module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const workflow_id = process.env.WORKFLOW_ID || 'export-redis-to-git.yml';
  const ref = process.env.WORKFLOW_REF || 'main';

  if (!GITHUB_TOKEN || !owner || !repo) return res.status(500).json({ error: 'Missing GITHUB env vars' });

  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`;

  try {
    const ghRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref }),
    });

    if (!ghRes.ok) {
      const errorText = await ghRes.text();
      return res.status(ghRes.status).json({ error: errorText });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
