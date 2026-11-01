var vars = require('./vars');
var send = require('./send');

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

    getInfo();
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
    localStorage.setItem('infoDownloaded','2');
    send.sendDataToPebble();
  }
}

function locationSuccess(pos) {
  currentFailures = 0;
  var position=vars.locationdatafix(pos);
  localStorage.setItem('locationLastPosJSON',JSON.stringify(position));

  localStorage.setItem('locationLastDownload',vars.getEpoch());
  getInfo();
}


function getInfo(){
  var postdata = {
  watchtoken       : localStorage.getItem('watchinfoToken'),
  platform         : localStorage.getItem('watchinfoPlatform'),
  model            : localStorage.getItem('watchinfoModel'),
  lang             : localStorage.getItem('configInfoLanguage'),
  battery          : localStorage.getItem('pebbleBatt'),
  steps            : localStorage.getItem('pebbleSteps'),
  hrbpm_avg        : localStorage.getItem('pebbleHrbpm'),
  hrbpm_min        : localStorage.getItem('pebbleHrbpmMin'),
  hrbpm_max        : localStorage.getItem('pebbleHrbpmMax'),
  from_time        : localStorage.getItem('pebbleLastData'),
  h24              : localStorage.getItem('pebbleH24'),
  data             : localStorage.getItem('configInfoData'),
  pos              : (localStorage.getItem('configInfoUsePos') == '1')?localStorage.getItem('locationLastPosJSON'):''
};
  var url=localStorage.getItem('configInfoURL');
  url=url.replace(/^http:\/\/(?:www\.)?czandor\.hu\/pebble\/(words|info-example)\.php(?=$|[?#])/i,
      'https://czandor.hu/pebble/$1.php');
   vars.xhrRequest(url, 'POST',
      function(responseText) {
        // responseText contains a JSON object with info
        var json;
        try {
          json = JSON.parse(responseText);
        }catch(e) {
          localStorage.setItem('infoDownloaded',2);

          send.sendDataToPebble();
          return;
        }
        if(("status" in json) && json.status == 'ok') {
          
          var infotext=("info" in json)?json.info:'';
          /*var infotitle=("title" in json)?json.title:'';
          var infobody=("body" in json)?json.body:'';*/

  
          localStorage.setItem('infoText',infotext);
          /*localStorage.setItem('infoTitle',infotitle);
          localStorage.setItem('infoBody',infobody);*/


          localStorage.setItem('infoDownloaded',1);
        }
        else{

          localStorage.setItem('infoDownloaded',2);
        } 
        send.sendDataToPebble();
    },JSON.stringify(postdata)); 
}

function downloadInfo(){

  var infourl=localStorage.getItem('configInfoURL');
  if(infourl == "") {
    localStorage.setItem('infoDownloaded',2);

  }
  else if(localStorage.getItem('configInfoUsePos') == '1') setTimeout(getLocation,(localStorage.getItem('weatherDownloaded') == "0")?1000:0);
  else setTimeout(getInfo,(localStorage.getItem('weatherDownloaded') == "0")?1000:0);
}


module.exports.downloadInfo = downloadInfo;
