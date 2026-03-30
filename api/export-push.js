const { exec } = require('child_process');
const https = require('https');

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

    // Some dev environments or proxies may not populate `req.body`.
    // As a fallback, try to read and parse the raw request body stream.
    const ensureParsedBody = async (request) => {
      try {
        // If req.body is already an object with keys, assume it's parsed.
        if (request.body && typeof request.body === 'object' && Object.keys(request.body).length > 0) return;
        // If req.body is a raw JSON string (some hosts provide it like this), try to parse it.
        if (request.body && typeof request.body === 'string' && request.body.trim()) {
          try {
            request.body = JSON.parse(request.body);
            return;
          } catch (e) {
            // fallthrough to attempt streaming parse
          }
        }
        // Fallback: read raw stream and try to parse
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString();
        // store raw body for debug purposes
        try { request._rawBody = raw; } catch (e) { /* ignore */ }
        if (raw && raw.trim()) {
          try { request.body = JSON.parse(raw); } catch (e) { /* ignore parse errors */ }
        }
      } catch (e) {
        // ignore; we'll rely on existing req.body if present
      }
    };
    await ensureParsedBody(req);

    const ADMIN_KEY = process.env.ADMIN_KEY;
  // If ADMIN_KEY is set in the environment, require it in the request header.
  // For development convenience, allow the call when NODE_ENV !== 'production' even if the header doesn't match.
  if (ADMIN_KEY) {
    if (req.headers['x-admin-key'] !== ADMIN_KEY) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({ error: 'Non autorisé' });
      } else {
        console.warn('Warning: x-admin-key mismatch, but allowing the call in non-production environment');
      }
    }
  } else {
    console.warn('Warning: /api/export-push called but ADMIN_KEY is not set — endpoint is unprotected');
  }

  // If GitHub credentials are available, dispatch the GitHub Actions workflow instead
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const workflow_id = process.env.WORKFLOW_ID || 'export-redis-to-git.yml';
  const ref = process.env.WORKFLOW_REF || 'main';

  if (GITHUB_TOKEN && owner && repo) {
    // Try to fetch Upstash key here (allow alternate env names KV_REST_API_...)
    const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    const REDIS_KEY = process.env.REDIS_KEY || 'carnet-data';

    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
      return res.status(500).json({ error: 'Missing Upstash config in environment' });
    }

    const getUpstash = ({ url, token, key }) => new Promise((resolve, reject) => {
      const reqUrl = `${url.replace(/\/$/, '')}/get/${encodeURIComponent(key)}`;
      const opts = {
        headers: { Authorization: `Bearer ${token}` }
      };
      https.get(reqUrl, opts, (r) => {
        let body = '';
        r.on('data', (c) => body += c);
        r.on('end', () => {
          try {
            const json = JSON.parse(body);
            if (json && (json.result !== undefined)) return resolve(json.result);
            return reject(new Error('No result field in Upstash response'));
          } catch (e) {
            return reject(e);
          }
        });
      }).on('error', reject);
    });

    const githubGetFile = ({ owner, repo, path, branch, token }) => new Promise((resolve, reject) => {
      const options = {
        method: 'GET',
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`,
        headers: {
          'User-Agent': 'lemanuel-exporter',
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${token}`
        }
      };
      const req = https.request(options, (r) => {
        let body = '';
        r.on('data', (c) => body += c);
        r.on('end', () => {
          if (r.statusCode === 200) return resolve({ status: r.statusCode, body });
          if (r.statusCode === 404) return resolve({ status: r.statusCode });
          return reject(new Error(`GitHub GET ${r.statusCode}: ${body}`));
        });
      });
      req.on('error', reject);
      req.end();
    });

    const githubPutFile = ({ owner, repo, path, branch, token, message, contentBase64, sha }) => new Promise((resolve, reject) => {
      const payload = JSON.stringify(Object.assign({ message, content: contentBase64, branch }, sha ? { sha } : {}));
      const options = {
        method: 'PUT',
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
        headers: {
          'User-Agent': 'lemanuel-exporter',
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };
      const req = https.request(options, (r) => {
        let body = '';
        r.on('data', (c) => body += c);
        r.on('end', () => {
          if (r.statusCode >= 200 && r.statusCode < 300) return resolve({ status: r.statusCode, body });
          return reject(new Error(`GitHub PUT ${r.statusCode}: ${body}`));
        });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    try {
      // If the client posted data in the request body, use it. Optionally a `module` field
      // may be provided to target a module-specific file (src/data/data.<module>.js).
      let dataObj = null;
      const moduleName = req.body && typeof req.body.module === 'string' && req.body.module ? String(req.body.module) : null;

      const normalizeModuleName = (name) => {
        try {
          return String(name || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');
        } catch (e) {
          return String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        }
      };

      const upstashSet = ({ url, token, key, value }) => new Promise((resolve, reject) => {
        try {
          const payload = JSON.stringify(value);
          const u = `${url.replace(/\/$/, '')}/set/${encodeURIComponent(key)}`;
          const options = {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload)
            }
          };
          const r = https.request(u, options, (res2) => {
            let body = '';
            res2.on('data', (c) => body += c);
            res2.on('end', () => {
              try { const j = JSON.parse(body); return resolve(j); } catch (e) { return resolve(body); }
            });
          });
          r.on('error', reject);
          r.write(payload);
          r.end();
        } catch (e) { reject(e); }
      });

      if (req.body && Object.keys(req.body).length > 0 && req.body.data !== undefined) {
        dataObj = req.body.data;
        // If client serialized `data` as a JSON string, try to parse it.
        if (typeof dataObj === 'string') {
          try {
            let parsed = dataObj.trim();
            // Remove common JS module wrapper like `export default ...;` if present
            if (parsed.startsWith('export default')) {
              parsed = parsed.replace(/^export\s+default\s+/, '').trim();
            } else if (parsed.startsWith('export ')) {
              parsed = parsed.replace(/^export\s+/, '').trim();
            }
            // Remove trailing semicolon which would break JSON.parse
            if (parsed.endsWith(';')) parsed = parsed.slice(0, -1).trim();

            let lastParsed = null;
            // keep parsing while the value is a JSON string
            while (typeof parsed === 'string' && parsed !== lastParsed) {
              lastParsed = parsed;
              try {
                parsed = JSON.parse(parsed);
                continue;
              } catch (e) {
                // If JSON.parse fails but the string contains an object-like fragment,
                // attempt to extract the {...} substring and parse that.
                if (typeof parsed === 'string' && (parsed[0] === '{' || parsed[0] === '[')) {
                  const firstBrace = parsed.indexOf('{');
                  const lastBrace = parsed.lastIndexOf('}');
                  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    const candidate = parsed.substring(firstBrace, lastBrace + 1);
                    try {
                      parsed = JSON.parse(candidate);
                      break;
                    } catch (e2) {
                      // give up and keep as string
                      break;
                    }
                  }
                }
                break;
              }
            }
            dataObj = parsed;
          } catch (e) {
            // keep as string if parsing/cleanup fails
          }
        }
        // If Upstash is configured, persist a module-scoped key when a module is provided,
        // otherwise persist the default REDIS_KEY (legacy behaviour).
        try {
          if (UPSTASH_URL && UPSTASH_TOKEN) {
            const keyToUse = moduleName ? `${REDIS_KEY || 'carnet-data'}:${normalizeModuleName(moduleName)}` : (REDIS_KEY || 'carnet-data');
            await upstashSet({ url: UPSTASH_URL, token: UPSTASH_TOKEN, key: keyToUse, value: dataObj });
          }
        } catch (e) {
          console.warn('Failed to persist posted data to Upstash:', e && e.message ? e.message : e);
        }
      } else {
        // No body data: try to read from Upstash. If moduleName provided, prefer module-scoped key.
        if (!UPSTASH_URL || !UPSTASH_TOKEN) {
          return res.status(500).json({ error: 'Missing Upstash config in environment' });
        }
        const keyToRead = moduleName ? `${REDIS_KEY || 'carnet-data'}:${normalizeModuleName(moduleName)}` : (REDIS_KEY || 'carnet-data');
        const rawValue = await getUpstash({ url: UPSTASH_URL, token: UPSTASH_TOKEN, key: keyToRead });
        try { dataObj = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue; } catch (e) { return res.status(500).json({ error: 'Upstash value is not valid JSON: ' + e.message }); }
      }

      // debug info for tracing why data may be invalid
      try {
        console.log('[export-push] module=', moduleName, 'bodyKeys=', req.body ? Object.keys(req.body) : null, 'typeof_data=', typeof dataObj, 'isArray=', Array.isArray(dataObj), 'sample=', (typeof dataObj === 'object' ? Object.keys(dataObj).slice(0,5) : String(dataObj).slice(0,200)) );
      } catch (e) { /* ignore logging errors */ }
      if (!dataObj || (typeof dataObj !== 'object' && !Array.isArray(dataObj))) {
        // Prepare safe debug info to help diagnose what was received
        const debugInfo = {};
        try {
          debugInfo.bodyKeys = req.body ? Object.keys(req.body) : null;
          debugInfo.bodyDataType = req.body && req.body.data !== undefined ? typeof req.body.data : 'undefined';
          try {
            debugInfo.bodyDataSample = req.body && req.body.data !== undefined ? JSON.stringify(req.body.data).slice(0, 200) : null;
          } catch (e) {
            debugInfo.bodyDataSample = String(req.body && req.body.data).slice(0, 200);
          }
          debugInfo.isArray = Array.isArray(req.body && req.body.data ? req.body.data : null);
          // Include a short raw-body and header info to help debugging client payload
          debugInfo.rawBodySample = req._rawBody ? String(req._rawBody).slice(0, 400) : null;
          debugInfo.headers = { 'content-type': req.headers['content-type'] || null, 'content-length': req.headers['content-length'] || null };
        } catch (e) { /* ignore */ }
        console.log('[export-push][debug] invalid data, debug=', debugInfo);
        return res.status(400).json({ error: 'No valid data to export', debug: debugInfo });
      }

      // Prepare exported object in the same shape the pages expect. If the payload already
      // looks like a wrapper (has .value), keep it; otherwise wrap under `value` so pages
      // that rely on dataSrc.value continue to work.
      let fileExportObj = dataObj;
      if (!dataObj.value && (dataObj.sections || dataObj.categories)) {
        fileExportObj = { value: dataObj };
      }

      const newContent = `export default ${JSON.stringify(fileExportObj, null, 2)};\n`;
      const contentBase64 = Buffer.from(newContent, 'utf8').toString('base64');

      const targetPath = moduleName ? `src/data/data.${normalizeModuleName(moduleName)}.js` : 'src/data.structure.js';

      // get existing file sha if exists
      const getResp = await githubGetFile({ owner, repo, path: targetPath, branch: ref, token: GITHUB_TOKEN });
      let sha;
      if (getResp && getResp.status === 200) {
        try {
          const meta = JSON.parse(getResp.body);
          sha = meta.sha;
        } catch (e) {
          // ignore
        }
      }

      const commitMessage = moduleName ? `Export module ${moduleName} [auto]` : 'Export carnet-data from Upstash Redis [auto]';
      const putResp = await githubPutFile({ owner, repo, path: targetPath, branch: ref, token: GITHUB_TOKEN, message: commitMessage, contentBase64, sha });
      return res.status(200).json({ success: true, result: putResp });
    } catch (e) {
      return res.status(500).json({ error: e && e.message ? e.message : String(e) });
    }
  }

    // Fallback: try running the local script (only useful in development where the file exists)
    exec('node export-redis-to-git.cjs', { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (stdout && stdout.includes('No change in data')) {
        return res.status(200).json({ success: true, output: stdout });
      }
      if (error) {
        if (stdout && stdout.trim().length > 0) {
          return res.status(200).json({ success: true, output: stdout });
        }
        return res.status(500).json({ error: stderr || error.message });
      }
      return res.status(200).json({ success: true, output: stdout });
    });
  } catch (e) {
    console.error('api/export-push error:', e);
    return res.status(500).json({ error: e && e.message ? e.message : String(e) });
  }
};
