var LOCATION_MIN_FREQ=8*60; //seconds
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

function needLocationDownload(){
  var period=LOCATION_MIN_FREQ; 
  var now=Math.floor(Date.now() / 1000);
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


    locationSuccess();
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
    obj=document.getElementById('weather-city-saved');
    if(obj) obj.value='Unable to get current location!';
    //document.write(''+err.code+' '+error.PERMISSION_DENIED);
  }
}

function locationSuccess(pos) {
  currentFailures = 0;
  if(pos){
      var position=locationdatafix(pos);
      localStorage.setItem('locationLastPosJSON',JSON.stringify(position));
      localStorage.setItem('locationLastDownload',Math.floor(Date.now() / 1000));
  }
  else pos=JSON.parse(localStorage.getItem('locationLastPosJSON'));
  var obj=document.getElementById('weather-city-saved');
  //void 0;
  if(obj) obj.value='Actual location: '+pos.coords.latitude+','+pos.coords.longitude;
}
