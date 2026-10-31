function reDraw() {
    //void 0;

    //drawLanguages();
    drawFaceType();
    drawFaceRows();
    drawVibrate();
    drawVertical();
    drawHorizontal();
    drawCustomText();
    drawWeather();
    drawDate();
    drawInfo();
}
function drawInfo() {
    obj=document.getElementById('infobox');
    if (infoEnabled()) {
        showBox(obj);
        obj=document.getElementById('infobox-scrollimg');
        if (obj) {
            obj.style.opacity='1';
            obj.style.pointerEvents='';
        }
        obj=document.getElementById('info-type-'+settings.infoType);
        addClassname(obj,'selected');
        obj=document.getElementById('info-config-'+settings.infoType);
        showBox(obj);
        obj=document.getElementById('info-config-url-'+settings.infoType);
        if (obj) obj.value=settings.info[settings.infoType].url;
        obj=document.getElementById('info-config-urlOK-'+settings.infoType);
        if (obj) {
            obj2=document.getElementById('info-config-url-delete-'+settings.infoType);
            if(settings.info[settings.infoType].urlOK != '') {
                obj.value=settings.info[settings.infoType].urlOK;
                if (obj2) obj2.style.display='';
            }
            else {
                obj.value='Plase add your custom info script url';
                if (obj2) obj2.style.display='none';
            }
        }
        obj=document.getElementById('info-config-usepos-'+settings.infoType);
        if (obj) obj.checked=(settings.info[settings.infoType].usePos==1);
        obj=document.getElementById('info-config-data-'+settings.infoType);
        if (obj) if(settings.infoType == 1) obj.checked=(settings.info[settings.infoType].data=='1');
                 else obj.value=settings.info[settings.infoType].data;
        obj=document.getElementById('info-config-language-'+settings.infoType);
        if(obj) {
            obj.innerHTML=buildLanguages();
            obj.value=settings.info[settings.infoType].language;
            //void 0;
        }
        obj=document.getElementById('info-refresh-'+settings.infoType);
        if (obj) obj.value=settings.info[settings.infoType].period;
    }
    else {
        hideBox(obj);
        obj=document.getElementById('infobox-scrollimg');
        if (obj) {
            obj.style.opacity='0.5';
            obj.style.pointerEvents='none';
        }
    }
}
function drawDate() {
    obj=document.getElementById('datebox');
    if (dateEnabled()) {
        showBox(obj);
        obj=document.getElementById('datebox-scrollimg');
        if (obj) {
            obj.style.opacity='1';
            obj.style.pointerEvents='';
        }
        obj=document.getElementById('date-config-time');
        if (timeEnabled()) {
            showBox(obj);
            obj=document.getElementById('date-config-timeformat-0');
            if(obj) {
                txt='';
                for(a = 0 ; a < timeFormats.length ; a++) txt+='<option value="'+a+'">'+timeFormats[a]+'</option>';
                obj.innerHTML=txt;
                if (!timeFormats[settings.timeFormat]) settings.timeFormat=0;
                obj.value=settings.timeFormat;
            }
        }
        else hideBox(obj);
        
        obj=document.getElementById('date-config-date');
        if (dateFullEnabled()) {
            showBox(obj);
            obj=document.getElementById('date-config-dateformat-0');
            if(obj) {
                txt='';
                for(a = 0 ; a < dateFormats.length ; a++) txt+='<option value="'+a+'">'+dateFormats[a]+'</option>';
                if (CONFIG_VERSION >= 1.64) for(a = 0 ; a < dateFormats.length ; a++) txt+='<option value="'+(10+a)+'">DAY '+dateFormats[a]+'</option>';
                obj.innerHTML=txt;
                obj.value=settings.dateFormat;
            }
        }
        else hideBox(obj);

        obj=document.getElementById('date-config-names');
        if (dateNameEnabled()) {
            showBox(obj);
            obj=document.getElementById('loadlanguages-0');
            if(obj) obj.innerHTML=buildLanguages(1);
            for(a = 0 ; a < 7 ; a++) document.getElementById('date-dayname-'+a).value=settings.dayNames[a];
            for(a = 0 ; a < 12 ; a++) document.getElementById('date-monthname-'+a).value=settings.monthNames[a];
        }
        else hideBox(obj);
    }
    else {
        hideBox(obj);
        obj=document.getElementById('datebox-scrollimg');
        if (obj) {
            obj.style.opacity='0.5';
            obj.style.pointerEvents='none';
        }
    }
}
function drawWeather() {
    obj=document.getElementById('weatherbox');
    if (weatherEnabled()) {
        showBox(obj);
        if (CONFIG_VERSION < 1.60 && settings.weatherProvider > 1) settings.weatherProvider=1;
        if (gadgetbridge) settings.weatherProvider=1;
        obj=document.getElementById('weather-pmkey-email-input');
        if (obj) obj.value=localStorage.getItem('weather-pmkey-email-input'); 
        obj=document.getElementById('weather-pmkey-pin-input');
        if (obj) obj.value=localStorage.getItem('weather-pmkey-pin-input'); 
        
        obj=document.getElementById('weatherbox-scrollimg');
        if (obj) {
            obj.style.opacity='1';
            obj.style.pointerEvents='';
        }
        provider=settings.weatherProvider;
        obj=document.getElementById('weather-apikey-allsettings');
        if (provider == 0 || provider == 2 || gadgetbridge) {
            hideBox(obj);
        }
        else showBox(obj);
        obj=document.getElementById('weather-city-input');
        obj2=document.getElementById('weather-city-check-0');
        if(provider == 0){
            obj.readOnly=true;
            //obj.value="Your current location will always be used";
            obj2.style.display="none";
        }
        else{
            obj.readOnly=false;
            //obj.value="Your current location will always be used";
            obj2.style.display="";
        }
        if (!(provider in settings.weatherSettings)) {
            settings.weatherSettings[provider]={apiKey:'',
                                                refreshTime:15,
                                                cityName:''};
        }
        if (!('language' in settings.weatherSettings[provider])) settings.weatherSettings[provider].language=0;
        if (!('cityId' in settings.weatherSettings[provider])) settings.weatherSettings[provider].cityId='';
        if(gadgetbridge) {
            settings.weatherSettings[provider].apiKey="gadgetbridge";
            settings.weatherSettings[provider].cityId="mimic";
        }
        if(provider == 0) {
            settings.weatherSettings[provider].apiKey="";
            settings.weatherSettings[provider].cityId="";
        }
        obj=document.getElementById('condition-language-0');
        if(obj) {
            obj.innerHTML=buildLanguages(0);
            obj.value=settings.weatherSettings[provider].language;
        }
        obj=document.getElementById('condition-language');
        if (CONFIG_VERSION < 1.60) obj=null;
        if (weatherConditionTextEnabled()) showBox(obj);
        else hideBox(obj);
        removeClassname(document.getElementById('weather-provider-0'),"selected");
        removeClassname(document.getElementById('weather-provider-1'),"selected");
        removeClassname(document.getElementById('weather-provider-2'),"selected");
        addClassname(document.getElementById('weather-provider-'+provider),"selected");
        text='The developer\'s API key will be used';
        text2='Please add your weather API key, if you have one.';
        deleteicon=false;
        restricted=false;
        if (settings.weatherSettings[provider].apiKey == '' || settings.weatherSettings[provider].apiKey==weatherApiKeys[provider]){
            settings.weatherSettings[provider].apiKey=weatherApiKeys[provider];
            if (provider==0) {
                text+='*';
                text2='*Limited use, minimum refresh time: 1 hour, and sometimes download error.<br/><b>Please use your own API key to avoid limitations and errors.</b><br/>';
                restricted=true;
                if (settings.weatherSettings[provider].refreshTime<60) settings.weatherSettings[provider].refreshTime=60;
            }
        }
        else{
            text=settings.weatherSettings[provider].apiKey;
            text2='Now you are using your private API key 👍';
            deleteicon=true;
        }
        obj=document.getElementById('weather-api-key-saved');
        if (obj) obj.value=text;
        obj=document.getElementById('weather-api-key-info');
        if (obj) obj.innerHTML=text2;
        obj=document.getElementById('weather-api-key-delete-0');
        if (obj) obj.style.display=(deleteicon)?"":"none";
        
        deleteicon=false;
        text="Your current location.";
        text2="If you want to know the weather for a fixed location, find your own city. Otherwise your current position will be used";
        if (settings.weatherSettings[provider].cityName == ''){
            //text='Testing to get actual location...';
            //setTimeout("getLocation()",400);
        }
        else{
            text=settings.weatherSettings[provider].cityName;
            deleteicon=true;
        }
        obj=document.getElementById('weather-city-saved');
        if (obj) obj.value=text;
        obj=document.getElementById('weather-city-info');
        if (obj) obj.innerHTML=text2;
        obj=document.getElementById('weather-city-delete-0');
        if (obj) obj.style.display=(deleteicon)?"":"none";
        
        obj=document.getElementById('weather-refresh-0');
        if (obj) obj.value=settings.weatherSettings[provider].refreshTime;
        obj=document.getElementById('weather-units-0');
        if (obj) obj.value=settings.weatherMetric;
    }
    else {
        hideBox(obj);
        obj=document.getElementById('weatherbox-scrollimg');
        if (obj) {
            obj.style.opacity='0.5';
            obj.style.pointerEvents='none';
        }
    }
}
function drawCustomText() {
    obj=document.getElementById('customtextbox');
    if (customTextEnabled()) {
        showBox(obj);
        obj=document.getElementById('customtextbox-scrollimg');
        if (obj) {
            obj.style.opacity='1';
            obj.style.pointerEvents='';
        }
        obj=document.getElementById('customtext-0');
        if (obj) {
            obj.value=settings.customText;
        }
    }
    else {
        hideBox(obj);
        obj=document.getElementById('customtextbox-scrollimg');
        if (obj) {
            obj.style.opacity='0.5';
            obj.style.pointerEvents='none';
        }
    }
}
function drawVibrate() {
    if (!('phoneConnectionCheck' in settings)) settings.phoneConnectionCheck=true;
    if (!('disconnectIcon' in settings)) settings.disconnectIcon=true;
    if (!('disconnectInvert' in settings)) settings.disconnectInvert=false;
    if (CONFIG_VERSION >= 1.60) showBox(document.getElementById('phoneconnection-box'));
    obj=document.getElementById('phoneconnection-0');
    if (obj) obj.checked=settings.phoneConnectionCheck;
    obj=document.getElementById('disconnect-type-icon-0');
    if (obj) obj.checked=settings.disconnectIcon;
    obj=document.getElementById('disconnect-type-invert-0');
    if (obj) obj.checked=settings.disconnectInvert;
    obj=document.getElementById('vibrate-disconnect-box');
    obj2=document.getElementById('vibrate-reconnect-box');
    if (CONFIG_VERSION >= 1.90) obj22=document.getElementById('disconnect-type-box');
    else obj22=null;
    
    obj3=document.getElementById('vertical-status-icon-3');
    if(settings.phoneConnectionCheck){
        showBox(obj);
        showBox(obj2);
        showBox(obj22);
    }
    else {
        hideBox(obj);
        hideBox(obj2);
        hideBox(obj22);
    }
    if (obj3){
        if (settings.phoneConnectionCheck && settings.disconnectIcon) obj3.style.display='';
        else obj3.style.display='none';
    }
    
    obj=document.getElementById('vibrate-disconnect-0');
    obj2=document.getElementById('vibrate-reconnect-0');
    if (obj && obj2) {
        str='';
        for(a=0 ; a < vibrateDisconnectTexts.length ; a++){
            str+='<option value='+a+'>'+vibrateDisconnectTexts[a]+'</option>';
        }
        obj.innerHTML=str;
        obj.value=settings.vibrateDisconnect;
        obj2.innerHTML=str;
        obj2.value=settings.vibrateReconnect;
    }
    obj=document.getElementById('vibrate-period-0');
    if (obj) {
        obj.value=settings.vibratePeriod;
    }
    obj=document.getElementById('quietcharge-0');
    if (obj) {
        obj.checked=(settings.quietCharge==1);
    }
    obj=document.getElementById('quiettime-row');
    obj2=document.getElementById('quietcharge-row');
    if(settings.vibratePeriod > 0 || (settings.vibrateDisconnect > 0 && settings.phoneConnectionCheck) || (settings.vibrateReconnect > 0 && settings.phoneConnectionCheck)) {
        //obj.style.display='';
        showBox(obj);
        showBox(obj2);
    }
    else {
        //obj.style.display='none';
        hideBox(obj);
        hideBox(obj2);
    }
    for(a = 0 ; a < 6 ; a++){
        obj=document.getElementById('quiettime-'+a);
        if (obj) {
            if (a==0) {
                obj.checked=(settings.quietTime[0]==1);
                if (obj.checked) document.getElementById('quiet-enabled').style.display='';
                else document.getElementById('quiet-enabled').style.display='none';
            }
            else obj.value=settings.quietTime[a];
        }
        else if (!a) settings.quietTime[a]=0;
    }
}
function drawHorizontal() {
    for(a=6 ; a<8 ; a++){
        obj=document.getElementById('config-'+a+'-textcolor');
        if (obj) {
            obj.style.backgroundColor='#'+pebblecolors[settings.horizontalColor[a-6]].rgb;
            obj.style.color='#'+pebblecolors[settings.horizontalColor[a-6]].rgbsun;
            obj.innerHTML=settings.horizontalColor[a-6];
        }
        obj=document.getElementById('config-'+a+'-bg');
        if (obj) {
            obj.style.backgroundColor='#'+pebblecolors[settings.horizontalBg[a-6]].rgb;
            obj.style.color='#'+pebblecolors[settings.horizontalBg[a-6]].rgbsun;
            obj.innerHTML=settings.horizontalBg[a-6];
        }
        obj=document.getElementById('config-'+a+'-line');
        if (obj) {
            obj.style.backgroundColor='#'+pebblecolors[settings.horizontalLine[a-6]].rgb;
            obj.style.color='#'+pebblecolors[settings.horizontalLine[a-6]].rgbsun;
            obj.innerHTML=settings.horizontalLine[a-6];
        }
        obj=document.getElementById('config-'+a+'-icon');
        if (obj) {
            obj.style.backgroundColor='#'+pebblecolors[settings.horizontalIcon[a-6]].rgb;
            obj.style.color='#'+pebblecolors[settings.horizontalIcon[a-6]].rgbsun;
            obj.innerHTML=settings.horizontalIcon[a-6];
        }
        obj=document.getElementById('config-'+a+'-iconbg');
        if (obj) {
            obj.style.backgroundColor='#'+pebblecolors[settings.horizontalIconBg[a-6]].rgb;
            obj.style.color='#'+pebblecolors[settings.horizontalIconBg[a-6]].rgbsun;
            obj.innerHTML=settings.horizontalIconBg[a-6];
        }
            
        
        obj=document.getElementById('config-'+a+'-img');
        if (obj) {
            src=imageurl+'&icon=PARTLY_CLOUDY&black='+pebblecolors[settings.horizontalIcon[a-6]].rgbsun+'&white='+pebblecolors[settings.horizontalIconBg[a-6]].rgbsun+'';
            obj.src=src;
            obj.style.backgroundColor='#'+pebblecolors[settings.horizontalBg[a-6]].rgbsun;
            if (settings.horizontalPosition == 2) {
                obj.style.borderBottomColor='#FFFFFF';
                obj.style.borderTopColor='#'+pebblecolors[settings.horizontalLine[a-6]].rgbsun;
            }
            else{
                obj.style.borderTopColor='#FFFFFF';
                obj.style.borderBottomColor='#'+pebblecolors[settings.horizontalLine[a-6]].rgbsun;
            }
        }
        obj=document.getElementById('config-'+a+'-dayname');
        if (obj) {
            obj.style.color='#'+pebblecolors[settings.horizontalColor[a-6]].rgbsun
        }
        obj=document.getElementById('config-'+a+'-month');
        if (obj) {
            obj.style.color='#'+pebblecolors[settings.horizontalColor[a-6]].rgbsun
        }
        obj=document.getElementById('config-'+a+'-day');
        if (obj) {
            obj.style.color='#'+pebblecolors[settings.horizontalIcon[a-6]].rgbsun
        }
    }
    
    obj=document.getElementById('horizontal-position-0');
    if (obj) {
        obj.value=settings.horizontalPosition;
    }
    for(i=0 ; i<3 ; i++){
        obj=document.getElementById('horizontal-content-'+i);
        if (obj) {
            str=createCompSelection(horizontalTexts,i+1);
            if (i==1 && settings.horizontalPositions[i]==0) settings.horizontalPositions[i]=STATUS_H_TEXT;
            //for(a = (i==2)?0:1 ; a < horizontalTexts.length ; a++) str+='<option value="'+horizontalTexts[a].id+'">'+horizontalTexts[a].name+'</option>';
            obj.innerHTML=str;
            obj.value=settings.horizontalPositions[i];
        }
    }
    obj=document.getElementById('horizontal2-show-0');
    if (obj) {
        obj.value=settings.horizontal2Show;
        obj=document.getElementById('horizontal2box');
        if (settings.horizontal2Show>0) {
            showBox(obj);
            obj=document.getElementById('horizontal2box-scrollimg');
            if (obj) {
                obj.style.opacity='1';
                obj.style.pointerEvents='';
            }
            
        }
        else {
            hideBox(obj);
            obj=document.getElementById('horizontal2box-scrollimg');
            if (obj) {
                obj.style.opacity='0.5';
                obj.style.pointerEvents='none';
            }
        }
    }
    for(i=0 ; i<2 ; i++){
        obj=document.getElementById('horizontal2-seconds-'+i);
        if (obj) {
            str='';
            for(a = 1 ; a <= 10 ; a++) str+='<option value="'+a+'">'+a+' second'+((a>1)?'s':'')+'</option>';
            obj.innerHTML=str;
            obj.value=settings.horizontal2Seconds[i];
        }
    }
    if (settings.horizontalPositions[2] != STATUS_H_NONE) document.getElementById('showthirdfor').style.display='';
    else document.getElementById('showthirdfor').style.display='none';
}

function drawVertical() {
    if (!('statusShow' in settings)) settings.statusShow=0;
    if (!('verticalSecondsShow' in settings)) settings.verticalSecondsShow=0;
    drawVerticalIcons();
    obj=document.getElementById('vertical-show-seconds-0');
    if (obj) obj.value=settings.verticalSecondsShow;
    
    obj=document.getElementById('config-5-textcolor');
    if (obj) {
        obj.style.backgroundColor='#'+pebblecolors[settings.verticalColor].rgb;
        obj.style.color='#'+pebblecolors[settings.verticalColor].rgbsun;
        obj.innerHTML=settings.verticalColor;
    }
    obj=document.getElementById('config-5-bg');
    if (obj) {
        obj.style.backgroundColor='#'+pebblecolors[settings.verticalBg].rgb;
        obj.style.color='#'+pebblecolors[settings.verticalBg].rgbsun;
        obj.innerHTML=settings.verticalBg;
    }
    obj=document.getElementById('config-5-line');
    if (obj) {
        obj.style.backgroundColor='#'+pebblecolors[settings.verticalLine].rgb;
        obj.style.color='#'+pebblecolors[settings.verticalLine].rgbsun;
        obj.innerHTML=settings.verticalLine;
    }
    obj=document.getElementById('config-5-icon');
    if (obj) {
        obj.style.backgroundColor='#'+pebblecolors[settings.verticalIcon].rgb;
        obj.style.color='#'+pebblecolors[settings.verticalIcon].rgbsun;
        obj.innerHTML=settings.verticalIcon;
    }
    obj=document.getElementById('config-5-iconbg');
    if (obj) {
        obj.style.backgroundColor='#'+pebblecolors[settings.verticalIconBg].rgb;
        obj.style.color='#'+pebblecolors[settings.verticalIconBg].rgbsun;
        obj.innerHTML=settings.verticalIconBg;
    }
        
    
    obj=document.getElementById('config-5-img');
    if (obj) {
        src=imageurl+'&icon=date&black='+pebblecolors[settings.verticalIcon].rgbsun+'&white='+pebblecolors[settings.verticalIconBg].rgbsun+'';
        obj.src=src;
        obj.style.backgroundColor='#'+pebblecolors[settings.verticalBg].rgbsun;
        if (settings.verticalPosition == 1) {
            obj.style.borderLeftColor='#FFFFFF';
            obj.style.borderRightColor='#'+pebblecolors[settings.verticalLine].rgbsun;
        }
        else{
            obj.style.borderRightColor='#FFFFFF';
            obj.style.borderLeftColor='#'+pebblecolors[settings.verticalLine].rgbsun;
        }
    }
    obj=document.getElementById('config-5-dayname');
    if (obj) {
        obj.style.color='#'+pebblecolors[settings.verticalColor].rgbsun
    }
    obj=document.getElementById('config-5-month');
    if (obj) {
        obj.style.color='#'+pebblecolors[settings.verticalColor].rgbsun
    }
    obj=document.getElementById('config-5-day');
    if (obj) {
        obj.style.color='#'+pebblecolors[settings.verticalIcon].rgbsun
    }
    obj=document.getElementById('vertical-position-0');
    if (obj) {
        obj.value=settings.verticalPosition;
    }
    obj=document.getElementById('vertical-status-pos-0');
    if (obj) {
        obj.value=settings.statusPosition;
    }
    for(i=0 ; i<3 ; i++){
        obj=document.getElementById('vertical-icon-pos-'+i);
        if (obj) {
            str=createCompSelection(verticalTexts);
            obj.innerHTML=str;
            obj.value=settings.verticalPositions[i];
        }
    }
    for(i=0;i<5;i++) removeClassname(document.getElementById('vertical-status-icon-'+i),'selected');
    for(i=4; i>=0; i--) if (settings.statusShow <= i) addClassname(document.getElementById('vertical-status-icon-'+i),'selected');
    obj=document.getElementById('vertical-status-icon-info');
    if (obj) if(settings.phoneConnectionCheck && settings.disconnectIcon) obj.innerHTML=statusIconTexts[settings.statusShow];
    else obj.innerHTML=statusIconTexts2[settings.statusShow];
}
function drawFaceType() {
    //void 0;
    removeClassname(document.getElementById('tabs-face-0'),'selected');
    removeClassname(document.getElementById('tabs-face-1'),'selected');
    removeClassname(document.getElementById('tabs-face-2'),'selected');
    removeClassname(document.getElementById('tabs-face-4'),'selected');
    
    // face type 4
    document.getElementById('config-face-4').style.display='none';
    
    // face type 0
    document.getElementById('config-face-0-0').style.display='none';
    document.getElementById('config-face-0-1').style.display='none';
    document.getElementById('config-face-0-2').style.display='none';
    // face type 0-2 
    removeClassname(document.getElementById('config-face-0-2-0'),'selected');
    removeClassname(document.getElementById('config-face-0-2-1'),'selected');
    removeClassname(document.getElementById('config-face-0-2-2'),'selected');
    removeClassname(document.getElementById('config-face-0-2-3'),'selected');
    document.getElementById('config-face-0-2-0-rows').style.display='none';
    document.getElementById('config-face-0-2-1-rows').style.display='none';
    document.getElementById('config-face-0-2-2-rows').style.display='none';
    document.getElementById('config-face-0-2-3-rows').style.display='none';
    
    //face type 1
    document.getElementById('config-face-1-0').style.display='none';
    document.getElementById('config-face-1-1').style.display='none';
    
    //face type 2 
    document.getElementById('config-face-2-0').style.display='none';
    document.getElementById('config-face-2-1').style.display='none';
    document.getElementById('config-face-2-2').style.display='none';
    removeClassname(document.getElementById('config-face-2-0-0'),'selected');
    removeClassname(document.getElementById('config-face-2-0-1'),'selected');
    removeClassname(document.getElementById('config-face-2-0-2'),'selected');
    removeClassname(document.getElementById('config-face-2-1-0'),'selected');
    removeClassname(document.getElementById('config-face-2-1-1'),'selected');
    removeClassname(document.getElementById('config-face-2-1-2'),'selected');
    removeClassname(document.getElementById('config-face-2-2-0'),'selected');
    removeClassname(document.getElementById('config-face-2-2-1'),'selected');
    removeClassname(document.getElementById('config-face-2-2-2'),'selected');
    document.getElementById('config-face-2-0-0-rows').style.display='none';
    document.getElementById('config-face-2-0-1-rows').style.display='none';
    document.getElementById('config-face-2-0-2-rows').style.display='none';
    document.getElementById('config-face-2-1-0-rows').style.display='none';
    document.getElementById('config-face-2-1-1-rows').style.display='none';
    document.getElementById('config-face-2-1-2-rows').style.display='none';
    document.getElementById('config-face-2-2-0-rows').style.display='none';
    document.getElementById('config-face-2-2-1-rows').style.display='none';
    document.getElementById('config-face-2-2-2-rows').style.display='none';
    
    
    
    addClassname(document.getElementById('tabs-face-'+settings.facetype),'selected')
    
    if(settings.facetype == 4) {
        obj=document.getElementById('config-face-4');
        if(obj) obj.style.display='';
        
    }
    if(settings.facetype == 0) {
        obj=document.getElementById('config-face-0-'+settings.facetype0);
        if(obj) obj.style.display='';
        addClassname(document.getElementById('config-face-0-2-'+settings.facetype02),'selected');
        obj=document.getElementById('config-face-0-2-'+settings.facetype02+'-rows');
        if(obj) obj.style.display='';
        
    }
    if(settings.facetype == 1) {
        obj=document.getElementById('config-face-1-'+settings.facetype1);
        if(obj) obj.style.display='';
    }
    if(settings.facetype == 2) {
        obj=document.getElementById('config-face-2-'+settings.facetype2);
        if(obj) obj.style.display='';
        var sub;
        if ('facetype2_suball' in settings) sub=settings.facetype2_suball;
        else sub=settings.facetype2_sub[settings.facetype2];
        addClassname(document.getElementById('config-face-2-'+settings.facetype2+'-'+sub),'selected')
        obj=document.getElementById('config-face-2-'+settings.facetype2+'-'+sub+'-rows');
        if(obj) obj.style.display='';
    }
    obj=document.getElementById('hour-leading');
    if (settings.facetype != 2) showBox(obj);
    else hideBox(obj);
    obj=document.getElementById('hour-leading-0');
    if (obj) obj.checked=settings.leadinZero;
    //void 0;
}

function drawFaceRows() {
    var randomForDigits=[randomInt(0,2),randomInt(0,9),randomInt(0,5),randomInt(0,9)];
    randomForDigits=[0,1,2,3];
    if (randomForDigits[0]==3) randomForDigits[0]=100;
    if(settings.facetype == 4) {
        i=0;
        for(a = 0 ; a < fontNames.length ; a++) removeClassname(document.getElementById('config-face-4-font-'+i+'-'+a),'selected');
        for(a = 0 ; a < 4 ; a++){
            obj=document.getElementById('config-face-4-img-'+a);
            if (obj) {
                src=imageurl+'&fonttype='+settings.facetype4.font[i]+'&black='+pebblecolors[settings.facetype4.color[i]].rgbsun+'&white=FFFFFF&number='+a;
                obj.src=src;
                obj.style.backgroundColor='#'+pebblecolors[settings.facetype4.bg[i]].rgbsun;
                //obj.parentElement.style.backgroundColor='#'+pebblecolors[settings.facetype00.bg[i]].rgbsun;
            }
        }
        obj=document.getElementById('config-face-4-foot-'+i);
        if (obj) {
            obj.innerHTML=fontNames[settings.facetype4.font[i]];
        }
        obj=document.getElementById('config-face-4-color-'+i);
        if (obj) {
            obj.style.backgroundColor='#'+pebblecolors[settings.facetype4.color[i]].rgb;
            obj.style.color='#'+pebblecolors[settings.facetype4.color[i]].rgbsun;
            obj.innerHTML=settings.facetype4.color[i];
        }
        obj=document.getElementById('config-face-4-bg-'+i);
        if (obj) {
            obj.style.backgroundColor='#'+pebblecolors[settings.facetype4.bg[i]].rgb;
            obj.style.color='#'+pebblecolors[settings.facetype4.bg[i]].rgbsun;
            obj.innerHTML=settings.facetype4.bg[i];
        }
        addClassname(document.getElementById('config-face-4-font-'+i+'-'+settings.facetype4.font[i]),'selected');
    }
    if(settings.facetype == 0) {
        if (settings.facetype0 == 0) {
            for(i=0 ; i<4 ; i++) {
                for(a = 0 ; a < fontNames.length ; a++) removeClassname(document.getElementById('config-face-0-0-font-'+i+'-'+a),'selected');
                obj=document.getElementById('config-face-0-0-img-'+i);
                if (obj) {
                    src=imageurl+'&fonttype='+settings.facetype00.font[i]+'&black='+pebblecolors[settings.facetype00.color[i]].rgbsun+'&white=FFFFFF&number='+randomForDigits[i];
                    obj.src=src;
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype00.bg[i]].rgbsun;
                    //obj.parentElement.style.backgroundColor='#'+pebblecolors[settings.facetype00.bg[i]].rgbsun;
                }
                obj=document.getElementById('config-face-0-0-color-'+i);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype00.color[i]].rgb;
                    obj.style.color='#'+pebblecolors[settings.facetype00.color[i]].rgbsun;
                    obj.innerHTML=settings.facetype00.color[i];
                }
                obj=document.getElementById('config-face-0-0-bg-'+i);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype00.bg[i]].rgb;
                    obj.style.color='#'+pebblecolors[settings.facetype00.bg[i]].rgbsun;
                    obj.innerHTML=settings.facetype00.bg[i];
                }
                addClassname(document.getElementById('config-face-0-0-font-'+i+'-'+settings.facetype00.font[i]),'selected');
            }
        }
        if (settings.facetype0 == 1) {
            for(i=0 ; i<11 ; i++) {
                //if (i==10) i=100;
                id=i;
                if (i==10) id=100;
                for(a = 0 ; a < fontNames.length ; a++) removeClassname(document.getElementById('config-face-0-1-font-'+id+'-'+a),'selected');
                obj=document.getElementById('config-face-0-1-img-'+id);
                if (obj) {
                    src=imageurl+'&fonttype='+settings.facetype01.font[i]+'&black='+pebblecolors[settings.facetype01.color[i]].rgbsun+'&white=FFFFFF&number='+id;
                    obj.src=src;
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype01.bg[i]].rgbsun;
                    //obj.parentElement.style.backgroundColor='#'+pebblecolors[settings.facetype00.bg[i]].rgbsun;
                }
                obj=document.getElementById('config-face-0-1-color-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype01.color[i]].rgb;
                    obj.style.color='#'+pebblecolors[settings.facetype01.color[i]].rgbsun;
                    obj.innerHTML=settings.facetype01.color[i];
                }
                obj=document.getElementById('config-face-0-1-bg-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype01.bg[i]].rgb;
                    obj.style.color='#'+pebblecolors[settings.facetype01.bg[i]].rgbsun;
                    obj.innerHTML=settings.facetype01.bg[i];
                }
                addClassname(document.getElementById('config-face-0-1-font-'+id+'-'+settings.facetype01.font[i]),'selected');
            }
        }
        if (settings.facetype0 == 2) {
            if(settings.facetype02==0) for(i=0 ; i<4 ; i++) {
                //if (i==10) i=100;
                id=i;
                if (i==3) id=100;
                for(a = 0 ; a < fontNames.length ; a++) removeClassname(document.getElementById('config-face-0-2-0-font-'+id+'-'+a),'selected');
                obj=document.getElementById('config-face-0-2-0-img-'+id);
                if (obj) {
                    src=imageurl+'&fonttype='+settings.facetype020.font[i]+'&black='+pebblecolors[settings.facetype020.color[i]].rgbsun+'&white=FFFFFF&number='+id;
                    obj.src=src;
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype020.bg[i]].rgbsun;
                    //obj.parentElement.style.backgroundColor='#'+pebblecolors[settings.facetype00.bg[i]].rgbsun;
                }
                obj=document.getElementById('config-face-0-2-0-color-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype020.color[i]].rgb;
                    obj.style.color='#'+pebblecolors[settings.facetype020.color[i]].rgbsun;
                    obj.innerHTML=settings.facetype020.color[i];
                }
                obj=document.getElementById('config-face-0-2-0-bg-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype020.bg[i]].rgb;
                    obj.style.color='#'+pebblecolors[settings.facetype020.bg[i]].rgbsun;
                    obj.innerHTML=settings.facetype020.bg[i];
                }
                addClassname(document.getElementById('config-face-0-2-0-font-'+id+'-'+settings.facetype020.font[i]),'selected');
            }
            if(settings.facetype02==1) for(i=0 ; i<10 ; i++) {
                //if (i==10) i=100;
                id=i;
                for(a = 0 ; a < fontNames.length ; a++) removeClassname(document.getElementById('config-face-0-2-1-font-'+id+'-'+a),'selected');
                obj=document.getElementById('config-face-0-2-1-img-'+id);
                if (obj) {
                    src=imageurl+'&fonttype='+settings.facetype021.font[i]+'&black='+pebblecolors[settings.facetype021.color[i]].rgbsun+'&white=FFFFFF&number='+id;
                    obj.src=src;
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype021.bg[i]].rgbsun;
                    //obj.parentElement.style.backgroundColor='#'+pebblecolors[settings.facetype00.bg[i]].rgbsun;
                }
                obj=document.getElementById('config-face-0-2-1-color-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype021.color[i]].rgb;
                    obj.style.color='#'+pebblecolors[settings.facetype021.color[i]].rgbsun;
                    obj.innerHTML=settings.facetype021.color[i];
                }
                obj=document.getElementById('config-face-0-2-1-bg-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype021.bg[i]].rgb;
                    obj.style.color='#'+pebblecolors[settings.facetype021.bg[i]].rgbsun;
                    obj.innerHTML=settings.facetype021.bg[i];
                }
                addClassname(document.getElementById('config-face-0-2-1-font-'+id+'-'+settings.facetype021.font[i]),'selected');
            }
            for(i=0 ; i<6 ; i++) {
                //if (i==10) i=100;
                id=i;
                for(a = 0 ; a < fontNames.length ; a++) removeClassname(document.getElementById('config-face-0-2-2-font-'+id+'-'+a),'selected');
                obj=document.getElementById('config-face-0-2-2-img-'+id);
                if (obj) {
                    src=imageurl+'&fonttype='+settings.facetype022.font[i]+'&black='+pebblecolors[settings.facetype022.color[i]].rgbsun+'&white=FFFFFF&number='+id;
                    obj.src=src;
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype022.bg[i]].rgbsun;
                    //obj.parentElement.style.backgroundColor='#'+pebblecolors[settings.facetype00.bg[i]].rgbsun;
                }
                obj=document.getElementById('config-face-0-2-2-color-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype022.color[i]].rgb;
                    obj.style.color='#'+pebblecolors[settings.facetype022.color[i]].rgbsun;
                    obj.innerHTML=settings.facetype022.color[i];
                }
                obj=document.getElementById('config-face-0-2-2-bg-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype022.bg[i]].rgb;
                    obj.style.color='#'+pebblecolors[settings.facetype022.bg[i]].rgbsun;
                    obj.innerHTML=settings.facetype022.bg[i];
                }
                addClassname(document.getElementById('config-face-0-2-2-font-'+id+'-'+settings.facetype022.font[i]),'selected');
            }
            for(i=0 ; i<10 ; i++) {
                //if (i==10) i=100;
                id=i;
                for(a = 0 ; a < fontNames.length ; a++) removeClassname(document.getElementById('config-face-0-2-3-font-'+id+'-'+a),'selected');
                obj=document.getElementById('config-face-0-2-3-img-'+id);
                if (obj) {
                    src=imageurl+'&fonttype='+settings.facetype023.font[i]+'&black='+pebblecolors[settings.facetype023.color[i]].rgbsun+'&white=FFFFFF&number='+id;
                    obj.src=src;
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype023.bg[i]].rgbsun;
                    //obj.parentElement.style.backgroundColor='#'+pebblecolors[settings.facetype00.bg[i]].rgbsun;
                }
                obj=document.getElementById('config-face-0-2-3-color-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype023.color[i]].rgb;
                    obj.style.color='#'+pebblecolors[settings.facetype023.color[i]].rgbsun;
                    obj.innerHTML=settings.facetype023.color[i];
                }
                obj=document.getElementById('config-face-0-2-3-bg-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype023.bg[i]].rgb;
                    obj.style.color='#'+pebblecolors[settings.facetype023.bg[i]].rgbsun;
                    obj.innerHTML=settings.facetype023.bg[i];
                }
                addClassname(document.getElementById('config-face-0-2-3-font-'+id+'-'+settings.facetype023.font[i]),'selected');
            }
            
        }
    }
    if(settings.facetype == 1) {
        if (settings.facetype1 == 0) {
            for(i=0 ; i<2 ; i++) {
                id=i;
                if (i==0) id=6;
                if (i==1) id=9;
                for(a = 0 ; a < fontNames.length ; a++) removeClassname(document.getElementById('config-face-1-0-font-'+id+'-'+a),'selected');
                obj=document.getElementById('config-face-1-0-img-'+id);
                if (obj) {
                    src=imageurl+'&fonttype='+settings.facetype10.font[i]+'&black='+pebblecolors[settings.facetype10.color[i]].rgbsun+'&white=FFFFFF&number='+id;
                    obj.src=src;
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype10.bg[i]].rgbsun;
                    //obj.parentElement.style.backgroundColor='#'+pebblecolors[settings.facetype00.bg[i]].rgbsun;
                }
                obj=document.getElementById('config-face-1-0-color-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype10.color[i]].rgb;
                    obj.style.color='#'+pebblecolors[settings.facetype10.color[i]].rgbsun;
                    obj.innerHTML=settings.facetype10.color[i];
                }
                obj=document.getElementById('config-face-1-0-bg-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype10.bg[i]].rgb;
                    obj.style.color='#'+pebblecolors[settings.facetype10.bg[i]].rgbsun;
                    obj.innerHTML=settings.facetype10.bg[i];
                }
                addClassname(document.getElementById('config-face-1-0-font-'+id+'-'+settings.facetype10.font[i]),'selected');
            }
        }
        if (settings.facetype1 == 1) {
            for(i=0 ; i<24 ; i++) {
                id=i;
                for(a = 0 ; a < fontNames.length ; a++) removeClassname(document.getElementById('config-face-1-1-font-'+id+'-'+a),'selected');
                obj=document.getElementById('config-face-1-1-img-'+id);
                if (obj) {
                    src=imageurl+'&fonttype='+settings.facetype11.font[i]+'&black='+pebblecolors[settings.facetype11.color[i]].rgbsun+'&white=FFFFFF&number='+(hourToNum(id,1)%10);
                    obj.src=src;
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype11.bg[i]].rgbsun;
                    //obj.parentElement.style.backgroundColor='#'+pebblecolors[settings.facetype00.bg[i]].rgbsun;
                }
                obj=document.getElementById('config-face-1-1-color-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype11.color[i]].rgb;
                    obj.style.color='#'+pebblecolors[settings.facetype11.color[i]].rgbsun;
                    obj.innerHTML=settings.facetype11.color[i];
                }
                obj=document.getElementById('config-face-1-1-bg-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[settings.facetype11.bg[i]].rgb;
                    obj.style.color='#'+pebblecolors[settings.facetype11.bg[i]].rgbsun;
                    obj.innerHTML=settings.facetype11.bg[i];
                }
                addClassname(document.getElementById('config-face-1-1-font-'+id+'-'+settings.facetype11.font[i]),'selected');
            }
        }
    }
    if(settings.facetype == 2) {
        if(1) {
            var ft=settings.facetype2;
            var sub;
            var analogdata;
            if (!('facetype2_suball' in settings)) {
                settings.facetype2_suball=JSON.parse(JSON.stringify(settings.facetype2_sub[settings.facetype2]))*1;
                settings.facetype2_sub=null;
            }
            sub=settings.facetype2_suball;
            if (!('facetype200' in settings)) {
                settings.facetype200=JSON.parse(JSON.stringify(settings.facetype20[ft]));
                settings.facetype20=null;
            }
            analogdata=settings.facetype200[sub];
            if (!('facetype2_showTime' in settings)) {
                settings.facetype2_showTime=0;
                settings.facetype2_showDate=0;
            }
            
            obj=document.getElementById('config-face-2-'+ft+'-0-showtime-0-0');
            if (obj) obj.value=settings.facetype2_showTime;
            obj=document.getElementById('config-face-2-'+ft+'-0-showdate-0-0');
            if (obj) obj.value=settings.facetype2_showDate;
            
            var idname='config-face-2-'+ft+'-'+sub+'-';
            
            if (!("hour" in analogdata)) {
                analogdata.hour=JSON.parse(JSON.stringify(analogdata.color));
            }
            //void 0;
            for(i=0 ; i<analogdata.color.length; i++) {
                id=i;
                obj=document.getElementById(idname+'img-'+id);
                if (obj) {
                    src=imageurl+'&icon='+analogtypes[ft]+'&black='+pebblecolors[analogdata.color[i]].rgbsun+'&white='+pebblecolors[analogdata.minut[i]].rgbsun+'&gray='+pebblecolors[analogdata.hour[i]].rgbsun;
                    obj.src=src;
                    obj.style.backgroundColor='#'+pebblecolors[analogdata.bg[i]].rgbsun;
                    //obj.parentElement.style.backgroundColor='#'+pebblecolors[settings.facetype00.bg[i]].rgbsun;
                }
                obj=document.getElementById(idname+'hour-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[analogdata.hour[i]].rgb;
                    obj.style.color='#'+pebblecolors[analogdata.hour[i]].rgbsun;
                    obj.innerHTML=analogdata.hour[i];
                }
                obj=document.getElementById(idname+'color-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[analogdata.color[i]].rgb;
                    obj.style.color='#'+pebblecolors[analogdata.color[i]].rgbsun;
                    obj.innerHTML=analogdata.color[i];
                }
                obj=document.getElementById(idname+'bg-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[analogdata.bg[i]].rgb;
                    obj.style.color='#'+pebblecolors[analogdata.bg[i]].rgbsun;
                    obj.innerHTML=analogdata.bg[i];
                }
                obj=document.getElementById(idname+'font-'+id);
                if (obj) {
                    obj.style.backgroundColor='#'+pebblecolors[analogdata.minut[i]].rgb;
                    obj.style.color='#'+pebblecolors[analogdata.minut[i]].rgbsun;
                    obj.innerHTML=analogdata.minut[i];
                }
                
            }
        }
    }
    
    /*if(settings.facetype == 1) {
        obj=document.getElementById('config-face-1-'+settings.facetype1);
        if(obj) obj.style.display='';
    }
    if(settings.facetype == 2) {
        obj=document.getElementById('config-face-2-'+settings.facetype2);
        if(obj) obj.style.display='';
        addClassname(document.getElementById('config-face-2-0-'+settings.facetype20),'selected')
        addClassname(document.getElementById('config-face-2-1-'+settings.facetype21),'selected')
        addClassname(document.getElementById('config-face-2-2-'+settings.facetype22),'selected')
        obj=document.getElementById('config-face-2-0-'+settings.facetype20+'-rows');
        if(obj) obj.style.display='';
        obj=document.getElementById('config-face-2-1-'+settings.facetype21+'-rows');
        if(obj) obj.style.display='';
        obj=document.getElementById('config-face-2-2-'+settings.facetype22+'-rows');
        if(obj) obj.style.display='';
    }
    */
}

function buildLanguages(withselect) {
    if(withselect) str="<option value='-1'>Select one</option>";
    else str="";
    for (i = 0 ; i < languages.length ; i++) {
        str+="<option value='"+i+"'>"+languages[i][1]+"</option>";
    }
    return str;
}


var verticalIconsSizes = [true,true,true,true];
var VERTICAL_ICON_MIN_PADDING=5;
var ICON_STATUS_MARGIN=10;
var ICON_STATUS_HEIGHT=16;
var ICON_MARGIN=2;
var PBL_DISPLAY_HEIGHT=168;

function get_vertical_icon_place(position){
    var vertheight=PBL_DISPLAY_HEIGHT-((verticalIconsSizes[3])?(ICON_STATUS_MARGIN+ICON_STATUS_HEIGHT):0);
    var offset=(settings.statusPosition==1)?(PBL_DISPLAY_HEIGHT-vertheight):0;
    var iconheight=(verticalIconsSizes[position])?VERTICAL_SIZES_EXTENDED[settings.verticalPositions[position]]:VERTICAL_SIZES_NORMAL[settings.verticalPositions[position]];
    if (platform == 'chalk') {
        vertheight=PBL_DISPLAY_HEIGHT;
        offset=35-iconheight/2;
        if (position == 2) offset=offset*-1;
    }
    if (position == 3) {
        if (platform == 'chalk'){
            offset=5;
            if(settings.statusPosition==1) return[offset*-1,ICON_STATUS_HEIGHT];
            if(settings.statusPosition==2) return[offset*-1+(PBL_DISPLAY_HEIGHT)/2-ICON_STATUS_HEIGHT,ICON_STATUS_HEIGHT];
            if(settings.statusPosition==3) return[offset+(PBL_DISPLAY_HEIGHT)/2,ICON_STATUS_HEIGHT];
            if(settings.statusPosition==4) return[offset+(PBL_DISPLAY_HEIGHT)-ICON_STATUS_HEIGHT,ICON_STATUS_HEIGHT];
        }
        else return [(settings.statusPosition==1)?(ICON_STATUS_MARGIN/2):(PBL_DISPLAY_HEIGHT-(ICON_STATUS_MARGIN/2)-ICON_STATUS_HEIGHT),ICON_STATUS_HEIGHT];
    }
    if (position == 0) {
        return [ICON_MARGIN+offset,iconheight];
    }
    if (position == 1) {
        //return [((vertheight-iconheight)/2)+offset,iconheight];
        var place0=get_vertical_icon_place(0);
        return [((vertheight-(get_vertical_icon_fullsizes()-iconheight))/2)+place0[1]+offset-(iconheight/2),iconheight];
    }
    return [(vertheight-iconheight-ICON_MARGIN+offset),iconheight];
}

function get_vertical_icon_fullsizes(state){
  var fullsize=0;
  var size;
  if (CONFIG_VERSION >= 1.70) {
    if (!state) state=verticalIconsSizes;
    for(var position = 0 ; position < 3 ; position++){
      if(state[position]) size=VERTICAL_SIZES_EXTENDED[settings.verticalPositions[position]];
      else size=VERTICAL_SIZES_NORMAL[settings.verticalPositions[position]];
      fullsize+=size;
    }
  }
  else {
    for(var position = 0 ; position < 3 ; position++){
      if(verticalIconsSizes[position]) size=VERTICAL_SIZES_EXTENDED[settings.verticalPositions[position]];
      else size=VERTICAL_SIZES_NORMAL[settings.verticalPositions[position]];
      fullsize+=size;
    }
  }
  //void 0
  return fullsize;
}
function calculate_vertical_icon_sizes(){
  var none_count=0;
  var position;
  verticalIconsSizes[3]=(settings.statusShow==0);
  var full_padding=VERTICAL_ICON_MIN_PADDING*2;
  for(position = 0 ; position < 3 ; position++){
    if(settings.verticalPositions[position] == STATUS_V_NONE && none_count < 2) none_count++;
    verticalIconsSizes[position]=true;
  }
  full_padding-=VERTICAL_ICON_MIN_PADDING*none_count;
  var vertheight=PBL_DISPLAY_HEIGHT-((verticalIconsSizes[3])?(ICON_STATUS_MARGIN+ICON_STATUS_HEIGHT):0)-ICON_MARGIN*2;
  if (platform == 'chalk') {
    if (verticalIconsSizes[3]) {
        if(settings.statusPosition==1 || settings.statusPosition==2) verticalIconsSizes[0]=false;
        if(settings.statusPosition==3 || settings.statusPosition==4) verticalIconsSizes[2]=false;
    }
  }
  else {
    if(CONFIG_VERSION >= 1.70){
      var states=[
              [true,true,true],
              [true,false,true],
              [false,true,true],
              [true,true,false],
              [true,false,false],
              [false,false,true],
              [false,true,false],
              [false,false,false]
            ];
      
      var good_position=7;
      var maradek=0;
      var good_maradek=100;
      for(position = 0 ; position < 8 ; position++){
          maradek=(vertheight-get_vertical_icon_fullsizes(states[position])-full_padding);
          if(maradek>=0 && maradek < good_maradek) {
              good_maradek=maradek;
              good_position=position;
          }
      }
      
      for(position = 0 ; position < 3 ; position++) verticalIconsSizes[position]=states[good_position][position];
    }
    else{
        //for(position = 3 ; position > 0 ; position--){
        // if((get_vertical_icon_fullsizes()+full_padding) > vertheight) verticalIconsSizes[position%3]=false;
        for(position = 0 ; position < 3 ; position++){
          if((get_vertical_icon_fullsizes()+full_padding) > vertheight) verticalIconsSizes[position]=false;
          else continue;
        }
    }
  }
  //void 0;
}
function drawVerticalIcons() {
    calculate_vertical_icon_sizes();
    var icon;
    var place;
    for(var position = 0 ; position < 4 ; position++){
        if (position == 3) icon=(verticalIconsSizes[3])?'images/nosilent.png':'images/1x1.png';
        else{
            icon='verticons/'+getVerticalObject(settings.verticalPositions[position]).icon;
            if(verticalIconsSizes[position]) icon=icon+'_extended';
            else icon=icon+'_normal';
            icon=icon+'.png?';
        }
        place=get_vertical_icon_place(position);
        //void 0;
        obj=document.getElementById("verticons-"+position);
        if (obj) {
            if (platform == 'chalk') {
                if (position == 0) {
                    obj.style.left='3px';
                    obj.style.right='0';
                }
                if (position == 2) {
                    obj.style.left='0';
                    obj.style.right='3px';
                }
            }
            obj.style.height=''+place[1]+'px';
            obj.style.top=''+place[0]+'px';
            if (position==3) {
                if (platform == 'chalk'){
                    if (settings.statusPosition < 3) obj.style.left='10px';
                    else obj.style.left='0px';
                }
                else obj.style.left='5px';
            }
            obj.innerHTML='<img src="'+icon+'" />';
        }
    }
}