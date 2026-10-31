var vars = require('./vars');
var send = require('./send');

var WeatherIcons = {
  PARTLY_CLOUDY       : 0,
  CLOUDY_DAY          : 1,
  LIGHT_SNOW          : 2,
  LIGHT_RAIN          : 3,
  HEAVY_RAIN          : 4,
  HEAVY_SNOW          : 5,
  CLEAR_DAY           : 6,
  RAINING_AND_SNOWING : 7,
  PARTLY_CLOUDY_NIGHT : 8,
  CLEAR_NIGHT         : 9,
  THUNDERSTORM        : 10,
  FOG                 : 11
};
 
function needForecastDownload(){
  if(localStorage.getItem('configForecastEnabled') !='1') return false;
  var period=vars.WEATHER_FORECAST_MIN_FREQ; 
  var now=vars.getEpoch();
  return (((localStorage.getItem('weatherForecastLastDownload')*1) + period) <= now) ;
}

function needWeatherDownload(){
  var period=vars.WEATHER_MIN_FREQ;
  var now=vars.getEpoch();
  return (((localStorage.getItem('weatherLastDownload')*1) + period) <= now) ;
}

function needLocationDownload(){
  var period=vars.LOCATION_MIN_FREQ; 
  var now=vars.getEpoch();
  return (((localStorage.getItem('locationLastDownload')*1) + period) <= now) ;
}


function getLocation() {
  if(needLocationDownload()) {

    navigator.geolocation.getCurrentPosition(
      locationSuccess,
      locationError,
      {timeout: 15000, maximumAge: 60000}
    );
  }
  else{


    getWeather(localStorage.getItem('locationLastPosJSON'));
  }
}
var currentFailures=0;
var MAX_FAILURES=3;
function locationError(err) {

  //if we fail, try using the cached location
  if(currentFailures <= MAX_FAILURES) {
    // try again
    getLocation();
    currentFailures++;
  } else {
    // until we get too many failures, at which point give up

    currentFailures = 0;
    localStorage.setItem('weatherDownloaded','2');
    send.sendDataToPebble();
  }
}

function locationSuccess(pos) {
  currentFailures = 0;
  var position=vars.locationdatafix(pos);
  localStorage.setItem('locationLastPosJSON',JSON.stringify(position));

  localStorage.setItem('locationLastDownload',vars.getEpoch());
  getWeather();
}



function extractFakeDailyForecast(json) {
  var todaysForecast = {};

  // find the max and min of those temperatures
  todaysForecast.highTemp = -Number.MAX_SAFE_INTEGER;
  todaysForecast.lowTemp  = Number.MAX_SAFE_INTEGER;

  for(var i = 0; i < json.list.length; i++) {
    if(todaysForecast.highTemp < json.list[i].main.temp_max) {
      todaysForecast.highTemp = json.list[i].main.temp_max;
    }

    if(todaysForecast.lowTemp > json.list[i].main.temp_min) {
      todaysForecast.lowTemp = json.list[i].main.temp_min;
    }
  }

  // we can't really "average" conditions, so we'll just cheat and use...one of them :-O
  todaysForecast.condition = json.list[3].weather[0].id;

  return todaysForecast;
} 

/// WU ////////////////////////

function getIconForConditionCodeWU(conditionCode, isNight) {
  var iconToLoad;
  // determine the correct icon
  switch(conditionCode) {
    case 'chanceflurries':
      iconToLoad = WeatherIcons.LIGHT_SNOW;
      break;
    case 'chancerain':
      iconToLoad =WeatherIcons.LIGHT_RAIN;
      break;
    case 'chancesleet':
      iconToLoad = WeatherIcons.RAINING_AND_SNOWING;
      break;
    case 'chancesnow':
      iconToLoad = WeatherIcons.LIGHT_SNOW;
      break;
    case 'chancetstorms':
      iconToLoad = WeatherIcons.THUNDERSTORM;
      break;
    case 'clear':
      iconToLoad = (!isNight) ? WeatherIcons.CLEAR_DAY : WeatherIcons.CLEAR_NIGHT;
      break;
    case 'cloudy':
      iconToLoad = WeatherIcons.CLOUDY_DAY;
      break;
    case 'flurries':
      iconToLoad = WeatherIcons.LIGHT_SNOW;
      break;
    case 'fog':
    case 'hazy':
      iconToLoad = WeatherIcons.FOG;
      break;
    case 'mostlycloudy':
      iconToLoad = WeatherIcons.CLOUDY_DAY;
      break;
    case 'mostlysunny':
      iconToLoad = (!isNight) ? WeatherIcons.CLEAR_DAY : WeatherIcons.CLEAR_NIGHT;
      break;
    case 'partlycloudy':
      iconToLoad = (!isNight) ? WeatherIcons.PARTLY_CLOUDY : WeatherIcons.PARTLY_CLOUDY_NIGHT;
      break;
    case 'partlysunny':
      iconToLoad = (!isNight) ? WeatherIcons.PARTLY_CLOUDY : WeatherIcons.PARTLY_CLOUDY_NIGHT;
      break;
    case 'sleet':
      iconToLoad = WeatherIcons.RAINING_AND_SNOWING;
      break;
    case 'rain':
      iconToLoad = WeatherIcons.HEAVY_RAIN;
      break;
    case 'snow':
      iconToLoad = WeatherIcons.HEAVY_SNOW;
      break;
    case 'sunny':
      iconToLoad = (!isNight) ? WeatherIcons.CLEAR_DAY : WeatherIcons.CLEAR_NIGHT;
      break;
    case 'tstorms':
      iconToLoad =WeatherIcons.THUNDERSTORM;
      break;
    default:
      iconToLoad = WeatherIcons.CLOUDY_DAY;

      break;
  }

  return iconToLoad; 
}
 
function getForecastURL(){
  var forecastURL="";
  var currentpos;
  var location=localStorage.getItem('configWeatherLocation');
  var locationId=localStorage.getItem('configWeatherLocationId');
  
  var key=localStorage.getItem('configWeatherAPIKey');
  var units="imperial";
  if(localStorage.getItem('configWeatherMetric') == '1') units = "metric";
  if(localStorage.getItem('configWeatherProvider') == "wu") {
    if(locationId != ""){
      forecastURL = 'http://api.wunderground.com/api/' + key +
            '/forecast/q/' + encodeURIComponent(locationId) + '.json';
    }
    else if(location != ""){
      forecastURL = 'http://api.wunderground.com/api/' + key +
            '/forecast/q/' + encodeURIComponent(location) + '.json';
    }
    else {
      currentpos=JSON.parse(localStorage.getItem('locationLastPosJSON'));
      forecastURL = 'http://api.wunderground.com/api/' + key +
            '/forecast/q/' + currentpos.coords.latitude + ',' + currentpos.coords.longitude + '.json';
    }
    if(key=='NINETIME_SERVER_WU') forecastURL=vars.BASE_SITE_URL + '/weather_wu.php?url='+encodeURIComponent(forecastURL);
  }
  if(localStorage.getItem('configWeatherProvider') == "owm") {
    if(locationId != ""){
      forecastURL = 'http://api.openweathermap.org/data/2.5/forecast?id=' +
        encodeURIComponent(locationId) + '&cnt=8&units='+units+'&appid=' + key;
    }
    else if(location != ""){
      forecastURL = 'http://api.openweathermap.org/data/2.5/forecast?q=' +
        encodeURIComponent(location) + '&cnt=8&units='+units+'&appid=' + key;
    }
    else {
      currentpos=JSON.parse(localStorage.getItem('locationLastPosJSON'));
      forecastURL = 'http://api.openweathermap.org/data/2.5/forecast?lat=' +
        currentpos.coords.latitude + '&lon=' + currentpos.coords.longitude + '&cnt=8&units='+units+'&appid=' + key;
    }
    if(key=='NINETIME_SERVER_OWM') forecastURL=vars.BASE_SITE_URL + '/weather_owm.php?url='+encodeURIComponent(forecastURL);
  }
  return forecastURL;
}

function getWeatherURL(){
  var url="";
  var currentpos;
  var units="imperial";
  if(localStorage.getItem('configWeatherMetric') == '1') units = "metric";
  var location=localStorage.getItem('configWeatherLocation');
  var locationId=localStorage.getItem('configWeatherLocationId');
  var key=localStorage.getItem('configWeatherAPIKey');
  var language=localStorage.getItem('configWeatherLanguage');
  if(localStorage.getItem('configWeatherProvider') == "wu") {
    language=language.toUpperCase();
    if(locationId != ""){
      url = 'http://api.wunderground.com/api/' + key +
        '/conditions/lang:'+language+'/q/' + encodeURIComponent(locationId) + '.json';
    }
    else if(location != ""){
      url = 'http://api.wunderground.com/api/' + key +
        '/conditions/lang:'+language+'/q/' + encodeURIComponent(location) + '.json';
    }
    else{
      currentpos=JSON.parse(localStorage.getItem('locationLastPosJSON'));
      url = 'http://api.wunderground.com/api/' + key +
            '/conditions/lang:'+language+'/q/' + currentpos.coords.latitude + ',' + currentpos.coords.longitude + '.json';
    } 
    if(key=='NINETIME_SERVER_WU') url=vars.BASE_SITE_URL + '/weather_wu.php?url='+encodeURIComponent(url);
  }
  if(localStorage.getItem('configWeatherProvider') == "owm") {
    if(locationId != ""){
      url = 'http://api.openweathermap.org/data/2.5/weather?lang='+language+'&id=' +
        encodeURIComponent(locationId) + '&units='+units+'&appid=' + key;
    }
    else if(location != ""){
      url = 'http://api.openweathermap.org/data/2.5/weather?lang='+language+'&q=' +
        encodeURIComponent(location) + '&units='+units+'&appid=' + key;
    }
    else{
      currentpos=JSON.parse(localStorage.getItem('locationLastPosJSON'));
      url = 'http://api.openweathermap.org/data/2.5/weather?lang='+language+'&lat=' +
        currentpos.coords.latitude + '&lon=' + currentpos.coords.longitude + '&units='+units+'&appid=' + key;
    }
    if(key=='NINETIME_SERVER_OWM') url=vars.BASE_SITE_URL + '/weather_owm.php?url='+encodeURIComponent(url);
  }
  if(localStorage.getItem('configWeatherProvider') == "yahoo") {
    if(locationId != ""){
      url = 'https://query.yahooapis.com/v1/public/yql?q=' +
        encodeURIComponent('select * from weather.forecast where woeid ='+locationId+' and u="'+((units=='metric')?'c':'f')+'" ') + '&format=json';
    }
    else if(location != ""){
      url = 'https://query.yahooapis.com/v1/public/yql?q=' +
        encodeURIComponent('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="'+location+'") and u="'+((units=='metric')?'c':'f')+'" ') + '&format=json';
    }
    else{
      currentpos=JSON.parse(localStorage.getItem('locationLastPosJSON'));
      url = 'https://query.yahooapis.com/v1/public/yql?q=' +
        encodeURIComponent('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="('+currentpos.coords.latitude+','+currentpos.coords.longitude+')") and u="'+((units=='metric')?'c':'f')+'"') + '&format=json';
    }
  }
  return url;
}

function getForecastWeatherWU(){
    var forecastURL=getForecastURL();

    vars.xhrRequest(forecastURL, 'GET',
      function(responseText) {
        // responseText contains a JSON object with weather info
        var json;
        try {
          json = JSON.parse(responseText);
        }catch(e) {

          localStorage.setItem('weatherDownloaded',2);
          send.sendDataToPebble();
          return;
        }
        if(json.response.features.forecast == 1) {
          var todaysForecast = json.forecast.simpleforecast.forecastday[0]; 
          var tomorrowForecast = json.forecast.simpleforecast.forecastday[1]; 
          if(!tomorrowForecast) tomorrowForecast=todaysForecast;
          
          // Conditions
          var d = new Date();
          var conditionCode = todaysForecast.icon;
          if(d.getHours() > 20) conditionCode = tomorrowForecast.icon;
          var iconToLoad = getIconForConditionCodeWU(conditionCode, false);
          var lowTemp;
          var lowTemp2;
          var highTemp;
          var highTemp2;
          if(localStorage.getItem('configWeatherMetric') == '1'){
            lowTemp=Math.round(parseInt(todaysForecast.low.celsius, 10));
            highTemp=Math.round(parseInt(todaysForecast.high.celsius, 10));
            lowTemp2=Math.round(parseInt(tomorrowForecast.low.celsius, 10));
            highTemp2=Math.round(parseInt(tomorrowForecast.high.celsius, 10));
          }
          else{
            lowTemp=Math.round(parseInt(todaysForecast.low.fahrenheit, 10));
            highTemp=Math.round(parseInt(todaysForecast.high.fahrenheit, 10));
            lowTemp2=Math.round(parseInt(tomorrowForecast.low.fahrenheit, 10));
            highTemp2=Math.round(parseInt(tomorrowForecast.high.fahrenheit, 10));
          }
          if(lowTemp > lowTemp2) lowTemp=lowTemp2;
          if(highTemp < highTemp2) highTemp=highTemp2;
          

  
          localStorage.setItem('tempMin',lowTemp);
          localStorage.setItem('tempMax',highTemp);
          localStorage.setItem('weatherIconF',iconToLoad);


          localStorage.setItem('weatherForecastLastDownload',vars.getEpoch());
          localStorage.setItem('weatherDownloaded',1);
        }
        else{

          localStorage.setItem('weatherDownloaded',2);
        } 
        send.sendDataToPebble();
    }); 
}


function getCurrentWeatherWU() {
    var url=getWeatherURL();

    vars.xhrRequest(url, 'GET',
      function(responseText) {
        // responseText contains a JSON object with weather info
        var json;
        try {
          json = JSON.parse(responseText);
        }catch(e) {

          localStorage.setItem('weatherDownloaded',2);
          send.sendDataToPebble();
          return;
        }
        if(json.response.features.conditions == 1) {
          var temperature;
          var wind;
          if(localStorage.getItem('configWeatherMetric') == '1'){
            temperature = Math.round(json.current_observation.temp_c);
            wind = Math.round(json.current_observation.wind_kph);
          }
          else{
            temperature = Math.round(json.current_observation.temp_f);
            wind = Math.round(json.current_observation.wind_mph);
          }
          var city = json.current_observation.display_location.city;
          var hum = json.current_observation.relative_humidity.replace('%','');
          
          // Conditions
          var conditionCode = json.current_observation.icon;
          var condition = json.current_observation.weather;
  
          // night state
          var isNight = (json.current_observation.icon_url.indexOf('nt_') != -1) ? 1 : 0;
  
          var iconToLoad = getIconForConditionCodeWU(conditionCode, isNight);
          

          
          localStorage.setItem('weatherWindspeed',wind);
          localStorage.setItem('weatherLocation',city);
          localStorage.setItem('weatherCondition',condition);
          localStorage.setItem('tempCurrent',temperature);
          localStorage.setItem('humCurrent',hum);
          localStorage.setItem('weatherIconC',iconToLoad);
          localStorage.setItem('weatherLastDownload',vars.getEpoch());
          localStorage.setItem('weatherLastURL',getWeatherURL());
          getForecastWeather();
        }
        else{

          localStorage.setItem('weatherDownloaded',2);
          send.sendDataToPebble();
        }
    });
}



/// OWM //////////////////////

function getIconForConditionCodeOWM(conditionCode, isNight) {
  var generalCondition = Math.floor(conditionCode / 100);
  var iconToLoad;
  // determine the correct icon
  switch(generalCondition) {
    case 2: //thunderstorm
      iconToLoad = WeatherIcons.THUNDERSTORM;
      break;
    case 3: //drizzle
      iconToLoad = WeatherIcons.LIGHT_RAIN;
      break;
    case 5: //rain
      if(conditionCode == 500 || conditionCode == 520) {
        iconToLoad = WeatherIcons.LIGHT_RAIN;
      } else if(conditionCode < 505 || conditionCode > 520) {
        iconToLoad = WeatherIcons.HEAVY_RAIN;
      } else if(conditionCode == 511) {
        iconToLoad = WeatherIcons.RAINING_AND_SNOWING;
      } else {
        iconToLoad = WeatherIcons.LIGHT_RAIN;
      }
      break;
    case 6: //snow
      if(conditionCode == 600 || conditionCode == 620) {
        iconToLoad = WeatherIcons.LIGHT_SNOW;
      } else if(conditionCode > 610 && conditionCode < 620) {
        iconToLoad = WeatherIcons.RAINING_AND_SNOWING;
      } else {
        iconToLoad = WeatherIcons.HEAVY_SNOW;
      }
      break;
    case 7: // fog, dust, etc
      if(conditionCode < 771) {
        iconToLoad = WeatherIcons.FOG;
      } else {
        iconToLoad = WeatherIcons.CLOUDY_DAY;
      }
      break;
    case 8: // clouds
      if(conditionCode == 800) {
        iconToLoad = (!isNight) ? WeatherIcons.CLEAR_DAY : WeatherIcons.CLEAR_NIGHT;
      } else if(conditionCode < 803) {
        iconToLoad = (!isNight) ? WeatherIcons.PARTLY_CLOUDY : WeatherIcons.PARTLY_CLOUDY_NIGHT;
      } else {
        iconToLoad = WeatherIcons.CLOUDY_DAY;
      }
      break;
    default:
      iconToLoad = WeatherIcons.CLOUDY_DAY;
      break;
  }

  return iconToLoad;
}
 

function getForecastWeatherOWM(){
  if(needForecastDownload()){
    var forecastURL=getForecastURL();

    vars.xhrRequest(forecastURL, 'GET',
      function(responseText) {
        // responseText contains a JSON object with weather info
        var json;
        try {
          json = JSON.parse(responseText);
        }catch(e) {

          localStorage.setItem('weatherDownloaded',2);
          send.sendDataToPebble();
          return;
        }
        if(json.cod == "200") {
          var forecast = extractFakeDailyForecast(json);
  
          
          // Conditions
          var conditionCode = forecast.condition;
          
          var iconToLoad = getIconForConditionCodeOWM(conditionCode, false);
          var lowTemp=Math.round(forecast.lowTemp);
          var highTemp=Math.round(forecast.highTemp);
          

  
          localStorage.setItem('tempMin',lowTemp);
          localStorage.setItem('tempMax',highTemp);
          localStorage.setItem('weatherIconF',iconToLoad);


          localStorage.setItem('weatherForecastLastDownload',vars.getEpoch());
          localStorage.setItem('weatherDownloaded',1);          
        }
        else{

          localStorage.setItem('weatherDownloaded',2);
        } 
        send.sendDataToPebble();
    }); 
  }
  else {


    localStorage.setItem('weatherDownloaded',1);
    send.sendDataToPebble();
  }
}


function getCurrentWeatherOWM() {
    var url=getWeatherURL();

    vars.xhrRequest(url, 'GET',
      function(responseText) {
        // responseText contains a JSON object with weather info
        var json;
        try {
          json = JSON.parse(responseText);
        }catch(e) {

          localStorage.setItem('weatherDownloaded',2);
          send.sendDataToPebble();
        }
        if(json.cod == "200") {
          var temperature = Math.round(json.main.temp);
          var hum = Math.round(json.main.humidity);
          var wind=-1;
          if(json.wind) {
            if(localStorage.getItem('configWeatherMetric') == '1'){
              wind = Math.round(json.wind.speed*3.6);
            }
            else{
              wind = Math.round(json.wind.speed);
            }
          }
          var city = "";
          if(json.name) city=json.name;
          else if(json.main.name) city=json.main.name;
  
          // Conditions
          var conditionCode = json.weather[0].id;
          var condition = json.weather[0].description;
          if(condition) condition=condition.charAt(0).toUpperCase() + condition.slice(1);
          
          // night state
          var isNight = (json.weather[0].icon.slice(-1) == 'n') ? 1 : 0;
  
          var iconToLoad = getIconForConditionCodeOWM(conditionCode, isNight);
          

          
          localStorage.setItem('weatherWindspeed',wind);
          localStorage.setItem('weatherLocation',city);
          localStorage.setItem('weatherCondition',condition);
          localStorage.setItem('tempCurrent',temperature);
          localStorage.setItem('humCurrent',hum);
          localStorage.setItem('weatherIconC',iconToLoad);
          localStorage.setItem('weatherLastDownload',vars.getEpoch());
          localStorage.setItem('weatherLastURL',getWeatherURL());
          getForecastWeather();
        }
        else{

          localStorage.setItem('weatherDownloaded',2);
          send.sendDataToPebble();
        }
    });
}

/// Yahoo //////////////////////
/*
  PARTLY_CLOUDY       : 0,
  CLOUDY_DAY          : 1,
  LIGHT_SNOW          : 2,
  LIGHT_RAIN          : 3,
  HEAVY_RAIN          : 4,
  HEAVY_SNOW          : 5,
  CLEAR_DAY           : 6,
  RAINING_AND_SNOWING : 7,
  PARTLY_CLOUDY_NIGHT : 8,
  CLEAR_NIGHT         : 9,
  THUNDERSTORM        : 10,
  FOG                 : 11
  */
function getIconForConditionCodeYahoo(conditionCode) {
  var iconToLoad;
  // determine the correct icon
  switch(conditionCode) {
    case 0: 
    case 1:
    case 2:
    case 3:
    case 4:
    case 37:
    case 38:
    case 39:
    case 45:
    case 47:
      iconToLoad = WeatherIcons.THUNDERSTORM;
      break;
    case 5:
    case 6:
    case 7:
    case 8: 
    case 10:
    case 17:
    case 18:
    case 35:
      iconToLoad = WeatherIcons.RAINING_AND_SNOWING;
      break;
    case 9:
    case 40:
      iconToLoad = WeatherIcons.LIGHT_RAIN;
      break;
    case 11:
    case 12:
      iconToLoad = WeatherIcons.HEAVY_RAIN;
      break;
    case 13:
    case 15:
    case 41:
    case 43:
    case 46:
      iconToLoad = WeatherIcons.HEAVY_SNOW;
      break;
    case 14:
    case 16:
    case 42:
      iconToLoad = WeatherIcons.LIGHT_SNOW;
      break;
    case 19:
    case 20:
    case 21:
    case 22:
      iconToLoad = WeatherIcons.FOG;
      break;
    case 23:
    case 24:
    case 25:
    case 26:
    case 44:
      iconToLoad = WeatherIcons.CLOUDY_DAY;
      break;
    case 27:
    case 29:
      iconToLoad = WeatherIcons.PARTLY_CLOUDY_NIGHT;
      break;
    case 28:
    case 30:
      iconToLoad = WeatherIcons.PARTLY_CLOUDY;
      break;
    case 31:
    case 33:
      iconToLoad = WeatherIcons.CLEAR_NIGHT;
      break;
    case 32:
    case 34:
    case 36:
      iconToLoad = WeatherIcons.CLEAR_DAY;
      break;
    default:
      iconToLoad = WeatherIcons.CLOUDY_DAY;
      break;
  }

  return iconToLoad;
}

function getCurrentWeatherYahoo() {
    var url=getWeatherURL();

    vars.xhrRequest(url, 'GET',
      function(responseText) {
        // responseText contains a JSON object with weather info
        var json;
        try {
          json = JSON.parse(responseText);
        }catch(e) {

          localStorage.setItem('weatherDownloaded',2);
          send.sendDataToPebble();
        }
        if(json.query && json.query.count==1 && json.query.results && json.query.results.channel && json.query.results.channel.location) {
          var temperature = Math.round(json.query.results.channel.item.condition.temp);
          var hum = Math.round(json.query.results.channel.atmosphere.humidity);
          var wind=-1;
          if(json.query.results.channel.wind) wind = Math.round(json.query.results.channel.wind.speed);
          var city = json.query.results.channel.location.city;
  
          // Conditions
          var conditionCode = json.query.results.channel.item.condition.code*1;
          var condition = json.query.results.channel.item.condition.text;
  
          var iconToLoad = getIconForConditionCodeYahoo(conditionCode);
          

          
          localStorage.setItem('weatherWindspeed',wind);
          localStorage.setItem('weatherLocation',city);
          localStorage.setItem('weatherCondition',condition);
          localStorage.setItem('tempCurrent',temperature);
          localStorage.setItem('humCurrent',hum);
          localStorage.setItem('weatherIconC',iconToLoad);
          localStorage.setItem('weatherLastDownload',vars.getEpoch());
          localStorage.setItem('weatherLastURL',getWeatherURL());
          //getForecastWeather();
          var todaysForecast = json.query.results.channel.item.forecast[0]; 
          var tomorrowForecast = json.query.results.channel.item.forecast[1]; 
          if(!tomorrowForecast) tomorrowForecast=todaysForecast;

          // Conditions
          var d = new Date();
          conditionCode = todaysForecast.code;
          if(d.getHours() > 20) conditionCode = tomorrowForecast.code;
          iconToLoad = getIconForConditionCodeYahoo(conditionCode);
          var lowTemp;
          var lowTemp2;
          var highTemp;
          var highTemp2;
          lowTemp=Math.round(parseInt(todaysForecast.low, 10));
          highTemp=Math.round(parseInt(todaysForecast.high, 10));
          lowTemp2=Math.round(parseInt(tomorrowForecast.low, 10));
          highTemp2=Math.round(parseInt(tomorrowForecast.high, 10));
          if(lowTemp > lowTemp2) lowTemp=lowTemp2;
          if(highTemp < highTemp2) highTemp=highTemp2;



          localStorage.setItem('tempMin',lowTemp);
          localStorage.setItem('tempMax',highTemp);
          localStorage.setItem('weatherIconF',iconToLoad);


          localStorage.setItem('weatherForecastLastDownload',vars.getEpoch());
          localStorage.setItem('weatherDownloaded',1);
        }
        else{

          localStorage.setItem('weatherDownloaded',2);
        }
        send.sendDataToPebble();
    });
}

function getWeather(){
  if(needWeatherDownload()){
    if(localStorage.getItem('configWeatherProvider') == "owm") getCurrentWeatherOWM();
    else if(localStorage.getItem('configWeatherProvider') == "wu") getCurrentWeatherWU();
    else if(localStorage.getItem('configWeatherProvider') == "yahoo") getCurrentWeatherYahoo();
    else{
      localStorage.setItem('weatherDownloaded',2);

      send.sendDataToPebble();
    }
  }
  else{

    if(localStorage.getItem('configWeatherProvider') == "owm") getForecastWeatherOWM();
    else if(localStorage.getItem('configWeatherProvider') == "wu") getForecastWeatherWU();
    else{
      localStorage.setItem('weatherDownloaded',2);

      send.sendDataToPebble();
    }
  }
}
function getForecastWeather(){
  if(needForecastDownload()){
    if(localStorage.getItem('configWeatherProvider') == "owm") getForecastWeatherOWM();
    else if(localStorage.getItem('configWeatherProvider') == "wu") getForecastWeatherWU();
    else{
      localStorage.setItem('weatherDownloaded',2);

      send.sendDataToPebble();
    }
  }
  else {


    localStorage.setItem('weatherDownloaded',1);
    send.sendDataToPebble();
  }

}

function downloadWeather(){

  var wlocation=localStorage.getItem('configWeatherLocation');
  if(wlocation == "")  getLocation();
  else getWeather();
}

module.exports.downloadWeather = downloadWeather;






