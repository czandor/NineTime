var weather = require('./weather');
var info = require('./info');
var vars = require('./vars');
//var send = require('./send');


function initStorage(force){
  // persistent variables for JS
  if(force || localStorage.getItem('lastRequestType') === null) localStorage.setItem('lastRequestType','0');
  if(force || localStorage.getItem('weatherDownloaded') === null) localStorage.setItem('weatherDownloaded','0'); //0: download not finished, 1: download succesfully, 2: download error
  if(force || localStorage.getItem('infoDownloaded') === null) localStorage.setItem('infoDownloaded','0'); //0: download not finished, 1: download succesfully, 2: download error
  if(force || localStorage.getItem('weatherLastDownload') === null) localStorage.setItem('weatherLastDownload','0'); // current weather minimum sync 15 minutes
  if(force || localStorage.getItem('locationLastDownload') === null) localStorage.setItem('locationLastDownload','0'); // forecast need to download every 3 hours
  if(force || localStorage.getItem('locationLastPosJSON') === null) localStorage.setItem('locationLastPosJSON',''); // forecast need to download every 3 hours
    
  // variables for weather send to pebble
  if(force || localStorage.getItem('weatherLocation') === null) localStorage.setItem('weatherLocation',"Unknown City"); //city name
  if(force || localStorage.getItem('tempCurrent') === null) localStorage.setItem('tempCurrent',999);
  if(force || localStorage.getItem('humCurrent') === null) localStorage.setItem('humCurrent',999);
  if(force || localStorage.getItem('tempMin') === null) localStorage.setItem('tempMin',-99);
  if(force || localStorage.getItem('tempMax') === null) localStorage.setItem('tempMax',99);
  if(force || localStorage.getItem('weatherIconC') === null) localStorage.setItem('weatherIconC',0);
  if(force || localStorage.getItem('weatherIconF') === null) localStorage.setItem('weatherIconF',1);
  if(force || localStorage.getItem('weatherWindspeed') === null) localStorage.setItem('weatherWindspeed',88);

  // variable for infotext send to pebble
  if(force || localStorage.getItem('infoText') === null) localStorage.setItem('infoText',"INFOTEXT");
  if(force || localStorage.getItem('infoTitle') === null) localStorage.setItem('infoTitle',"");
  if(force || localStorage.getItem('infoBody') === null) localStorage.setItem('infoBody',"");
  
  // configs send to pebble
  if(force || localStorage.getItem('configIntText') === null) localStorage.setItem('configIntText',""); //value_appConfigInt values (int=char-32, cahr < 127!!!!)
  if(force || localStorage.getItem('configTextString') === null) localStorage.setItem('configTextString',"PEBBLE"); //UTF8!!!!
  if(force || localStorage.getItem('configTextStringEnabled') === null) localStorage.setItem('configTextStringEnabled',"0"); 
  if(force || localStorage.getItem('configMonthnames') === null) localStorage.setItem('configMonthnames',"JAN,FEB,MÁR,ÁPR,MÁJ,JÚN,JÚL,AUG,SZE,OKT,NOV,DEC"); //UTF8!!!!
  if(force || localStorage.getItem('configDaynames') === null) localStorage.setItem('configDaynames',"VAS,HÉT,KED,SZE,CSÜ,PÉN,SZO"); //UTF8!!!!

  // configs from phone config page, use only in JS
  if(force || localStorage.getItem('configWeatherProvider') === null) localStorage.setItem('configWeatherProvider','openmeteo');
  if(force || localStorage.getItem('configWeatherLocation') === null) localStorage.setItem('configWeatherLocation',""); // "":by config, city name
  if(force || localStorage.getItem('configWeatherLatitude') === null) localStorage.setItem('configWeatherLatitude','');
  if(force || localStorage.getItem('configWeatherLongitude') === null) localStorage.setItem('configWeatherLongitude','');
  
  if(force || localStorage.getItem('configWeatherLanguage') === null) localStorage.setItem('configWeatherLanguage',""); // "":by config, weather condition language
  if(force || localStorage.getItem('configWeatherMetric') === null) localStorage.setItem('configWeatherMetric',"1"); // 1: metric, 0: imperial
  if(force || localStorage.getItem('configForecastEnabled') === null) localStorage.setItem('configForecastEnabled',"1"); 
  if(force || localStorage.getItem('configWeatherLocationEnabled') === null) localStorage.setItem('configWeatherLocationEnabled',"1"); 
  if(force || localStorage.getItem('configInfoURL') === null) localStorage.setItem('configInfoURL',vars.BASE_SITE_URL + '/words.php'); // URL for downloading INFO text (json[0]), "": default, words from the configured NineTime server
  if(force || localStorage.getItem('configInfoUsePos') === null) localStorage.setItem('configInfoUsePos',"1"); // send position to info url by POST JSON
  if(force || localStorage.getItem('configInfoData') === null) localStorage.setItem('configInfoData',""); // send some data (eg,token) to info url by POST JSON (future use)
  if(force || localStorage.getItem('configInfoLanguage') === null) localStorage.setItem('configInfoLanguage',"en"); // language for info script
  
  // data coming from pebble
  if(force || localStorage.getItem('pebbleBatt') === null) localStorage.setItem('pebbleBatt',"-1"); // pebble battery percent
  if(force || localStorage.getItem('pebbleSteps') === null) localStorage.setItem('pebbleSteps',"0"); // steps from last info request
  if(force || localStorage.getItem('pebbleHrbpm') === null) localStorage.setItem('pebbleHrbpm',"0"); // average heart rate in bpm from last info request
  if(force || localStorage.getItem('pebbleHrbpmMin') === null) localStorage.setItem('pebbleHrbpmMin',"0"); // min heart rate in bpm from last info request
  if(force || localStorage.getItem('pebbleHrbpmMax') === null) localStorage.setItem('pebbleHrbpmMax',"0"); // max heart rate in bpm from last info request
  if(force || localStorage.getItem('pebbleLastData') === null) localStorage.setItem('pebbleLastData',"0"); // health data from this time to now
  if(force || localStorage.getItem('pebbleH24') === null) localStorage.setItem('pebbleH24',"2"); // Pebble watch is in 24h mode //2 mean no info
  
  // data sending to config page
  if(force || localStorage.getItem('watchinfoToken') === null) localStorage.setItem('watchinfoToken',""); 
  if(force || localStorage.getItem('watchinfoPlatform') === null) localStorage.setItem('watchinfoPlatform',"unknown"); 
  if(force || localStorage.getItem('watchinfoModel') === null) localStorage.setItem('watchinfoModel',"unknown"); 
  
  weather.migrateSettings();
}


// Listen for when the watchface is opened
Pebble.addEventListener('ready',
  function(e) {

    initStorage();
  }
);

// Listen for incoming messages
// when one is received, we simply assume that it is a request for new weather data
Pebble.addEventListener('appmessage',
  function(msg) {

    
    // in the case of recieving this, we assume the watch does, in fact, need weather data
    //window.localStorage.setItem('disable_weather', 'no');
    //weather.updateWeather();
    //var type=msg.payload[0]*1;
    var type=msg.payload.TYPE*1;
    var batt=msg.payload.BATTERY*1;
    var steps=0;
    var hrbpm=0;
    var hrbpmmin=0;
    var hrbpmmax=0;
    var lastdata=0;
    if(msg.payload.STEPS){
      steps=msg.payload.STEPS*1;
      hrbpm=msg.payload.HRBPM*1;
      hrbpmmin=msg.payload.HRBPM_MIN*1;
      hrbpmmax=msg.payload.HRBPM_MAX*1;
      lastdata=msg.payload.HEALTH_LASTDATA*1;
    }
    var h24=msg.payload.H24*1;
    localStorage.setItem('pebbleBatt',batt);
    localStorage.setItem('pebbleSteps',steps);
    localStorage.setItem('pebbleHrbpm',hrbpm);
    localStorage.setItem('pebbleHrbpmMin',hrbpmmin);
    localStorage.setItem('pebbleHrbpmMax',hrbpmmax);
    localStorage.setItem('pebbleLastData',lastdata);
    localStorage.setItem('pebbleH24',h24);
    if(type == vars.PKIT_WEATHER || type == vars.PKIT_INFO || type == vars.PKIT_WEATHER_INFO){

      localStorage.setItem('lastRequestType',type);
      localStorage.setItem('weatherDownloaded','0');
      localStorage.setItem('infoDownloaded','0');
      if(type == vars.PKIT_WEATHER) localStorage.setItem('infoDownloaded','1'); // need just weather, set info to already downloaded, will not send because of type=PKIT_WEATHER
      if(type == vars.PKIT_INFO) localStorage.setItem('weatherDownloaded','1'); // need just info, set weather to already downloaded, will not send because of type=PKIT_INFO
      if(localStorage.getItem('weatherDownloaded') == "0") weather.downloadWeather();
      if(localStorage.getItem('infoDownloaded') == "0") info.downloadInfo();
      //sendDataToPebble();
    }
    else if(type == vars.PKIT_INIT){

      //showConfiguration();
    }
    else void 0;
  }
);

function showConfiguration(){
  /*var timeout=5;
  var starttime=vars.getEpoch();
  var acttime=starttime;
  while(localStorage.getItem('pebbleH24') == '2' && (starttime+timeout) >= acttime) {
    acttime=vars.getEpoch();
  }
  */
  var configurl=vars.BASE_CONFIG_URL;
  var watch;
  var token;
  if(Pebble.getActiveWatchInfo) {
    try {
      watch = Pebble.getActiveWatchInfo();
    } catch(err) {
      watch = {
        platform: "basalt",
        model: "unknown"
      };
    }
  } else {
    watch = {
      platform: "aplite",
      model: "unknown"
    };
  }
  
  if(Pebble.getWatchToken) {
    try {
      token = Pebble.getWatchToken();
    } catch(err) {
      token = "";
    }
  } else {
    token="";
  }
  
  localStorage.setItem('watchinfoToken',token); 
  localStorage.setItem('watchinfoPlatform',watch.platform); 
  localStorage.setItem('watchinfoModel',watch.model); 
  
  Pebble.openURL(configurl+"?"+vars.getEpoch()+
                           "&token="+localStorage.getItem('watchinfoToken')+
                           "&platform="+localStorage.getItem('watchinfoPlatform')+
                           "&model="+localStorage.getItem('watchinfoModel')+
                           "&batt="+localStorage.getItem('pebbleBatt')+
                           "&h24="+localStorage.getItem('pebbleH24')+
                           "&CONFIG_VERSION="+vars.CONFIG_VERSION+
                           "&d0="+localStorage.getItem('weatherLastDownload')+
                           "&d1="+encodeURIComponent(localStorage.getItem('weatherLocation'))+
                           "&d2="+localStorage.getItem('tempCurrent')+
                           "&d3="+localStorage.getItem('humCurrent')+
                           "&d4="+localStorage.getItem('tempMin')+
                           "&d5="+localStorage.getItem('tempMax')+
                           "&d6="+localStorage.getItem('weatherIconC')+
                           "&d7="+localStorage.getItem('weatherIconF')+
                           "&d8="+localStorage.getItem('weatherWindspeed')+
                           "&d9="+encodeURIComponent(localStorage.getItem('infoText'))+
                           "&da="+encodeURIComponent(localStorage.getItem('configTextString'))+
                           "&db="+localStorage.getItem('pebbleLastData')+
                           "&dc="+localStorage.getItem('pebbleSteps')+
                           "&dd="+localStorage.getItem('pebbleHrbpm')+
                           "&de="+localStorage.getItem('pebbleHrbpmMin')+
                           "&df="+localStorage.getItem('pebbleHrbpmMax')
                            );  
}

Pebble.addEventListener('showConfiguration', function(e) {
  //Pebble.openURL("javascript:document.write('Loading...')");
  
  
  showConfiguration();
});

Pebble.addEventListener('webviewclosed', function(e) {

  var configData = (e.response)?decodeURIComponent(e.response):null;

  if(configData) {
    configData = JSON.parse(decodeURIComponent(e.response));
    

    
    // prepare a structure to hold everything we'll send to the watch
    var dict = {};

   if('configIntText' in configData) {
      localStorage.setItem('configIntText',configData.configIntText);
    }
    if('configTextString' in configData) {
      localStorage.setItem('configTextString',configData.configTextString);
    }
    if('configMonthnames' in configData) {
      localStorage.setItem('configMonthnames',configData.configMonthnames);
    }
    if('configDaynames' in configData) {
      localStorage.setItem('configDaynames',configData.configDaynames);
    }
    if('configWeatherProvider' in configData) {
      localStorage.setItem('configWeatherProvider',configData.configWeatherProvider);
    }

    if('configWeatherLocation' in configData) {
      localStorage.setItem('configWeatherLocation',configData.configWeatherLocation);
    }
    if ('configWeatherLatitude' in configData) localStorage.setItem('configWeatherLatitude', configData.configWeatherLatitude === null ? '' : configData.configWeatherLatitude);
    if ('configWeatherLongitude' in configData) localStorage.setItem('configWeatherLongitude', configData.configWeatherLongitude === null ? '' : configData.configWeatherLongitude);
    if('configWeatherLanguage' in configData) {
      localStorage.setItem('configWeatherLanguage',configData.configWeatherLanguage);
    }
    if('configWeatherMetric' in configData) {
      localStorage.setItem('configWeatherMetric',configData.configWeatherMetric);
    }
    if('configInfoURL' in configData) {
      localStorage.setItem('configInfoURL',configData.configInfoURL);
    }
    if('configInfoUsePos' in configData) {
      localStorage.setItem('configInfoUsePos',configData.configInfoUsePos);
    }
    if('configInfoData' in configData) {
      localStorage.setItem('configInfoData',configData.configInfoData);
    }
    if('configInfoLanguage' in configData) {
      localStorage.setItem('configInfoLanguage',configData.configInfoLanguage);
    }
    if('configForecastEnabled' in configData) {
      localStorage.setItem('configForecastEnabled',configData.configForecastEnabled);
    }
    if('configTextStringEnabled' in configData) {
      localStorage.setItem('configTextStringEnabled',configData.configTextStringEnabled);
    }
    if('configWeatherLocationEnabled' in configData) {
      localStorage.setItem('configWeatherLocationEnabled',configData.configWeatherLocationEnabled);
    }
    
    
    dict[200] = localStorage.getItem('configIntText');
    if(localStorage.getItem('configTextStringEnabled')=='1') dict[201] = localStorage.getItem('configTextString');
    if(localStorage.getItem('configMonthnames')) dict[202] = localStorage.getItem('configMonthnames');
    if(localStorage.getItem('configDaynames')) dict[203] = localStorage.getItem('configDaynames');
    



    // Send settings to Pebble watchapp
    Pebble.sendAppMessage(dict, function(){


      // after sending config data, force a weather refresh in case that changed
      
      /*if(type == vars.PKIT_WEATHER || type == vars.PKIT_INFO || type == vars.PKIT_WEATHER_INFO){

      localStorage.setItem('lastRequestType',type);
      localStorage.setItem('weatherDownloaded','0');
      localStorage.setItem('infoDownloaded','0');
      if(type == vars.PKIT_WEATHER) localStorage.setItem('infoDownloaded','1'); // need just weather, set info to already downloaded, will not send because of type=PKIT_WEATHER
      if(type == vars.PKIT_INFO) localStorage.setItem('weatherDownloaded','1'); // need just info, set weather to already downloaded, will not send because of type=PKIT_INFO
      if(localStorage.getItem('weatherDownloaded') == "0") weather.downloadWeather();
      if(localStorage.getItem('infoDownloaded') == "0") info.downloadInfo();
      //sendDataToPebble();
      }*/
      var type=0;
      if(configData.fetchWeatherNow && configData.fetchWeatherNow > 0){
        type = vars.PKIT_WEATHER;
        localStorage.setItem('weatherLastDownload','0');
        localStorage.setItem('locationLastDownload','0');
      }
      if(configData.fetchInfoNow && configData.fetchInfoNow > 0){
        if(type) type=vars.PKIT_WEATHER_INFO;
        else type=vars.PKIT_INFO;
      }
      if(type > 0){
        localStorage.setItem('lastRequestType',type);
        localStorage.setItem('weatherDownloaded','0');
        localStorage.setItem('infoDownloaded','0');
        if(type == vars.PKIT_WEATHER) localStorage.setItem('infoDownloaded','1'); // need just weather, set info to already downloaded, will not send because of type=PKIT_WEATHER
        if(type == vars.PKIT_INFO) localStorage.setItem('weatherDownloaded','1'); // need just info, set weather to already downloaded, will not send because of type=PKIT_INFO
        setTimeout(function(){
          if(localStorage.getItem('weatherDownloaded') == "0") weather.downloadWeather();
          if(localStorage.getItem('infoDownloaded') == "0") info.downloadInfo();
        },300);
      }
    }, function() {

    });
    
  } else {

  }

});
