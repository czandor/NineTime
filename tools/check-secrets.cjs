#!/usr/bin/env node
// No dependencies. Reports locations/rules, never credential values.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const staged = process.argv.includes('--staged');
const explicit = process.argv.indexOf('--file');
function git(args, input) {
  return cp.execFileSync('git', args, { cwd: root, input, encoding: null, maxBuffer: 64 * 1024 * 1024, stdio: [input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'] });
}
let files;
try {
  files = explicit !== -1 ? [process.argv[explicit + 1]] :
    git(staged ? ['ls-files', '--cached', '-z'] : ['ls-files', '--cached', '--others', '--exclude-standard', '-z'])
      .toString('utf8').split('\0').filter(Boolean);
} catch {
  console.error('Run this check from an initialized Git repository, or pass --file PATH.');
  process.exit(2);
}
const privateInventory = path.join(root, 'local-only/config/known-private-values.json');
const known = fs.existsSync(privateInventory) ? JSON.parse(fs.readFileSync(privateInventory, 'utf8')) : [];
const findings = [];
const stagedContents = new Map();
if (staged && explicit === -1) {
  const records = git(['ls-files', '--stage', '-z']).toString('utf8').split('\0').filter(Boolean)
    .map(record => {
      const match = record.match(/^\d+ ([a-f0-9]+) 0\t(.+)$/);
      if (!match) throw new Error('Cannot audit an unmerged Git index.');
      return { sha: match[1], file: match[2] };
    });
  const hashes = [...new Set(records.map(record => record.sha))];
  const output = git(['cat-file', '--batch'], hashes.join('\n') + '\n');
  const objects = new Map();
  let position = 0;
  for (const expected of hashes) {
    const end = output.indexOf(10, position);
    const header = output.subarray(position, end).toString('ascii').split(' ');
    if (header[0] !== expected || header[1] !== 'blob') throw new Error('Unable to inspect a staged Git object.');
    const size = Number(header[2]);
    position = end + 1;
    objects.set(expected, output.subarray(position, position + size));
    position += size + 1;
  }
  for (const record of records) stagedContents.set(record.file, objects.get(record.sha));
}
function report(file, src, index, rule) {
  findings.push({ file, line: src.slice(0, Math.max(0, index)).split('\n').length, rule });
}
for (const file of [...new Set(files)]) {
  if (!file || file.includes('\n')) { findings.push({ file: '[invalid path]', line: 1, rule: 'invalid path' }); continue; }
  const normalized = file.replace(/\\/g, '/');
  const forbidden = /(^|\/)(local-only|node_modules|build|\.git)(\/|$)|(^|\/)(config\.local\.(php|json)|site-config\.json|client_secret[^/]*|\.env(?:\..*)?)$|\.(zip|7z|rar|apk|pbw|psd|ttf|otf|pem|p12|pfx|key)$/i;
  if ((forbidden.test(normalized) && !normalized.endsWith('/.env.example')) ||
      (normalized.endsWith('.sql') && normalized !== 'database/schema.sql')) {
    findings.push({ file: normalized, line: 1, rule: 'private or generated file selected for Git' });
  }
  let data;
  try {
    data = staged && explicit === -1 ? stagedContents.get(normalized) : fs.readFileSync(path.join(root, normalized));
    if (!data) throw new Error('Missing staged contents.');
  }
  catch { findings.push({ file: normalized, line: 1, rule: 'unable to inspect selected file' }); continue; }
  const src = data.toString('utf8');
  for (const value of known) {
    const at = src.indexOf(value);
    if (at !== -1) report(normalized, src, at, 'credential found in the original local sources');
  }
  if (!/\.(php|js|cjs|mjs|json|c|h|html|css|txt|md|sql|yml|yaml|toml|ini|env)$/.test(normalized)) continue;
  const rules = [
    ['private key', /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/g],
    ['provider access token', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AIza[0-9A-Za-z_-]{30,}|AKIA[0-9A-Z]{16}|sk-(?:proj-)?[A-Za-z0-9_-]{20,})\b/g],
    ['legacy hexadecimal credential', /['"][a-f0-9]{16,64}['"]/gi],
    ['literal password or secret', /\b(?:password|passwd|pwd|client_secret|consumer_secret|access_token|refresh_token)\s*['"]?\s*(?:=>|:|=)\s*['"]([^'"\r\n]+)['"]/gi],
    ['credential inside URL', /https?:\/\/[^/\s'"]+:[^@\s'"]+@|[?&](?:api_?key|token|APPID)=([A-Za-z0-9_-]{16,})/gi]
  ];
  for (const [name, regex] of rules) {
    for (const match of src.matchAll(regex)) {
      if (match[1] && /^(?:NINETIME_SERVER_|REMOVED_LEGACY_)/.test(match[1])) continue;
      report(normalized, src, match.index, name);
    }
  }
  if (normalized === 'database/schema.sql' && /^\s*(?:INSERT|REPLACE|LOAD\s+DATA|COPY|CREATE\s+USER|GRANT)\b/im.test(src)) {
    report(normalized, src, 0, 'database data or accounts in schema');
  }
}
const unique = [...new Map(findings.map(f => [f.file + ':' + f.line + ':' + f.rule, f])).values()];
if (unique.length) {
  for (const finding of unique) console.error(finding.file + ':' + finding.line + ': ' + finding.rule);
  console.error('Secret check failed. Credential values were not printed.');
  process.exit(1);
}
console.log('Secret check passed: ' + files.length + ' Git-selected files; ' + known.length + ' original private values checked locally.');
