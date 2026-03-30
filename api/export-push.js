const { exec } = require('child_process');
const https = require('https');

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

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
      const rawValue = await getUpstash({ url: UPSTASH_URL, token: UPSTASH_TOKEN, key: REDIS_KEY });
      let dataObj;
      try { dataObj = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue; } catch (e) { return res.status(500).json({ error: 'Upstash value is not valid JSON: ' + e.message }); }

      const newContent = `export default ${JSON.stringify(dataObj, null, 2)};\n`;
      const contentBase64 = Buffer.from(newContent, 'utf8').toString('base64');
      const targetPath = 'src/data.structure.js';

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

      const putResp = await githubPutFile({ owner, repo, path: targetPath, branch: ref, token: GITHUB_TOKEN, message: 'Export carnet-data from Upstash Redis [auto]', contentBase64, sha });
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
