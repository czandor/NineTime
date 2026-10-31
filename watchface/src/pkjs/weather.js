var vars = require('./vars');
var send = require('./send');
var busy = false;

function validPosition(latitude, longitude) {
  return latitude !== null && longitude !== null && latitude !== '' && longitude !== '' &&
    isFinite(Number(latitude)) && isFinite(Number(longitude)) &&
    Math.abs(Number(latitude)) <= 90 && Math.abs(Number(longitude)) <= 180;
}

function migrateSettings() {
  var provider = localStorage.getItem('configWeatherProvider');
  if (provider !== 'openmeteo' && provider !== 'metno') {
    localStorage.setItem('configWeatherProvider', 'openmeteo');
    localStorage.setItem('configWeatherLatitude', '');
    localStorage.setItem('configWeatherLongitude', '');
    localStorage.setItem('configWeatherLocation', '');
    localStorage.setItem('weatherLastDownload', '0');
  }
  localStorage.removeItem('configWeatherAPIKey');
  localStorage.removeItem('configWeatherLocationId');
  localStorage.removeItem('weatherLastURL');
  localStorage.removeItem('weatherForecastLastDownload');
}

function fail() {
  busy = false;
  localStorage.setItem('weatherDownloaded', '2');
  send.sendDataToPebble();
}

function request(url, callback) {
  var xhr = new XMLHttpRequest();
  var finished = false;
  function complete(value) {
    if (finished) return;
    finished = true;
    callback(value);
  }
  xhr.open('GET', url);
  xhr.timeout = 25000;
  xhr.onload = function () {
    if (xhr.status < 200 || xhr.status >= 300) return complete(null);
    try { complete(JSON.parse(xhr.responseText)); } catch (error) { complete(null); }
  };
  xhr.onerror = xhr.ontimeout = function () { complete(null); };
  xhr.send();
}

function cachedPosition() {
  try {
    var position = JSON.parse(localStorage.getItem('locationLastPosJSON'));
    if (position && position.coords && validPosition(position.coords.latitude, position.coords.longitude) &&
        vars.getEpoch() - Number(localStorage.getItem('locationLastDownload')) < 86400) return position.coords;
  } catch (error) {}
  return null;
}

function getPosition(callback) {
  var latitude = localStorage.getItem('configWeatherLatitude');
  var longitude = localStorage.getItem('configWeatherLongitude');
  if (validPosition(latitude, longitude)) return callback({ latitude: Number(latitude), longitude: Number(longitude) });
  var cached = cachedPosition();
  if (cached && vars.getEpoch() - Number(localStorage.getItem('locationLastDownload')) < vars.LOCATION_MIN_FREQ) return callback(cached);
  if (typeof navigator === 'undefined' || !navigator.geolocation) return callback(cached);
  try { navigator.geolocation.getCurrentPosition(function (position) {
    if (!position.coords || !validPosition(position.coords.latitude, position.coords.longitude)) return callback(cached);
    var coords = { latitude: Number(position.coords.latitude), longitude: Number(position.coords.longitude) };
    localStorage.setItem('locationLastPosJSON', JSON.stringify({ coords: coords }));
    localStorage.setItem('locationLastDownload', vars.getEpoch());
    callback(coords);
  }, function () { callback(cached); }, { timeout: 15000, maximumAge: 60000 }); }
  catch (error) { callback(cached); }
}

function numberInRange(value, low, high) {
  return typeof value === 'number' && isFinite(value) && value >= low && value <= high;
}

function validWeather(data) {
  return data && data.current && data.forecast &&
    numberInRange(data.current.temperatureC, -100, 70) &&
    numberInRange(data.current.humidity, 0, 100) &&
    numberInRange(data.current.windKph, 0, 500) &&
    numberInRange(data.current.icon, 0, 11) && data.current.icon % 1 === 0 &&
    numberInRange(data.forecast.icon, 0, 11) && data.forecast.icon % 1 === 0 &&
    numberInRange(data.forecast.minC, -100, 70) &&
    numberInRange(data.forecast.maxC, -100, 70) && data.forecast.minC <= data.forecast.maxC;
}

function fetchWeather(coords) {
  if (!coords) return fail();
  var latitude = Number(coords.latitude).toFixed(4);
  var longitude = Number(coords.longitude).toFixed(4);
  var provider = localStorage.getItem('configWeatherProvider');
  var metric = localStorage.getItem('configWeatherMetric') === '1';
  var language = localStorage.getItem('configWeatherLanguage') || 'en';
  var identity = [provider, latitude, longitude, metric, language].join('|');
  if (localStorage.getItem('weatherRequestIdentity') === identity &&
      vars.getEpoch() - Number(localStorage.getItem('weatherLastDownload')) < vars.WEATHER_MIN_FREQ) {
    busy = false;
    localStorage.setItem('weatherDownloaded', '1');
    return send.sendDataToPebble();
  }
  var url = vars.BASE_SITE_URL + '/weather.php?provider=' + encodeURIComponent(provider) +
    '&latitude=' + latitude + '&longitude=' + longitude + '&language=' + encodeURIComponent(language);
  request(url, function (data) {
    if (!validWeather(data)) return fail();
    function temperature(celsius) { return Math.round(metric ? celsius : celsius * 1.8 + 32); }
    localStorage.setItem('tempCurrent', temperature(data.current.temperatureC));
    localStorage.setItem('tempMin', temperature(data.forecast.minC));
    localStorage.setItem('tempMax', temperature(data.forecast.maxC));
    localStorage.setItem('humCurrent', Math.round(data.current.humidity));
    localStorage.setItem('weatherWindspeed', Math.round(metric ? data.current.windKph : data.current.windKph / 1.609344));
    localStorage.setItem('weatherIconC', data.current.icon);
    localStorage.setItem('weatherIconF', data.forecast.icon);
    localStorage.setItem('weatherCondition', data.condition || '');
    var city = localStorage.getItem('configWeatherLocation');
    localStorage.setItem('weatherLocation', city ? city.split(',')[0].slice(0, 32) : latitude + ', ' + longitude);
    localStorage.setItem('weatherLastDownload', vars.getEpoch());
    localStorage.setItem('weatherRequestIdentity', identity);
    localStorage.setItem('weatherDownloaded', '1');
    busy = false;
    send.sendDataToPebble();
  });
}

function downloadWeather() {
  if (busy) return;
  busy = true;
  migrateSettings();
  getPosition(fetchWeather);
}

module.exports.downloadWeather = downloadWeather;
module.exports.migrateSettings = migrateSettings;
