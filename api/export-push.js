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
    // Use native https.request to avoid depending on global fetch
    const dispatchWorkflow = ({ owner, repo, workflow_id, ref, token }) => new Promise((resolve, reject) => {
      const payload = JSON.stringify({ ref });
      const options = {
        method: 'POST',
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`,
        headers: {
          'User-Agent': 'lemanuel-exporter',
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        }
      };

      const req = https.request(options, (r) => {
        let body = '';
        r.on('data', (c) => body += c);
        r.on('end', () => {
          if (r.statusCode >= 200 && r.statusCode < 300) return resolve({ status: r.statusCode, body });
          return reject(new Error(`GitHub API ${r.statusCode}: ${body}`));
        });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    try {
      await dispatchWorkflow({ owner, repo, workflow_id, ref, token: GITHUB_TOKEN });
      return res.status(200).json({ success: true, message: 'Workflow dispatched' });
    } catch (e) {
      return res.status(500).json({ error: e.message });
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
