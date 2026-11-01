
function cancelClose() {
    document.location = return_to;
}
function sendData() {
    normalizeWeatherSettings();
    //onScroll();
    var script = getInfoSettings();
    saveData();
    var options = {
      configIntText:buildIntStr(),
      configTextString:(customTextEnabled())?settings.customText:"",
      configMonthnames:(dateNameEnabled()?settings.monthNames.join(','):""),
      configDaynames:(dateNameEnabled()?settings.dayNames.join(','):""),
      configWeatherProvider:weatherProviders[settings.weatherProvider],
      configWeatherLocation:settings.weatherSettings[settings.weatherProvider].cityName,
      configWeatherLatitude:settings.weatherSettings[settings.weatherProvider].latitude,
      configWeatherLongitude:settings.weatherSettings[settings.weatherProvider].longitude,
      configWeatherLanguage:(weatherConditionTextEnabled())?settings.weatherSettings[settings.weatherProvider].language:'',
      configWeatherMetric:settings.weatherMetric,
      configInfoURL:settings.info[settings.infoType].urlOK,
      configInfoUsePos:settings.info[settings.infoType].usePos,
      configInfoData:settings.info[settings.infoType].data,
      configInfoLanguage:languages[settings.info[settings.infoType].language][0],
      fetchWeatherNow:1,
      fetchInfoNow:(infoEnabled() && !!script.urlOK)*1,
      configInfoEnabled:infoEnabled()*1,
      configForecastEnabled:weatherForecastEnabled()*1,
      configTextStringEnabled:customTextEnabled()*1,
      configWeatherLocationEnabled:weatherLocationEnabled()*1
    };
    if (Number(CONFIG_VERSION) < 2) {
      // An installed 1.xx companion cannot understand the new provider identifiers.
      // Keep its existing routing/key/location preferences; server adapters supply new data.
      ['configWeatherProvider', 'configWeatherLocation', 'configWeatherLatitude', 'configWeatherLongitude',
       'configWeatherLanguage', 'configWeatherMetric'].forEach(function (key) { delete options[key]; });
    }
    //void 0;
    if(1 || model != 'qemu_platform_basalt') document.location = return_to + encodeURIComponent(JSON.stringify(options));
}

function buildIntStr() {
        
    var offset=intStorageStartIndex*(-1);
    var data=new Array(intStorageLastIndex-intStorageStartIndex+1);
    var i;
    for (i = 0 ; i < data.length ; i++) data[i]=0;
    data[infoDownloadFreqIndex+offset]=settings.info[settings.infoType].period;
    data[weatherDownloadFreqIndex+offset]=settings.weatherSettings[settings.weatherProvider].refreshTime;
    data[statusPositionIndex+offset]=settings.statusPosition+settings.statusShow*5;
    data[vertPosIndex+offset]=settings.verticalPosition;
    data[horPosIndex+offset]=settings.horizontalPosition;
    for(i=0 ; i < 3 ; i++) {
        data[positionsVIndex+offset+i]=settings.verticalPositions[i];
        hpos=settings.horizontalPositions[i];
        if (i==2 && (settings.horizontalPositions[1] == STATUS_H_NONE || settings.horizontal2Show == 0)) hpos=STATUS_H_NONE;
        if (i==1 && settings.horizontal2Show == 0) hpos=STATUS_H_NONE;
        data[positionsHIndex+offset+i]=hpos;
    }
    data[positionsHIndex+offset+3]=settings.horizontal2Seconds[0]+((settings.horizontal2Show==2)?30:0);
    data[positionsHIndex+offset+4]=settings.horizontal2Seconds[1]+settings.verticalSecondsShow*15;
    switch (settings.facetype) {
        case 4:
            data[faceTypeIndex+offset]=0;
            for(i = 0 ; i < (3+10+6+10) ; i++) data[fontTypeIndex+offset+i]=settings.facetype4.font[0];
            for(i = 0 ; i < (4+10+6+10) ; i++) data[bgDigitIndex+offset+i]=settings.facetype4.bg[0];
            for(i = 0 ; i < (3+10+6+10) ; i++) data[colorDigitIndex+offset+i]=settings.facetype4.color[0];
            break;
        case 0:
            data[faceTypeIndex+offset]=0;
            //for digit 0
            obj=settings.facetype00;
            if (settings.facetype0 == 1) obj=settings.facetype01;                   
            for(i = 0 ; i < (4) ; i++) {
                index=0;
                if (settings.facetype0 == 1) {
                    index=i;
                    if (i == 4) index=10;
                }
                if (settings.facetype0 == 2) {
                    index=i;
                    obj=settings.facetype020;
                }
                if(i < 4) data[fontTypeIndex+offset+i]=obj.font[index];
                data[bgDigitIndex+offset+i]=obj.bg[index];
                if(i < 4) data[colorDigitIndex+offset+i]=obj.color[index];
            }
            //for digit 1 & 3
            for(i = 0 ; i < (10) ; i++) {
                index=1;
                if (settings.facetype0 == 1) index=i;
                if (settings.facetype0 == 2) {
                    index=i;
                    obj=settings.facetype021;
                }
                data[fontTypeIndex+offset+i+3]=obj.font[index];
                data[bgDigitIndex+offset+i+4]=obj.bg[index];
                data[colorDigitIndex+offset+i+3]=obj.color[index];

                                if (settings.facetype0 == 2) {
                    index=i;
                    obj=settings.facetype023;
                }
                index=3;
                if (settings.facetype0 == 1) index=i;
                data[fontTypeIndex+offset+i+3+10+6]=obj.font[index];
                data[bgDigitIndex+offset+i+4+10+6]=obj.bg[index];
                data[colorDigitIndex+offset+i+3+10+6]=obj.color[index];
            }
            //for digit 2
            for(i = 0 ; i < (6) ; i++) {
                index=2;
                if (settings.facetype0 == 1) index=i;
                if (settings.facetype0 == 2) {
                    index=i;
                    obj=settings.facetype022;
                }
                data[fontTypeIndex+offset+i+3+10]=obj.font[index];
                data[bgDigitIndex+offset+i+4+10]=obj.bg[index];
                data[colorDigitIndex+offset+i+3+10]=obj.color[index];
            }
            break;
        case 1:
            data[faceTypeIndex+offset]=1;
            for(i= 0 ; i < 24 ; i++){
                index=i;
                obj=settings.facetype11;
                if (settings.facetype1==0) {
                    index=(i>=6 && i < 21)?0:1;
                    obj=settings.facetype10;
                }
                data[fontTypeIndex+offset+i]=obj.font[index];
                data[bgDigitIndex+offset+i]=obj.bg[index];
                data[colorDigitIndex+offset+i]=obj.color[index];
            }
            break;
        case 2:
        case 3:
        case 4:
            data[faceTypeIndex+offset]=2+settings.facetype2;
            for(i= 0 ; i < 24 ; i++){
                index=i;
                var analogdata;
                if ('facetype200' in settings) analogdata=settings.facetype200;
                else analogdata=settings.facetype20[settings.facetype2];
                var sub;
                if ('facetype2_suball' in settings) sub=settings.facetype2_suball;
                else sub=settings.facetype2_sub[settings.facetype2];
                var obj=analogdata[sub];
                if (sub==0) index=(i>=6 && i < 21)?0:1;
                if (sub==2) index=0;
                data[fontTypeIndex+offset+i]=obj.minut[index];
                data[bgDigitIndex+offset+i]=obj.bg[index];
                data[colorDigitIndex+offset+i]=obj.color[index];
                if(CONFIG_VERSION >= 1.5) data[fontMinuteIndex+offset+i]=obj.hour[index];
            }
            data[fontTypeIndex+offset+24]=settings.facetype2_showTime;
            data[fontTypeIndex+offset+25]=settings.facetype2_showDate;
            break;
    }
    data[bgVertIndex+offset]=settings.verticalBg;
    data[lineVertIndex+offset]=settings.verticalLine;
    data[colorVertIndex+offset]=settings.verticalColor;
    data[iconVertIndex+offset]=settings.verticalIcon;
    data[iconbgVertIndex+offset]=settings.verticalIconBg;
    for(i = 0 ; i < 2 ; i++){
        data[bgHorIndex+offset+i]=settings.horizontalBg[i];
        data[lineHorIndex+offset+i]=settings.horizontalLine[i];
        data[colorHorIndex+offset+i]=settings.horizontalColor[i];
        data[iconHorIndex+offset+i]=settings.horizontalIcon[i];
        data[iconbgHorIndex+offset+i]=settings.horizontalIconBg[i];
    }
    data[leadingZeroIndex+offset]=settings.leadinZero;
    data[tempMetricIndex+offset]=settings.weatherMetric;
    data[vibrateDisconnectIndex+offset]=(settings.phoneConnectionCheck)?(settings.vibrateDisconnect+settings.vibrateReconnect*10):66;
    data[vibratePeriodIndex+offset]=settings.vibratePeriod+((settings.disconnectIcon)?0:1)+((settings.disconnectInvert)?2:0);
    data[quietTimeIndex+offset]=settings.quietTime[0]+settings.quietCharge*10;
    for(i=1 ; i<5 ; i++) data[quietTimeIndex+offset+i]=settings.quietTime[i];
    data[dateformatIndex+offset]=settings.dateFormat+settings.timeFormat*20;
    //void 0;
    var str='';
    for(i=0 ; i < data.length ; i++){
        if(CONFIG_VERSION >= 1.92) {
         /*
         40(48)-59(57)     20(10)
         64(65)-91(90)     28(26)
         97(97)-126(122)   30(26)
         78(62)
		   */
            charcode=data[i]+40;
            if(charcode > 59) charcode+=4;
            if(charcode > 91) charcode+=5;
            if(charcode > 126){

               charcode=40;
            }
        }
        else{
           charcode=data[i]+48;
           if (charcode > 126 || charcode < 48) {

               charcode=48;
           }
        }
        str+=String.fromCharCode(charcode);
    }
   return str;
}






