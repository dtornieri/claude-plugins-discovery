// Fetches the official Claude marketplace and adds any new plugins to index.html
const https = require('https');
const fs = require('fs');

const MARKETPLACE_URL =
  'https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/.claude-plugin/marketplace.json';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function autoCategory(name, desc) {
  const t = (name + ' ' + desc).toLowerCase();
  if (/-lsp$/.test(name) || /language server/.test(t)) return 'lsp';
  if (/playwright|chrome.devtools|e2e test/.test(t)) return 'testing';
  if (/github|gitlab|buildkite|teamcity|pagerduty/.test(t)) return 'devops';
  if (/\baws\b|\bazure\b|cloudflare|vercel|netlify|railway|terraform|serverless/.test(t)) return 'cloud';
  if (/database|postgres|mongodb|\bsql\b|\bredis\b|supabase|prisma|clickhouse|pinecone/.test(t)) return 'database';
  if (/security|sast|dast|vulnerab|semgrep|aikido|zscaler|crowdstrike/.test(t)) return 'security';
  if (/figma|cloudinary|runway|miro/.test(t)) return 'design';
  if (/analytics|datadog|sentry|posthog|amplitude|telemetry/.test(t)) return 'analytics';
  if (/slack|telegram|discord|imessage|twilio/.test(t)) return 'comms';
  if (/linear\b|jira|notion\b|asana\b|mintlify/.test(t)) return 'pm';
  if (/stripe|payment|mercadopago|revenuecat/.test(t)) return 'payments';
  if (/huggingface|machine.learn|pydantic.ai|together.ai/.test(t)) return 'ai';
  if (/scraping|crawl|web.search|postman|greptile|sourcegraph/.test(t)) return 'webdata';
  if (/\bsap\b|servicenow|oracle\b|salesforce|netsuite/.test(t)) return 'enterprise';
  if (/shopify|wordpress|wix\b|sanity\b/.test(t)) return 'ecommerce';
  if (/\bauth\b|\bsso\b|oauth|oidc/.test(t)) return 'auth';
  if (/mobile|react.native|expo\b/.test(t)) return 'mobile';
  if (/airflow|etl|data.engineer|warehouse|snowflake/.test(t)) return 'dataeng';
  return 'utils';
}

async function main() {
  const html = fs.readFileSync('index.html', 'utf8');

  // Extract names already in the file
  const known = new Set();
  const rx = /\{name:'([^']+)'/g;
  let m;
  while ((m = rx.exec(html)) !== null) known.add(m[1]);

  console.log(`Known plugins: ${known.size}`);

  // Fetch marketplace
  const data = await fetchJson(MARKETPLACE_URL);
  const remote = data.plugins || [];
  console.log(`Remote plugins: ${remote.length}`);

  const newPlugins = remote.filter(p => !known.has(p.name));
  if (newPlugins.length === 0) {
    console.log('No new plugins — nothing to do.');
    return;
  }

  // Build JS entries
  const entries = newPlugins.map(p => {
    const desc = (p.description || 'Plugin available in the marketplace.')
      .replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const cat = autoCategory(p.name, p.description || '');
    return `  {name:'${p.name}',cat:'${cat}',installs:${p.installCount || 0},icon:'🔌',desc:'${desc}',isNew:true},`;
  });

  // Insert before the closing of PLUGINS array
  const updated = html.replace(
    /(\/\/ ── UTILITIES ──[\s\S]*?\{name:'cwc-makers'[^}]+\},)\n\];/,
    `$1\n\n  // ── AUTO-UPDATED ${new Date().toISOString().slice(0, 10)} ──\n${entries.join('\n')}\n];`
  );

  if (updated === html) {
    // fallback: insert before the array closing
    const fallback = html.replace(
      /(\n\];\n\nlet currentCategory)/,
      `\n\n  // ── AUTO-UPDATED ${new Date().toISOString().slice(0, 10)} ──\n${entries.join('\n')}\n$1`
    );
    fs.writeFileSync('index.html', fallback, 'utf8');
  } else {
    fs.writeFileSync('index.html', updated, 'utf8');
  }

  console.log(`Added ${newPlugins.length} plugin(s): ${newPlugins.map(p => p.name).join(', ')}`);
}

main().catch(err => { console.error(err); process.exit(1); });
