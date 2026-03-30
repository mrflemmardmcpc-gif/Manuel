const https = require('https');

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' });

    const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    const REDIS_KEY = process.env.REDIS_KEY || 'carnet-data';

    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
      return res.status(500).json({ error: 'Missing Upstash config in environment' });
    }

    const moduleName = req.query && req.query.module ? String(req.query.module) : null;
    const normalizeModuleName = (name) => {
      try {
        return String(name || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/\u0300-\u036f/g, '')
          .replace(/[^a-z0-9]/g, '');
      } catch (e) { return String(name || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
    };

    const keyToRead = moduleName ? `${REDIS_KEY || 'carnet-data'}:${normalizeModuleName(moduleName)}` : (REDIS_KEY || 'carnet-data');

    const url = `${UPSTASH_URL.replace(/\/$/, '')}/get/${encodeURIComponent(keyToRead)}`;
    const opts = { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } };

    https.get(url, opts, (r) => {
      let body = '';
      r.on('data', (c) => body += c);
      r.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (!json || typeof json.result === 'undefined') return res.status(500).json({ error: 'Upstash returned no result' });
          const raw = json.result;
          let parsed = raw;
          try { if (typeof raw === 'string') parsed = JSON.parse(raw); } catch (e) { /* keep raw */ }
          return res.status(200).json({ success: true, data: parsed });
        } catch (e) {
          return res.status(500).json({ error: 'Failed to parse Upstash response', detail: String(e) });
        }
      });
    }).on('error', (err) => {
      return res.status(500).json({ error: 'Upstash request failed', detail: String(err) });
    });
  } catch (e) {
    return res.status(500).json({ error: e && e.message ? e.message : String(e) });
  }
};
