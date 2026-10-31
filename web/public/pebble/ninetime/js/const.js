var STATUS_V_NONE          =0 ;
var STATUS_V_BATT          =1 ;
var STATUS_V_DATE_DAY_MON  =2 ;
var STATUS_V_STEPS         =3 ;
var STATUS_V_HR            =4 ;
var STATUS_V_WEATHER_C_WIN =5 ;
var STATUS_V_WEATHER_F     =6 ;
var STATUS_V_WEATHER_WH    =7 ;
var STATUS_V_WEATHER_C_HUM =8 ;
var STATUS_V_WEATHER_C     =9 ;
var STATUS_V_BATT_STEPS    =10 ;
var STATUS_V_BATT_HR       =11 ;
var STATUS_V_STEPS_HR      =12 ;
var STATUS_V_HR_STEPS      =13 ;
var STATUS_V_DATE_MON_DAY  =14 ;
var STATUS_V_DATE_DAY      =15 ;
var STATUS_V_DATE_MON      =16 ;
var STATUS_V_WEEK_SUN      =17 ;
var STATUS_V_WEEK_MON      =18 ;

var STATUS_H_NONE         =0 ;
var STATUS_H_DATE         =1 ;
var STATUS_H_DATE_FULL    =2 ;
var STATUS_H_TIME         =3 ;
var STATUS_H_DATETIME     =4 ;
var STATUS_H_HEALTH       =5 ;
var STATUS_H_WEATHER_C    =6 ;
var STATUS_H_WEATHER_F    =7 ;
var STATUS_H_WEATHER_CITY =8 ;
var STATUS_H_INFO         =9 ;
var STATUS_H_TEXT         =10 ;
var STATUS_H_WEATHER_COND =11 ;
var STATUS_H_HOLIDAYS_CHR =12 ;
var STATUS_H_TIME_SEC     =13 ;

var weatherProviders=['wu','owm','yahoo'];
var weatherApiKeys=['NINETIME_SERVER_WU','NINETIME_SERVER_OWM',''];

var fontNames=['C64','9GAG','Ubuntu','Mr. Robot','Atari'];
if (CONFIG_VERSION >= 1.80) fontNames=['C64','9GAG','Ubuntu','Mr. Robot','Atari','LECO','BosaNova'];
function getVerticalObject(id) {
    for(i=0; i < verticalTexts.length ; i++) if (verticalTexts[i].id==id) return verticalTexts[i];
    return verticalTexts[0];
}
var VERTICAL_SIZES_NORMAL  =[0,30,46,29,34,42,48,37,42,42,30,30,29,34,46,35,35,34,34];
var VERTICAL_SIZES_EXTENDED=[0,30,51,29,34,65,55,42,58,42,61,66,65,65,51,38,38,34,34];

function compElemet(name,id,icon,health,hr,customtext,dateFull,dateName,time,info,forecast,weather,weathercondition,weatherlocation,pos1,pos2,pos3) {
    this.name=name;
    this.id=(typeof(id) === "number")?id:-1;
    this.icon=(icon)?icon:'';
    this.health=(health)?health:0;
    this.hr=(hr)?hr:0;
    this.customtext=(customtext)?customtext:0;
    this.dateFull=(dateFull)?dateFull:0;
    this.dateName=(dateName)?dateName:0;
    this.time=(time)?time:0;
    this.info=(info)?info:0;
    this.forecast=(forecast)?forecast:0;
    this.weather=(weather)?weather:0;
    this.weathercondition=(weathercondition)?weathercondition:0;
    this.weatherlocation=(weatherlocation)?weatherlocation:0;
    this.pos=new Array();
    this.pos[0]=(typeof(pos1) === "number")?pos1:1;
    this.pos[1]=(typeof(pos2) === "number")?pos2:1;
    this.pos[2]=(typeof(pos3) === "number")?pos3:1;
    
}

var verticalTexts= new Array();
var c=0;
verticalTexts[c++]=new compElemet("None",                       STATUS_V_NONE,          'STATUS_V_NONE',            0,0,0,0,0,0,0,0,0);
verticalTexts[c++]=new compElemet("Battery");
verticalTexts[c++]=new compElemet("Battery with percent",       STATUS_V_BATT,          'STATUS_V_BATT',            0,0,0,0,0,0,0,0,0);
if (CONFIG_VERSION >= 1.61)
verticalTexts[c++]=new compElemet("Battery (+Steps)",           STATUS_V_BATT_STEPS,    'STATUS_V_BATT_STEPS',      1,0,0,0,0,0,0,0,0);
if (CONFIG_VERSION >= 1.61)
verticalTexts[c++]=new compElemet("Battery (+Heart Rate)",      STATUS_V_BATT_HR,       'STATUS_V_BATT_HR',         1,1,0,0,0,0,0,0,0);

verticalTexts[c++]=new compElemet("Today's Date");
verticalTexts[c++]=new compElemet("Day name, Date, Month name", STATUS_V_DATE_DAY_MON,  'STATUS_V_DATE_DAY_MON',    0,0,0,0,1,0,0,0,0);
if (CONFIG_VERSION >= 1.70){
verticalTexts[c++]=new compElemet("Month name, Date, Day name", STATUS_V_DATE_MON_DAY,  'STATUS_V_DATE_MON_DAY',    0,0,0,0,1,0,0,0,0);
verticalTexts[c++]=new compElemet("Date, Day name",             STATUS_V_DATE_DAY,      'STATUS_V_DATE_DAY',        0,0,0,0,1,0,0,0,0);
verticalTexts[c++]=new compElemet("Date, Month name",           STATUS_V_DATE_MON,      'STATUS_V_DATE_MON',        0,0,0,0,1,0,0,0,0);
}
if (CONFIG_VERSION >= 1.90){
verticalTexts[c++]=new compElemet("Week number");
verticalTexts[c++]=new compElemet("Week starts Monday",        STATUS_V_WEEK_MON,      'STATUS_V_WEEK_MON',        0,0,0,0,1,0,0,0,0);
verticalTexts[c++]=new compElemet("Week starts Sunday",        STATUS_V_WEEK_SUN,      'STATUS_V_WEEK_SUN',        0,0,0,0,1,0,0,0,0);
}

verticalTexts[c++]=new compElemet("Health");
verticalTexts[c++]=new compElemet("Health Steps",               STATUS_V_STEPS,         'STATUS_V_STEPS',           1,0,0,0,0,0,0,0,0);
if (CONFIG_VERSION >= 1.61)
verticalTexts[c++]=new compElemet("Health Steps (+Heart Rate)", STATUS_V_STEPS_HR,      'STATUS_V_STEPS_HR',        1,1,0,0,0,0,0,0,0);
verticalTexts[c++]=new compElemet("Heart Rate",                 STATUS_V_HR,            'STATUS_V_HR',              1,1,0,0,0,0,0,0,0);
if (CONFIG_VERSION >= 1.61)
verticalTexts[c++]=new compElemet("Heart Rate (+Steps)",        STATUS_V_HR_STEPS,      'STATUS_V_HR_STEPS',        1,1,0,0,0,0,0,0,0);

verticalTexts[c++]=new compElemet("Weather");
if (CONFIG_VERSION >= 1.60)
verticalTexts[c++]=new compElemet("Current Weather",            STATUS_V_WEATHER_C,     'STATUS_V_WEATHER_C',       0,0,0,0,0,0,0,0,1);
if(!gadgetbridge)
verticalTexts[c++]=new compElemet("Current Weather (+Wind)",    STATUS_V_WEATHER_C_WIN, 'STATUS_V_WEATHER_C_WIN',   0,0,0,0,0,0,0,0,1);
if (CONFIG_VERSION >= 1.60)
verticalTexts[c++]=new compElemet("Current Weather (+Humidity)",STATUS_V_WEATHER_C_HUM, 'STATUS_V_WEATHER_C_HUM',   0,0,0,0,0,0,0,0,1);
if (CONFIG_VERSION >= 1.5 && !gadgetbridge)
verticalTexts[c++]=new compElemet("Current Wind and Humidity",  STATUS_V_WEATHER_WH,    'STATUS_V_WEATHER_WH',      0,0,0,0,0,0,0,0,1);
if(!gadgetbridge)
verticalTexts[c++]=new compElemet("Forecast Weather",           STATUS_V_WEATHER_F,     'STATUS_V_WEATHER_F',       0,0,0,0,0,0,0,1,1);

function getHorizontalObject(id) {
    for(i=0; i < horizontalTexts.length ; i++) if (horizontalTexts[i].id==id) return horizontalTexts[i];
    return horizontalTexts[0];
}
var horizontalTexts= new Array();
c=0;
horizontalTexts[c++]=new compElemet("None",                     STATUS_H_NONE,          '',                         0,0,0,0,0,0,0,0,0,0,0,1,0,1);
horizontalTexts[c++]=new compElemet("Today's Date/Time");
horizontalTexts[c++]=new compElemet("Date with names",          STATUS_H_DATE,          '',                         0,0,0,0,1,0,0,0,0);
horizontalTexts[c++]=new compElemet("Date with year",           STATUS_H_DATE_FULL,     '',                         0,0,0,1,1,0,0,0,0);
horizontalTexts[c++]=new compElemet("Time",                     STATUS_H_TIME,          '',                         0,0,0,0,0,1,0,0,0);
if (CONFIG_VERSION >= 1.70)
horizontalTexts[c++]=new compElemet("Time with seconds (high battery usage!)",STATUS_H_TIME_SEC,            '',     0,0,0,0,0,1,0,0,0,0,0,1,0,0);
if (CONFIG_VERSION >= 1.70)
horizontalTexts[c++]=new compElemet("Time with seconds",        STATUS_H_TIME_SEC,      '',                         0,0,0,0,0,1,0,0,0,0,0,0,1,1);
horizontalTexts[c++]=new compElemet("Date and Time (full)",     STATUS_H_DATETIME,      '',                         0,0,0,1,1,1,0,0,0);
horizontalTexts[c++]=new compElemet("Health");
horizontalTexts[c++]=new compElemet("Health data",              STATUS_H_HEALTH,        '',                         1,0,0,0,0,0,0,0,0);
horizontalTexts[c++]=new compElemet("Weather");
horizontalTexts[c++]=new compElemet("Current Weather",          STATUS_H_WEATHER_C,     '',                         0,0,0,0,0,0,0,0,1);
horizontalTexts[c++]=new compElemet("Weather city name",        STATUS_H_WEATHER_CITY,  '',                         0,0,0,0,0,0,0,0,1,0,1);
if (CONFIG_VERSION >= 1.60)
horizontalTexts[c++]=new compElemet("Weather condition text",   STATUS_H_WEATHER_COND,  '',                         0,0,0,0,0,0,0,0,1,1);
if(!gadgetbridge)
horizontalTexts[c++]=new compElemet("Forecast Weather",         STATUS_H_WEATHER_F,     '',                         0,0,0,0,0,0,0,1,1);
horizontalTexts[c++]=new compElemet("Custom texts");
if(!gadgetbridge)
horizontalTexts[c++]=new compElemet("Info script result*",      STATUS_H_INFO,          '',                         0,0,0,0,0,0,1,0,0);
horizontalTexts[c++]=new compElemet("Custom text**",            STATUS_H_TEXT,          '',                         0,0,1,0,0,0,0,0,0);
if ((CONFIG_VERSION >= 1.64 && PBL_HEALTH) || CONFIG_VERSION >= 1.70) 
horizontalTexts[c++]=new compElemet("Upcoming holidays (Christian+Halloween)",STATUS_H_HOLIDAYS_CHR,'',             0,0,0,0,0,0,0,0,0);

var vibrateDisconnectTexts=['Disable','Short pulse','Double pulse','Long pulse','Special pattern'];
var statusIconTexts =['Always show','Show when <b>quiet</b>, <b>download error</b>, or <b>disconnected</b>','Show when <b>download error</b>, or <b>phone disconnected</b>','Show only when <b>phone disconnected</b>','Never show'];
var statusIconTexts2=['Always show','Show when <b>quiet</b>, or <b>download error</b>','Show only when <b>download error</b>','Never show','Never show'];
//var dateFormats=['17-04-22','17.04.22','17/04/22','22.04.17','22/04/17','22-04-17','04/22/17'];
var dateFormats=['YY-MM-DD','YY.MM.DD','YY/MM/DD','DD.MM.YY','DD/MM/YY','DD-MM-YY','MM/DD/YY'];
//var timeFormats=['6:30 pm','6.30pm','6:30 p.m.'];
var timeFormats=['H:MM am/pm','H.MMam/pm','H:MM a.m./p.m.'];
if (h24) timeFormats=['H:MM','H.MM'];

var DFT=2; //default_font_type
var DFC=63; //default_font_color
var DFB=0; //default_font_bg
var DBC=new Array(0,63,0); //default_bar_color
var DBB=new Array(32,0,63); //default_bar_bg
var DBI=new Array(63,32,63); //default_bar_iconbg
var DBL=new Array(DBB[0],42,42); //default_bar_line
if (!PBL_COLOR) {
    DFT=0;
    DFC=0;
    DFB=63;
    DBC=Array(0,0,63);
    DBB=Array(42,63,0);
    DBI=Array(63,63,0);
    DBL=Array(DBB[0],42,42);    
}
var intStorageStartIndex     =10;

var infoDownloadFreqIndex    =10;
var weatherDownloadFreqIndex =11;
var statusPositionIndex      =12;
var vertPosIndex             =13;
var horPosIndex              =14;
var positionsVIndex          =15; //3 byte
var positionsHIndex          =18; //5 byte
var fontTypeIndex            =23; //3+10+6+10 byte
var bgDigitIndex             =52; //4+10+6+10 byte
var colorDigitIndex          =82; //3+10+6+10 byte
var bgVertIndex              =111;
var lineVertIndex            =112;
var colorVertIndex           =113;
var iconVertIndex            =114;
var iconbgVertIndex          =115;
var bgHorIndex               =116; //2 byte
var lineHorIndex             =118; //2 byte
var colorHorIndex            =120; //2 byte
var iconHorIndex             =122; //2 byte
var iconbgHorIndex           =124; //2 byte
var leadingZeroIndex         =126;
var tempMetricIndex          =127;
var vibrateDisconnectIndex   =128;
var vibratePeriodIndex       =129;
var faceTypeIndex            =130;
var quietTimeIndex           =131; //5 byte
var dateformatIndex          =136;  //  /20: timeformat('6:30 pm','6.30pm','6:30 p.m.') , %20: dateformat('1996-04-22','1996.04.22','1996/04/22','22.04.1996','22/04/1996','22-04-1996','04/22/1996')
var fontMinuteIndex          =137; //12 byte
var bgMinuteIndex            =149; //12 byte
var colorMinuteIndex         =161; //12 byte


var intStorageLastIndex      =136;
if (CONFIG_VERSION >= 1.5) intStorageLastIndex=172;

var settings={
    facetype:4,
    facetype0:0,
    facetype02:0,
    facetype1:0,
    facetype2:0,
    facetype2_sub:[2,2,2],
    
    facetype4:{
        font: [DFT],
        color:[DFC],
        bg:   [DFB]
    },
    facetype00:{
        font: [DFT,DFT,DFT,DFT],
        color:[DFC,DFC,DFC,DFC],
        bg:   [DFB,DFB,DFB,DFB]
    },
    facetype01:{
        font: [DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT],
        color:[DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC],
        bg:   [DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB]
    },
    facetype020:{
        font: [DFT,DFT,DFT,DFT],
        color:[DFC,DFC,DFC,DFC],
        bg:   [DFB,DFB,DFB,DFB]
    },
    facetype021:{
        font: [DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT],
        color:[DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC],
        bg:   [DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB]
    },
    facetype022:{
        font: [DFT,DFT,DFT,DFT,DFT,DFT],
        color:[DFC,DFC,DFC,DFC,DFC,DFC],
        bg:   [DFB,DFB,DFB,DFB,DFB,DFB]
    },
    facetype023:{
        font: [DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT],
        color:[DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC],
        bg:   [DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB]
    },
    
    facetype10:{
        font: [DFT,DFT],
        color:[DFC,DFC],
        bg:   [DFB,DFB]
    },
    facetype11:{
        font: [DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT],
        color:[DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC],
        bg:   [DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB]
    },

    facetype20:[[{
        minut:[DFC,DFC],
        color:[DFC,DFC],
        bg:   [DFB,DFB]
    },
    {
        minut:[DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC],
        color:[DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC],
        bg:   [DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB]
    },
    {
        minut: [DFC],
        color:[DFC],
        bg:   [DFB]
    }],
    [{
        minut:[DFC,DFC],
        color:[DFC,DFC],
        bg:   [DFB,DFB]
    },
    {
        minut:[DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC],
        color:[DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC],
        bg:   [DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB]
    },
    {
        minut: [DFC],
        color:[DFC],
        bg:   [DFB]
    }],
    [{
        minut:[DFC,DFC],
        color:[DFC,DFC],
        bg:   [DFB,DFB]
    },
    {
        minut:[DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC],
        color:[DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC],
        bg:   [DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB]
    },
    {
        minut: [DFC],
        color:[DFC],
        bg:   [DFB]
    }]],
    leadinZero: 0,
    statusPosition:2,
    statusShow:0,
    verticalPosition:1,
    verticalBg:DBB[0],
    verticalLine:DBL[0],
    verticalColor:DBC[0],
    verticalIcon:DBC[0],
    verticalIconBg:DBI[0],
    verticalPositions:[(PBL_HEALTH)?STATUS_V_BATT:STATUS_V_BATT,
                       (PBL_HEALTH && platform != 'chalk')?STATUS_V_STEPS:STATUS_V_NONE,
                       (PBL_HEALTH)?STATUS_V_DATE_DAY_MON:STATUS_V_DATE_DAY_MON],
    horizontalPosition:2,
    horizontalBg:[DBB[1],DBB[2]],
    horizontalLine:[DBL[1],DBL[2]],
    horizontalColor:[DBC[1],DBC[2]],
    horizontalIcon:[DBC[1],DBC[2]],
    horizontalIconBg:[DBI[1],DBI[2]],
    horizontalPositions:[(PBL_HEALTH)?STATUS_H_TEXT:STATUS_H_TEXT,
                       STATUS_H_NONE,
                       STATUS_H_NONE],
    horizontal2Show:0,
    horizontal2Seconds:[4,4],
    vibrateDisconnect:4,
    vibrateReconnect:0,
    vibratePeriod:0,
    quietCharge:1,
    quietTime:[0,23,0,6,0],
    customText:'PEBBLE',
    weatherProvider: 1,
    weatherMetric:1,
    weatherSettings:[{apiKey:'',
                      refreshTime:60,
                      cityName:''},
                     {apiKey:'',
                      refreshTime:15,
                      cityName:''}],
    dayNames:[dayNames[0][0],dayNames[0][1],dayNames[0][2],dayNames[0][3],dayNames[0][4],dayNames[0][5],dayNames[0][6]],
    monthNames:[monthNames[0][0],monthNames[0][1],monthNames[0][2],monthNames[0][3],monthNames[0][4],monthNames[0][5],
                monthNames[0][6],monthNames[0][7],monthNames[0][8],monthNames[0][9],monthNames[0][10],monthNames[0][11]],
    infoType:1,
    info:[{url:'http://',
           urlOK:'',
           language:0,
           usePos:1,
           period: 60,
           data:''},
          {url:'',
           urlOK:NINETIME_BASE_URL + '/words.php',
           language:0,
           usePos:0,
           period: 60,
           data:''}],
    dateFormat:0,
    timeFormat:0,
};
var defaultSettings=JSON.stringify(settings);

/*var settings = {
  value_appConfigInt: new Array( 0,0,0,0,0,0,0,0,0,0,
    2, //value_infoDownloadFreq //0: disable, 5: 5min, 15: 15min, 30: 30min, 60: 1hour, 61: morning and night, 62: morning
    2, //value_weatherDownloadFreq //0: disable, 5: 5min, 15: 15min, 30: 30min, 60: 1hour, 61: morning and night, 62: morning
    1, //value_statusPosition //nobt, silent icon position - 1: up, 2: down
    1, //value_vertPos //Vertical info position - 1: left, 2: right
    2, //value_horPos //Horizontal info position - 1: top, 2: bottom
    (PBL_HEALTH)?STATUS_V_BATT:STATUS_V_BATT, //value_positionsV // Vertical icons - top
    (PBL_HEALTH)?STATUS_V_NONE:STATUS_V_NONE, //value_positionsV // Vertical icons - middle
    (PBL_HEALTH)?STATUS_V_DATE:STATUS_V_DATE, //value_positionsV // Vertical icons - bottom
  
    (PBL_HEALTH)?STATUS_H_HEALTH:STATUS_H_DATE, //value_positionsH // // Horizontal icons - default show
    (PBL_HEALTH)?STATUS_H_NONE:STATUS_H_NONE, //value_positionsH // Horizontal icons - show on tap/shake
    7, //value_positionsH // Horizontal icons - seconds/10 delay to show on tap/shake
    7, //value_positionsH // Horizontal icons - seconds delay to back to default
    1, //value_positionsH // Double tap
    // font type for every number and digit- 0: square, 1: 9gag, 2: round
    DFT,DFT,DFT, // value_fontType digit 0
    DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT, // value_fontType digit 1
    DFT,DFT,DFT,DFT,DFT,DFT, // value_fontType digit 2
    DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT,DFT, // value_fontType digit 3
    // digits background color - 0-63
    DFB,DFB,DFB,DFB, // value_bgDigit digit 0
    DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB, // value_bgDigit digit 1
    DFB,DFB,DFB,DFB,DFB,DFB, // value_bgDigit digit 2
    DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB,DFB, // value_bgDigit digit 3
    //digits color - 0-63
    DFC,DFC,DFC, //value_colorDigit digit 0
    DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC, //value_colorDigit digit 1
    DFC,DFC,DFC,DFC,DFC,DFC, //value_colorDigit digit 2
    DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC,DFC, //value_colorDigit digit 3
    
    DBB[0], //value_bgVert // Vertical info background color - 0-63
    DBL[0], //value_lineVert // Vertical info line color - 0-63
    DBC[0], //value_colorVert // Vertical info text color - 0-63
    DBC[0], //value_iconVert // Vertical icon color - 0-63
    DBI[0], //value_iconbgVert // Vertical icon background color - 0-63
    DBB[1], //value_bgHor1 // Horizontal1 info background color - 0-63
    DBB[2], //value_bgHor2 // Horizontal2 info background color - 0-63
    DBL[1], //value_lineHor1 // Horizontal1 info line color - 0-63
    DBL[2], //value_lineHor2 // Horizontal2 info line color - 0-63
    DBC[1], //value_colorHor1 // Horizontal1 info text color - 0-63
    DBC[2], //value_colorHor2 // Horizontal2 info text color - 0-63
    DBC[1], //value_iconHor1 // Horizontal icon color - 0-63
    DBC[2], //value_iconHor2 // Horizontal icon color - 0-63
    DBI[1], //value_iconbgHor1 // Horizontal icon background color - 0-63
    DBI[2], //value_iconbgHor2 // Horizontal icon background color - 0-63

    1, //value_leadingZero // hour leading zero
    0, //value_tempMetric
    1, //value_vibrateDisconnect
    0, //value_vibratePeriod
    0 //value_faceType //0: normal, color/digit/number; 1: color/all_digit/hour; 2: analog with square sans font color/hour; 3:  analog with 9gag font color/hour
    ),
  value_daynames:dayNames[0].join(),
  value_monthnames:monthNames[0].join(),
  value_textString:"PEBBLE",
  
  configWeatherProvider:"owm",
  configWeatherAPIKey:"NINETIME_SERVER_OWM",
  configWeatherLocation:"",
  configInfoURL:NINETIME_BASE_URL + '/words.php',
  configInfoUsePos:0,
  configLanguage:languages[0][0]
};*/


function pebblecolor(name,rgb,rgbsun) {
    this.rgb=rgb;
    this.rgbsun=rgbsun;
    this.name=name;
}
var pebblecolors=new Array()
pebblecolors[0]=new pebblecolor("GColorBlack","000000","000000");
pebblecolors[1]=new pebblecolor("GColorOxfordBlue","000055","001E41");
pebblecolors[2]=new pebblecolor("GColorDukeBlue","0000AA","004387");
pebblecolors[3]=new pebblecolor("GColorBlue","0000FF","0068CA");
pebblecolors[4]=new pebblecolor("GColorDarkGreen","005500","2B4A2C");
pebblecolors[5]=new pebblecolor("GColorMidnightGreen","005555","27514F");
pebblecolors[6]=new pebblecolor("GColorCobaltBlue","0055AA","16638D");
pebblecolors[7]=new pebblecolor("GColorBlueMoon","0055FF","007DCE");
pebblecolors[8]=new pebblecolor("GColorIslamicGreen","00AA00","5E9860");
pebblecolors[9]=new pebblecolor("GColorJaegerGreen","00AA55","5C9B72");
pebblecolors[10]=new pebblecolor("GColorTiffanyBlue","00AAAA","57A5A2");
pebblecolors[11]=new pebblecolor("GColorVividCerulean","00AAFF","4CB4DB");
pebblecolors[12]=new pebblecolor("GColorGreen","00FF00","8EE391");
pebblecolors[13]=new pebblecolor("GColorMalachite","00FF55","8EE69E");
pebblecolors[14]=new pebblecolor("GColorMediumSpringGreen","00FFAA","8AEBC0");
pebblecolors[15]=new pebblecolor("GColorCyan","00FFFF","84F5F1");
pebblecolors[16]=new pebblecolor("GColorBulgarianRose","550000","4A161B");
pebblecolors[17]=new pebblecolor("GColorImperialPurple","550055","482748");
pebblecolors[18]=new pebblecolor("GColorIndigo","5500AA","40488A");
pebblecolors[19]=new pebblecolor("GColorElectricUltramarine","5500FF","2F6BCC");
pebblecolors[20]=new pebblecolor("GColorArmyGreen","555500","564E36");
pebblecolors[21]=new pebblecolor("GColorDarkGray","555555","545454");
pebblecolors[22]=new pebblecolor("GColorLiberty","5555AA","4F6790");
pebblecolors[23]=new pebblecolor("GColorVeryLightBlue","5555FF","4180D0");
pebblecolors[24]=new pebblecolor("GColorKellyGreen","55AA00","759A64");
pebblecolors[25]=new pebblecolor("GColorMayGreen","55AA55","759D76");
pebblecolors[26]=new pebblecolor("GColorCadetBlue","55AAAA","71A6A4");
pebblecolors[27]=new pebblecolor("GColorPictonBlue","55AAFF","69B5DD");
pebblecolors[28]=new pebblecolor("GColorBrightGreen","55FF00","9EE594");
pebblecolors[29]=new pebblecolor("GColorScreaminGreen","55FF55","9DE7A0");
pebblecolors[30]=new pebblecolor("GColorMediumAquamarine","55FFAA","9BECC2");
pebblecolors[31]=new pebblecolor("GColorElectricBlue","55FFFF","95F6F2");
pebblecolors[32]=new pebblecolor("GColorDarkCandyAppleRed","AA0000","99353F");
pebblecolors[33]=new pebblecolor("GColorJazzberryJam","AA0055","983E5A");
pebblecolors[34]=new pebblecolor("GColorPurple","AA00AA","955694");
pebblecolors[35]=new pebblecolor("GColorVividViolet","AA00FF","8F74D2");
pebblecolors[36]=new pebblecolor("GColorWindsorTan","AA5500","9D5B4D");
pebblecolors[37]=new pebblecolor("GColorRoseVale","AA5555","9D6064");
pebblecolors[38]=new pebblecolor("GColorPurpureus","AA55AA","9A7099");
pebblecolors[39]=new pebblecolor("GColorLavenderIndigo","AA55FF","9587D5");
pebblecolors[40]=new pebblecolor("GColorLimerick","AAAA00","AFA072");
pebblecolors[41]=new pebblecolor("GColorBrass","AAAA55","AEA382");
pebblecolors[42]=new pebblecolor("GColorLightGray","AAAAAA","ABABAB");
pebblecolors[43]=new pebblecolor("GColorBabyBlueEyes","AAAAFF","A7BAE2");
pebblecolors[44]=new pebblecolor("GColorSpringBud","AAFF00","C9E89D");
pebblecolors[45]=new pebblecolor("GColorInchworm","AAFF55","C9EAA7");
pebblecolors[46]=new pebblecolor("GColorMintGreen","AAFFAA","C7F0C8");
pebblecolors[47]=new pebblecolor("GColorCeleste","AAFFFF","C3F9F7");
pebblecolors[48]=new pebblecolor("GColorRed","FF0000","E35462");
pebblecolors[49]=new pebblecolor("GColorFolly","FF0055","E25874");
pebblecolors[50]=new pebblecolor("GColorFashionMagenta","FF00AA","E16AA3");
pebblecolors[51]=new pebblecolor("GColorMagenta","FF00FF","DE83DC");
pebblecolors[52]=new pebblecolor("GColorOrange","FF5500","E66E6B");
pebblecolors[53]=new pebblecolor("GColorSunsetOrange","FF5555","E6727C");
pebblecolors[54]=new pebblecolor("GColorBrilliantRose","FF55AA","E37FA7");
pebblecolors[55]=new pebblecolor("GColorShockingPink","FF55FF","E194DF");
pebblecolors[56]=new pebblecolor("GColorChromeYellow","FFAA00","F1AA86");
pebblecolors[57]=new pebblecolor("GColorRajah","FFAA55","F1AD93");
pebblecolors[58]=new pebblecolor("GColorMelon","FFAAAA","EFB5B8");
pebblecolors[59]=new pebblecolor("GColorRichBrilliantLavender","FFAAFF","ECC3EB");
pebblecolors[60]=new pebblecolor("GColorYellow","FFFF00","FFEEAB");
pebblecolors[61]=new pebblecolor("GColorIcterine","FFFF55","FFF1B5");
pebblecolors[62]=new pebblecolor("GColorPastelYellow","FFFFAA","FFF6D3");
pebblecolors[63]=new pebblecolor("GColorWhite","FFFFFF","FFFFFF");
