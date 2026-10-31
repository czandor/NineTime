#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const walk = dir => fs.readdirSync(path.join(root, dir), { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(dir + '/' + e.name) : [dir + '/' + e.name]);
let checks = 0;
function run(command, args) {
  const result = cp.spawnSync(command, args, { cwd: root, encoding: 'utf8', windowsHide: true });
  if (result.error) throw new Error(command + ' is required for verification.');
  if (result.status !== 0) {
    process.stderr.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    process.exit(result.status || 1);
  }
  checks++;
}
const files = ['watchface', 'web', 'tools'].flatMap(walk);
for (const file of files) {
  if (/\.(?:cjs|js)$/.test(file)) run(process.execPath, ['--check', file]);
  if (file.endsWith('.php')) run(process.env.PHP_BINARY || 'php', ['-l', file]);
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'watchface/package.json'), 'utf8'));
for (const resource of pkg.pebble.resources.media) {
  const full = path.join(root, 'watchface/resources', resource.file);
  const extension = path.extname(full);
  const stem = path.basename(full, extension);
  const variants = fs.readdirSync(path.dirname(full)).filter(name => name.startsWith(stem + '~') && name.endsWith(extension));
  if (!fs.existsSync(full) && variants.length === 0) {
    throw new Error('Missing watchface resource: ' + resource.file);
  }
}
if (!fs.existsSync(path.join(root, 'watchface/src/pkjs/site-config.json'))) {
  throw new Error('Run node tools/configure-watchface.cjs before building.');
}
run(process.execPath, ['tools/check-secrets.cjs']);
console.log('Verification passed: ' + checks + ' syntax/secret checks, ' + pkg.pebble.resources.media.length + ' watchface resources. C compilation requires the Pebble SDK.');
