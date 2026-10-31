#pragma once

//#define SHOW_APP_LOGS
//#ifndef PBL_PLATFORM_APLITE
#define HOLIDAY
//#endif

#define CONFIG_VERSION_MAJOR 2
#define CONFIG_VERSION_MINOR 0

#define BUFFERSTRING_LENGTH 140

#define DEFAULT_STRING_INFO "INFO"
#define DEFAULT_STRING_WEATHER "WEATHER"
#define DEFAULT_DAYNAMES "SUN,MON,TUE,WED,THU,FRI,SAT"
#define DEFAULT_MONTHNAMES "JAN,FEB,MAR,APR,MAY,JUN,JUL,AUG,SEP,OCT,NOV,DEC"

#define HANDS_WIDTH 5
#define HANDS_HEIGHT 46
#define HANDS_CENTER 3

#define ICON_MARGIN 2
#define ICON_STATUS_MARGIN 10
#define TEXT_HEIGHT 24
#define TEXT_MARGIN_TOP -10
#define TEXT_MARGIN_BOTTOM 2
#define TEXT_HEIGHT_SMALL 19
#define TEXT_HEIGHT_TINY 15

#define VERTICAL_ICON_MIN_PADDING 5

#define ICON_BATT_HEIGHT 14
#define ICON_BATT_WIDTH 27

#define ICON_STATUS_HEIGHT 16
#define ICON_STATUS_WIDTH 22

#define ICON_NOINTERNET_HEIGHT 16
#define ICON_NOINTERNET_WIDTH 14

#define ICON_HR_HEIGHT 18
#define ICON_HR_WIDTH 23
#define ICON_HRH_HEIGHT 18
#define ICON_HRH_WIDTH 19

#define ICON_STEPS_HEIGHT 16
#define ICON_STEPS_WIDTH 26
#define ICON_STEPSH_HEIGHT 17
#define ICON_STEPSH_WIDTH 21

#define ICON_DATE_HEIGHT 22
#define ICON_DATE_WIDTH 26

#define ICON_WEEK_HEIGHT 34
#define ICON_WEEK_WIDTH 26

#define ICON_WEATHER_HEIGHT 25
#define ICON_WEATHER_WIDTH 25

#define DIGITWFULL 56  // ((56*2-50*2)/3) (/2)
#define DIGITHFULL 70  // ((70*2-64*2)/3) (/2)
#define DIGITW 50
#define DIGITH 64
#define DIGITWMARGIN ((DIGITWFULL*2-DIGITW*2)/6)
//#define DIGITHMARGIN ((DIGITHFULL*2-DIGITH*2)/6)
#define DIGITHMARGIN ((DIGITHFULL*2-DIGITH*2)/4)

#define BORDERSIZE 1 //vertical and/or horizontal line size
#define ROUND_VERTICAL_RADIUS 720
#ifdef PBL_PLATFORM_EMERY
  #define PBL_DISPLAY_OFFSET_X 18
  #define PBL_DISPLAY_OFFSET_Y 6
#else
  #ifdef PBL_ROUND
    #define PBL_DISPLAY_OFFSET_X 2
    #define PBL_DISPLAY_OFFSET_Y 6
    #define PBL_DISPLAY_WIDTH 180
    #define PBL_DISPLAY_HEIGHT 180
  #else
    #define PBL_DISPLAY_OFFSET_X 0
    #define PBL_DISPLAY_OFFSET_Y 0
    #define PBL_DISPLAY_WIDTH 144
    #define PBL_DISPLAY_HEIGHT 168
  #endif
#endif
//FONT_KEY_GOTHIC_24_BOLD
//FONT_KEY_GOTHIC_18_BOLD
//FONT_KEY_ROBOTO_CONDENSED_21
#define TEXTFONT FONT_KEY_GOTHIC_24_BOLD
#define TEXTFONTSMALL FONT_KEY_GOTHIC_18_BOLD
#define TEXTFONTTINY FONT_KEY_GOTHIC_14_BOLD
#define FONT_HEIGHT 14
#define FONT_OFFSET -10
#define FONT_SMALL_HEIGHT 11
#define FONT_SMALL_OFFSET -7
#define FONT_TINY_HEIGHT 9
#define FONT_TINY_OFFSET -5


#define STATUS_V_NONE          0 //kész
#define STATUS_V_BATT          1 //kész
#define STATUS_V_DATE_DAY_MON  2 //kész
#define STATUS_V_STEPS         3 //kész
#define STATUS_V_HR            4 //kész
#define STATUS_V_WEATHER_C_WIN 5 //kész
#define STATUS_V_WEATHER_F     6 //kész
#define STATUS_V_WEATHER_WH    7 //kész
#define STATUS_V_WEATHER_C_HUM 8 //kész
#define STATUS_V_WEATHER_C     9 //kész
#define STATUS_V_BATT_STEPS    10 
#define STATUS_V_BATT_HR       11 
#define STATUS_V_STEPS_HR      12 
#define STATUS_V_HR_STEPS      13
#define STATUS_V_DATE_MON_DAY  14
#define STATUS_V_DATE_DAY      15
#define STATUS_V_DATE_MON      16
#define STATUS_V_WEEK_SUN      17
#define STATUS_V_WEEK_MON      18

/////////////////////////////!!!!!!!!!!!!!!!!!!!!     health_enabled, weather_enabled, info_enabled frissítése     !!!!!!!!!!!!!!!!!!
                                              //  0,1 ,2 ,3 ,4 ,5 ,6, 7 ,8 ,9 ,10,11,12,13,14,15,16,17,18 
static const uint8_t VERTICAL_SIZES_NORMAL[21]  ={0,30,46,29,34,42,48,37,42,42,30,30,29,34,46,35,35,34,34};
static const uint8_t VERTICAL_SIZES_EXTENDED[21]={0,30,51,29,34,65,55,42,58,42,61,66,65,65,51,38,38,34,34};

#define STATUS_H_NONE         0 //kész
#define STATUS_H_DATE         1 //kész
#define STATUS_H_DATE_FULL    2 //kész
#define STATUS_H_TIME         3 //kész
#define STATUS_H_DATETIME     4 //kész
#define STATUS_H_HEALTH       5 //kész
#define STATUS_H_WEATHER_C    6 //kész
#define STATUS_H_WEATHER_F    7 //kész
#define STATUS_H_WEATHER_CITY 8 //kész
#define STATUS_H_INFO         9 //kész
#define STATUS_H_TEXT         10 //kész
#define STATUS_H_WEATHER_COND 11 //kész
#define STATUS_H_HOLIDAYS_CHR 12
#define STATUS_H_TIME_SEC     13

/////////////////////////////!!!!!!!!!!!!!!!!!!!!     health_enabled, weather_enabled, info_enabled frissítése      !!!!!!!!!!!!!!!!!!

// inbox data type, in index 0
#define PKIT_CONFIG           1
#define PKIT_WEATHER          2
#define PKIT_INFO             3
#define PKIT_WEATHER_INFO     4
#define PKIT_INIT             5

#define allIndex                 0
////////////////////////////// INDEXES IN STORAGE /////////////////////////////////////
// app config one dimension data bytes
#define intStorageStartIndex             10
#define infoDownloadFreqIndex    10
#define weatherDownloadFreqIndex 11
#define statusPositionIndex      12 // %5: normal status position; 1:(left)top,2:(left)bottom,3:(right)top,4: (right)bottom, /5: which status to show; 0:all, 1: quiet-disc, 2: derror-disc, 3: disc, 4: never
#define vertPosIndex             13
#define horPosIndex              14
#define positionsVIndex          15 //3 byte
#define positionsHIndex          18 //5 byte
#define fontTypeIndex            23 //3+10+6+10 byte
#define bgDigitIndex             52 //4+10+6+10 byte
#define colorDigitIndex          82 //3+10+6+10 byte
#define bgVertIndex              111
#define lineVertIndex            112
#define colorVertIndex           113
#define iconVertIndex            114
#define iconbgVertIndex          115
#define bgHorIndex               116 //2 byte
#define lineHorIndex             118 //2 byte
#define colorHorIndex            120 //2 byte
#define iconHorIndex             122 //2 byte
#define iconbgHorIndex           124 //2 byte
#define leadingZeroIndex         126 // %2: hour leading zero, /2: minute mode (hourly digital mode alt: 0: normal hourly, 1: hour:hourly minute: minutelly, 2: all minutelly; analog: 0: nothig, 1: minutehandcolor, 2: bgcolor, 4: facecolor, 8: hourhandcolor, 15: all, etc...)
#define tempMetricIndex          127
#define vibrateDisconnectIndex   128
#define vibratePeriodIndex       129
#define faceTypeIndex            130  //0: normal, color/digit/number; 1: color/all_digit/hour; 2: analog with all number, 3: analog with mixed line+number, 4: analog with lines
#define quietTimeIndex           131 //5 byte
#define dateformatIndex          136 // /20: timeformat('6:30 pm','6.30pm','6:30 p.m.') , %20: dateformat('1996-04-22','1996.04.22','1996/04/22','22.04.1996','22/04/1996','22-04-1996','04/22/1996')
#define fontMinuteIndex          137 //12 byte
#define bgMinuteIndex            149 //12 byte
#define colorMinuteIndex         161 //12 byte

#define intStorageLastIndex             172


//app config one dim string
#define textStringIndex          140
#define monthnamesIndex          141 //12 value separated with "," starting with january
#define daynamesIndex            142 //7 value separated with "," starting with sunday



//weather update
#define weatherIconFIndex        150
#define weatherIconCIndex        151
#define tempCurrentIndex         152
#define tempMaxIndex             153
#define tempMinIndex             154
#define weatherLocationIndex     155
#define weatherWindspeedIndex    156
#define humCurrentIndex          157
#define weatherConditionIndex    158

//app saved data
#define weatherLastDownloadIndex   160
#define infoLastDownloadIndex      161
#define hrbpmIndex                 162
#define stepsIndex                 163
#define infoStringIndex            164
#define infoLastDownloadStartIndex 165
#define h24SentValueIndex          166

#define maxIndex            170

#define morningHour 6
#define eveningHour (morningHour+12)
#define downloadDelay 5 //secs
#define downloadDelayMin 0 //min, minute%5==
#define downloadDelayMax 3 //min, minute%5== , <5
#define downloadErrorTimout (downloadDelayMax*2*60+30) //secs

static const uint16_t IMAGE_DIGITS[7][10]={ {
  RESOURCE_ID_IMAGE_NUM_0, RESOURCE_ID_IMAGE_NUM_1, RESOURCE_ID_IMAGE_NUM_2,
  RESOURCE_ID_IMAGE_NUM_3, RESOURCE_ID_IMAGE_NUM_4, RESOURCE_ID_IMAGE_NUM_5,
  RESOURCE_ID_IMAGE_NUM_6, RESOURCE_ID_IMAGE_NUM_7, RESOURCE_ID_IMAGE_NUM_8,
  RESOURCE_ID_IMAGE_NUM_9
},{
  RESOURCE_ID_IMAGE_NUM9_0, RESOURCE_ID_IMAGE_NUM9_1, RESOURCE_ID_IMAGE_NUM9_2,
  RESOURCE_ID_IMAGE_NUM9_3, RESOURCE_ID_IMAGE_NUM9_4, RESOURCE_ID_IMAGE_NUM9_5,
  RESOURCE_ID_IMAGE_NUM9_6, RESOURCE_ID_IMAGE_NUM9_7, RESOURCE_ID_IMAGE_NUM9_8,
  RESOURCE_ID_IMAGE_NUM9_9
},{
  RESOURCE_ID_IMAGE_NUMO_0, RESOURCE_ID_IMAGE_NUMO_1, RESOURCE_ID_IMAGE_NUMO_2,
  RESOURCE_ID_IMAGE_NUMO_3, RESOURCE_ID_IMAGE_NUMO_4, RESOURCE_ID_IMAGE_NUMO_5,
  RESOURCE_ID_IMAGE_NUMO_6, RESOURCE_ID_IMAGE_NUMO_7, RESOURCE_ID_IMAGE_NUMO_8,
  RESOURCE_ID_IMAGE_NUMO_9
},{
  RESOURCE_ID_IMAGE_NUMR_0, RESOURCE_ID_IMAGE_NUMR_1, RESOURCE_ID_IMAGE_NUMR_2,
  RESOURCE_ID_IMAGE_NUMR_3, RESOURCE_ID_IMAGE_NUMR_4, RESOURCE_ID_IMAGE_NUMR_5,
  RESOURCE_ID_IMAGE_NUMR_6, RESOURCE_ID_IMAGE_NUMR_7, RESOURCE_ID_IMAGE_NUMR_8,
  RESOURCE_ID_IMAGE_NUMR_9
},{
  RESOURCE_ID_IMAGE_NUMA_0, RESOURCE_ID_IMAGE_NUMA_1, RESOURCE_ID_IMAGE_NUMA_2,
  RESOURCE_ID_IMAGE_NUMA_3, RESOURCE_ID_IMAGE_NUMA_4, RESOURCE_ID_IMAGE_NUMA_5,
  RESOURCE_ID_IMAGE_NUMA_6, RESOURCE_ID_IMAGE_NUMA_7, RESOURCE_ID_IMAGE_NUMA_8,
  RESOURCE_ID_IMAGE_NUMA_9
},{
  RESOURCE_ID_IMAGE_NUML_0, RESOURCE_ID_IMAGE_NUML_1, RESOURCE_ID_IMAGE_NUML_2,
  RESOURCE_ID_IMAGE_NUML_3, RESOURCE_ID_IMAGE_NUML_4, RESOURCE_ID_IMAGE_NUML_5,
  RESOURCE_ID_IMAGE_NUML_6, RESOURCE_ID_IMAGE_NUML_7, RESOURCE_ID_IMAGE_NUML_8,
  RESOURCE_ID_IMAGE_NUML_9
},{
  RESOURCE_ID_IMAGE_NUMB_0, RESOURCE_ID_IMAGE_NUMB_1, RESOURCE_ID_IMAGE_NUMB_2,
  RESOURCE_ID_IMAGE_NUMB_3, RESOURCE_ID_IMAGE_NUMB_4, RESOURCE_ID_IMAGE_NUMB_5,
  RESOURCE_ID_IMAGE_NUMB_6, RESOURCE_ID_IMAGE_NUMB_7, RESOURCE_ID_IMAGE_NUMB_8,
  RESOURCE_ID_IMAGE_NUMB_9
}};

static const uint16_t WEATHER_ICONS[12]={
  RESOURCE_ID_ICON_PARTLY_CLOUDY,RESOURCE_ID_ICON_CLOUDY_DAY,RESOURCE_ID_ICON_LIGHT_SNOW,
  RESOURCE_ID_ICON_LIGHT_RAIN,RESOURCE_ID_ICON_HEAVY_RAIN,RESOURCE_ID_ICON_HEAVY_SNOW,
  RESOURCE_ID_ICON_SUNNY_DAY,RESOURCE_ID_ICON_RAINING_AND_SNOWING,
  RESOURCE_ID_ICON_PARTLY_CLOUDY_NIGHT,RESOURCE_ID_ICON_CLEAR_NIGHT,
  RESOURCE_ID_ICON_THUNDERSTORM,RESOURCE_ID_ICON_FOG
};

//extern Layer *s_hor_layer[3];
extern uint8_t value_appConfigInt[intStorageLastIndex+1];
extern BatteryChargeState battery;

uint8_t get_vert_width();
uint8_t get_vert_height();
#ifdef PBL_ROUND
uint8_t get_hor_width_full();
uint8_t get_hor_height_full();
#endif
uint8_t get_hor_width();
uint8_t get_hor_height();
uint8_t get_digit_index(uint8_t index,uint8_t digit,uint8_t number);
bool get_quiet_time_enabled();

/*static const GPathInfo MINUTE_HAND_POINTS = {
  4,
  (GPoint []) {
    { -5, 10 },
    { 5, 10 },
    { 3, -50 },
    { -3, -50 }
  }
};

static const GPathInfo HOUR_HAND_POINTS = {
  4, (GPoint []){
    {-7, 10},
    {7, 10},
    {3, -36},
    {-3, -36}
  }
};*/

static const GPathInfo MINUTE_HAND_POINTS = {
  4,
  (GPoint []) {
    { -5, 10 },
    { 5, 10 },
    { 2, -50 },
    { -2, -50 }
  }
};

static const GPathInfo HOUR_HAND_POINTS = {
  4, (GPoint []){
    {-7, 10},
    {7, 10},
    {2, -36},
    {-2, -36}
  }
};

#ifdef HOLIDAY
static const char HolidayGreetings[3][9]={
  "Happy",
  "Marry",
  "Welcome"
};

#define HolidayChristianCount 10

#define HolidayChristianEasterId 3
#define HolidayChristianMotherId 4
#define HolidayChristianFatherId 5
#define HolidayChristianNewYearId 0

static const char HolidayChristianTexts[HolidayChristianCount][17]={
  "New Year",
  "Valentine's Day",
  "Women's Day",
  "Easter",
  "Mother's Day",
  "Father's Day",
  "Summer",
  "Summer",
  "Halloween",
  //{"%d day%s until Thanksgiving","Happy Thanksgiving!"},
  "Christmas"
};
static const uint8_t HolidayChristianGreetingsId[HolidayChristianCount]={
  0,
  0,
  0,
  0,
  0,
  0,
  2,
  0,
  0,
  //{"%d day%s until Thanksgiving","Happy Thanksgiving!"},
  1
};

#endif

