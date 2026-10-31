
function getWeatherURL(apikey,city){
  var url="";
  var units="imperial";
  if(settings.weatherProvider == 0) {
      url = 'http://api.wunderground.com/api/' + apikey +
            '/conditions/q/' + encodeURIComponent(city) + '.json';
      url=NINETIME_BASE_URL + '/weather_wu.php?url='+encodeURIComponent(url);
  }
  if(settings.weatherProvider == 1) {
      url = 'http://api.openweathermap.org/data/2.5/weather?q=' +
        encodeURIComponent(city) + '&units='+units+'&appid=' + apikey;
      //url=NINETIME_BASE_URL + '/weather_owm.php?url='+encodeURIComponent(url);
  }
  if(settings.weatherProvider == 2) {
      /*url = 'https://query.yahooapis.com/v1/public/yql?q=' +
        encodeURIComponent('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="'+city+'")') +
        '&format=json';*/
      url = 'https://query.yahooapis.com/v1/public/yql?q=' +
        encodeURIComponent('select * from geo.places(1) where text="'+city+'"') +
        '&format=json';
  }
  if (apikey == 'NINETIME_SERVER_OWM') {
    url = NINETIME_BASE_URL + '/weather_owm.php?url=' + encodeURIComponent(url);
  }
  return url;
}


/// WU ////////////////////////

function getCurrentWeatherWU(apikey,city,saveto) {
    var url=getWeatherURL(apikey,city);

    xhrRequest(url, 'GET',
      function(responseText) {
        // responseText contains a JSON object with weather info
        var json;
        try {
          json = JSON.parse(responseText);
        }catch(e) {

          weatherError(apikey,city,saveto,'Response exception');
          return;
        }
        if(json.response.features && json.response.features.conditions == 1) {

            if (json.response.results) {
                //weatherSuccess(apikey,json.response.results[0].country+'/'+json.response.results[0].state+'/'+json.response.results[0].city,saveto);
                weatherSuccess(apikey,
                                 'zmw:'+json.response.results[0].zmw
                                 +'.'+json.response.results[0].city
                                 +','+json.response.results[0].state
                                 +','+json.response.results[0].country_name
                                 ,saveto,'zmw:'+json.response.results[0].zmw);
                
            }
            else if (json.current_observation && json.current_observation.display_location) {
                //weatherSuccess(apikey,json.current_observation.display_location.city+','+json.current_observation.display_location.state+','+json.current_observation.display_location.state_name,saveto);
                //weatherSuccess(apikey,json.current_observation.display_location.full,saveto);
                zmw='zmw:'+json.current_observation.display_location.zip
                      +'.'+json.current_observation.display_location.magic
                      +'.'+json.current_observation.display_location.wmo;
                weatherSuccess(apikey,zmw
                                 +'.'+json.current_observation.display_location.city
                                 +','+json.current_observation.display_location.state
                                 +','+json.current_observation.display_location.state_name
                                 ,saveto,zmw);
            }
            else{
                weatherError(apikey,city,saveto,(json.response.error)?json.response.error.description:"ERROR");
            }
        }
        else{

          weatherError(apikey,city,saveto,json.response.error.description);
        }
    });
}



/// OWM //////////////////////
function getCurrentWeatherOWM(apikey,city,saveto) {
    var url=getWeatherURL(apikey,city);

    xhrRequest(url, 'GET',
      function(responseText) {
        // responseText contains a JSON object with weather info
        var json;
        try {
          json = JSON.parse(responseText);
        }catch(e) {

          weatherError(apikey,city,saveto,'Response exception');
        }
        if(json.cod == "200") {

          weatherSuccess(apikey,json.name+','+json.sys.country,saveto,''+json.id+'');
        }
        else{

          weatherError(apikey,city,saveto,json.message);
        }
    });
}

/// Yahoo //////////////////////
function getCurrentWeatherYahoo(apikey,city,saveto) {
    var url=getWeatherURL(apikey,city);

    xhrRequest(url, 'GET',
      function(responseText) {
        // responseText contains a JSON object with weather info
        var json;
        try {
          json = JSON.parse(responseText);
        }catch(e) {

          weatherError(apikey,city,saveto,'Response exception');
        }
        if(json.query && json.query.count==1 && json.query.results && json.query.results.place && json.query.results.place.woeid) {

          weatherSuccess(apikey,json.query.results.place.name
                                +','+json.query.results.place.admin1.content
                                +','+json.query.results.place.country.code
                                ,saveto,json.query.results.place.woeid);
        }
        else{

          weatherError(apikey,city,saveto,(json.error)?json.error.description:'city not found');
        }
    });
}

function testWeather(apikey,city,saveto){
    if(settings.weatherProvider == 0) getCurrentWeatherWU(apikey,city,saveto);
    if(settings.weatherProvider == 1) getCurrentWeatherOWM(apikey,city,saveto);
    if(settings.weatherProvider == 2) getCurrentWeatherYahoo(apikey,city,saveto);
}
function weatherSuccess(apikey,city,saveto,cityId) {

    weatherChanged();
    if (saveto == 'api') {
        objstatus=document.getElementById('weather-api-status');
        document.getElementById('weather-api-key-input').value='';
        settings.weatherSettings[settings.weatherProvider].apiKey=apikey;
    }
    else{
        objstatus=document.getElementById('weather-city-status');
        document.getElementById('weather-city-input').value='';
        settings.weatherSettings[settings.weatherProvider].cityName=city;
        if (cityId) settings.weatherSettings[settings.weatherProvider].cityId=cityId;
    }
    if (objstatus) objstatus.innerHTML='OK';
    addClassname(objstatus,"status-ok");
    drawWeather();
}
function weatherError(apikey,city,saveto,error) {

    if (saveto == 'api') {
        objstatus=document.getElementById('weather-api-status');
    }
    else{
        objstatus=document.getElementById('weather-city-status');
    }
    if (objstatus) objstatus.innerHTML=error.substring(0,30);
    addClassname(objstatus,"status-error");
}

function weatherApiKeyCheck(check){
    if (!check) {
        obj=document.getElementById('weather-api-status');
        if (obj) obj.innerHTML='Checking...';
        removeClassname(obj,"status-ok");
        removeClassname(obj,"status-error");
        setTimeout(function(){weatherApiKeyCheck(1);},1000);
    }
    else{
        apikey=document.getElementById('weather-api-key-input').value.replace(/[^\w]/gi, '');
        saveto='api';
        city='London';
        if (apikey.length < 3) weatherError(apikey,city,saveto,'key too short');
        else testWeather(apikey,city,saveto);
    }
}
function weatherCityCheck(check){
    if (!check) {
        obj=document.getElementById('weather-city-status');
        if (obj) obj.innerHTML='Checking...';
        removeClassname(obj,"status-ok");
        removeClassname(obj,"status-error");
        setTimeout(function(){weatherCityCheck(1);},1000);
    }
    else{
        apikey=settings.weatherSettings[settings.weatherProvider].apiKey;


        saveto='city';
        city=document.getElementById('weather-city-input').value;
        if (city.length < 3) weatherError(apikey,city,saveto,'city too short');
        else testWeather(apikey,city,saveto);
    }
}
function weatherApiKeyDelete() {
    settings.weatherSettings[settings.weatherProvider].apiKey='';
    obj=document.getElementById('weather-api-status');
    if (obj) obj.innerHTML='';
    removeClassname(obj,"status-ok");
    removeClassname(obj,"status-error");
    drawWeather();
}
function weatherCityDelete() {
    settings.weatherSettings[settings.weatherProvider].cityName='';
    obj=document.getElementById('weather-city-status');
    if (obj) obj.innerHTML='';
    removeClassname(obj,"status-ok");
    removeClassname(obj,"status-error");
    drawWeather();
}

function weatherEnabled() { 
    return (weatherCurrentEnabled() || weatherForecastEnabled());
}
function weatherCurrentEnabled() {
    for (a=0 ; a<3 ; a++) {
        /*if (settings.verticalPositions[a] == STATUS_V_WEATHER_C_WIN) return true;
        if (settings.verticalPositions[a] == STATUS_V_WEATHER_WH) return true;
        if (settings.horizontalPositions[a] == STATUS_H_WEATHER_C) return true;
        if (settings.horizontalPositions[a] == STATUS_H_WEATHER_CITY) return true;*/
        if (getVerticalObject(settings.verticalPositions[a]).weather) return true;
        if (getHorizontalObject(settings.horizontalPositions[a]).weather) return true;
    }
    return false;
}
function weatherForecastEnabled() {
    for (a=0 ; a<3 ; a++) {
        /*if (settings.verticalPositions[a] == STATUS_V_WEATHER_F) return true;
        if (settings.horizontalPositions[a] == STATUS_H_WEATHER_F) return true;
        */
        if (getVerticalObject(settings.verticalPositions[a]).forecast) return true;
        if (getHorizontalObject(settings.horizontalPositions[a]).forecast) return true;
    }
    return false;
}
function weatherConditionTextEnabled() {
    //if (settings.weatherProvider == 2) return false;
    for (a=0 ; a<3 ; a++) {
      if (('weathercondition' in getHorizontalObject(settings.horizontalPositions[a])) && getHorizontalObject(settings.horizontalPositions[a]).weathercondition) return true;
    }
    return false;
}
function weatherLocationEnabled() {
    for (a=0 ; a<3 ; a++) {
      if (('weatherlocation' in getHorizontalObject(settings.horizontalPositions[a])) && getHorizontalObject(settings.horizontalPositions[a]).weatherlocation) return true;
    }
    return false;
}
function weatherChanged() {
    document.getElementById('weather-config-fetchnow').checked=true;
}
