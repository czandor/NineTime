#!/usr/bin/env node
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let assertions = 0;
function check(value, label) { assert.ok(value, label); assertions++; }
function storage(initial) {
  const data = Object.fromEntries(Object.entries(initial).map(([key, value]) => [key, String(value)]));
  return { data, getItem: key => Object.hasOwn(data, key) ? data[key] : null,
    setItem: (key, value) => { data[key] = String(value); }, removeItem: key => { delete data[key]; } };
}
const valid = {
  current: { temperatureC: 12, humidity: 70, windKph: 18, icon: 9 },
  forecast: { minC: -5, maxC: 20, icon: 10, hours: 24 },
  condition: 'Clear', provider: 'openmeteo', location: {name:'Resolved city'}
};
function phone(overrides = {}, options = {}) {
  const memory = storage({ configWeatherProvider: 'openmeteo', configWeatherLatitude: 47.4979,
    configWeatherLongitude: 19.0402, configWeatherLocation: 'Budapest, Hungary', configWeatherMetric: 1,
    configWeatherLanguage: 'en', weatherLastDownload: 0, ...overrides });
  let sends = 0, gpsRequests = 0;
  const requests = [];
  const now = 1700000000;
  const context = {
    module: { exports: {} }, localStorage: memory,
    require: name => name === './vars' ? { BASE_SITE_URL: 'https://ninetime.example.invalid/pebble',
      WEATHER_MIN_FREQ: 900, LOCATION_MIN_FREQ: 480, getEpoch: () => now } : { sendDataToPebble: () => { sends++; } },
    navigator: { geolocation: { getCurrentPosition: (success, error) => {
      gpsRequests++; if (options.gpsFails) error({});
      else success({ coords: { latitude: 0, longitude: 0 } });
    } } },
    XMLHttpRequest: function () {
      this.open = (method, url) => { this.url = url; };
      this.send = () => {
        requests.push(this);
        this.finish = () => {
          if (options.networkError) return this.onerror();
          this.status = options.status || 200;
          this.responseText = options.body === undefined ? JSON.stringify(valid) : options.body;
          this.onload();
        };
        if (!options.deferred) this.finish();
      };
    }
  };
  vm.createContext(context); vm.runInContext(read('watchface/src/pkjs/weather.js'), context);
  return { memory, context, requests, run: force => context.module.exports.downloadWeather(force), sends: () => sends, gpsRequests: () => gpsRequests };
}
let test = phone(); test.run();
check(test.memory.getItem('weatherDownloaded') === '1', 'successful phone download');
check(test.memory.getItem('tempCurrent') === '12' && test.memory.getItem('tempMin') === '-5', 'Celsius values');
check(test.memory.getItem('weatherWindspeed') === '18', 'km/h values');
check(test.memory.getItem('weatherIconC') === '9' && test.memory.getItem('weatherIconF') === '10', 'current and forecast icons');
check(test.memory.getItem('weatherLocation') === 'Budapest', 'watch city label');
check(test.requests.length === 1 && test.sends() === 1, 'current and forecast use one request');
test.run(); check(test.requests.length === 1 && test.sends() === 2, 'phone cache');
test.run(true); check(test.requests.length === 2, 'settings refresh bypasses the phone weather cache');
check(!test.requests[0].url.includes('apikey') && !test.requests[0].url.includes('token'), 'keyless request URL');
test = phone({ configWeatherProvider: 'metno', configWeatherMetric: 0 }); test.run();
check(test.requests[0].url.includes('provider=metno'), 'second provider selection');
check(test.memory.getItem('tempCurrent') === '54' && test.memory.getItem('tempMin') === '23', 'Fahrenheit conversion');
check(test.memory.getItem('weatherWindspeed') === '11', 'mph conversion');
for (const provider of ['openmeteo','metno']) {
  test = phone({configWeatherProvider:provider,configWeatherLocation:''}); test.run();
  check(test.memory.getItem('weatherLocation') === 'Resolved city', 'GPS label uses resolved city for '+provider);
}
test = phone({configWeatherLocation:''}, {body:JSON.stringify({...valid,location:{}})}); test.run();
check(test.memory.getItem('weatherLocation') === 'Unknown location' && test.memory.getItem('weatherDownloaded') === '1', 'missing city does not break weather or expose coordinates as the label');
test = phone({ configWeatherProvider: 'retired-provider', configWeatherAPIKey: 'old-private-value',
  weatherLastURL: 'old-private-url', configWeatherLocationId: 'retired-id' }); test.run();
check(test.memory.getItem('configWeatherProvider') === 'openmeteo', 'legacy provider migration');
check(test.memory.getItem('configWeatherAPIKey') === null && test.memory.getItem('weatherLastURL') === null, 'legacy key and URL removed');
check(test.memory.getItem('configWeatherLocationId') === null, 'legacy provider city ID removed');
check(test.gpsRequests() === 1 && test.requests[0].url.includes('latitude=0.0000'), 'GPS migration and zero coordinates');
test = phone({ configWeatherLatitude: '', configWeatherLongitude: '', configWeatherLocation: '',
  locationLastPosJSON: JSON.stringify({ coords: { latitude: 10, longitude: 20 } }), locationLastDownload: 1699999000 }, { gpsFails: true }); test.run();
check(test.memory.getItem('weatherDownloaded') === '1' && test.requests[0].url.includes('latitude=10.0000'), 'cached location after GPS failure');
test = phone({ configWeatherLatitude: '', configWeatherLongitude: '' }, { gpsFails: true }); test.run();
check(test.requests.length === 0 && test.memory.getItem('weatherDownloaded') === '2', 'GPS failure terminates without retries');
for (const options of [{ networkError: true }, { status: 503 }, { body: '{' }, { body: JSON.stringify({ error: 'Unavailable' }) },
  { body: JSON.stringify({ ...valid, current: { ...valid.current, temperatureC: null } }) }]) {
  test = phone({ tempCurrent: 7 }, options); test.run();
  check(test.memory.getItem('weatherDownloaded') === '2' && test.memory.getItem('tempCurrent') === '7' && test.sends() === 1, 'failed response preserves previous weather');
}
test = phone({}, { deferred: true }); test.run(); test.run();
check(test.requests.length === 1, 'concurrent requests coalesce');
test.requests[0].finish(); test.requests[0].ontimeout();
check(test.sends() === 1, 'completion delivered once');
test = phone({}, {deferred:true}); test.run();
test.memory.setItem('configWeatherProvider','metno'); test.run(true); test.requests[0].finish();
check(test.requests.length === 2 && test.requests[1].url.includes('provider=metno') && test.sends() === 0, 'saving during an active download queues the latest settings');
test.requests[1].finish(); check(test.sends() === 1, 'queued settings refresh completes once');

const browserMemory = storage({ 'weather-pmkey-pin-input': '12345', 'configWeatherAPIKey': 'obsolete' });
const browser = {
  settings: { weatherProvider: 1, weatherMetric: 0, customText: 'KEEP',
    weatherSettings: [{}, { apiKey: 'obsolete', cityId: 'old', cityName: 'Old city', refreshTime: 5, language: 3 }] },
  languages: [['en'], ['fr'], ['de'], ['hu']], localStorage: browserMemory
};
vm.createContext(browser); vm.runInContext(read('web/public/pebble/ninetime/js/weather.js'), browser);
browser.normalizeWeatherSettings();
check(browser.settings.weatherProvider === 0 && browser.settings.weatherSchemaVersion === 2, 'browser provider schema migration');
check(browser.settings.weatherSettings.length === 2 && browser.settings.weatherMetric === 0 && browser.settings.customText === 'KEEP', 'unrelated settings preserved');
check(!JSON.stringify(browser.settings).includes('apiKey') && !JSON.stringify(browser.settings).includes('cityId'), 'browser legacy credentials removed');
check(browser.settings.weatherSettings[0].refreshTime === 30 && browser.settings.weatherSettings[0].language === 'hu', 'refresh and language migration');
check(browser.settings.weatherSettings[0].cityName === '' && browserMemory.getItem('weather-pmkey-pin-input') === null, 'obsolete city and PIN removed');
browser.settings.weatherProvider = 1;
browser.settings.weatherSettings[1].latitude = 0; browser.settings.weatherSettings[1].longitude = 0;
browser.settings.weatherSettings[1].cityName = 'Equator'; browser.normalizeWeatherSettings();
check(browser.settings.weatherProvider === 1 && browser.settings.weatherSettings[1].cityName === 'Equator', 'new provider and fixed location survive normalization');
const before = JSON.stringify(browser.settings); browser.normalizeWeatherSettings();
check(JSON.stringify(browser.settings) === before, 'migration is idempotent');

function configuratorPayload(version) {
  const settings = JSON.parse(JSON.stringify(browser.settings));
  settings.infoType = 0; settings.info = [{urlOK:'https://example.test/info',usePos:0,data:'',language:0}];
  settings.customText = 'TEST'; settings.dayNames = []; settings.monthNames = [];
  const page = { settings, CONFIG_VERSION:version, weatherProviders:['openmeteo','metno'],
    document:{location:'',getElementById:()=>({checked:false})}, model:'pebble_time',return_to:'pebblejs://close#',
    saveData:()=>{}, normalizeWeatherSettings:()=>{}, buildIntStr:()=>'', customTextEnabled:()=>false,
    dateNameEnabled:()=>false, weatherConditionTextEnabled:()=>true, infoEnabled:()=>false,
    weatherEnabled:()=>true, weatherForecastEnabled:()=>true, weatherLocationEnabled:()=>true,
    languages:[['en']] };
  page.getInfoSettings=()=>settings.info[settings.infoType];
  vm.createContext(page); vm.runInContext(read('web/public/pebble/ninetime/js/send.js'),page);
  page.buildIntStr=()=>''; page.sendData();
  return JSON.parse(decodeURIComponent(page.document.location.split('#')[1]));
}
const legacyOptions = configuratorPayload(1.92);
check(!('configWeatherProvider' in legacyOptions) && !('configWeatherMetric' in legacyOptions), '1.xx companion retains its existing weather routing and units');
check(configuratorPayload(2).configWeatherProvider === 'metno', '2.00 companion receives the new provider');
check(configuratorPayload(2).fetchWeatherNow === 1 && configuratorPayload(1.92).fetchWeatherNow === 1, 'every settings submission requests weather, including legacy companions');

function saveSettings(options = {}, fail = false) {
  const handlers = {}, calls = [], memory = storage({weatherLastDownload:1699999999});
  const page = {localStorage:memory,setTimeout:fn=>fn(),console:{log:()=>{}},
    require:name=>name==='./weather'?{downloadWeather:force=>calls.push(['weather',force])}:
      name==='./info'?{downloadInfo:()=>calls.push(['info'])}:
      {PKIT_WEATHER:2,PKIT_INFO:3,PKIT_WEATHER_INFO:4,PKIT_INIT:5},
    Pebble:{addEventListener:(name,fn)=>{handlers[name]=fn;},sendAppMessage:(_,success,error)=>fail?error():success()}};
  vm.createContext(page);vm.runInContext(read('watchface/src/pkjs/index.js'),page);
  handlers.webviewclosed({response:encodeURIComponent(JSON.stringify({configIntText:'test',...options}))});
  return {calls,memory,handlers};
}
let saved = saveSettings({fetchWeatherNow:0});
check(saved.calls.length === 1 && saved.calls[0][0] === 'weather' && saved.calls[0][1] === true, 'phone refreshes after a save even when an old page sends an unchecked flag');
saved = saveSettings({fetchInfoNow:0,configInfoEnabled:1,configInfoURL:'https://example.test/info'});
check(saved.calls.length === 2 && saved.calls[1][0] === 'info', 'settings save can refresh weather and info together');
check(saveSettings({configInfoEnabled:0,configInfoURL:'https://example.test/info'}).calls.length === 1, 'inactive info widget does not fetch');
check(saveSettings({},true).calls.length === 0, 'failed settings transfer does not fetch for unapplied settings');
saved=saveSettings();saved.calls.length=0;saved.handlers.webviewclosed({response:''});
check(saved.calls.length === 0, 'closing settings without saving does not refresh');

const pkg = JSON.parse(read('watchface/package.json'));
check(pkg.version === '2.4.0' && read('web/public/pebble/ninetime/version.txt').trim() === '2.04', 'version 2.04');
check(/CONFIG_VERSION_MAJOR 2/.test(read('watchface/src/c/const.h')) && /CONFIG_VERSION_MINOR 4/.test(read('watchface/src/c/const.h')), 'watch configuration version');
check(!pkg.pebble.targetPlatforms.includes('emery'), 'PBT2 remains a future 3.xx port');
console.log('Weather JavaScript tests passed: ' + assertions + ' assertions; no external service contacted.');
