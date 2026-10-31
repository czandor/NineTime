

#include <pebble.h>

#include "const.h"
#include "functions.h"
#include "colors.h"
#include "draw.h"
#include "vertical.h"
#include "horizontal.h"


Window *s_main_window;
Layer *s_window_layer;
BatteryChargeState battery;
static bool btConnected = true;
static bool showsecondhor_enabled=true;
static bool vibrate_enabled=false;
static bool accel_recognize_disabled=false;
static void accel_recognize_enable(){accel_recognize_disabled=false;}
static int32_t stop_vertical_seconds_at=0;
static bool need_vertical_seconds();
static bool need_horizontal_seconds();
static bool timetick_is_seconds=false;
static void update_seconds();
static bool drawing_v_seconds=false;
static bool drawing_h_seconds=false;
bool inverted=false;
static bool disconnectIcon=true;
static bool disconnectInvert=false;

Layer *s_time_layer[4];
Layer *s_vert_layer;
#ifdef PBL_ROUND
Layer *s_vert_layer2;
#endif
Layer *s_hor_layer[3];
static int32_t infoDownloadStart=0; //nem kell menteni, csak munka
//DictionaryIterator *out_iter;


uint8_t digitValues[4]={99,99,99,99}; //init digit values (hour/10,hour%10,minute/10,minute%10)


// locally generated and stored variables
static int32_t value_infoLastDownload=0;
static int32_t value_weatherLastDownload=0;
static int value_steps=0;
static int value_hrbpm=0;
static int32_t value_infoLastDownloadStart=0;

static uint8_t value_h24SentValue=2;

// locally generated 
char dayname[10];
static uint8_t mday=0;
static uint8_t wday=0;
char monthname[10];
static uint8_t month=0;
static uint8_t year=0;
static uint8_t nextDownloadDelay=0;
bool verticalIconsSizes[4]={0,0,0,0};

// got from pebblekit.js, but not config
//char value_infoString[100]="Info script result";

//char value_weatherLocation[100]="Weather city";
//char value_weatherCondition[100]="Weather condition";
static int value_tempCurrent=-20;
static int value_tempMin=10;
static int value_tempMax=33;
static uint8_t value_weatherIconC=0;
static uint8_t value_weatherIconF=1;
static int value_weatherWindspeed=23;
static uint8_t value_humCurrent=0;

//char value_textString[100]="PEBBLE";

char bufferstring[BUFFERSTRING_LENGTH]="";
//char *bufferstring;

#define DATASTRUCTUREVERSION  48

// got frm pebblekit.js, from config
uint8_t value_appConfigInt[intStorageLastIndex+1]={ [0 ... (intStorageStartIndex-1)]=0,
  60, //value_infoDownloadFreq //0: disable, 5: 5min, 15: 15min, 30: 30min, 60: 1hour, 61: morning and night, 62: morning
  15, //value_weatherDownloadFreq //0: disable, 5: 5min, 15: 15min, 30: 30min, 60: 1hour, 61: morning and night, 62: morning
  2, //value_statusPosition //nobt, silent icon position - 1: up, 2: down
  1, //value_vertPos //Vertical info position - 1: left, 2: right
  2, //value_horPos //Horizontal info position - 1: top, 2: bottom
  #ifdef PBL_HEALTH
    STATUS_V_BATT, //value_positionsV // Vertical icons - top
    #ifdef PBL_ROUND
      STATUS_V_NONE, //value_positionsV // Vertical icons - middle
    #else
      STATUS_V_STEPS, //value_positionsV // Vertical icons - middle
    #endif
    STATUS_V_DATE_DAY_MON, //value_positionsV // Vertical icons - bottom

    STATUS_H_TEXT, //value_positionsH // // Horizontal icons - default show
    STATUS_H_NONE, //value_positionsH // Horizontal icons - show on tap/shake
    STATUS_H_NONE, //value_positionsH // Horizontal icons - show on tap/shake, secondary
  #else
    STATUS_V_BATT, //value_positionsV // Vertical icons - top
    STATUS_V_NONE, //value_positionsV // Vertical icons - middle
    STATUS_V_DATE_DAY_MON, //value_positionsV // Vertical icons - bottom
    
    STATUS_H_TEXT, //value_positionsH // // Horizontal icons - default show
    STATUS_H_NONE, //value_positionsH // Horizontal icons - show on tap/shake
    STATUS_H_NONE, //value_positionsH // Horizontal icons - show on tap/shake, secondary
  #endif
  3+30, //value_positionsH // Horizontal icons - seconds to show on tap/shake ; +30 if double tap
  3, //value_positionsH // %15: Horizontal icons - seconds to show on tap/shake, secondary, /15: show seconds on status icon (0:no,1:always when,2:ontap,3:ondoubletap)
  #ifdef PBL_COLOR
    // font type for every number and digit- 0: square, 1: 9gag, 2: round
    2,2,2, // value_fontType digit 0
    2,2,2,2,2,2,2,2,2,2, // value_fontType digit 1
    2,2,2,2,2,2, // value_fontType digit 2
    2,2,2,2,2,2,2,2,2,2, // value_fontType digit 3
    // digits background color - 0-63
    0,0,0,0, // value_bgDigit digit 0
    0,0,0,0,0,0,0,0,0,0, // value_bgDigit digit 1
    0,0,0,0,0,0, // value_bgDigit digit 2
    0,0,0,0,0,0,0,0,0,0, // value_bgDigit digit 3
    //digits color - 0-63
    63,63,63, //value_colorDigit digit 0
    63,63,63,63,63,63,63,63,63,63, //value_colorDigit digit 1
    63,63,63,63,63,63, //value_colorDigit digit 2
    63,63,63,63,63,63,63,63,63,63, //value_colorDigit digit 3
    
    32, //value_bgVert // Vertical info background color - 0-63
    32, //value_lineVert // Vertical info line color - 0-63
    0, //value_colorVert // Vertical info text color - 0-63
    0, //value_iconVert // Vertical icon color - 0-63
    63, //value_iconbgVert // Vertical icon background color - 0-63
    0, //value_bgHor1 // Horizontal1 info background color - 0-63
    63, //value_bgHor2 // Horizontal2 info background color - 0-63
    42, //value_lineHor1 // Horizontal1 info line color - 0-63
    42, //value_lineHor2 // Horizontal2 info line color - 0-63
    63, //value_colorHor1 // Horizontal1 info text color - 0-63
    0, //value_colorHor2 // Horizontal2 info text color - 0-63
    63, //value_iconHor1 // Horizontal icon color - 0-63
    0, //value_iconHor2 // Horizontal icon color - 0-63
    32, //value_iconbgHor1 // Horizontal icon background color - 0-63
    63, //value_iconbgHor2 // Horizontal icon background color - 0-63

  #else
    // font type for every number and digit- 0: square, 1: 9gag, 2: round
    0,0,0, // value_fontType digit 0
    0,0,0,0,0,0,0,0,0,0, // value_fontType digit 1
    0,0,0,0,0,0, // value_fontType digit 2
    0,0,0,0,0,0,0,0,0,0, // value_fontType digit 3
    // digits background color - 0-63
    63,63,63,63, // value_bgDigit digit 0
    63,63,63,63,63,63,63,63,63,63, // value_bgDigit digit 1
    63,63,63,63,63,63, // value_bgDigit digit 2
    63,63,63,63,63,63,63,63,63,63, // value_bgDigit digit 3
    //digits color - 0-63
    0,0,0, //value_colorDigit digit 0
    0,0,0,0,0,0,0,0,0,0, //value_colorDigit digit 1
    0,0,0,0,0,0, //value_colorDigit digit 2
    0,0,0,0,0,0,0,0,0,0, //value_colorDigit digit 3
    
    42, //value_bgVert // Vertical info background color - 0-63
    42, //value_lineVert // Vertical info line color - 0-63
    0, //value_colorVert // Vertical info text color - 0-63
    0, //value_iconVert // Horizontal icon color - 0-63
    63, //value_iconbgVert // Horizontal icon background color - 0-63
    63, //value_bgHor1 // Horizontal info background color - 0-63
    0, //value_bgHor2 // Horizontal2 info background color - 0-63
    63, //value_lineHor1 // Horizontal info line color - 0-63
    42, //value_lineHor2 // Horizontal2 info line color - 0-63
    0, //value_colorHor1 // Horizontal1 info text color - 0-63
    63, //value_colorHor2 // Horizontal2 info text color - 0-63
    0, //value_iconHor1 // Horizontal icon color - 0-63
    63, //value_iconHor2 // Horizontal2 icon color - 0-63
    63, //value_iconbgHor1 // Horizontal icon background color - 0-63
    42, //value_iconbgHor2 // Horizontal2 icon background color - 0-63
  #endif  
    0, //value_leadingZero // hour leading zero
    1, //value_tempMetric
    4, //value_vibrateDisconnect 0: disable, 1: short, 2: double, 3: long, 4: special
    0, //value_vibratePeriod
    0, //value_faceType //0: normal, color/digit/number; 1: color/all_digit/hour; 2: analog with all number, 3: analog with mixed line+number, 4: analog with lines
    10,23,0,6,0, //value_quietTime // quiet time enabled for vibrate, start hour minute, end hour minute
    0, // value_dateformat  // /20: timeformat('6:30 pm','6.30pm','6:30 p.m.') , %20: dateformat('1996-04-22','1996.04.22','1996/04/22','22.04.1996','22/04/1996','22-04-1996','04/22/1996')
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
};

//char value_daynames[80]="SUN,MON,TUE,WED,THU,FRI,SAT";
//char value_monthnames[120]="JAN,FEB,MAR,APR,MAY,JUN,JUL,AUG,SEP,OCT,NOV,DEC";




static void accel_tap_handler(AccelAxisType axis, int32_t direction);
static void bluetooth_callback(bool connected);
static void enable_vibrate(){
  vibrate_enabled=true;//!get_quiet_time_enabled();
}

static void redrawScreen(){
  layer_mark_dirty(s_window_layer);
}
static bool weather_enabled(){
  if(value_appConfigInt[weatherDownloadFreqIndex] == 0) return false;
  int i;
  for (i = 0 ; i < 3 ; i++) {
    switch (value_appConfigInt[positionsVIndex+i]) {
      case STATUS_V_WEATHER_C_WIN:
      case STATUS_V_WEATHER_F:
      case STATUS_V_WEATHER_WH:
      case STATUS_V_WEATHER_C_HUM:
      case STATUS_V_WEATHER_C:
        return true;
    }
    /*
    if(value_appConfigInt[positionsVIndex+i] == STATUS_V_WEATHER_C_WIN) return true;
    if(value_appConfigInt[positionsVIndex+i] == STATUS_V_WEATHER_F) return true;
    if(value_appConfigInt[positionsVIndex+i] == STATUS_V_WEATHER_WH) return true;    
    if(value_appConfigInt[positionsVIndex+i] == STATUS_V_WEATHER_C_HUM) return true;    
    if(value_appConfigInt[positionsVIndex+i] == STATUS_V_WEATHER_C) return true;    */
  //}
  //for (i = 0 ; i < 3 ; i++) {
    switch (value_appConfigInt[positionsHIndex+i]){
      case STATUS_H_WEATHER_C:
      case STATUS_H_WEATHER_F:
      case STATUS_H_WEATHER_CITY:
      case STATUS_H_WEATHER_COND:
        return true;
    }
    /*
    if(value_appConfigInt[positionsHIndex+i] == STATUS_H_WEATHER_C) return true;
    if(value_appConfigInt[positionsHIndex+i] == STATUS_H_WEATHER_F) return true;
    if(value_appConfigInt[positionsHIndex+i] == STATUS_H_WEATHER_CITY) return true;
    if(value_appConfigInt[positionsHIndex+i] == STATUS_H_WEATHER_COND) return true;*/
    
  }
  return false;
}
static bool info_enabled(){
  if(value_appConfigInt[infoDownloadFreqIndex] == 0) return false;
  int i;
  for (i = 0 ; i < 3 ; i++) {
    if(value_appConfigInt[positionsHIndex+i] == STATUS_H_INFO) return true;
  }
  return false;
}
#ifdef PBL_HEALTH
static bool health_enabled(){
  int i;
  for (i = 0 ; i < 3 ; i++) {
    switch (value_appConfigInt[positionsVIndex+i]){
      case STATUS_V_STEPS:
      case STATUS_V_HR:
      case STATUS_V_BATT_STEPS:
      case STATUS_V_BATT_HR:
      case STATUS_V_STEPS_HR:
      case STATUS_V_HR_STEPS:
        return true;
    }
    /*
    if(value_appConfigInt[positionsVIndex+i] == STATUS_V_STEPS) return true;
    if(value_appConfigInt[positionsVIndex+i] == STATUS_V_HR) return true;
    if(value_appConfigInt[positionsVIndex+i] == STATUS_V_BATT_STEPS) return true;
    if(value_appConfigInt[positionsVIndex+i] == STATUS_V_BATT_HR) return true;
    if(value_appConfigInt[positionsVIndex+i] == STATUS_V_STEPS_HR) return true;
    if(value_appConfigInt[positionsVIndex+i] == STATUS_V_HR_STEPS) return true;*/
  //}
  //for (i = 0 ; i < 3 ; i++) {
    if(value_appConfigInt[positionsHIndex+i] == STATUS_H_HEALTH) return true;
  }
  return false;
}
#endif
static int get_period(uint8_t freq){ //in secs
  return (freq <= 60)?freq*60:(freq-60)*12*60*60;
}
static char download_error(){
  //return 'd';
  time_t now = time(NULL);
  bool werr=false;
  bool ierr=false;
  if( weather_enabled() && (value_weatherLastDownload+get_period(value_appConfigInt[weatherDownloadFreqIndex])+downloadErrorTimout) <= now ) werr= true;
  if( info_enabled() && (value_infoLastDownload+get_period(value_appConfigInt[infoDownloadFreqIndex])+downloadErrorTimout) <= now ) ierr= true;
  return (werr&&ierr)?'d':((werr)?'w':((ierr)?'i':(char)0));
}

////////////////////  STORAGE FUNCTIONS  ////////////////////////////////////////////////////////////////////////////////////
static void save_ints_as_string(){
  int a=0;
  int intsize=intStorageLastIndex+1;
  char buf[intsize+1];
  for(a = 0 ; a < intsize ; a++){
    buf[a]=(char)(value_appConfigInt[a]+32);
  }
  buf[intsize]='\0';
  persist_write_string(intStorageStartIndex,buf);
}
static void save_storage(int what){
  //int a;
  persist_write_int(0,DATASTRUCTUREVERSION);
  if(what == allIndex || what == intStorageLastIndex) save_ints_as_string();
  
  // weatherIconF
  if(what == allIndex || what == weatherIconFIndex) persist_write_int(weatherIconFIndex,value_weatherIconF);
  // weatherIconC
  if(what == allIndex || what == weatherIconCIndex) persist_write_int(weatherIconCIndex,value_weatherIconC);
  // tempCurrent
  if(what == allIndex || what == tempCurrentIndex) persist_write_int(tempCurrentIndex,value_tempCurrent);
  // tempMax
  if(what == allIndex || what == tempMaxIndex) persist_write_int(tempMaxIndex,value_tempMax);
  // tempMin
  if(what == allIndex || what == tempMinIndex) persist_write_int(tempMinIndex,value_tempMin);
  // weatherWindspeed
  if(what == allIndex || what == weatherWindspeedIndex) persist_write_int(weatherWindspeedIndex,value_weatherWindspeed);
  // humCurrent
  if(what == allIndex || what == humCurrentIndex) persist_write_int(humCurrentIndex,value_humCurrent);
  
  // weatherLastDownload
  if(what == allIndex || what == weatherLastDownloadIndex) persist_write_int(weatherLastDownloadIndex,value_weatherLastDownload);
  // infoLastDownload
  if(what == allIndex || what == infoLastDownloadIndex) persist_write_int(infoLastDownloadIndex,value_infoLastDownload);
  // infoLastDownloadStart
  if(what == allIndex || what == infoLastDownloadStartIndex) persist_write_int(infoLastDownloadStartIndex,(value_infoLastDownloadStart > 0)?value_infoLastDownloadStart:time(NULL));
  // h24SentValue
  if(what == allIndex || what == h24SentValueIndex) persist_write_int(h24SentValueIndex,value_h24SentValue);
  
  // steps
  if(what == allIndex || what == stepsIndex) persist_write_int(stepsIndex,value_steps);
  // hrbpm
  if(what == allIndex || what == hrbpmIndex) persist_write_int(hrbpmIndex,value_hrbpm);
  
  ////// STRINGS //////
  // monthnames
  //if(what == allIndex || what == monthnamesIndex) persist_write_string(monthnamesIndex,value_monthnames);
  // daynames
  //if(what == allIndex || what == daynamesIndex) persist_write_string(daynamesIndex,value_daynames);
  
  // textString
  //if(what == allIndex || what == textStringIndex) persist_write_string(textStringIndex,value_textString);
    
  // weatherLocation
  //if(what == allIndex || what == weatherLocationIndex) persist_write_string(weatherLocationIndex,value_weatherLocation);
  // weatherCondition
  //if(what == allIndex || what == weatherConditionIndex) persist_write_string(weatherConditionIndex,value_weatherCondition);
  // infoString
  //if(what == allIndex || what == infoStringIndex) persist_write_string(infoStringIndex,value_infoString);
  if( what == textStringIndex || what == weatherLocationIndex || what == weatherConditionIndex || what == infoStringIndex || what == monthnamesIndex || what == daynamesIndex) 
    persist_write_string(what,bufferstring);
}
static void init_storage(bool force){
  //return;
  if(force || persist_read_int(0) < DATASTRUCTUREVERSION){
    //if(force) for(int i = 0 ; i < maxIndex ; i++) if(persist_exists(i)) persist_delete(i);
    save_storage(allIndex);
  }
}
static void load_ints_from_string(){
  int a=0;
  int intsize=intStorageLastIndex+1;
  char buf[intsize+1];
  persist_read_string(intStorageStartIndex,buf,sizeof(buf));
  for(a = 0 ; a < intsize ; a++){
    value_appConfigInt[a] = (uint8_t)(buf[a])-32;
  }
  disconnectIcon=((value_appConfigInt[vibratePeriodIndex]%15)%2)==0;
  disconnectInvert=((value_appConfigInt[vibratePeriodIndex]%15)/2)==1;
}

static void load_storage(int what){
  /*
  int a;
  
  for(a = intStorageStartIndex ; a <= intStorageLastIndex ; a++){
    if((what == allIndex || what == a) && persist_exists(a)) value_appConfigInt[a]=persist_read_int(a);
  }
  */
  if(what == allIndex || what == intStorageLastIndex) load_ints_from_string();
  // weatherIconF
  if((what == allIndex || what == weatherIconFIndex) && persist_exists(weatherIconFIndex)) value_weatherIconF=persist_read_int(weatherIconFIndex);
  // weatherIconC
  if((what == allIndex || what == weatherIconFIndex) && persist_exists(weatherIconFIndex)) value_weatherIconC=persist_read_int(weatherIconCIndex);
  // tempCurrent
  if((what == allIndex || what == tempCurrentIndex) && persist_exists(tempCurrentIndex)) value_tempCurrent=persist_read_int(tempCurrentIndex);
  // tempMax
  if((what == allIndex || what == tempMaxIndex) && persist_exists(tempMaxIndex)) value_tempMax=persist_read_int(tempMaxIndex);
  // tempMin
  if((what == allIndex || what == tempMinIndex) && persist_exists(tempMinIndex)) value_tempMin=persist_read_int(tempMinIndex);
  // weatherWindspeed
  if((what == allIndex || what == weatherWindspeedIndex) && persist_exists(weatherWindspeedIndex)) value_weatherWindspeed=persist_read_int(weatherWindspeedIndex);
  // humCurrent
  if((what == allIndex || what == humCurrentIndex) && persist_exists(humCurrentIndex)) value_humCurrent=persist_read_int(humCurrentIndex);
  
  // weatherLastDownload
  if((what == allIndex || what == weatherLastDownloadIndex) && persist_exists(weatherLastDownloadIndex)) value_weatherLastDownload=persist_read_int(weatherLastDownloadIndex);
  // infoLastDownload
  if((what == allIndex || what == infoLastDownloadIndex) && persist_exists(infoLastDownloadIndex)) value_infoLastDownload=persist_read_int(infoLastDownloadIndex);
  // infoLastDownloadStart
  if((what == allIndex || what == infoLastDownloadStartIndex) && persist_exists(infoLastDownloadStartIndex)) value_infoLastDownloadStart=persist_read_int(infoLastDownloadStartIndex);
  //h24SentValue
  if((what == allIndex || what == h24SentValueIndex) && persist_exists(h24SentValueIndex)) value_h24SentValue=persist_read_int(h24SentValueIndex);

  // steps
  if((what == allIndex || what == stepsIndex) && persist_exists(stepsIndex)) value_steps=persist_read_int(stepsIndex);
  // hrbpm
  if((what == allIndex || what == hrbpmIndex) && persist_exists(hrbpmIndex)) value_hrbpm=persist_read_int(hrbpmIndex);
  
  ////// STRINGS //////
  // monthnames
  //if((what == allIndex || what == monthnamesIndex) && persist_exists(monthnamesIndex)) persist_read_string(monthnamesIndex,value_monthnames,sizeof(value_monthnames));
  // daynames
  //if((what == allIndex || what == daynamesIndex) && persist_exists(daynamesIndex)) persist_read_string(daynamesIndex,value_daynames,sizeof(value_daynames));
  
  // textString
  //if((what == allIndex || what == textStringIndex) && persist_exists(textStringIndex)) persist_read_string(textStringIndex,value_textString,sizeof(value_textString));
    
  // weatherLocation
  //if((what == allIndex || what == weatherLocationIndex) && persist_exists(weatherLocationIndex)) persist_read_string(weatherLocationIndex,value_weatherLocation,sizeof(value_weatherLocation));
  // weatherCondition
  //if((what == allIndex || what == weatherConditionIndex) && persist_exists(weatherConditionIndex)) persist_read_string(weatherConditionIndex,value_weatherCondition,sizeof(value_weatherCondition));
  // infoString
  //if((what == allIndex || what == infoStringIndex) && persist_exists(infoStringIndex)) persist_read_string(infoStringIndex,value_infoString,sizeof(value_infoString));
  if(what == textStringIndex || what == weatherLocationIndex || what == weatherConditionIndex || what == infoStringIndex || what == monthnamesIndex || what == daynamesIndex){
    if(persist_exists(what)) persist_read_string(what,bufferstring,sizeof(bufferstring));
    else{
      switch(what){
        case weatherLocationIndex:
        case weatherConditionIndex:
          strcpy(bufferstring, DEFAULT_STRING_WEATHER);
        break;
        case textStringIndex:
        case infoStringIndex:
          strcpy(bufferstring, DEFAULT_STRING_INFO);
        break;
        case monthnamesIndex:
          strcpy(bufferstring, DEFAULT_MONTHNAMES);
        break;
        case daynamesIndex:
          strcpy(bufferstring, DEFAULT_DAYNAMES);
        break;
      }
    }
  }  
}

#ifdef PBL_HEALTH
int * health_collect() {
  #ifdef SHOW_APP_LOGS
        APP_LOG(APP_LOG_LEVEL_INFO, 
              "health_collect start");
  #endif
  int steps=0;
  int hravg=0;
  int hrmin=0;
  int hrmax=0;
  HealthMetric metric = HealthMetricStepCount;
  infoDownloadStart=time(NULL);
  load_storage(infoLastDownloadStartIndex);
  int start = value_infoLastDownloadStart;
  int end = infoDownloadStart;
  // Check the metric has data available for today
  HealthServiceAccessibilityMask mask = health_service_metric_accessible(metric,start, end);

  if(mask & HealthServiceAccessibilityMaskAvailable) {
    // Data is available!
    steps=health_service_aggregate_averaged(metric,start,end,HealthAggregationSum,HealthServiceTimeScopeOnce);
    hravg=health_service_aggregate_averaged(HealthMetricHeartRateBPM,start,end,HealthAggregationAvg,HealthServiceTimeScopeOnce);
    hrmin=health_service_aggregate_averaged(HealthMetricHeartRateBPM,start,end,HealthAggregationMin,HealthServiceTimeScopeOnce);
    hrmax=health_service_aggregate_averaged(HealthMetricHeartRateBPM,start,end,HealthAggregationMax,HealthServiceTimeScopeOnce);
    #ifdef SHOW_APP_LOGS
      APP_LOG(APP_LOG_LEVEL_INFO, "Health sum last:%d-%d, %d secs",start,end,(int)(end-start));
      APP_LOG(APP_LOG_LEVEL_INFO, "Steps sum: %d",steps);
      APP_LOG(APP_LOG_LEVEL_INFO, "Heart Rate BPM avg: %d, min: %d, max: %d",hravg,hrmin,hrmax);
    #endif
  } else {
    // No data recorded yet today
    #ifdef SHOW_APP_LOGS
    APP_LOG(APP_LOG_LEVEL_ERROR, "Data unavailable!");
    #endif
  }
  int *hd = (int *) malloc(sizeof(int) * 5);  
  if( hd != NULL ) {
    hd[0] = steps;
    hd[1] = hravg;
    hd[2] = hrmin;
    hd[3] = hrmax;
    hd[4] = start;
  }
  return hd;
}

#endif
#ifndef PBL_ROUND
static int16_t get_vertical_icon_fullsizes(bool state[3]){
  uint8_t position;
  uint8_t size;
  int16_t fullsize=0;
  for(position = 0 ; position < 3 ; position++){
    if(state[position]) size=VERTICAL_SIZES_EXTENDED[value_appConfigInt[positionsVIndex+position]];
    else size=VERTICAL_SIZES_NORMAL[value_appConfigInt[positionsVIndex+position]];
    fullsize+=size;
  }
  return fullsize;
}
static void calculate_vertical_icon_sizes(){
  uint8_t position;
  uint8_t none_count=0;
  uint8_t full_padding=VERTICAL_ICON_MIN_PADDING*2;
  bool states[8][3]={
    {true,true,true},
    {true,false,true},
    {false,true,true},
    {true,true,false},
    {true,false,false},
    {false,false,true},
    {false,true,false},
    {false,false,false}
  };
  for(position = 0 ; position < 3 ; position++){
    if(value_appConfigInt[positionsVIndex+position] == STATUS_V_NONE && none_count < 2) none_count++;
    //verticalIconsSizes[position]=true;
  }
  full_padding-=VERTICAL_ICON_MIN_PADDING*none_count;
  int16_t vertheight=get_vert_height()-((verticalIconsSizes[3])?(ICON_STATUS_MARGIN+ICON_STATUS_HEIGHT):0)-ICON_MARGIN*2;
  //for(position = 3 ; position > 0 ; position--){
   // if((get_vertical_icon_fullsizes()+full_padding) > vertheight) verticalIconsSizes[position%3]=false;
  /*for(position = 0 ; position < 3 ; position++){
    if((get_vertical_icon_fullsizes()+full_padding) > vertheight) verticalIconsSizes[position]=false;
    else return;
  }*/
  uint8_t good_position=7;
  int8_t maradek=0;
  int8_t good_maradek=100;
  for(position = 0 ; position < 8 ; position++){
    maradek=(vertheight-get_vertical_icon_fullsizes(states[position])-full_padding);
    //APP_LOG(APP_LOG_LEVEL_DEBUG, "maradek: %d, p0:%d,p1:%d,p2:%d, full_padding:%d",maradek,states[i][0],states[i][1],states[i][2],full_padding);
    if(maradek>=0 && maradek < good_maradek) {
      good_maradek=maradek;
      good_position=position;
    }
  }
  //APP_LOG(APP_LOG_LEVEL_DEBUG, "good_maradek: %d, good_i:%d, p0:%d,p1:%d,p2:%d",good_maradek,good_i,states[good_i][0],states[good_i][1],states[good_i][2]);
  for(position = 0 ; position < 3 ; position++) verticalIconsSizes[position]=states[good_position][position];
}
#endif
static void update_vertical(GContext *ctx,uint8_t position){
  char d_error=download_error();
  //uint16_t y=0;
  uint8_t status_view=value_appConfigInt[statusPositionIndex]/5;
  bool BT=btConnected;
  if(value_appConfigInt[vibrateDisconnectIndex] == 66) BT=true;
  if(!disconnectIcon) BT=true;
  verticalIconsSizes[3]=((status_view==0 && (true)) || 
                         (status_view==1 && (get_quiet_time_enabled() || d_error != (char)0 || !BT)) || 
                         (status_view==2 && (d_error != (char)0 || !BT)) || 
                         (status_view==3 && (!BT)) 
                        );
  bool needseconds=need_vertical_seconds();
  if(needseconds) verticalIconsSizes[3]=true;
  #ifdef PBL_ROUND
  verticalIconsSizes[0]=true;
  verticalIconsSizes[2]=true;
  if(verticalIconsSizes[3]) verticalIconsSizes[position]=((((value_appConfigInt[statusPositionIndex]%5)/3)*2) == position)?false:true;
  if(verticalIconsSizes[3] && !verticalIconsSizes[position]) update_status_v(ctx,d_error,BT,needseconds);
  //bool extended=((((value_appConfigInt[statusPositionIndex]%5)/3)*2) == position)?false:true;
  //if(!extended) update_status_v(ctx,d_error,btConnected);
  #else
  if(verticalIconsSizes[3]) update_status_v(ctx,d_error,BT,needseconds);
  calculate_vertical_icon_sizes();
  /*bool extended=false;
  for(position = 0 ; position < 3 ; position++){
    if (!extended) extended=(value_appConfigInt[positionsVIndex+position] == STATUS_V_NONE);
  }*/
  for(position = 0 ; position < 3 ; position++){
  #endif
    //bool extended=verticalIconsSizes[position];
    switch(value_appConfigInt[positionsVIndex+position]) {
      case STATUS_V_BATT:
        update_battery_v(ctx,position,battery,0);
        break;
      case STATUS_V_DATE_DAY_MON:
        update_date_v(ctx,position,dayname,mday,monthname,0);
        break;
      case STATUS_V_DATE_MON_DAY:
        update_date_v(ctx,position,monthname,mday,dayname,0);
        break;
      case STATUS_V_DATE_DAY:
        update_date_v(ctx,position,"",mday,dayname,0);
        break;
      case STATUS_V_DATE_MON:
        update_date_v(ctx,position,"",mday,monthname,0);
        break;
      case STATUS_V_WEEK_SUN:
      case STATUS_V_WEEK_MON:
        update_week_v(ctx,position,value_appConfigInt[positionsVIndex+position],0);
        break;
      case STATUS_V_WEATHER_C_WIN:
        update_weather_c_v(ctx,position,value_weatherIconC,value_tempCurrent,value_weatherWindspeed,200,d_error,0);
        break;
      case STATUS_V_WEATHER_C_HUM:
        update_weather_c_v(ctx,position,value_weatherIconC,value_tempCurrent,-1,value_humCurrent,d_error,0);
        break;
      case STATUS_V_WEATHER_C:
        update_weather_c_v(ctx,position,value_weatherIconC,value_tempCurrent,-1,200,d_error,0);
        break;
      case STATUS_V_WEATHER_F:
        update_weather_f_v(ctx,position,value_tempMin, value_tempMax,value_weatherIconF,d_error,0);
        break;
      case STATUS_V_WEATHER_WH:
        //update_weather_wh_v(ctx,position,value_weatherWindspeed, value_humCurrent,d_error);
        update_weather_c_v(ctx,position,value_weatherIconC,-1000,value_weatherWindspeed,value_humCurrent,d_error,0);
        break;
      #ifdef PBL_HEALTH
      case STATUS_V_BATT_STEPS:
        update_battery_v(ctx,position,battery,0);
        if(verticalIconsSizes[position]) update_steps_v(ctx,position,value_steps,VERTICAL_SIZES_NORMAL[STATUS_V_BATT]+ICON_MARGIN);
        break;
      case STATUS_V_BATT_HR:
        update_battery_v(ctx,position,battery,0);
        if(verticalIconsSizes[position]) update_hr_v(ctx,position,value_hrbpm,VERTICAL_SIZES_NORMAL[STATUS_V_BATT]+ICON_MARGIN);
        break;
      case STATUS_V_STEPS_HR:
        update_steps_v(ctx,position,value_steps,0);
        if(verticalIconsSizes[position]) update_hr_v(ctx,position,value_hrbpm,VERTICAL_SIZES_NORMAL[STATUS_V_STEPS]+ICON_MARGIN);
        break;
      case STATUS_V_HR_STEPS:
        update_hr_v(ctx,position,value_hrbpm,0);
        if(verticalIconsSizes[position]) update_steps_v(ctx,position,value_steps,VERTICAL_SIZES_NORMAL[STATUS_V_HR]+ICON_MARGIN);
        break;
      case STATUS_V_STEPS:
        update_steps_v(ctx,position,value_steps,0);
        break;
      case STATUS_V_HR:
        update_hr_v(ctx,position,value_hrbpm,0);
        break;
      #endif
      default:
        //update_none
        break;
  
    }
  #ifndef PBL_ROUND    
  }
  #endif
  drawing_v_seconds=false;
}


static void update_horizontal(GContext *ctx,uint32_t position){
  char d_error=download_error();
  uint8_t posIndex=0;
  if(position > 0) posIndex=1;
  switch(value_appConfigInt[positionsHIndex+position]) {
    case STATUS_H_DATE:
      update_date_h(ctx,posIndex,dayname,mday,monthname);
      break;
    case STATUS_H_DATE_FULL:
    case STATUS_H_TIME:
    case STATUS_H_TIME_SEC:
    case STATUS_H_DATETIME:
      update_date_txt_h(ctx,posIndex,value_appConfigInt[positionsHIndex+position],dayname,need_horizontal_seconds());
      break;
    case STATUS_H_INFO:
      load_storage(infoStringIndex);
      update_string_h(ctx,posIndex,bufferstring,d_error,0,GTextAlignmentCenter);
      break;
    case STATUS_H_TEXT:
      load_storage(textStringIndex);
      update_string_h(ctx,posIndex,bufferstring,(char)0,0,GTextAlignmentCenter);
      break;
    case STATUS_H_WEATHER_C:
      update_weather_c_h(ctx,posIndex,value_tempCurrent,value_weatherWindspeed,value_weatherIconC,value_humCurrent,d_error);
      break;
    case STATUS_H_WEATHER_F:
      update_weather_f_h(ctx,posIndex,value_tempMin, value_tempMax,value_weatherIconF,d_error);
      break;
    case STATUS_H_WEATHER_CITY:
      load_storage(weatherLocationIndex);
      update_string_h(ctx,posIndex,bufferstring,(d_error == 'w')?'d':d_error,0,GTextAlignmentCenter);
      break;
    case STATUS_H_WEATHER_COND:
      load_storage(weatherConditionIndex);
      update_string_h(ctx,posIndex,bufferstring,(d_error == 'w')?'d':d_error,0,GTextAlignmentCenter);
      break;
    #ifdef HOLIDAY
    case STATUS_H_HOLIDAYS_CHR:
      //update_string_h(ctx,posIndex,holidayText,(char)0,0,GTextAlignmentCenter);
      setHolidayText(ctx,1,posIndex);
      break;
    #endif
    #ifdef PBL_HEALTH
    case STATUS_H_HEALTH:
      update_health_h(ctx,posIndex, value_steps, value_hrbpm);
      break;
    #endif
    default:
    //update_none
    break;
  }
  drawing_h_seconds=false;
}


////////////////////////////  UPDATE PROC FUNCTIONS   //////////////////////////////////////////////////////////////////////////////////////

static void update_proc_root(Layer *layer, GContext *ctx){
  if(drawing_v_seconds || drawing_h_seconds) return;
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "root layer dirty");
	#endif 
  #ifdef PBL_ROUND
    // bal 2 pixel színezés
    draw_rect(ctx,intToColor(value_appConfigInt[bgVertIndex]),GColorWhite,(uint8_t[4]){0,0,0,0},GRect(0,0,PBL_DISPLAY_OFFSET_X,PBL_DISPLAY_HEIGHT));
    // jobb 2 pixel színezés
    draw_rect(ctx,intToColor(value_appConfigInt[bgVertIndex]),GColorWhite,(uint8_t[4]){0,0,0,0},GRect(PBL_DISPLAY_WIDTH-PBL_DISPLAY_OFFSET_X,0,PBL_DISPLAY_OFFSET_X,PBL_DISPLAY_HEIGHT));
    //ha felül van a hor layer
    if(value_appConfigInt[horPosIndex] == 1){
      // bal felső digit melletti rész
      draw_rect(ctx,intToColor(value_appConfigInt[get_digit_index(bgDigitIndex,0,digitValues[0])]),GColorWhite,(uint8_t[4]){0,0,0,0},
                GRect(get_vert_width()/2+PBL_DISPLAY_OFFSET_X,PBL_DISPLAY_HEIGHT-PBL_DISPLAY_OFFSET_Y-DIGITHFULL*2,get_vert_width()/2,DIGITHFULL));
      // bal alsó digit alatti, melletti és mögötti rész
      draw_rect(ctx,intToColor(value_appConfigInt[get_digit_index(bgDigitIndex,2,digitValues[2])]),GColorWhite,(uint8_t[4]){0,0,0,0},
                GRect(get_vert_width()/2+PBL_DISPLAY_OFFSET_X,PBL_DISPLAY_HEIGHT-PBL_DISPLAY_OFFSET_Y-DIGITHFULL,DIGITWFULL+get_vert_width()/2,PBL_DISPLAY_OFFSET_Y+DIGITHFULL));
      // jobb felső melletti rész
      draw_rect(ctx,intToColor(value_appConfigInt[get_digit_index(bgDigitIndex,1,digitValues[1])]),GColorWhite,(uint8_t[4]){0,0,0,0},
                GRect(get_vert_width()+PBL_DISPLAY_OFFSET_X+DIGITWFULL*2,PBL_DISPLAY_HEIGHT-PBL_DISPLAY_OFFSET_Y-DIGITHFULL*2,get_vert_width()/2,DIGITHFULL));
      // jobb alsó digit alatti, melletti és mögötti rész
      draw_rect(ctx,intToColor(value_appConfigInt[get_digit_index(bgDigitIndex,3,digitValues[3])]),GColorWhite,(uint8_t[4]){0,0,0,0},
                GRect(get_vert_width()+PBL_DISPLAY_OFFSET_X+DIGITWFULL,PBL_DISPLAY_HEIGHT-PBL_DISPLAY_OFFSET_Y-DIGITHFULL,DIGITWFULL+get_vert_width()/2,PBL_DISPLAY_OFFSET_Y+DIGITHFULL));
    }
    // ha alul van a hor layer
    if(value_appConfigInt[horPosIndex] == 2){
      // bal felső digit feletti, mögötti és melletti rész
      draw_rect(ctx,intToColor(value_appConfigInt[get_digit_index(bgDigitIndex,0,digitValues[0])]),GColorWhite,(uint8_t[4]){0,0,0,0},
                GRect(get_vert_width()/2+PBL_DISPLAY_OFFSET_X,0,get_vert_width()/2+DIGITWFULL,PBL_DISPLAY_OFFSET_Y+DIGITHFULL));
      // bal alsó digit melletti rész
      draw_rect(ctx,intToColor(value_appConfigInt[get_digit_index(bgDigitIndex,2,digitValues[2])]),GColorWhite,(uint8_t[4]){0,0,0,0},
                GRect(get_vert_width()/2+PBL_DISPLAY_OFFSET_X,PBL_DISPLAY_OFFSET_Y+DIGITHFULL,get_vert_width()/2,DIGITHFULL));
      // jobb felső feletti, mögötti és melletti rész
      draw_rect(ctx,intToColor(value_appConfigInt[get_digit_index(bgDigitIndex,1,digitValues[1])]),GColorWhite,(uint8_t[4]){0,0,0,0},
                GRect(get_vert_width()+PBL_DISPLAY_OFFSET_X+DIGITWFULL,0,DIGITWFULL+get_vert_width()/2,PBL_DISPLAY_OFFSET_Y+DIGITHFULL));
      // jobb alsó digit melletti rész
      draw_rect(ctx,intToColor(value_appConfigInt[get_digit_index(bgDigitIndex,3,digitValues[3])]),GColorWhite,(uint8_t[4]){0,0,0,0},
                GRect(get_vert_width()+PBL_DISPLAY_OFFSET_X+DIGITWFULL*2,PBL_DISPLAY_OFFSET_Y+DIGITHFULL,get_vert_width()/2,DIGITHFULL));
    }
  #endif
}
static void update_proc_timea(Layer *layer, GContext *ctx) {
  if(drawing_v_seconds || drawing_h_seconds) return;
  time_t now = time(NULL);
  struct tm *tick = localtime(&now);
  uint8_t digit=tick->tm_hour;
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "time layer analog dirty");
	#endif 
  graphics_context_set_compositing_mode(ctx, GCompOpSet);
  uint8_t colorBG=value_appConfigInt[get_digit_index(bgDigitIndex,0,digit)];
  uint8_t colorFACE=value_appConfigInt[get_digit_index(colorDigitIndex,0,digit)];
  uint8_t colorHOUR=value_appConfigInt[get_digit_index(fontMinuteIndex,0,digit)];
  uint8_t colorMIN=value_appConfigInt[get_digit_index(fontTypeIndex,0,digit)];
  int x;
  int y;
  int imageresource=RESOURCE_ID_IMAGE_ANALOG_NUMBER;
  if(value_appConfigInt[faceTypeIndex] == 3) imageresource=RESOURCE_ID_IMAGE_ANALOG_PARTLINE;
  if(value_appConfigInt[faceTypeIndex] == 4) imageresource=RESOURCE_ID_IMAGE_ANALOG_FULLLINE;
  draw_bitmap(ctx, imageresource, GRect(0,0,DIGITWFULL*2,DIGITHFULL*2), colorFACE,colorBG);
  x=DIGITWFULL;
  y=DIGITHFULL;
  uint8_t upperoffset=30;
  uint8_t bottomoffset=96;
  if(value_appConfigInt[fontTypeIndex+24] > 0 ){
    char buftime[12]; 
    /*uint8_t h=tick->tm_hour;
    uint8_t m=tick->tm_min;
    uint8_t timeformat=value_appConfigInt[dateformatIndex]/20;
    char bufampm[]=" a.m.";
    if(!clock_is_24h_style()) if(h >=13) {
      h=(h>=13)?(h-12):((h<1)?h+12:h);
      switch(timeformat){
        case 0:
          snprintf(bufampm, sizeof(bufampm), " pm");
          break;
        case 1:
          snprintf(bufampm, sizeof(bufampm), "pm");
          break;
        case 2:
          snprintf(bufampm, sizeof(bufampm), " p.m.");
          break;
        default:
          bufampm[0]='\0';
          break;
      }
    }
    else{
      h=(h>=13)?(h-12):((h<1)?h+12:h);
      switch(timeformat){
        case 0:
          snprintf(bufampm, sizeof(bufampm), " am");
          break;
        case 1:
          snprintf(bufampm, sizeof(bufampm), "am");
          break;
        case 2:
          snprintf(bufampm, sizeof(bufampm), " a.m.");
          break;
        default:
          bufampm[0]='\0';
          break;
      }
    }
    else bufampm[0]='\0';
    switch(timeformat){
      case 1:
        snprintf(buftime, sizeof(buftime), "%d.%02d%s", h,m,bufampm );
        break;
      default:
        snprintf(buftime, sizeof(buftime), "%d:%02d%s", h,m,bufampm);
        break;
    }
    */
    if(format_time(buftime,sizeof(buftime),false)) 
    write_text2(ctx, buftime, 0, "", 0,GSize(0,0),GRect(0,
                                                        (value_appConfigInt[fontTypeIndex+24] == 1)?upperoffset:bottomoffset,
                                                        DIGITWFULL*2,
                                                        30),
                GTextAlignmentCenter,colorFACE);
  }
  if(value_appConfigInt[fontTypeIndex+25] > 0 ){
    char bufdate[14]; 
    uint8_t mday=tick->tm_mday;
    snprintf(bufdate, sizeof(bufdate), "%s %d",(value_appConfigInt[fontTypeIndex+25]<3)?monthname:dayname,mday);
    write_text2(ctx, bufdate, 0, "", 0,GSize(0,0),GRect(0,
                                                        ((value_appConfigInt[fontTypeIndex+25]%2) == 1)?upperoffset:bottomoffset,
                                                        DIGITWFULL*2,
                                                        30),
                GTextAlignmentCenter,colorFACE);
  }
  GPoint center=GPoint(x,y);
  int32_t angle;

  GPath *s_minute_arrow = gpath_create(&MINUTE_HAND_POINTS);
  GPath *s_hour_arrow = gpath_create(&HOUR_HAND_POINTS);
  gpath_move_to(s_minute_arrow, center);
  gpath_move_to(s_hour_arrow, center);
  
  graphics_context_set_fill_color(ctx, intToColor(colorHOUR));
  //graphics_context_set_stroke_color(ctx, GColorClear);
  graphics_context_set_stroke_color(ctx, intToColor(colorBG));
  angle = (TRIG_MAX_ANGLE * (((tick->tm_hour % 12) * 6) + (tick->tm_min / 10))) / (12 * 6);
  //angle = (TRIG_MAX_ANGLE * (((12 % 12) * 6) + (tick->tm_min / 10))) / (12 * 6);
  gpath_rotate_to(s_hour_arrow, angle);
  gpath_draw_filled(ctx, s_hour_arrow);
  gpath_draw_outline(ctx, s_hour_arrow);
  
  graphics_context_set_fill_color(ctx, intToColor(colorMIN));
  graphics_context_set_stroke_color(ctx, intToColor(colorBG));
  angle = TRIG_MAX_ANGLE * tick->tm_min / 60;
  gpath_rotate_to(s_minute_arrow, angle);
  gpath_draw_filled(ctx, s_minute_arrow);
  gpath_draw_outline(ctx, s_minute_arrow);
  
  gpath_destroy(s_minute_arrow);
  gpath_destroy(s_hour_arrow);
  
  graphics_context_set_fill_color(ctx, intToColor(colorBG));
  graphics_fill_rect(ctx, GRect(center.x - 1, center.y - 1, 3, 3), 1, GCornersAll);
  
}
static void update_proc_time(Layer *layer, GContext *ctx,uint8_t digit) {
  if(drawing_v_seconds || drawing_h_seconds) return;
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "time layer(%d) dirty",digit);
	#endif 
  graphics_context_set_compositing_mode(ctx, GCompOpSet);
  int color=value_appConfigInt[get_digit_index(bgDigitIndex,digit,digitValues[digit])];
  #ifdef SHOW_APP_LOGS
    APP_LOG(APP_LOG_LEVEL_DEBUG, "time layer(%d) draw bg start, color: %d",digit,color);
  #endif 
  draw_rect(ctx,intToColor(color),GColorWhite,(uint8_t[4]){0,0,0,0},GRect(0,0,DIGITWFULL,DIGITHFULL));
  #ifdef SHOW_APP_LOGS
    APP_LOG(APP_LOG_LEVEL_DEBUG, "time layer(%d) draw bg finished",digit);
  #endif 
  if(!(digit == 0 && digitValues[digit] == 3)) {
    #ifdef SHOW_APP_LOGS
  	  APP_LOG(APP_LOG_LEVEL_DEBUG, "time layer(%d) draw digit start",digit);
  	#endif 
    uint8_t margin=DIGITWMARGIN*(((digit+1)%2)+1);
    int8_t checkcolordigitoffset=(digit%2)?-1:1;
    if(value_appConfigInt[get_digit_index(bgDigitIndex,digit+checkcolordigitoffset,digitValues[digit+checkcolordigitoffset])] != value_appConfigInt[get_digit_index(bgDigitIndex,digit,digitValues[digit])]) {
      margin=DIGITHMARGIN;
    }
    draw_bitmap(ctx, 
              IMAGE_DIGITS[value_appConfigInt[get_digit_index(fontTypeIndex,digit,digitValues[digit])]][digitValues[digit]], 
              GRect(margin,DIGITHMARGIN,DIGITW,DIGITH), 
              value_appConfigInt[get_digit_index(colorDigitIndex,digit,digitValues[digit])], 
              value_appConfigInt[get_digit_index(colorDigitIndex,digit,digitValues[digit])]
             );
    #ifdef SHOW_APP_LOGS
  	  APP_LOG(APP_LOG_LEVEL_DEBUG, "time layer(%d) draw digit finished",digit);
  	#endif 
    
  }
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "time layer(%d) dirty finished",digit);
	#endif 
  
}
static void update_proc_time0(Layer *layer, GContext *ctx) {
  update_proc_time(layer, ctx,0) ;
}
static void update_proc_time1(Layer *layer, GContext *ctx) {
  update_proc_time(layer, ctx,1) ;
}
static void update_proc_time2(Layer *layer, GContext *ctx) {
  update_proc_time(layer, ctx,2) ;
}
static void update_proc_time3(Layer *layer, GContext *ctx) {
  update_proc_time(layer, ctx,3) ;
}
static void update_proc_vert(Layer *layer, GContext *ctx){
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "vert layer dirty");
	#endif 
  graphics_context_set_compositing_mode(ctx, GCompOpSet);
  #ifdef PBL_ROUND
  draw_rect_round(ctx,intToColor(value_appConfigInt[bgVertIndex]),intToColor(value_appConfigInt[lineVertIndex]), GPoint(get_vert_width()-ROUND_VERTICAL_RADIUS-1,get_vert_height()/2), ROUND_VERTICAL_RADIUS);
  #else
  draw_rect(ctx, intToColor(value_appConfigInt[bgVertIndex]),intToColor(value_appConfigInt[lineVertIndex]),
            (uint8_t[4]){0,(value_appConfigInt[vertPosIndex] == 2)?0:BORDERSIZE,0,(value_appConfigInt[vertPosIndex] == 1)?0:BORDERSIZE},GRect(0,0,get_vert_width(),get_vert_height()));
  #endif
  update_vertical(ctx,0);
}
#ifdef PBL_ROUND
static void update_proc_vert2(Layer *layer, GContext *ctx){
  if(drawing_h_seconds || drawing_v_seconds) return;
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "vert2 layer dirty");
	#endif 
  graphics_context_set_compositing_mode(ctx, GCompOpSet);
  draw_rect_round(ctx,intToColor(value_appConfigInt[bgVertIndex]),intToColor(value_appConfigInt[lineVertIndex]), GPoint(ROUND_VERTICAL_RADIUS,get_vert_height()/2), ROUND_VERTICAL_RADIUS);
  update_vertical(ctx,2);
}
#endif
static void update_proc_hor(GContext *ctx, uint8_t position){
  //if(!drawing_v_seconds && !drawing_h_seconds) return;
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "hor layer dirty");
	#endif 
  uint8_t posIndex=0;
  if(position > 0) posIndex=1;
  graphics_context_set_compositing_mode(ctx, GCompOpSet);
  #ifdef PBL_ROUND
  draw_rect(ctx, intToColor(value_appConfigInt[bgHorIndex+posIndex]),intToColor(value_appConfigInt[lineHorIndex+posIndex]),
            (uint8_t[4]){(value_appConfigInt[horPosIndex]==1)?0:BORDERSIZE,0,(value_appConfigInt[horPosIndex]==2)?0:BORDERSIZE,0},GRect(0,0,get_hor_width_full(),get_hor_height_full()));
  #else
  draw_rect(ctx, intToColor(value_appConfigInt[bgHorIndex+posIndex]),intToColor(value_appConfigInt[lineHorIndex+posIndex]),
            (uint8_t[4]){(value_appConfigInt[horPosIndex]==1)?0:BORDERSIZE,0,(value_appConfigInt[horPosIndex]==2)?0:BORDERSIZE,0},GRect(0,0,get_hor_width(),get_hor_height()));
  #endif
  update_horizontal(ctx,position);
}
static void update_proc_hor1(Layer *layer, GContext *ctx){
  update_proc_hor(ctx,0);
}
static void update_proc_hor2(Layer *layer, GContext *ctx){
  update_proc_hor(ctx,1);
}
static void update_proc_hor3(Layer *layer, GContext *ctx){
  update_proc_hor(ctx,2);
}

////////////////////////////  CREATE LAYERS FUNCTIONS   //////////////////////////////////////////////////////////////////////////////////////

static GRect get_analog_bound(){
  uint8_t offset_x=PBL_DISPLAY_OFFSET_X;
  uint8_t offset_y=PBL_DISPLAY_OFFSET_Y;
  if(value_appConfigInt[vertPosIndex] == 1) offset_x+=get_vert_width();
  if(value_appConfigInt[horPosIndex] == 1) offset_y+=get_hor_height();
  return GRect(offset_x,offset_y,DIGITWFULL*2,DIGITHFULL*2);
}
static GRect get_digit_bound(uint8_t digit){
  uint8_t offset_x=PBL_DISPLAY_OFFSET_X;
  uint8_t offset_y=PBL_DISPLAY_OFFSET_Y;
  #ifdef PBL_ROUND
  offset_x+=get_vert_width();
  #else
  if(value_appConfigInt[vertPosIndex] == 1) offset_x+=get_vert_width();
  #endif
  offset_x += DIGITWFULL*(digit%2);
  if(value_appConfigInt[horPosIndex] == 1) offset_y+=get_hor_height();
  offset_y += DIGITHFULL*(digit/2);
  return GRect(offset_x,offset_y,DIGITWFULL,DIGITHFULL);
}
static void create_time_layers(){
  Layer *window_layer = window_get_root_layer(s_main_window);
  if(value_appConfigInt[faceTypeIndex] < 2) {
    for (uint8_t i = 0 ; i < 4 ; i++) {
      s_time_layer[i] = layer_create(get_digit_bound(i));
      layer_add_child(window_layer, s_time_layer[i]);
    }
    layer_set_update_proc(s_time_layer[0], update_proc_time0);
    layer_set_update_proc(s_time_layer[1], update_proc_time1);
    layer_set_update_proc(s_time_layer[2], update_proc_time2);
    layer_set_update_proc(s_time_layer[3], update_proc_time3);
  }
  else{
    s_time_layer[0] = layer_create(get_analog_bound());
    layer_add_child(window_layer, s_time_layer[0]);
    layer_set_update_proc(s_time_layer[0], update_proc_timea);
  }
}
static GRect get_vert_bound(){
  uint8_t offset_x=PBL_DISPLAY_OFFSET_X;
  uint8_t offset_y=PBL_DISPLAY_OFFSET_Y*0;
  if(value_appConfigInt[vertPosIndex] == 2) offset_x+=DIGITWFULL*2;
  return GRect(offset_x,offset_y,get_vert_width(),get_vert_height());
}
static void create_vert_layer(){
  Layer *window_layer = window_get_root_layer(s_main_window);
  s_vert_layer = layer_create(get_vert_bound());
  layer_set_update_proc(s_vert_layer, update_proc_vert);
  layer_add_child(window_layer, s_vert_layer);
}
#ifdef PBL_ROUND
static void create_vert_layer2(){
  Layer *window_layer = window_get_root_layer(s_main_window);
  GRect bound=get_vert_bound();
  bound.origin.x+=get_vert_width()+DIGITWFULL*2;
  s_vert_layer2 = layer_create(bound);
  layer_set_update_proc(s_vert_layer2, update_proc_vert2);
  layer_add_child(window_layer, s_vert_layer2);
}
static GRect get_hor_bound(){
  uint8_t offset_x=get_vert_width()/2+PBL_DISPLAY_OFFSET_X;
  uint8_t offset_y=0;
  if(value_appConfigInt[horPosIndex] == 2) offset_y+=PBL_DISPLAY_OFFSET_Y+DIGITHFULL*2;
  return GRect(offset_x,offset_y,get_hor_width_full(),get_hor_height_full());
}
#else
static GRect get_hor_bound(){
  uint8_t offset_x=PBL_DISPLAY_OFFSET_X;
  uint8_t offset_y=PBL_DISPLAY_OFFSET_Y;
  if(value_appConfigInt[vertPosIndex] == 1) offset_x+=get_vert_width();
  if(value_appConfigInt[horPosIndex] == 2) offset_y+=DIGITHFULL*2;
  return GRect(offset_x,offset_y,get_hor_width(),get_hor_height());
}
#endif
static void create_hor_layer(){
  Layer *window_layer = window_get_root_layer(s_main_window);
  s_hor_layer[0] = layer_create(get_hor_bound());
  layer_set_update_proc(s_hor_layer[0], update_proc_hor1);
  layer_add_child(window_layer, s_hor_layer[0]);
}
static void create_hor_layer2(uint8_t num){
  GRect bound=get_hor_bound();
  bound.origin.y=bound.size.h*((value_appConfigInt[horPosIndex]==1)?-1:1);
  bound.origin.x=0;
  s_hor_layer[num] = layer_create(bound);
  layer_set_update_proc(s_hor_layer[num], (num==1)?update_proc_hor2:update_proc_hor3);
  layer_add_child(s_hor_layer[0], s_hor_layer[num]);
}

static void destroy_layers(){
  uint8_t i;
  for (i = 0 ; i < 4 ; i++) layer_destroy(s_time_layer[i]);
  layer_destroy(s_vert_layer);
  #ifdef PBL_ROUND
    layer_destroy(s_vert_layer2);
  #endif
  for (i = 0 ; i < 3 ; i++) layer_destroy(s_hor_layer[i]);
}
static void create_layers(){
  create_time_layers();
  create_hor_layer();
  create_vert_layer();
  #ifdef PBL_ROUND
    create_vert_layer2();
  #endif
  bool needaccel=false;
  if(value_appConfigInt[positionsHIndex+1]!=STATUS_H_NONE) {
    needaccel=true;
    create_hor_layer2(1);
    if(value_appConfigInt[positionsHIndex+2]!=STATUS_H_NONE) create_hor_layer2(2);
  }
  if((value_appConfigInt[positionsHIndex+4]/15)>1) needaccel=true;
  if(needaccel) accel_tap_service_subscribe(accel_tap_handler);
}

static void resize_layers(){
  destroy_layers();
  create_layers();
}



///////////////////////////  DOWNLOAD FUNCTIONS    /////////////////////////////////////////////////////////////////////////////////
static void messaging_requestData(uint8_t type) {
  // just send an empty message for now
  #ifdef SHOW_APP_LOGS
    APP_LOG(APP_LOG_LEVEL_DEBUG, "messaging_requestData type:%d",type);
  #endif
  DictionaryIterator * out_iter;

  
  // Prepare the outbox buffer for this message
  AppMessageResult result = app_message_outbox_begin(&out_iter);
  if(result == APP_MSG_OK) {
    // Add an item to ask for weather data
    dict_write_uint8(out_iter, MESSAGE_KEY_TYPE, type);
    dict_write_uint8(out_iter, MESSAGE_KEY_BATTERY, battery.charge_percent);
    #ifdef PBL_HEALTH
    if(health_enabled()){
      int *hd;
      hd=health_collect();
      if(hd != NULL){
        dict_write_uint32(out_iter, MESSAGE_KEY_STEPS, hd[0]);
        dict_write_uint8(out_iter, MESSAGE_KEY_HRBPM, hd[1]);
        dict_write_uint8(out_iter, MESSAGE_KEY_HRBPM_MIN, hd[2]);
        dict_write_uint8(out_iter, MESSAGE_KEY_HRBPM_MAX, hd[3]);
        dict_write_uint32(out_iter, MESSAGE_KEY_HEALTH_LASTDATA, hd[4]);
      }
    }
    #endif
    dict_write_uint8(out_iter, MESSAGE_KEY_H24, clock_is_24h_style()*1);
    dict_write_uint8(out_iter, MESSAGE_KEY_CONFIG_VERSION_MAJOR, CONFIG_VERSION_MAJOR);
    dict_write_uint8(out_iter, MESSAGE_KEY_CONFIG_VERSION_MINOR, CONFIG_VERSION_MINOR);
    dict_write_uint8(out_iter, 40, CONFIG_VERSION_MAJOR);
    dict_write_uint8(out_iter, 41, CONFIG_VERSION_MINOR);
    // Send this message
    result = app_message_outbox_send();
    #ifdef SHOW_APP_LOGS
    if(result != APP_MSG_OK) {
      APP_LOG(APP_LOG_LEVEL_ERROR, "Error sending the outbox: %d", (int)result);
    }
    #endif
  } 
  #ifdef SHOW_APP_LOGS
  else {
    // The outbox cannot be used right now
    APP_LOG(APP_LOG_LEVEL_ERROR, "Error preparing the outbox: %d", (int)result);
  }
  #endif
}

static uint32_t get_data_downloaded_time(uint8_t freq){
  time_t now = time(NULL);
  uint32_t period=get_period(freq);
  uint32_t newtime=now;
  if(freq <= 60) newtime=((now)/period)*period;
  else{
    struct tm *tick = localtime(&now);
    int offsethour=0;
    if(tick->tm_hour >= eveningHour) offsethour+=tick->tm_hour - eveningHour;
    if(tick->tm_hour < morningHour) offsethour+=tick->tm_hour+(24-eveningHour);
    if(freq == 62) offsethour+=12;
    if(tick->tm_hour >= morningHour && tick->tm_hour < eveningHour) offsethour+=tick->tm_hour-morningHour;
    newtime=now-(offsethour*60*60+tick->tm_min*60+tick->tm_sec);
  }
  return newtime;
}
static void set_weather_downloaded(){
  value_weatherLastDownload=get_data_downloaded_time(value_appConfigInt[weatherDownloadFreqIndex]);
  save_storage(weatherLastDownloadIndex);
  
  
  #ifdef SHOW_APP_LOGS
  struct tm *d = localtime(&value_weatherLastDownload);
    APP_LOG(APP_LOG_LEVEL_INFO, "value_weatherLastDownload %d, %d-%d-%d %d:%d:%d",(int)value_weatherLastDownload,(int)d->tm_year+1900,(int)d->tm_mon+1,(int)d->tm_mday,(int)d->tm_hour,(int)d->tm_min,(int)d->tm_sec);
  #endif
  
}
static void set_info_downloaded(){
  value_infoLastDownload=get_data_downloaded_time(value_appConfigInt[infoDownloadFreqIndex]);
  save_storage(infoLastDownloadIndex);
  value_infoLastDownloadStart=infoDownloadStart;
  save_storage(infoLastDownloadStartIndex);
  #ifdef SHOW_APP_LOGS
  struct tm *d = localtime(&value_infoLastDownload);
  APP_LOG(APP_LOG_LEVEL_INFO, "value_infoLastDownload %d, %d-%d-%d %d:%d:%d",(int)value_weatherLastDownload,(int)d->tm_year+1900,(int)d->tm_mon+1,(int)d->tm_mday,(int)d->tm_hour,(int)d->tm_min,(int)d->tm_sec);
  #endif
}

static void inbox_received_callback(DictionaryIterator *iterator, void *context) {
  uint8_t reload=0;
  char *bufferstring2;
  Tuple *tuple0 = dict_find(iterator, 0);
  /*Tuple *tuple1 = dict_find(iterator, 1);
  Tuple *tuple2 = dict_find(iterator, 2);
  Tuple *tuple3 = dict_find(iterator, 3);
  Tuple *tuple4 = dict_find(iterator, 4);
  Tuple *tuple5 = dict_find(iterator, 5);
  Tuple *tuple6 = dict_find(iterator, 6);
  Tuple *tuple7 = dict_find(iterator, 7);
  Tuple *tuple8 = dict_find(iterator, 8);*/
  Tuple *tuple100 = dict_find(iterator, 100);
  Tuple *tuple200 = dict_find(iterator, 200);
  /*Tuple *tuple201 = dict_find(iterator, 201);
  Tuple *tuple202 = dict_find(iterator, 202);
  Tuple *tuple203 = dict_find(iterator, 203);*/
  Tuple *tuple300 = dict_find(iterator, 300);
  //int type=(int)type_tuple->value->int32;
  int i;
  
  if(tuple0){
    value_tempCurrent=(int)tuple0->value->int32;
    save_storage(tempCurrentIndex);
    
    if((tuple0=dict_find(iterator, 1))){
      value_tempMin=(int)tuple0->value->int32;
      save_storage(tempMinIndex);
    }
    if((tuple0=dict_find(iterator, 2))){
      value_tempMax=(int)tuple0->value->int32;
      save_storage(tempMaxIndex);
    }
    if((tuple0=dict_find(iterator, 3))){
      value_weatherIconC=(int)tuple0->value->int32;
      save_storage(weatherIconCIndex);
    }
    if((tuple0=dict_find(iterator, 4))){    
      value_weatherIconF=(int)tuple0->value->int32;
      save_storage(weatherIconFIndex);
    }
    if((tuple0=dict_find(iterator, 5))){
      value_weatherWindspeed=(int)tuple0->value->int32;
      save_storage(weatherWindspeedIndex);
    }
    if((tuple0=dict_find(iterator, 6))){
      value_humCurrent=(int)tuple0->value->int32;
      save_storage(humCurrentIndex);
    }
    if((tuple0=dict_find(iterator, 7))){
      bufferstring2 = tuple0->value->cstring;
      snprintf(bufferstring, sizeof(bufferstring),"%s", bufferstring2); 
      save_storage(weatherLocationIndex);
    }
    if((tuple0=dict_find(iterator, 8))){
      bufferstring2 = tuple0->value->cstring;
      snprintf(bufferstring, sizeof(bufferstring),"%s", bufferstring2); 
      save_storage(weatherConditionIndex);
    }
    if(!reload) reload=1;
    set_weather_downloaded();
  }
  
  if(tuple100){
    bufferstring2 = tuple100->value->cstring;
    snprintf(bufferstring, sizeof(bufferstring),"%s", bufferstring2); 
    save_storage(infoStringIndex);

    if(!reload) reload=1;
    set_info_downloaded();
  }
  if(tuple200){
    time_t now = time(NULL);
    struct tm *tick = localtime(&now);
    bufferstring2 = tuple200->value->cstring;
    int ln=strlen(bufferstring2);
    for(i = 0 ; i < ln ; i++) if((i+intStorageStartIndex) <=  intStorageLastIndex) {
      //value_appConfigInt[i+intStorageStartIndex] = ((uint8_t)bufferstring2[i])-48;
      if ((uint8_t)bufferstring2[i] >= 97) value_appConfigInt[i+intStorageStartIndex] = ((uint8_t)bufferstring2[i])-40-4-5;
      else if ((uint8_t)bufferstring2[i] >= 64) value_appConfigInt[i+intStorageStartIndex] = ((uint8_t)bufferstring2[i])-40-4;
      else if ((uint8_t)bufferstring2[i] >= 40) value_appConfigInt[i+intStorageStartIndex] = ((uint8_t)bufferstring2[i])-40;
      else value_appConfigInt[i+intStorageStartIndex] =0;
    }
    if((tuple200=dict_find(iterator, 201))){
      bufferstring2 = tuple200->value->cstring;
      snprintf(bufferstring, sizeof(bufferstring),"%s", bufferstring2); 
      save_storage(textStringIndex);
    }
    if((tuple200=dict_find(iterator, 202))){
      bufferstring2 = tuple200->value->cstring;
      snprintf(bufferstring, sizeof(bufferstring),"%s", bufferstring2); 
      set_monthname(tick->tm_mon,bufferstring, monthname);
      save_storage(monthnamesIndex);
    }
    if((tuple200=dict_find(iterator, 203))){
      bufferstring2 = tuple200->value->cstring;
      snprintf(bufferstring, sizeof(bufferstring),"%s", bufferstring2); 
      set_dayname(tick->tm_wday,bufferstring,dayname);
      save_storage(daynamesIndex);
    }
    save_storage(allIndex);
    reload=2;
  }
  if(tuple300){
    messaging_requestData(PKIT_INIT);
  }
  if(reload == 2) {
    resize_layers();
    //reload=1;
  }
  if(reload == 1) redrawScreen(); 
  
}
#ifdef SHOW_APP_LOGS
static void outbox_failed_callback(DictionaryIterator *iterator, AppMessageResult reason, void *context) {
  #ifdef SHOW_APP_LOGS
  APP_LOG(APP_LOG_LEVEL_ERROR, "Outbox send failed! %d %d %d", reason, APP_MSG_SEND_TIMEOUT, APP_MSG_SEND_REJECTED);
  #endif
}
static void inbox_dropped_callback(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped!");
}
static void outbox_sent_callback(DictionaryIterator *iterator, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "Outbox send success!");
} 
#endif
static void send_h24_value(){
  if(value_h24SentValue != (clock_is_24h_style()*1)){
    messaging_requestData(PKIT_INIT);
    value_h24SentValue=(clock_is_24h_style()*1);
    save_storage(h24SentValueIndex);
  }
}
static void messaging_init() {
  app_message_open(512, 128);

  // Register callbacks
  app_message_register_inbox_received(inbox_received_callback);
  #ifdef SHOW_APP_LOGS
  app_message_register_outbox_failed(outbox_failed_callback);
  app_message_register_inbox_dropped(inbox_dropped_callback);
  app_message_register_outbox_sent(outbox_sent_callback);
  #endif
  
}

static bool data_need_download(int32_t last,uint8_t dataindex){
  if(!btConnected) return false;
  time_t now = time(NULL);
  //struct tm *tick_time = localtime(&now);
  if( (last+get_period(value_appConfigInt[dataindex])) <= now ) return true;
  return false;
  
}
static bool weather_need_download(){
  if(!weather_enabled()) return false;
  return data_need_download(value_weatherLastDownload,weatherDownloadFreqIndex);
}
static bool info_need_download(){
  if(!info_enabled()) return false;
  return data_need_download(value_infoLastDownload,infoDownloadFreqIndex);
}
static void download_data_start(){
  
  uint8_t type=0;
  if(weather_need_download()) type=PKIT_WEATHER;
  if(info_need_download()){
    if(type > 0) type=PKIT_WEATHER_INFO;
    else type=PKIT_INFO;
  }
  if(type > 0) messaging_requestData(type);
}

static void download_data(bool force){
  if(download_error() != (char)0) force=true;
  time_t now = time(NULL);
  struct tm *tick = localtime(&now);
  uint8_t m = tick->tm_min;
  
  if( (weather_need_download() || info_need_download()) && ((m%5)==nextDownloadDelay || force)){
    nextDownloadDelay=((rand() % (downloadDelayMax + 1 - downloadDelayMin)) + downloadDelayMin);
    //APP_LOG(APP_LOG_LEVEL_DEBUG, "nextDownloadDelay: %d",nextDownloadDelay);
    app_timer_register(downloadDelay*1000, download_data_start, NULL);
  }
}

////////////////////////////  EVENTS FUNCTIONS   //////////////////////////////////////////////////////////////////////////////////////
#ifdef PBL_HEALTH
static void get_health() {
  #ifdef SHOW_APP_LOGS
        APP_LOG(APP_LOG_LEVEL_INFO, 
              "get_health");
  #endif
  
  HealthServiceAccessibilityMask mask = health_service_metric_accessible(HealthMetricHeartRateBPM, time(NULL), time(NULL));
  if (mask & HealthServiceAccessibilityMaskAvailable) {
    uint8_t hrbpm=health_service_peek_current_value(HealthMetricHeartRateBPM);
    if(hrbpm) value_hrbpm=hrbpm;
    #ifdef SHOW_APP_LOGS
    APP_LOG(APP_LOG_LEVEL_INFO, "Heart Rate BPM: %d", 
            (int)hrbpm);
    #endif
  }
  mask = health_service_metric_accessible(HealthMetricStepCount,time_start_of_today(), time(NULL));
  if(mask & HealthServiceAccessibilityMaskAvailable) {
    // Data is available!
    value_steps=health_service_sum_today(HealthMetricStepCount);
    if(watch_info_get_model() == WATCH_INFO_MODEL_UNKNOWN){
      value_steps=9999;
      #ifdef PBL_BW
      value_hrbpm=88;
      #endif
    }
    #ifdef SHOW_APP_LOGS
    APP_LOG(APP_LOG_LEVEL_INFO, "Heart Rate BPM: %d", 
            (int)health_service_peek_current_value(HealthMetricHeartRateBPM));
    #endif
  } else {
    // No data recorded yet today
    #ifdef SHOW_APP_LOGS
    APP_LOG(APP_LOG_LEVEL_ERROR, "Data unavailable!");
    #endif
  }
}
#endif

static void vibrate_period(uint8_t m){
  //if(m==0) m=60;
  if (vibrate_enabled && !get_quiet_time_enabled() && (value_appConfigInt[vibratePeriodIndex]/15) > 0 && (m%((value_appConfigInt[vibratePeriodIndex]/15)*15)) == 0){
    accel_recognize_disabled=true;
    app_timer_register(1200, accel_recognize_enable, NULL);
    //vibes_short_pulse();
    uint8_t num_vib=m/15;
    VibePattern patt;
    switch(num_vib){
      case 1:
        patt.durations = (uint32_t[3]){100,500,100};
        patt.num_segments = 3;
        break;
      case 2:
        patt.durations = (uint32_t[5]){100,500,100,150,100};
        patt.num_segments = 5;
        break;
      case 3:
        patt.durations = (uint32_t[7]){100,500,100,150,100,150,100};
        patt.num_segments = 7;
        break;
      case 0:
      case 4:
      default:
        patt.durations = (uint32_t[3]){100,500,300};
        patt.num_segments = 3;
        break;
    }
    vibes_enqueue_custom_pattern(patt);
  }
}
static void update_time(struct tm *tick_time){
  uint8_t h = tick_time->tm_hour;
  uint8_t m = tick_time->tm_min;
  battery=battery_state_service_peek();
  #ifdef HOLIDAY
  //if(h==0 && m==0) setHolidaysChristian();
  #endif
  if(!clock_is_24h_style()) h=(h>=13)?(h-12):((h<1)?h+12:h);
  digitValues[0]=h/10;
  digitValues[1]=h%10;
  digitValues[2]=m/10;
  digitValues[3]=m%10;
  if((value_appConfigInt[leadingZeroIndex]%2) == 0 && digitValues[0] == 0) digitValues[0]=3;
  
  mday=tick_time->tm_mday;
  
  wday=tick_time->tm_wday;
  load_storage(daynamesIndex);
  set_dayname(wday,bufferstring,dayname);
  
  month=tick_time->tm_mon;
  load_storage(monthnamesIndex);
  set_monthname(month,bufferstring, monthname);
  
  year=tick_time->tm_year;
  #ifdef PBL_HEALTH
  if(health_enabled()) get_health();
  #endif
  redrawScreen();
}
static void handle_tick(struct tm *tick_time, TimeUnits units_changed) {
  if(units_changed == MINUTE_UNIT || tick_time->tm_sec==0){
    //APP_LOG(APP_LOG_LEVEL_INFO, "MINUTE_UNIT");
    update_time(tick_time);
    vibrate_period(tick_time->tm_min);
    download_data(false);
  }
  else{
    //APP_LOG(APP_LOG_LEVEL_INFO, "SECOND_UNIT");
    update_seconds();
  }
}
#ifndef PBL_PLATFORM_APLITE
static uint8_t prev_hor_pos;
static void quickview_will_change(GRect final_unobstructed_screen_area,void *context) {
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "quickview_will_change");
	#endif 
  // Get the full size of the screen
  GRect full_bounds = layer_get_bounds(s_window_layer);
  if (!grect_equal(&full_bounds, &final_unobstructed_screen_area)) {
    #ifdef SHOW_APP_LOGS
  	  APP_LOG(APP_LOG_LEVEL_DEBUG, "quickview_will_change - screen will small");
  	#endif 
    // Screen is about to become obstructed, move horizonal layer to bottom
    prev_hor_pos=value_appConfigInt[horPosIndex];
    resize_layers();
  }
  else {
    #ifdef SHOW_APP_LOGS
  	  APP_LOG(APP_LOG_LEVEL_DEBUG, "quickview_will_change - screen will original");
  	#endif 
    // Screen is about to become obstructed, move horizonal layer to bottom
    value_appConfigInt[horPosIndex]=prev_hor_pos;
    resize_layers();
  }
}
static void quickview_did_change(void *context) {
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "quickview_did_change");
	#endif 
  // Get the full size of the screen
  GRect full_bounds = layer_get_bounds(s_window_layer);
  // Get the total available screen real-estate
  GRect bounds = layer_get_unobstructed_bounds(s_window_layer);
  if (grect_equal(&full_bounds, &bounds)) {
     #ifdef SHOW_APP_LOGS
  	  APP_LOG(APP_LOG_LEVEL_DEBUG, "quickview_did_change - screen original");
  	#endif 
  }
}
#endif
static void battery_update(BatteryChargeState b){
  battery=b;
  //actual_hor_offset=battery.charge_percent;
  redrawScreen(); 
}

static void bluetooth_callback(bool connected) {
  // Show icon if disconnected
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "bluetooth_callback, connected:%i",connected);
	#endif 
  //if((btConnected>0) != connected){
    btConnected = connected;
    inverted=disconnectInvert&&(!btConnected)&&(value_appConfigInt[vibrateDisconnectIndex] != 66);
    if(btConnected) {
      download_data(false);
    }
    redrawScreen(); 
    uint8_t vibetype=(connected)?(value_appConfigInt[vibrateDisconnectIndex]/10):(value_appConfigInt[vibrateDisconnectIndex]%10);
    //if(!connected) {
      // Issue a vibrating alert
      if(vibrate_enabled && !get_quiet_time_enabled() && vibetype>0 && vibetype<6) {
        accel_recognize_disabled=true;
        app_timer_register(1000, accel_recognize_enable, NULL);
        if(vibetype == 1) vibes_short_pulse();
        else if(vibetype == 2) vibes_double_pulse();
        else if(vibetype == 3) vibes_long_pulse();
        else if(connected){
          VibePattern pat = {
            .durations = (uint32_t[5]){ 400, 100,100,100,100 },
            .num_segments = 5,
          };
          vibes_enqueue_custom_pattern(pat);
        }
        else{
          VibePattern pat = {
            .durations = (uint32_t[5]){ 200, 100,100,100,400 },
            .num_segments = 5,
          };
          vibes_enqueue_custom_pattern(pat);
        }
      }
    //}
  //}
}
static void setTimerSubscribe(bool needsecs){
  if(needsecs && !timetick_is_seconds) {
    tick_timer_service_subscribe(SECOND_UNIT, handle_tick);
    timetick_is_seconds=true;
  }
  if(!needsecs && timetick_is_seconds) {
    tick_timer_service_subscribe(MINUTE_UNIT, handle_tick);
    timetick_is_seconds=false;
  }
}
static bool need_vertical_seconds(){
  uint8_t vertseconds_type=value_appConfigInt[positionsHIndex+4]/15;
  bool needsecs=false;
  if(vertseconds_type==0) needsecs=false;
  else if(vertseconds_type==1 && !verticalIconsSizes[3]) needsecs=true;
  else if(vertseconds_type==2 || vertseconds_type==3) {
    int32_t now = (int32_t)time(NULL);
    if(now <= stop_vertical_seconds_at) needsecs=true;
  }
  setTimerSubscribe(needsecs);
  return needsecs;
}
static bool need_horizontal_seconds(){
  bool needsecs=false;
  if(value_appConfigInt[positionsHIndex] == STATUS_H_TIME_SEC) needsecs= true;
  if(!showsecondhor_enabled && (value_appConfigInt[positionsHIndex+1] == STATUS_H_TIME_SEC || value_appConfigInt[positionsHIndex+2] == STATUS_H_TIME_SEC)) needsecs= true;
  setTimerSubscribe(needsecs);
  return needsecs;
}

static void update_seconds(){
  //layer_mark_dirty(s_vert_layer);
  drawing_v_seconds=true;
  drawing_h_seconds=true;
  redrawScreen();
  /*if(need_vertical_seconds()) 
  else enable_minutes();*/
}
static void vertical_seconds_tap(){
  int32_t now = (int32_t)time(NULL);
  stop_vertical_seconds_at=now+10;
  update_seconds();
}
static void show_second_hor(uint8_t num){
  GRect bound=get_hor_bound();
  #ifdef PBL_ROUND
  GRect startHorMove = GRect(0,bound.size.h*((value_appConfigInt[horPosIndex]==1)?-1:1),get_hor_width_full(),bound.size.h);
  GRect finishHorMove = GRect(0,0,get_hor_width_full(),bound.size.h);
  #else
  GRect startHorMove = GRect(0,bound.size.h*((value_appConfigInt[horPosIndex]==1)?-1:1),get_hor_width(),bound.size.h);
  GRect finishHorMove = GRect(0,0,get_hor_width(),bound.size.h);
  #endif
  PropertyAnimation *prop_anim = property_animation_create_layer_frame(s_hor_layer[num],&startHorMove, &finishHorMove);
  Animation *anim = property_animation_get_animation(prop_anim);
  animation_set_curve(anim, AnimationCurveEaseOut);
  animation_set_duration(anim, 500);
  animation_schedule(anim);
}
static void hide_second_hor(uint8_t num){
  GRect bound=get_hor_bound();
  #ifdef PBL_ROUND
  GRect startHorMove = GRect(0,bound.size.h*((value_appConfigInt[horPosIndex]==1)?-1:1),get_hor_width_full(),bound.size.h);
  GRect finishHorMove = GRect(0,0,get_hor_width_full(),bound.size.h);
  #else
  GRect startHorMove = GRect(0,bound.size.h*((value_appConfigInt[horPosIndex]==1)?-1:1),get_hor_width(),bound.size.h);
  GRect finishHorMove = GRect(0,0,get_hor_width(),bound.size.h);
  #endif
  PropertyAnimation *prop_anim = property_animation_create_layer_frame(s_hor_layer[num], &finishHorMove,&startHorMove);
  Animation *anim = property_animation_get_animation(prop_anim);
  animation_set_curve(anim, AnimationCurveEaseOut);
  animation_set_duration(anim, 500);
  animation_schedule(anim);
}
static void hide_second_hor1();
static void hide_second_hor2();
static void show_second_hor1(){
  showsecondhor_enabled=false;
  show_second_hor(1);
  app_timer_register((value_appConfigInt[positionsHIndex+3]%30)*1000, hide_second_hor1, NULL);
}
static void show_second_hor2(){
  show_second_hor(2);
}
static void hide_second_hor1(){
  hide_second_hor(1);
  if(value_appConfigInt[positionsHIndex+2] != STATUS_H_NONE){
    app_timer_register(300, show_second_hor2, NULL);
    app_timer_register(300+(value_appConfigInt[positionsHIndex+4]%15)*1000, hide_second_hor2, NULL);
  }
  else{
    showsecondhor_enabled=true;
  }
}
static void hide_second_hor2(){
  hide_second_hor(2);
  showsecondhor_enabled=true;
}

static void on_tap(){
  //APP_LOG(APP_LOG_LEVEL_DEBUG, "on_tap");
  if(showsecondhor_enabled && value_appConfigInt[positionsHIndex+1]!=STATUS_H_NONE && (value_appConfigInt[positionsHIndex+3]/30) == 0) show_second_hor1();
  if((value_appConfigInt[positionsHIndex+4]/15)==2) vertical_seconds_tap();
}
static void on_doubletap(){
  //APP_LOG(APP_LOG_LEVEL_DEBUG, "on_doubletap");
  if(showsecondhor_enabled && value_appConfigInt[positionsHIndex+1]!=STATUS_H_NONE && (value_appConfigInt[positionsHIndex+3]/30) == 1) show_second_hor1();
  if((value_appConfigInt[positionsHIndex+4]/15)==3) vertical_seconds_tap();
}
uint8_t tap_counter=0;
static void reset_tap_counter(){
  tap_counter=0;
}
static void accel_tap_handler(AccelAxisType axis, int32_t direction) {
  // A tap event occured
  if(!accel_recognize_disabled){
    accel_recognize_disabled=true;
    tap_counter++;
    app_timer_register(3000, reset_tap_counter, NULL);
    app_timer_register(500, accel_recognize_enable, NULL);
    //APP_LOG(APP_LOG_LEVEL_DEBUG, "accel_tap_handler ENABLED, tap_counter:%d, x:%d, y:%d,z:%d",tap_counter,axis==ACCEL_AXIS_X,axis==ACCEL_AXIS_Y,axis==ACCEL_AXIS_Z);
    if(tap_counter >= 2) on_doubletap();
    else on_tap();
  }
}

static void  focus_changed(bool in_focus){
  if(in_focus) app_timer_register(1000, accel_recognize_enable, NULL);
  else accel_recognize_disabled=true;
}

////////////////////////////  INIT FUNCTIONS   //////////////////////////////////////////////////////////////////////////////////////

static void window_load(Window *window) {
  //APP_LOG(APP_LOG_LEVEL_DEBUG, "RESOURCE_ID_IMAGE_NUMB_9: %d",RESOURCE_ID_IMAGE_NUMB_9);
  window_set_background_color(s_main_window, GColorDarkCandyAppleRed);
  init_storage(false);
  load_storage(allIndex);
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "load");
	#endif 
  s_window_layer = window_get_root_layer(window);
  layer_set_update_proc(s_window_layer,update_proc_root);
  #ifdef HOLIDAY
  //setHolidaysChristian();
  //setHolidayText(1);
  #endif
  create_layers();
  time_t now = time(NULL);
  struct tm *tick = localtime(&now);
  update_time(tick);
  download_data(true);

  /*if(need_vertical_seconds()) enable_seconds();
  else enable_minutes();*/
  tick_timer_service_subscribe(MINUTE_UNIT, handle_tick);
  //need_vertical_seconds();
  #ifndef PBL_PLATFORM_APLITE
  prev_hor_pos=value_appConfigInt[horPosIndex];
  UnobstructedAreaHandlers handlers = {
    .will_change = quickview_will_change,
    .did_change = quickview_did_change
  };
  unobstructed_area_service_subscribe(handlers, NULL);
  #endif
  battery_state_service_subscribe(battery_update);
  bluetooth_callback(connection_service_peek_pebble_app_connection());
  connection_service_subscribe((ConnectionHandlers) {
    .pebble_app_connection_handler = bluetooth_callback
  });
  app_focus_service_subscribe_handlers((AppFocusHandlers){
    .will_focus = focus_changed,
    .did_focus = focus_changed,
  });
  messaging_init();
  app_timer_register(500, send_h24_value,NULL);
  app_timer_register(1000, enable_vibrate,NULL);
}


static void window_unload(Window *window) {
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "unload");
	#endif 
  save_storage(stepsIndex);
  save_storage(hrbpmIndex);
  
  accel_tap_service_unsubscribe();
  app_focus_service_unsubscribe();
  battery_state_service_unsubscribe();
  #ifndef PBL_PLATFORM_APLITE
  unobstructed_area_service_unsubscribe();
  #endif
  destroy_layers();
  
}
static void init() {
  // Set up main Window
  s_main_window = window_create();
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "init");
	  if(s_main_window == NULL) APP_LOG(APP_LOG_LEVEL_DEBUG, "s_main_window not created");
    else APP_LOG(APP_LOG_LEVEL_DEBUG, "s_main_window succesfully created");
	#endif 

  window_set_background_color(s_main_window, GColorLightGray);
  window_set_window_handlers(s_main_window, (WindowHandlers) {
      .load = window_load,
      .unload = window_unload,
  });
  window_stack_push(s_main_window, true);
}

static void deinit() {
  // Destroy main Window
  window_destroy(s_main_window);
}

int main() {
  init();
  app_event_loop();
  deinit();
}
