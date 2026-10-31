#include <pebble.h>
#include "const.h"

 
uint8_t get_vert_width(){
  #ifdef PBL_ROUND
  return ((PBL_DISPLAY_WIDTH-PBL_DISPLAY_OFFSET_X*2)-DIGITWFULL*2)/2;
  #else
  return (PBL_DISPLAY_WIDTH-PBL_DISPLAY_OFFSET_X*2)-DIGITWFULL*2;
  #endif
}
uint8_t get_vert_height(){
  return PBL_DISPLAY_HEIGHT-PBL_DISPLAY_OFFSET_Y*0 ;
}
#ifdef PBL_ROUND
uint8_t get_hor_width_full(){
  return DIGITWFULL*2+get_vert_width();
}
uint8_t get_hor_height_full(){
  return PBL_DISPLAY_HEIGHT-PBL_DISPLAY_OFFSET_Y-DIGITHFULL*2;
}
#else
#endif
uint8_t get_hor_width(){
  return DIGITWFULL*2;
}
uint8_t get_hor_height(){
  return PBL_DISPLAY_HEIGHT-PBL_DISPLAY_OFFSET_Y*2-DIGITHFULL*2;
}
uint8_t get_digit_index(uint8_t index,uint8_t digit,uint8_t number){
  uint8_t offset=0;
  if(value_appConfigInt[faceTypeIndex] == 0) for(uint8_t i = 0 ; i < 4 ; i++) if(i <= digit) switch(i){
    case 0:
      offset+=0;
      break;
    case 1:
      offset+=3;
      if(index == bgDigitIndex) offset++;
      break;
    case 2:
      offset+=10;
      break;
    case 3:
      offset+=6;
      break;
  }
  if(value_appConfigInt[faceTypeIndex] >= 1){
    time_t now = time(NULL);
    struct tm *tick_time = localtime(&now);
    number=tick_time->tm_hour;
  }
  return index+offset+number;
}

bool get_quiet_time_enabled(){
  if(battery.is_plugged && (value_appConfigInt[quietTimeIndex]/10) > 0) return true;
  if((value_appConfigInt[quietTimeIndex]%10) == 0) return quiet_time_is_active();
  time_t now = time(NULL);
  struct tm *tick = localtime(&now);
  uint8_t start_hour=value_appConfigInt[quietTimeIndex+1];
  uint8_t start_minute=value_appConfigInt[quietTimeIndex+2];
  uint8_t end_hour=value_appConfigInt[quietTimeIndex+3];
  uint8_t end_minute=value_appConfigInt[quietTimeIndex+4];
  uint8_t hour=tick->tm_hour;
  uint8_t minute=tick->tm_min;
  bool is_not_ended=(hour <= end_hour && (hour < end_hour || minute < end_minute));
  bool is_started=(hour >= start_hour && (hour > start_hour || minute >=start_minute));
  if(start_hour > end_hour){
    if(end_hour < hour) return is_started;
    else return is_not_ended;
  } 
  else return (is_started && is_not_ended);
}
