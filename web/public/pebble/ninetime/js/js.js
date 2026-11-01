function init() {
    loadData();
    if(typeof initSettingsUI === 'function') initSettingsUI();
    reDraw();
    //window.onscroll = onScroll;
    setTimeout('initScroll()',500);
}
function deinit() {
    saveScroll();
}
function saveScroll() {
    var y=0;
    if(window.pageYOffset!= undefined){
        y= pageYOffset;
    }
    else{
        var sx, sy, d= document, r= d.documentElement, b= d.body;
        sx= r.scrollLeft || b.scrollLeft || 0;
        sy= r.scrollTop || b.scrollTop || 0;
        y=sy;
    }
    localStorage.setItem('scrollPos',y);
    
}
function initScroll() {
    return;
    var y=localStorage.getItem('scrollPos')*1;
    if (actualVersion != CONFIG_VERSION) y=10000;
    window.scrollTo(0,y);
    //void 0;
}
var needRedraw=false;
function change(obj) {
    if (obj.className == "select-color") {
        colorpicker(obj);
    }
    needRedraw=false;
    if (!obj.id) return;
    id=obj.id;
    ida=id.split("-");
    partnum=ida[ida.length-1]*1;
    ida.pop();
    partid=ida.join("-");
    /*digitln=1;
    partid=id.substring(0,id.length-digitln);
    if (partid.substring(partid.length-1,partid.length) != "-") {
        digitln++;
        partid=id.substring(0,id.length-digitln);
    }
    partnum=id.substring(id.length-digitln,id.length)*1;*/
    //void 0;
    var foundFaceType=false;
    switch (partid) {
        // main facetype
        case 'tabs-face':
            if (partnum != settings.facetype) {
                settings.facetype=partnum;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        // sub facetype
        case 'config-face-0':
            if (partnum != settings.facetype0) {
                settings.facetype0=partnum;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'config-face-0-2':
            if (partnum != settings.facetype02) {
                settings.facetype02=partnum;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'config-face-1':
            if (partnum != settings.facetype1) {
                settings.facetype1=partnum;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'config-face-2':
            if (partnum != settings.facetype2) {
                settings.facetype2=partnum;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'config-face-2-0':
        case 'config-face-2-1':
        case 'config-face-2-2':
            if (partnum != settings.facetype2_suball) {
                settings.facetype2_suball=partnum*1;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'hour-leading':
            if ((obj.checked*1) != settings.leadinZero) {
                settings.leadinZero=(obj.checked*1);
                needRedraw=true;
            }
            foundFaceType=true;
            break;

        // vertical
        case 'config-5-bg':
            if (partnum != settings.verticalBg) {
                settings.verticalBg=partnum;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'config-5-line':
            if (partnum != settings.verticalLine) {
                settings.verticalLine=partnum;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'config-5-textcolor':
            if (partnum != settings.verticalColor) {
                settings.verticalColor=partnum;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'config-5-icon':
            if (partnum != settings.verticalIcon) {
                settings.verticalIcon=partnum;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'config-5-iconbg':
            if (partnum != settings.verticalIconBg) {
                settings.verticalIconBg=partnum;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'vertical-position':
            if ((obj.value*1) != settings.verticalPosition) {
                settings.verticalPosition=(obj.value*1);
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'vertical-status-pos':
            if ((obj.value*1) != settings.statusPosition) {
                settings.statusPosition=(obj.value*1);
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'vertical-icon-pos':
            if ((obj.value*1) != settings.verticalPositions[partnum]) {
                settings.verticalPositions[partnum]=(obj.value*1);
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'vertical-status-icon':
            if (partnum != settings.statusShow){
                settings.statusShow=partnum;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'vertical-show-seconds':
            if ((obj.value*1) != settings.verticalSecondsShow) {
                settings.verticalSecondsShow=(obj.value*1);
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        
        // horizontal
        case 'config-6-bg':
        case 'config-7-bg':
            hor=partid.split("-");
            if (partnum != settings.horizontalBg[hor[1]-6]) {
                settings.horizontalBg[hor[1]-6]=partnum;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'config-6-line':
        case 'config-7-line':
            hor=partid.split("-");
            if (partnum != settings.horizontalLine[hor[1]-6]) {
                settings.horizontalLine[hor[1]-6]=partnum;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'config-6-textcolor':
        case 'config-7-textcolor':
            hor=partid.split("-");
            if (partnum != settings.horizontalColor[hor[1]-6]) {
                settings.horizontalColor[hor[1]-6]=partnum;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'config-6-icon':
        case 'config-7-icon':
            hor=partid.split("-");
            if (partnum != settings.horizontalIcon[hor[1]-6]) {
                settings.horizontalIcon[hor[1]-6]=partnum;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'config-6-iconbg':
        case 'config-7-iconbg':
            hor=partid.split("-");
            if (partnum != settings.horizontalIconBg[hor[1]-6]) {
                settings.horizontalIconBg[hor[1]-6]=partnum;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'horizontal-position':
            if ((obj.value*1) != settings.horizontalPosition) {
                settings.horizontalPosition=(obj.value*1);
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'horizontal-content':
            if ((obj.value*1) != settings.horizontalPositions[partnum]) {
                settings.horizontalPositions[partnum]=(obj.value*1);
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'horizontal2-show':
            if ((obj.value*1) != settings.horizontal2Show) {
                settings.horizontal2Show=(obj.value*1);
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'horizontal2-seconds':
            if ((obj.value*1) != settings.horizontal2Seconds[partnum]) {
                settings.horizontal2Seconds[partnum]=(obj.value*1);
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        
        //vibrate
        case 'phoneconnection':
            value=obj.checked;
            if (value != settings.phoneConnectionCheck) {
                settings.phoneConnectionCheck=value;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'disconnect-type-icon':
            value=obj.checked;
            if (value != settings.disconnectIcon) {
                settings.disconnectIcon=value;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'disconnect-type-invert':
            value=obj.checked;
            if (value != settings.disconnectInvert) {
                settings.disconnectInvert=value;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'vibrate-disconnect':
            if ((obj.value*1) != settings.vibrateDisconnect) {
                settings.vibrateDisconnect=(obj.value*1);
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'vibrate-reconnect':
            if ((obj.value*1) != settings.vibrateReconnect) {
                settings.vibrateReconnect=(obj.value*1);
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'vibrate-period':
            if ((obj.value*1) != settings.vibratePeriod) {
                settings.vibratePeriod=(obj.value*1);
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'quietcharge':
            if ((obj.checked*1) != settings.quietCharge) {
                settings.quietCharge=(obj.checked*1);
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'quiettime':
            value=((partnum==0)?obj.checked:obj.value)*1;
            if (value != settings.quietTime[partnum]) {
                settings.quietTime[partnum]=value;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        
        // Custom text
        case 'customtext':
            value=obj.value;
            if (value != settings.customText) {
                settings.customText=value;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        
        // weather
        case 'weather-provider':
            if (partnum != settings.weatherProvider) {
                settings.weatherProvider=partnum;
                weatherSearchRequest++;
                weatherSearchResults=[];
                document.getElementById('weather-city-results').hidden=true;
                obj=document.getElementById('weather-city-status');
                if (obj) obj.innerHTML='';
                removeClassname(obj,"status-ok");
                removeClassname(obj,"status-error");
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'weather-refresh':
            value=obj.value*1;
            if (value != settings.weatherSettings[settings.weatherProvider].refreshTime) {
                settings.weatherSettings[settings.weatherProvider].refreshTime=value;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'weather-units':
            value=obj.value*1;
            if (value != settings.weatherMetric) {
                settings.weatherMetric=value;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'condition-language':
            value=obj.value;
            if (value != settings.weatherSettings[settings.weatherProvider].language) {
                settings.weatherSettings[settings.weatherProvider].language=value;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'weather-city-check':
            weatherCityCheck();
            foundFaceType=true;
            break;
        case 'weather-city-delete':
            weatherCityDelete();
            foundFaceType=true;
            break;
        
        // day and monthnames
        case 'date-dayname':
            settings.dayNames[partnum]=obj.value;
            needRedraw=true;
            foundFaceType=true;
            break;
        case 'date-monthname':
            settings.monthNames[partnum]=obj.value;
            needRedraw=true;
            foundFaceType=true;
            break;
        case 'loadlanguages':
            value=obj.value*1;
            if (value>=0){
                for(a=0 ; a < 7 ; a++) settings.dayNames[a]=dayNames[value][a];
                for(a=0 ; a < 12 ; a++) settings.monthNames[a]=monthNames[value][a];
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'date-config-dateformat':
            value=obj.value*1;
            if (value!= settings.dateFormat){
                settings.dateFormat=value;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'date-config-timeformat':
            value=obj.value*1;
            if (value!= settings.timeFormat){
                settings.timeFormat=value;
                needRedraw=true;
            }
            foundFaceType=true;
            break;
        
        // info script
        case 'info-config-url':
            value=obj.value;
            if (settings.info[settings.infoType].url!=value || settings.info[settings.infoType].urlOK!=value) {
                settings.info[settings.infoType].url=value;
                settings.info[settings.infoType].urlOK=value;
                infoChanged();
                needRedraw=true;
                //needRedraw=true;
            }
            foundFaceType=true;
            break;
        case 'info-config-usepos':
            value=obj.checked*1;
            if (settings.info[settings.infoType].usePos!=value) {
                settings.info[settings.infoType].usePos=value;
                needRedraw=true;
                infoChanged();
            }
            foundFaceType=true;
            break;
        case 'info-config-data':
            value=obj.value;
            if (settings.info[settings.infoType].data!=value) {
                settings.info[settings.infoType].data=value;
                needRedraw=true;
                infoChanged();
            }
            foundFaceType=true;
            break;
        case 'info-config-language':
            value=obj.value*1;
            if (settings.info[settings.infoType].language!=value) {
                settings.info[settings.infoType].language=value;
                needRedraw=true;
                infoChanged();
            }
            foundFaceType=true;
            break;
        case 'info-config-url-check':
            infoCheck();
            foundFaceType=true;
            break;
        case 'info-config-url-delete':
            infoDelete();
            infoChanged();
            foundFaceType=true;
            break;
        case 'info-refresh':
            value=obj.value*1;
            if (value != settings.info[settings.infoType].period) {
                settings.info[settings.infoType].period=value;
                needRedraw=true;
                infoChanged();
            }
            foundFaceType=true;
            break;
    }
    if (!foundFaceType) {
        rownum=ida[ida.length-1]*1;
        ida.pop();
        partid=ida.join("-");
        //void 0;
        switch (partid) {
            case "config-face-4-font":
                if(settings.facetype4.font[rownum] != partnum){
                    settings.facetype4.font[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-4-color":
                if(settings.facetype4.color[rownum] != partnum){
                    settings.facetype4.color[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-4-bg":
                if(settings.facetype4.bg[rownum] != partnum){
                    settings.facetype4.bg[rownum] = partnum;
                    needRedraw=true;
                }
                break;
           
           
            case "config-face-0-0-font":
                if(settings.facetype00.font[rownum] != partnum){
                    settings.facetype00.font[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-0-0-color":
                if(settings.facetype00.color[rownum] != partnum){
                    settings.facetype00.color[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-0-0-bg":
                if(settings.facetype00.bg[rownum] != partnum){
                    settings.facetype00.bg[rownum] = partnum;
                    needRedraw=true;
                }
                break;
           
           
           case "config-face-0-1-font":
                if (rownum == 100) rownum=10;
                if(settings.facetype01.font[rownum] != partnum){
                    settings.facetype01.font[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-0-1-color":
                if (rownum == 100) rownum=10;
                if(settings.facetype01.color[rownum] != partnum){
                    settings.facetype01.color[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-0-1-bg":
                if (rownum == 100) rownum=10;
                if(settings.facetype01.bg[rownum] != partnum){
                    settings.facetype01.bg[rownum] = partnum;
                    needRedraw=true;
                }
                break;
           
           
           case "config-face-0-2-0-font":
                if (rownum == 100) rownum=3;
                if(settings.facetype020.font[rownum] != partnum){
                    settings.facetype020.font[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-0-2-0-color":
                if (rownum == 100) rownum=3;
                if(settings.facetype020.color[rownum] != partnum){
                    settings.facetype020.color[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-0-2-0-bg":
                if (rownum == 100) rownum=3;
                if(settings.facetype020.bg[rownum] != partnum){
                    settings.facetype020.bg[rownum] = partnum;
                    needRedraw=true;
                }
                break;
           case "config-face-0-2-1-font":
                if(settings.facetype021.font[rownum] != partnum){
                    settings.facetype021.font[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-0-2-1-color":
                if(settings.facetype021.color[rownum] != partnum){
                    settings.facetype021.color[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-0-2-1-bg":
                if(settings.facetype021.bg[rownum] != partnum){
                    settings.facetype021.bg[rownum] = partnum;
                    needRedraw=true;
                }
                break;
           case "config-face-0-2-2-font":
                if(settings.facetype022.font[rownum] != partnum){
                    settings.facetype022.font[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-0-2-2-color":
                if(settings.facetype022.color[rownum] != partnum){
                    settings.facetype022.color[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-0-2-2-bg":
                if(settings.facetype022.bg[rownum] != partnum){
                    settings.facetype022.bg[rownum] = partnum;
                    needRedraw=true;
                }
                break;
           case "config-face-0-2-3-font":
                if(settings.facetype023.font[rownum] != partnum){
                    settings.facetype023.font[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-0-2-3-color":
                if(settings.facetype023.color[rownum] != partnum){
                    settings.facetype023.color[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-0-2-3-bg":
                if(settings.facetype023.bg[rownum] != partnum){
                    settings.facetype023.bg[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            
            
            case "config-face-1-0-font":
                if (rownum == 6) rownum=0;
                if (rownum == 9) rownum=1;
                if(settings.facetype10.font[rownum] != partnum){
                    settings.facetype10.font[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-1-0-color":
                if (rownum == 6) rownum=0;
                if (rownum == 9) rownum=1;
                if(settings.facetype10.color[rownum] != partnum){
                    settings.facetype10.color[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-1-0-bg":
                if (rownum == 6) rownum=0;
                if (rownum == 9) rownum=1;
                if(settings.facetype10.bg[rownum] != partnum){
                    settings.facetype10.bg[rownum] = partnum;
                    needRedraw=true;
                }
                break;

                
            case "config-face-1-1-font":
                if(settings.facetype11.font[rownum] != partnum){
                    settings.facetype11.font[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-1-1-color":
                if(settings.facetype11.color[rownum] != partnum){
                    settings.facetype11.color[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-1-1-bg":
                if(settings.facetype11.bg[rownum] != partnum){
                    settings.facetype11.bg[rownum] = partnum;
                    needRedraw=true;
                }
                break;


            case "config-face-2-0-0-hour":
            case "config-face-2-0-1-hour":
            case "config-face-2-0-2-hour":
            case "config-face-2-1-0-hour":
            case "config-face-2-1-1-hour":
            case "config-face-2-1-2-hour":
            case "config-face-2-2-0-hour":
            case "config-face-2-2-1-hour":
            case "config-face-2-2-2-hour":
                var s=settings.facetype200;
                var sub_=settings.facetype2_suball;
                if(s[sub_].hour[rownum] != partnum){
                    s[sub_].hour[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-2-0-0-font":
            case "config-face-2-0-1-font":
            case "config-face-2-0-2-font":
            case "config-face-2-1-0-font":
            case "config-face-2-1-1-font":
            case "config-face-2-1-2-font":
            case "config-face-2-2-0-font":
            case "config-face-2-2-1-font":
            case "config-face-2-2-2-font":
                var s=settings.facetype200;
                var sub_=settings.facetype2_suball;
                if(s[sub_].minut[rownum] != partnum){
                    s[sub_].minut[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-2-0-0-color":
            case "config-face-2-0-1-color":
            case "config-face-2-0-2-color":
            case "config-face-2-1-0-color":
            case "config-face-2-1-1-color":
            case "config-face-2-1-2-color":
            case "config-face-2-2-0-color":
            case "config-face-2-2-1-color":
            case "config-face-2-2-2-color":
                var s=settings.facetype200;
                var sub_=settings.facetype2_suball;
                if(s[sub_].color[rownum] != partnum){
                    s[sub_].color[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-2-0-0-bg":
            case "config-face-2-0-1-bg":
            case "config-face-2-0-2-bg":
            case "config-face-2-1-0-bg":
            case "config-face-2-1-1-bg":
            case "config-face-2-1-2-bg":
            case "config-face-2-2-0-bg":
            case "config-face-2-2-1-bg":
            case "config-face-2-2-2-bg":
                var s=settings.facetype200;
                var sub_=settings.facetype2_suball;
                if(s[sub_].bg[rownum] != partnum){
                    s[sub_].bg[rownum] = partnum;
                    needRedraw=true;
                }
                break;
            case "config-face-2-0-0-showtime":
            case "config-face-2-1-0-showtime":
            case "config-face-2-2-0-showtime":
                value=obj.value*1;
                if(settings.facetype2_showTime != value){
                    settings.facetype2_showTime = value;
                    if (settings.facetype2_showDate == 1 && value==1) settings.facetype2_showDate=2;
                    if (settings.facetype2_showDate == 2 && value==2) settings.facetype2_showDate=1;
                    if (settings.facetype2_showDate == 3 && value==1) settings.facetype2_showDate=4;
                    if (settings.facetype2_showDate == 4 && value==2) settings.facetype2_showDate=3;
                    needRedraw=true;
                }
                break;
            case "config-face-2-0-0-showdate":
            case "config-face-2-1-0-showdate":
            case "config-face-2-2-0-showdate":
                value=obj.value*1;
                if(settings.facetype2_showDate != value){
                    settings.facetype2_showDate = value;
                    if (settings.facetype2_showTime == 1 && value==1) settings.facetype2_showTime=2;
                    if (settings.facetype2_showTime == 2 && value==2) settings.facetype2_showTime=1;
                    if (settings.facetype2_showTime == 1 && value==3) settings.facetype2_showTime=2;
                    if (settings.facetype2_showTime == 2 && value==4) settings.facetype2_showTime=1;
                    needRedraw=true;
                }
                break;

        }
    }
    if (needRedraw) reDraw();
}
colorChooseId='';
function colorpicker(obj) {
    colorChooseId=obj.id;
    var textcolor=(colorChooseId.indexOf("textcolor") >= 0);
    for(a = 0 ; a < 64 ; a++){
        objc=document.getElementById('colorpicker-'+a);
        objc.style.backgroundColor='#'+pebblecolors[a].rgb;
        objc.style.color='#'+pebblecolors[a].rgbsun;
        if (obj.innerHTML == a) addClassname(objc,'selected');
        else removeClassname(objc,'selected');
        if (PBL_COLOR || a==0 || (!textcolor && a==42) || a==63) {
            removeClassname(objc,'disabled');
            objc.innerHTML=a;
        }
        else {
            addClassname(objc,'disabled');
            objc.innerHTML='';
        }
    }
    document.getElementById('colorpicker').style.display='';
}
var disableoutsideclick=false;
function colorChoose(obj) {
    if (obj) {
        disableoutsideclick=true;
        setTimeout(function(){disableoutsideclick=false;},500);
        if (obj.innerHTML === '') return;
        ida=obj.id.split("-");
        change({id:colorChooseId+'-'+ida[1]});
    }
    else if (disableoutsideclick == true) return;
    colorChooseId='';
    document.getElementById('colorpicker').style.display='none';
}
 



function removeClassname(obj,nev){
    if(obj) obj.className=obj.className.split(nev).join("").trim();
}
function addClassname(obj,nev){
    removeClassname(obj,nev);
    if (obj) obj.className=(obj.className+" "+nev).trim();
}
function randomInt(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}
function to2Digit(num) {
    if (num > 9) return ''+num;
    return '0'+num;
}
function hourToNum(hour,justnum) {
    if(h24) return to2Digit(hour);
    if(justnum) return to2Digit((hour + 11) % 12 + 1);
    return to2Digit((hour + 11) % 12 + 1)+((hour>= 12)?" PM":" AM");
}
function customTextEnabled() {
    for (a=0 ; a<3 ; a++) {
        //if (settings.horizontalPositions[a] == STATUS_H_TEXT) return true;
        if ((a==0 || settings.horizontal2Show > 0 ) && getHorizontalObject(settings.horizontalPositions[a]).customtext) return true;
    }
    return false;
}
function showBox(obj,show) {
    if (!obj) return;
    obj.style.display='block';
    obj.style.height='auto';
}
function hideBox(obj) {
    if (!obj) return;
    obj.style.display='none';
    obj.style.height='auto';
}
var xhrRequest = function (url, type, callback,postdata) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, NINETIME_BASE_URL + '/xhr.php?url='+encodeURIComponent(url));
  if(postdata && type == 'POST') {
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(postdata);
  }
  else xhr.send();
};
function dateFullEnabled() { 
    for (a=0 ; a<3 ; a++) {
        /*if (settings.horizontalPositions[a] == STATUS_H_DATE_FULL) return true;
        if (settings.horizontalPositions[a] == STATUS_H_DATETIME) return true;*/
        if (getVerticalObject(settings.verticalPositions[a]).dateFull) return true;
        if ((a==0 || settings.horizontal2Show > 0 ) && getHorizontalObject(settings.horizontalPositions[a]).dateFull) return true;
    }
    return false;
}
function timeEnabled() { 
    if (settings.facetype == 2 && settings.facetype2_showTime) return true;
    for (a=0 ; a<3 ; a++) {
        /*if (settings.horizontalPositions[a] == STATUS_H_TIME) return true;
        if (settings.horizontalPositions[a] == STATUS_H_DATETIME) return true;*/
        if (getVerticalObject(settings.verticalPositions[a]).time) return true;
        if ((a==0 || settings.horizontal2Show > 0 ) && getHorizontalObject(settings.horizontalPositions[a]).time) return true;
    }
    return false;
}
function dateNameEnabled() {
    if (settings.facetype == 2 && settings.facetype2_showDate) return true;
    for (a=0 ; a<3 ; a++) {
        if (getVerticalObject(settings.verticalPositions[a]).dateName) return true;
        if ((a==0 || settings.horizontal2Show > 0 ) && getHorizontalObject(settings.horizontalPositions[a]).dateName) return true;
    }
    return false;
}
function dateEnabled() {
    return dateFullEnabled()||timeEnabled()||dateNameEnabled();
}
function setCaretPosition(elem, caretPos) {
    
    if(elem != null) {
        if(elem.createTextRange) {
            var range = elem.createTextRange();
            range.move('character', caretPos);
            range.select();
        }
        else {
            if(elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(caretPos, caretPos);
            }
            else
                elem.focus();
        }
    }
}
function checkInputName(obj) {
    value=obj.value;
    position=value.indexOf(",");
    if (position>=0) {
        obj.value=value.substring(0,position)+value.substring(position+1,value.length);
        setCaretPosition(obj,position);
    }
}
function gotoPaypal() {
    //onScroll();
    localStorage.setItem('gotoPaypal',JSON.stringify(settings));
    //document.location = 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=4RX9SQV493LQL';
}
function copyClipboard(copyText){
    copyText.select();
    document.execCommand("Copy");
}
function createCompSelection(tomb,position) {
    if (!position) position=0;
    str='';
    var optgroup=0;
    for(var a = 0 ; a < tomb.length ; a++) if(!position || tomb[a].pos[position-1]){
        //void 0;
        if(tomb[a].id>=0){
            if (!PBL_HR && tomb[a].hr) str+='';
            else if(!PBL_HEALTH && tomb[a].health) str+='';
            else str+='<option value="'+tomb[a].id+'">'+tomb[a].name+'</option>';
        }
        else{
            if(optgroup) {
                str+='</optgroup>';
                optgroup=0;
            }
            if(tomb[a].name){
                str+='<optgroup label="'+tomb[a].name+'">';
                optgroup=1;
            }
        }
    }
    if(optgroup) str+='</optgroup>';
    return str;
}
