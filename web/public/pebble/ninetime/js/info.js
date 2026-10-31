
function testInfo(type) {
    
    url=document.getElementById('info-config-url-'+type).value;
    data=document.getElementById('info-config-data-'+type).value;
    langnum=document.getElementById('info-config-language-'+type).value;
    if (languages[langnum]) lang=languages[langnum][0];
    else lang='en';
    battery=randomInt(1,10)*10;
    steps=randomInt(1,5000);
    hrbpm_avg=randomInt(50,100);
    hrbpm_min=randomInt(50,70);
    hrbpm_max=randomInt(70,150);
    from_time=Math.floor(new Date() / 1000)-600;
    test=1;
    var postdata = {
        watchtoken       : watchtoken,
        platform         : platform,
        model            : model,
        lang             : lang,
        battery          : battery,
        steps            : steps,
        hrbpm_avg        : hrbpm_avg,
        hrbpm_min        : hrbpm_min,
        hrbpm_max        : hrbpm_max,
        from_time        : from_time,
        h24              : h24,
        data             : data,
        test             : 1,
        pos              : (settings.info[type].usePos==1)?'{"coords":{"latitude":39.0437,"longitude":-77.4875,"accuracy":1000},"timestamp":1506694086366}':''
    };
    xhrRequest(url, 'POST',
      function(responseText) {
        // responseText contains a JSON object with info
        var json;
        try {
          json = JSON.parse(responseText);
        }catch(e) {

          infoError('ERROR EXEPTION\n'+responseText,type);
          return;
        }
        if(("status" in json) && json.status == 'ok') {

          infoSuccess('SUCCESS\n'+JSON.stringify(json, null, 4),type);
        }
        else{

          infoError('ERROR STATUS\n'+JSON.stringify(json, null, 4),type);
        } 
    },JSON.stringify(postdata)); 
}


function infoError(text,type) {
    obj=document.getElementById('info-config-status-'+type);
    if (obj) {
        obj.innerHTML='<span><pre>'+text+'</pre></span>';
    }
}
function infoSuccess(text,type) {
    obj=document.getElementById('info-config-status-'+type);
    if (obj) {
        obj.innerHTML='<span><pre>'+text+'</pre></span>';
    }
    infoChanged();
    settings.info[type].urlOK=settings.info[type].url;
    drawInfo();
}
function infoCheckStart(type) {
    obj=document.getElementById('info-config-status-'+type);
    if (obj) {
        obj.innerHTML='<span>Checking URL...</span>';
    }
}

function infoCheck(check) {
    type=settings.infoType;
    if (!check) {
        infoCheckStart(type);
        setTimeout(function(){infoCheck(1);},1000);
    }
    else{
        testInfo(type);
    }
}


function infoDelete() {
    settings.info[settings.infoType].urlOK='';
    obj=document.getElementById('info-config-status-'+settings.infoType);
    if (obj) {
        obj.innerHTML='';
    }
    drawInfo();
}
function showInfoHelp() {
    obj=document.getElementById('infohelp');
    if (obj) obj.style.display='';
}
function hideInfoHelp() {
    obj=document.getElementById('infohelp');
    if (obj) obj.style.display='none';
}
function infoEnabled() { 
    for (a=0 ; a<3 ; a++) {
        //if (settings.horizontalPositions[a] == STATUS_H_INFO) return true;
        if (getVerticalObject(settings.verticalPositions[a]).info) return true;
        if (getHorizontalObject(settings.horizontalPositions[a]).info) return true;
    }
    return false;
}
function infoChanged() {
    document.getElementById('info-config-fetchnow').checked=true;
}