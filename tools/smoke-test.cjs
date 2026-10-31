#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const http = require('node:http');
const net = require('node:net');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let assertions = 0;
function check(condition, label) {
  assert.ok(condition, label);
  assertions++;
}
async function freePort() {
  const socket = net.createServer();
  await new Promise((resolve, reject) => {
    socket.once('error', reject);
    socket.listen(0, '127.0.0.1', resolve);
  });
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  return port;
}
function request(port, pathname, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path: pathname, method }, response => {
      const parts = [];
      response.on('data', part => parts.push(part));
      response.on('end', () => resolve({ status: response.statusCode, body: Buffer.concat(parts).toString('utf8') }));
    });
    req.setTimeout(3000, () => req.destroy(new Error('Local PHP request timed out.')));
    req.on('error', reject);
    req.end();
  });
}
async function main() {
  for (const command of [[process.execPath, ['tools/weather-test.cjs']], [process.env.PHP_BINARY || 'php', ['tools/weather-test.php']]]) {
    const result = cp.spawnSync(command[0], command[1], { cwd: root, encoding: 'utf8', windowsHide: true });
    check(result.status === 0, 'Weather regression suite: ' + (result.stderr || result.stdout));
  }
  const fixture = 'tools/.secret-check-fixture.json';
  try {
    const fake = 'a1b2c3d4'.repeat(4);
    fs.writeFileSync(path.join(root, fixture), JSON.stringify({ apiKey: fake }));
    const result = cp.spawnSync(process.execPath, ['tools/check-secrets.cjs', '--file', fixture], { cwd: root, encoding: 'utf8', windowsHide: true });
    check(result.status === 1, 'Secret detector must reject a synthetic API key.');
    check(!(result.stdout + result.stderr).includes(fake), 'Secret detector must not print a detected value.');
  } finally {
    if (fs.existsSync(path.join(root, fixture))) fs.unlinkSync(path.join(root, fixture));
  }

  const port = await freePort();
  const php = cp.spawn(process.env.PHP_BINARY || 'php', [
    '-d', 'display_errors=0', '-d', 'log_errors=0',
    '-S', '127.0.0.1:' + port, '-t', path.join(root, 'web/public')
  ], {
    cwd: root,
    windowsHide: true,
    stdio: ['ignore', 'ignore', 'pipe'],
    env: {
      ...process.env,
      NINETIME_CONFIG_FILE: path.join(root, 'web/config/config.example.php'),
      NINETIME_PUBLIC_BASE_URL: 'http://127.0.0.1:' + port + '/pebble',
      NINETIME_DB_HOST: '127.0.0.1',
      NINETIME_DB_PORT: '1',
      NINETIME_DB_USER: 'ninetime_test',
      NINETIME_DB_PASSWORD: '',
      NINETIME_DB_NAME: 'ninetime_test',
      NINETIME_ADMIN_TOKEN: ''
    }
  });
  let startupError;
  let serverDiagnostics = '';
  php.on('error', error => { startupError = error; });
  php.stderr.on('data', chunk => { serverDiagnostics = (serverDiagnostics + chunk.toString('utf8')).slice(-3000); });
  try {
    let ready = false;
    let lastConnectionError = '';
    for (let i = 0; i < 50; i++) {
      if (startupError) throw new Error('PHP is required for the local smoke test.');
      try { await request(port, '/pebble/ninetime/version.txt'); ready = true; break; }
      catch (error) { lastConnectionError = error.message; await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    check(ready, 'Local PHP connection failed: ' + lastConnectionError + '\n' + serverDiagnostics);
    const home = await request(port, '/pebble/ninetime/index.php');
    check(home.status === 200 && /NineTime|NINETIME/.test(home.body), 'NineTime home page loads.');
    const preview = await request(port, '/pebble/ninetime/configpage.php?token=local-preview&platform=basalt&model=pebble_time&CONFIG_VERSION=2.00&h24=1&batt=75');
    check(preview.status === 200 && preview.body.includes('WatchFace style') && preview.body.includes('NINETIME_BASE_URL'), 'Configurator renders without a live database.');
    for (const file of ['/config/config.local.php', '/config/config.example.php', '/bootstrap.php', '/local-only/config/original-server-config.json']) {
      check((await request(port, file)).status === 404, 'Private file is outside the document root: ' + file);
    }
    check((await request(port, '/pebble/weather-chart.php')).status === 404, 'Weather statistics endpoint removed.');
    check((await request(port, '/pebble/colormatch.php')).status === 403, 'Color matching requires admin authentication.');
    check((await request(port, '/pebble/getapikey_owm.php')).status === 410, 'Legacy key discovery remains disabled.');
    for (const endpoint of ['weather_owm.php', 'weather_wu.php', 'weather_yahoo.php', 'weather_czandor.php']) {
      check((await request(port, '/pebble/' + endpoint)).status === 400, 'Legacy weather URL exists and validates input: ' + endpoint);
    }
    for (const query of ['provider=invalid', 'latitude=91&longitude=0', 'url=http%3A%2F%2F127.0.0.1', 'action=geocode&q=a']) {
      check((await request(port, '/pebble/weather.php?' + query)).status === 400, 'Weather input validation: ' + query);
    }
    check((await request(port, '/pebble/weather.php', 'POST')).status === 405, 'Weather endpoint accepts GET only.');
    check(preview.body.includes('Open-Meteo') && preview.body.includes('MET Norway') && !preview.body.includes('id="weather-api-key-input"'), 'Exactly the new weather choices, without key entry.');
    const refreshOptions = preview.body.match(/<select id="weather-refresh-0"[^>]*>([\s\S]*?)<\/select>/)[1];
    check(!/<option value="(?:5|10)"/.test(refreshOptions), 'Weather refresh choices respect the 15-minute minimum.');
    for (const script of preview.body.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
      if (script[1].trim()) new vm.Script(script[1]);
    }
    check(preview.body.includes('var actualVersion="2.00"'), 'Version 2.00 renders as valid JavaScript.');
    console.log('Smoke tests passed: ' + assertions + ' assertions. No external service was contacted.');
  } finally {
    php.kill();
    if (php.exitCode === null) await new Promise(resolve => { php.once('exit', resolve); setTimeout(resolve, 1500); });
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
