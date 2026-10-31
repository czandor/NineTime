#pragma once
#include "const.h"

extern uint8_t value_appConfigInt[intStorageLastIndex+1];
extern bool verticalIconsSizes[4];

void update_battery_v(GContext *ctx,uint8_t position,BatteryChargeState battery,uint16_t offset);
void update_date_v(GContext *ctx,uint8_t position,char *name1,uint8_t mday,char *name2,uint16_t offset);
void update_week_v(GContext *ctx,uint8_t position,uint8_t type,uint16_t offset);
void update_weather_c_v(GContext *ctx,uint8_t position,uint8_t value_weatherIconC,int value_tempCurrent,int value_weatherWindspeed,uint8_t value_weatherHum, char d_error,uint16_t offset);
void update_weather_f_v(GContext *ctx,uint8_t position,int value_tempMin, int value_tempMax,uint8_t value_weatherIconF,char d_error,uint16_t offset);
void update_weather_wh_v(GContext *ctx,uint8_t position,int value_weatherWindspeed, uint8_t value_humCurrent,char d_error,uint16_t offset);
#ifdef PBL_HEALTH
void update_steps_v(GContext *ctx,uint8_t position,int steps,uint16_t offset);
void update_hr_v(GContext *ctx,uint8_t position,int value_hrbpm,uint16_t offset);
#endif
void update_status_v(GContext *ctx, char downloaderror, bool btConnected, bool showSeconds);



