const { exec } = require('child_process');

module.exports = function handler(req, res) {
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
};
