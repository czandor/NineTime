#pragma once
#include "const.h"
//extern uint8_t value_appConfigInt[intStorageLastIndex+1];

void update_date_h(GContext *ctx,uint8_t position,char *dayname,uint8_t mday,char *monthname);
void update_date_txt_h(GContext *ctx,uint8_t position,uint8_t type,char *dayname,bool needsecs);
void update_string_h(GContext *ctx,uint8_t position,char *szoveg, char d_error,int16_t offset_x,GTextAlignment alignment);
void update_weather_c_h(GContext *ctx,uint8_t position,int value_tempCurrent,int value_weatherWindspeed,uint8_t value_weatherIconC,uint8_t value_humCurrent,char d_error);
void update_weather_f_h(GContext *ctx,uint8_t position,int value_tempMin, int value_tempMax,uint8_t value_weatherIconF,char d_error);
void update_counter_h(GContext *ctx,uint8_t position,char *szoveg, int16_t number,GTextAlignment alignment);
#ifdef PBL_HEALTH
void update_health_h(GContext *ctx,uint8_t position,int value_steps, int value_hrbpm);
#endif
//bool format_date(char *bufdate,uint8_t bufsize,bool withname,char *dayname);
bool format_time(char *buftime,uint8_t bufsize,bool needsecs);
#ifdef HOLIDAY
void setHolidayText(GContext *ctx,uint8_t rel,uint8_t position);
#endif


