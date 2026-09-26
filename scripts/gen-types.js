// Regenerates types/database.ts from the live Supabase schema.
// Uses SUPABASE_DB_URL directly (via --db-url) since the project is not
// `supabase link`-ed in this environment (linking needs a browser login).
// If you do run `supabase login` + `supabase link` locally, you can switch
// this back to `supabase gen types typescript --linked`.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  }
}

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error('SUPABASE_DB_URL is not set (check .env).');
  process.exit(1);
}

const result = spawnSync(
  'npx',
  ['--yes', 'supabase', 'gen', 'types', 'typescript', '--db-url', dbUrl],
  { encoding: 'utf8', shell: true },
);

if (result.status !== 0) {
  console.error(result.stderr);
  process.exit(result.status ?? 1);
}

const outPath = path.join(__dirname, '..', 'types', 'database.ts');
fs.writeFileSync(outPath, result.stdout);

const fmt = spawnSync('npx', ['--yes', 'prettier', '--write', outPath], {
  stdio: 'inherit',
  shell: true,
});
process.exit(fmt.status ?? 0);
