const { exec } = require('child_process');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const ADMIN_KEY = process.env.ADMIN_KEY;
  if (!ADMIN_KEY) return res.status(500).json({ error: 'Server misconfigured: ADMIN_KEY missing' });

  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Non autorisé' });
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
