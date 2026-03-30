// Script d'export de la clé Redis Upstash vers un fichier local et commit/push Git
// Usage : node export-redis-to-git.cjs

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Lire depuis les variables d'environnement
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const REDIS_KEY = process.env.REDIS_KEY || 'carnet-data';

// Fichier local où sauvegarder la donnée
const OUTPUT_FILE = path.join(__dirname, 'src', 'data.structure.js');

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  console.error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN in environment');
  process.exit(1);
}

function fetchRedisKey() {
  return new Promise((resolve, reject) => {
    const url = `${UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(REDIS_KEY)}`;
    const options = {
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      },
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && (json.result !== undefined)) {
            resolve(json.result);
          } else {
            reject(new Error('No result in response: ' + data));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log('Fetching Redis key...');
    const value = await fetchRedisKey();
    let dataObj;
    try {
      dataObj = typeof value === 'string' ? JSON.parse(value) : value;
    } catch (e) {
      throw new Error('La valeur Redis n\'est pas un JSON valide: ' + e.message);
    }
    const newContent = `export default ${JSON.stringify(dataObj, null, 2)};\n`;
    let oldContent = null;
    try {
      oldContent = fs.readFileSync(OUTPUT_FILE, 'utf8');
    } catch (e) {
      // fichier absent -> on l'écrit
    }
    if (oldContent !== newContent) {
      fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
      fs.writeFileSync(OUTPUT_FILE, newContent, 'utf8');
      console.log('Data saved to', OUTPUT_FILE);
      try {
        execSync(`git add "${OUTPUT_FILE}"`);
        execSync(`git commit -m "Export carnet-data from Upstash Redis [auto]"`);
        execSync('git push');
        console.log('Git commit & push done.');
      } catch (gitErr) {
        console.warn('Git push failed (maybe no credentials configured):', gitErr && gitErr.message ? gitErr.message : gitErr);
      }
    } else {
      console.log('No change in data, nothing to commit.');
    }
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

main();
