const https = require('https');

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

    const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    const REDIS_KEY = process.env.REDIS_KEY || 'carnet-data';

    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
      return res.status(500).json({ error: 'Missing Upstash config in environment' });
    }

    // parse body (support raw)
    const ensureParsedBody = async (request) => {
      try {
        if (request.body && typeof request.body === 'object' && Object.keys(request.body).length > 0) return;
        if (request.body && typeof request.body === 'string' && request.body.trim()) {
          try { request.body = JSON.parse(request.body); return; } catch (e) {}
        }
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString();
        if (raw && raw.trim()) {
          try { request.body = JSON.parse(raw); } catch (e) { /* ignore */ }
        }
      } catch (e) { }
    };

    await ensureParsedBody(req);

    const moduleName = req.body && typeof req.body.module === 'string' ? req.body.module : null;
    let dataObj = req.body && req.body.data !== undefined ? req.body.data : null;

    // attempt to parse string data
    if (typeof dataObj === 'string') {
      try { dataObj = JSON.parse(dataObj); } catch (e) { /* keep as string */ }
    }

    // Do not allow storing null/undefined payloads — require an object or array
    if (dataObj === null || typeof dataObj === 'undefined') {
      return res.status(400).json({ error: 'Invalid data payload' });
    }

    const normalizeModuleName = (name) => {
      try {
        return String(name || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/\u0300-\u036f/g, '')
          .replace(/[^a-z0-9]/g, '');
      } catch (e) { return String(name || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
    };

    const keyToUse = moduleName ? `${REDIS_KEY || 'carnet-data'}:${normalizeModuleName(moduleName)}` : (REDIS_KEY || 'carnet-data');

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

    try {
      await upstashSet({ url: UPSTASH_URL, token: UPSTASH_TOKEN, key: keyToUse, value: dataObj });
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e && e.message ? e.message : String(e) });
    }
  } catch (e) {
    return res.status(500).json({ error: e && e.message ? e.message : String(e) });
  }
};
