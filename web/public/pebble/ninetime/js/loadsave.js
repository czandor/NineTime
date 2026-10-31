

function loadDefaults() {
    settings=JSON.parse(defaultSettings);
    hideLoadSave();
}
function showLoadSave() {
    if(document.getElementById('loadsaveokbutton')) document.getElementById('loadsaveokbutton').value='Back';
    document.getElementById('loadsave').style.display='';
}
function hideLoadSave() {
    document.getElementById('loadsave').style.display='none';
    reDraw();
}

function saveData(slot) {
  if (!slot) slot=0;
  if(slot){
    obj=document.getElementById('slotstatus-'+slot);
    if (obj) obj.value='Saving...';
    var url=NINETIME_BASE_URL + '/ninetime/data.php';
    obj=document.getElementById('slotname-'+slot);
    if (obj) name=obj.value;
    else name="Slot#"+slot;
    var postdata = {
        type       : 'save',
        watchtoken : watchtoken,
        platform   : platform,
        model      : model,
        slot       : slot,
        name       : name,
        jsondata   : JSON.stringify(settings)
    };
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {

      var json;
      var status="";
      try {
        json = JSON.parse(this.responseText);
        status=json.status;
        if (status == 'Saved') {
            obj=document.getElementById('loadbutton-'+slot);
            if (obj) obj.disabled=false;
        }

      }catch(e) {
        status="Save error";

        //void 0;
      }

      obj=document.getElementById('slotstatus-'+slot);
      if (obj) obj.value=status;
      saveData();
    };
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    setTimeout(function(){xhr.send(JSON.stringify(postdata))},1000);
  }
  else{
    localStorage.setItem(watchtoken+'-'+platform,JSON.stringify(settings));
    localStorage.setItem('settings-'+platform,JSON.stringify(settings));

    //reDraw();
  }
}
function loadData(slot) {
  if (!slot) slot=0;
  var loaded_settings='';
  if(slot > 0){
    obj=document.getElementById('slotstatus-'+slot);
    if (obj) obj.value='Loading...';
    var url=NINETIME_BASE_URL + '/ninetime/data.php';
    var postdata = {
        type       : 'load',
        watchtoken : watchtoken,
        platform   : platform,
        model      : model,
        slot       : slot,
        name       :'',
        jsondata   : ''
    };
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      //void 0;
      var json;
      var status='';
      try {
        json = JSON.parse(this.responseText);
        loaded_settings=json.jsondata;
      }catch(e) {
        loaded_settings='';

        status="Load error";
      }
      
      if (loaded_settings) {
        try {
          settings = JSON.parse(loaded_settings);

          status="Load OK";
          if(document.getElementById('loadsaveokbutton')) document.getElementById('loadsaveokbutton').value='OK';
        }catch(e) {
          loaded_settings='';

          status="Load error";
        }
      }
      else{

        status="Load error";
      }
      obj=document.getElementById('slotstatus-'+slot);
      if (obj) obj.value=status;
      saveData();
    };
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    setTimeout(function(){xhr.send(JSON.stringify(postdata))},1000);
  }
  if(slot == -1){
    localStorage.setItem(watchtoken+'-'+platform,'');
    localStorage.setItem('settings-'+platform,'');

    slot=0;
  }
  if(slot == 0){
    if (paypal) loaded_settings=localStorage.getItem('gotoPaypal');
    else loaded_settings=localStorage.getItem(watchtoken+'-'+platform);
    if (!loaded_settings) loaded_settings=localStorage.getItem('settings-'+platform);
    if (loaded_settings) {
      try {
        settings = JSON.parse(loaded_settings);

        //if (CONFIG_VERSION >= 1.5) setSettingsIntegrity();
      }catch(e) {
        loaded_settings='';

      }
    }
    if (!paypal) saveData();
  }
}
function setSettingsIntegrity() {

    ds=JSON.parse(defaultSettings);
    copyMissingElementsObjects(ds,settings);
}
function copyMissingElementsObjects(objFrom,objTo) {
    for (var key in objFrom) {
        if (objFrom.hasOwnProperty(key)) {
            if(!objTo.hasOwnProperty(key)) {

                objTo[key]=JSON.parse(JSON.stringify(objFrom[key]));
            }
            if (Array.isArray(objFrom[key]) || (objFrom[key] instanceof Object)) {
                copyMissingElementsObjects(objFrom[key],objTo[key])
            }
        }
    }
}