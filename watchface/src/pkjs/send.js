var vars = require('./vars');
function sendDataToPebble() {
  // Send to Pebble
  //var i;
  var type=localStorage.getItem('lastRequestType')*1;
  if(type == vars.PKIT_INIT || (localStorage.getItem('weatherDownloaded') != "0" && localStorage.getItem('infoDownloaded') != "0")) {
    var dictionary = {
      //0: type
    };
    if((type == vars.PKIT_WEATHER_INFO || type == vars.PKIT_WEATHER) && localStorage.getItem('weatherDownloaded') == "1"){
      dictionary[0]=localStorage.getItem('tempCurrent')*1;
      dictionary[1]=localStorage.getItem('tempMin')*1;
      dictionary[2]=localStorage.getItem('tempMax')*1;
      dictionary[3]=localStorage.getItem('weatherIconC')*1;
      dictionary[4]=localStorage.getItem('weatherIconF')*1;
      dictionary[5]=localStorage.getItem('weatherWindspeed')*1;
      dictionary[6]=localStorage.getItem('humCurrent')*1;
      if(localStorage.getItem('configWeatherLocationEnabled') == '1') dictionary[7]=localStorage.getItem('weatherLocation');
      if(localStorage.getItem('configWeatherLanguage')) dictionary[8]=localStorage.getItem('weatherCondition');
      
      //for(i=0 ; i<weatherData.length ; i++) dictionary[i]=weatherData[i];
    }
    if((type == vars.PKIT_WEATHER_INFO || type == vars.PKIT_INFO) && localStorage.getItem('infoDownloaded') == "1"){
      //infoText=new Date().toLocaleString();
      dictionary[100]=localStorage.getItem('infoText');
    }
    /*if(type == vars.PKIT_CONFIG){
      dictionary[200]=localStorage.getItem('configIntText');
      if(localStorage.getItem('configTextStringEnabled')=='1') dictionary[201]=localStorage.getItem('configTextString');
      if(localStorage.getItem('configMonthnames')) dictionary[202]=localStorage.getItem('configMonthnames');
      if(localStorage.getItem('configDaynames')) dictionary[203]=localStorage.getItem('configDaynames');
    }*/
    if(type == vars.PKIT_INIT){
      dictionary[300]=1;
    }
    
    if(Object.keys(dictionary).length) Pebble.sendAppMessage(dictionary,
      function(e) {


        /*if(localStorage.getItem('infoTitle') != ''){
          clearTimeout(notificatonTimer);
          notificatonTimer=setTimeout(function(){
            Pebble.showSimpleNotificationOnPebble(localStorage.getItem('infoTitle'), localStorage.getItem('infoBody'));
            localStorage.setItem('infoTitle','');
          },10000);
        }*/
      },
      function(e) {
        // if we fail, wait a couple seconds, then try again
        //if(currentFailures < failureRetryAmount) {
          // call it again somewhere between 3 and 10 seconds
          //setTimeout(updateWeather, Math.floor(Math.random() * 10000) + 3000);
  
          //currentFailures++;
        //} else {
          //currentFailures = 0;
        //}
  

      }
    );
    else void 0;
  }
  else void 0;
}
 
module.exports.sendDataToPebble = sendDataToPebble;


