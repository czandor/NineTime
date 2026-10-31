
function getPmkeyURL(email,pin){
  var url="";
  url = 'https://pmkey.xyz/search/?email=' +
        encodeURIComponent(email) + '&pin='+pin;
  return url;
}
function getPMkey(email,pin,provider) {
    var url=getPmkeyURL(email,pin);

    xhrRequest(url, 'GET',
      function(responseText) {
        // responseText contains a JSON object with weather info
        var json;
        try {
          json = JSON.parse(responseText);
        }catch(e) {

          pmkeyError(email,pin,'Response exception');
          return;
        }
        if(json.success && json.success == true) {

            var pmkeyapikey='';
            if (json.keys && json.keys.weather) {
                if (weatherProviders[provider] == 'wu' && json.keys.weather.wu)  pmkeyapikey=json.keys.weather.wu;
                if (weatherProviders[provider] == 'owm' && json.keys.weather.owm)  pmkeyapikey=json.keys.weather.owm;
            }
            if (pmkeyapikey) {
                pmkeySuccess(email,pin,pmkeyapikey);
            }
            else{
                pmkeyError(email,pin,'No API key found');
            }
        }
        else{

          pmkeyError(email,pin,json.error);
        }
    });
}

function pmkeyCheck(check){
    if (!check) {
        obj=document.getElementById('weather-pmkey-status');
        if (obj) obj.innerHTML='Checking...';
        removeClassname(obj,"status-ok");
        removeClassname(obj,"status-error");
        setTimeout(function(){pmkeyCheck(1);},1000);
    }
    else{
        email=document.getElementById('weather-pmkey-email-input').value;
        pin=document.getElementById('weather-pmkey-pin-input').value;
        localStorage.setItem('weather-pmkey-email-input',email);
        localStorage.setItem('weather-pmkey-pin-input',pin);
        provider=settings.weatherProvider;
        getPMkey(email,pin,provider);
    }
}

function pmkeySuccess(email,pin,pmkeyapikey){

    objstatus=document.getElementById('weather-pmkey-status');
    if (objstatus) objstatus.innerHTML='OK';
    addClassname(objstatus,"status-ok");
    obj=document.getElementById('weather-api-key-input');
    if (obj) {
        obj.value=pmkeyapikey;
        weatherApiKeyCheck();
    }
}

function pmkeyError(email,pin,error){

    objstatus=document.getElementById('weather-pmkey-status');
    if (objstatus) objstatus.innerHTML=error.substring(0,50);
    addClassname(objstatus,"status-error");
}
