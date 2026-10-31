#!/usr/bin/env node
// Only public URLs belong in the phone bundle. Never add provider secrets here.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const local = path.join(root, 'watchface/config.local.json');
const source = fs.existsSync(local) ? local : path.join(root, 'watchface/config.example.json');
const config = JSON.parse(fs.readFileSync(source, 'utf8'));
if (Object.keys(config).some(key => key !== 'baseUrl') || typeof config.baseUrl !== 'string') {
  throw new Error('Watchface configuration must contain only the public baseUrl.');
}
const url = new URL(config.baseUrl);
if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
  throw new Error('baseUrl must be a public HTTP(S) URL without credentials, query or fragment.');
}
const generated = path.join(root, 'watchface/src/pkjs/site-config.json');
fs.writeFileSync(generated, JSON.stringify({ baseUrl: config.baseUrl.replace(/\/+$/, '') }, null, 2) + '\n');
console.log('Generated watchface/src/pkjs/site-config.json (public URL only; ignored by Git).');
