var site = require('./site-config.json');
var BASE_SITE_URL = site.baseUrl.replace(/\/+$/, '');
var BASE_CONFIG_URL = BASE_SITE_URL + '/ninetime/configpage.php';
var CONFIG_VERSION = 1.92; // Keep in sync with const.h and the configurator.

var PKIT_CONFIG=           1;
var PKIT_WEATHER=          2;
var PKIT_INFO=             3;
var PKIT_WEATHER_INFO=     4;
var PKIT_INIT=             5;

var WEATHER_FORECAST_MIN_FREQ=3*60*60; //seconds
var WEATHER_MIN_FREQ=3*60; //seconds
var LOCATION_MIN_FREQ=8*60; //seconds

var xhrRequest = function (url, type, callback,postdata) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  if(postdata && type == 'POST') {
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(postdata);
  }
  else xhr.send();

}; 

function locationdatafix(position){
  var positionObject = {};

  if ('coords' in position) {
    positionObject.coords = {};

    if ('latitude' in position.coords) {
      positionObject.coords.latitude = position.coords.latitude;
    }
    if ('longitude' in position.coords) {
      positionObject.coords.longitude = position.coords.longitude;
    }
    if ('accuracy' in position.coords) {
      positionObject.coords.accuracy = position.coords.accuracy;
    }
    if ('altitude' in position.coords) {
      positionObject.coords.altitude = position.coords.altitude;
    }
    if ('altitudeAccuracy' in position.coords) {
      positionObject.coords.altitudeAccuracy = position.coords.altitudeAccuracy;
    }
    if ('heading' in position.coords) {
      positionObject.coords.heading = position.coords.heading;
    }
    if ('speed' in position.coords) {
      positionObject.coords.speed = position.coords.speed;
    }
  }

  if ('timestamp' in position) {
    positionObject.timestamp = position.timestamp;
  }
  return positionObject;
}

function getEpoch(){
  return Math.round(new Date() / 1000); 
}

module.exports.getEpoch = getEpoch;
module.exports.BASE_CONFIG_URL = BASE_CONFIG_URL;
module.exports.CONFIG_VERSION = CONFIG_VERSION;
module.exports.PKIT_CONFIG = PKIT_CONFIG;
module.exports.PKIT_WEATHER = PKIT_WEATHER;
module.exports.PKIT_INFO = PKIT_INFO;
module.exports.PKIT_WEATHER_INFO = PKIT_WEATHER_INFO;
module.exports.PKIT_INIT = PKIT_INIT;
module.exports.WEATHER_FORECAST_MIN_FREQ = WEATHER_FORECAST_MIN_FREQ;
module.exports.WEATHER_MIN_FREQ = WEATHER_MIN_FREQ;
module.exports.LOCATION_MIN_FREQ = LOCATION_MIN_FREQ;
module.exports.xhrRequest = xhrRequest;
module.exports.locationdatafix = locationdatafix;

module.exports.BASE_SITE_URL = BASE_SITE_URL;
