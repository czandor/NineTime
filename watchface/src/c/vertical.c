#include <pebble.h>
#include "vertical.h"
#include "colors.h"
#include "draw.h"

////////////////////////////  VERTICAL FUNCTIONS   //////////////////////////////////////////////////////////////////////////////////////


static GRect get_vertical_status_GRect(uint8_t position){
  uint8_t border=(value_appConfigInt[bgVertIndex]==value_appConfigInt[lineVertIndex])?0:BORDERSIZE;
  uint8_t x=(PBL_IF_ROUND_ELSE(position,value_appConfigInt[vertPosIndex]) == 2)?border:0;
  uint8_t width=get_vert_width()-border;
  
  uint8_t height0=VERTICAL_SIZES_NORMAL[value_appConfigInt[positionsVIndex]];
  uint8_t height2=VERTICAL_SIZES_NORMAL[value_appConfigInt[positionsVIndex+2]];
  #ifndef PBL_ROUND
  uint8_t height1=VERTICAL_SIZES_NORMAL[value_appConfigInt[positionsVIndex+1]];
  int16_t vertheight=get_vert_height()-((verticalIconsSizes[3])?(ICON_STATUS_HEIGHT+ICON_STATUS_MARGIN):0);
  int16_t offset=(((value_appConfigInt[statusPositionIndex]%5)%2) == 1)?(get_vert_height()-vertheight):0;
  if(verticalIconsSizes[1]) height1=VERTICAL_SIZES_EXTENDED[value_appConfigInt[positionsVIndex+1]];
  #endif
  if(verticalIconsSizes[0]) height0=VERTICAL_SIZES_EXTENDED[value_appConfigInt[positionsVIndex]];
  if(verticalIconsSizes[2]) height2=VERTICAL_SIZES_EXTENDED[value_appConfigInt[positionsVIndex+2]];
  
  #ifdef PBL_ROUND
  //int16_t offset=(verticalIconsSizes[3] && ((value_appConfigInt[statusPositionIndex]%5)/3) == (position/2))?6*(((value_appConfigInt[statusPositionIndex]%5)%2)-1):0;
  if(position == 2) return GRect(x,((get_vert_height()-height2)/2),width,height2);
  return GRect(x,((get_vert_height()-height0)/2),width,height0);
  #else
  if(position == 1) return GRect(x,((vertheight-height0-height1-height2-4)/2)+height0+2+offset,width,height1);
  if(position == 2) return GRect(x,vertheight-2-height2+offset,width,height2);
  //if(position == 0)
  return GRect(x,2+offset,width,height0);
  #endif
}

void update_battery_v(GContext *ctx,uint8_t position,BatteryChargeState battery,uint16_t offset){
  GRect vpos=get_vertical_status_GRect(position);
  vpos.origin.y+=offset;
  GRect iconrect=GRect(((vpos.size.w-ICON_BATT_WIDTH)/2)+vpos.origin.x,vpos.origin.y,ICON_BATT_WIDTH,ICON_BATT_HEIGHT);
  int imageresource=(RESOURCE_ID_IMAGE_BATT_0);
  if(battery.is_plugged) imageresource=(RESOURCE_ID_IMAGE_BATT_C);
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "update_battery vpos.x=%d, vpos.y=%d, level:%d, charging:%i, resource:%i",vpos.x,vpos.y,battery.charge_percent,battery.is_plugged,imageresource);
	#endif 
  draw_bitmap(ctx, imageresource, iconrect, value_appConfigInt[iconVertIndex], value_appConfigInt[iconbgVertIndex]);
  uint8_t batteryiconpaddings[4]={3,4,3,3};
  if(battery.charge_percent>0 && !battery.is_plugged) 
    draw_rect(ctx,intToColor(value_appConfigInt[iconVertIndex]),GColorClear,(uint8_t[4]){0,0,0,0},GRect(iconrect.origin.x+batteryiconpaddings[3],
                                                                                     iconrect.origin.y+batteryiconpaddings[0],
                                                                                     battery.charge_percent/((uint16_t)100/(ICON_BATT_WIDTH-(batteryiconpaddings[3]+batteryiconpaddings[1]))),
                                                                                     ICON_BATT_HEIGHT-(batteryiconpaddings[0]+batteryiconpaddings[2])));
  char buf[4]; 
  snprintf(buf, sizeof(buf), "%d", battery.charge_percent);
  write_text2(ctx,buf,0,"",2,GSize(0,100),GRect(vpos.origin.x-10,
                                                vpos.origin.y+ICON_BATT_HEIGHT+2,
                                                vpos.size.w+20,
                                                30), 
              GTextAlignmentCenter,value_appConfigInt[colorVertIndex]);
}

void update_date_v(GContext *ctx,uint8_t position,char *name1,uint8_t mday,char *name2,uint16_t offset){
  GRect vpos=get_vertical_status_GRect(position);
  vpos.origin.y+=offset;
  //mday=29;
  uint8_t fontsize=1;
  offset=0;
  if(verticalIconsSizes[position]) {
    fontsize=0;
  }
  if(name1[0] != (char)0) {
    offset+=write_text2(ctx,name1,fontsize+1,"",0,GSize(0,0), GRect(vpos.origin.x-10,
                                                                    vpos.origin.y+offset,
                                                                    vpos.size.w+20,
                                                                    30),
             GTextAlignmentCenter,value_appConfigInt[colorVertIndex]);
    offset+=ICON_MARGIN;
  }
  
  GRect iconrect=GRect(((vpos.size.w-ICON_DATE_WIDTH)/2)+vpos.origin.x,vpos.origin.y+offset,ICON_DATE_WIDTH,ICON_DATE_HEIGHT);
  int imageresource=(RESOURCE_ID_IMAGE_DATE);
  draw_bitmap(ctx, imageresource, iconrect, value_appConfigInt[iconVertIndex], value_appConfigInt[iconbgVertIndex]);
  uint8_t iconpaddings[4]={4,2,3,(mday>9 && mday < 20)?1:2};
  char buf[3]; 
  snprintf(buf, sizeof(buf), "%d", mday);
  write_text2(ctx,buf,0,"",0,GSize(0,0),GRect(iconrect.origin.x+iconpaddings[3],
                                              iconrect.origin.y+iconpaddings[0],
                                              ICON_DATE_WIDTH-(iconpaddings[3]+iconpaddings[1]),
                                              30),
             GTextAlignmentCenter,value_appConfigInt[iconVertIndex]);
  offset+=iconrect.size.h;
  offset+=ICON_MARGIN;
  
  write_text2(ctx,name2,fontsize,"",0,GSize(0,0),GRect(vpos.origin.x-10,
                                                       vpos.origin.y+offset,
                                                       vpos.size.w+20,
                                                       30),
             GTextAlignmentCenter,value_appConfigInt[colorVertIndex]);
}
void update_week_v(GContext *ctx,uint8_t position,uint8_t type,uint16_t offset){
  GRect vpos=get_vertical_status_GRect(position);
  vpos.origin.y+=offset;
  char buf[3]; 
  time_t now = time(NULL);
  struct tm *tick = localtime(&now);
  /*if(verticalIconsSizes[position] && (type == STATUS_V_WEEK_MON_YEAR || type == STATUS_V_WEEK_SUN_YEAR)) {
    snprintf(buf, sizeof(buf), "'%d", tick->tm_year-100);
    offset+=write_text2(ctx,buf,0,"",0,GSize(0,0), GRect(vpos.origin.x-10,
                                                                    vpos.origin.y+offset,
                                                                    vpos.size.w+20,
                                                                    30),
             GTextAlignmentCenter,value_appConfigInt[colorVertIndex]);
    offset+=ICON_MARGIN/2;
  }
  */
  GRect iconrect=GRect(((vpos.size.w-ICON_WEEK_WIDTH)/2)+vpos.origin.x,vpos.origin.y+offset,ICON_WEEK_WIDTH,ICON_WEEK_HEIGHT);
  int imageresource=(RESOURCE_ID_IMAGE_WEEK);
  draw_bitmap(ctx, imageresource, iconrect, value_appConfigInt[iconVertIndex], value_appConfigInt[iconbgVertIndex]);
  strftime(buf, 3, (type == STATUS_V_WEEK_SUN)?"%U":"%V", tick);
  if(buf[0]=='0') {
    buf[0]=buf[1];
    buf[1]=0;
  }
  uint8_t iconpaddings[4]={10,2,3,(buf[1]!=0)?1:2};
  write_text2(ctx,buf,0,"",0,GSize(0,0),GRect(iconrect.origin.x+iconpaddings[3],
                                              iconrect.origin.y+iconpaddings[0],
                                              ICON_DATE_WIDTH-(iconpaddings[3]+iconpaddings[1]),
                                              30),
             GTextAlignmentCenter,value_appConfigInt[iconVertIndex]);
  offset+=iconrect.size.h;
  uint8_t day=tick->tm_wday+1;
  if (type == STATUS_V_WEEK_MON) day--;
  if(day == 0) day=7;
  day--;
  iconrect=GRect(iconrect.origin.x+3+day*3,
                 iconrect.origin.y+iconrect.size.h-7,
                 2,
                 2);
  draw_rect(ctx,intToColor(value_appConfigInt[iconVertIndex]),GColorClear,(uint8_t[4]){0,0,0,0} ,iconrect);
}
void update_weather_c_v(GContext *ctx,uint8_t position,uint8_t value_weatherIconC,int value_tempCurrent,int value_weatherWindspeed,uint8_t value_weatherHum, char d_error,uint16_t offset){
  GRect vpos=get_vertical_status_GRect(position);
  vpos.origin.y+=offset;
  char buf[7]; 
  offset=0;
  //value_weatherWindspeed=200;
  //value_weatherHum=100;
  if(value_weatherHum == 100) value_weatherHum=99;
  //value_tempCurrent=-99;
  if(verticalIconsSizes[position] || value_tempCurrent==-1000) {
    if(value_weatherWindspeed >= 0){
      snprintf(buf, sizeof(buf), "%d", value_weatherWindspeed);
      offset+=write_text2(ctx,buf,((verticalIconsSizes[position] && value_tempCurrent==-1000))?0:1,"",0,GSize(0,0),GRect(vpos.origin.x-10,
                                                    vpos.origin.y+offset,
                                                    vpos.size.w+20,
                                                    30),
                 GTextAlignmentCenter,value_appConfigInt[colorVertIndex]);
      offset+=1;
      uint8_t ln=0;
      if(value_appConfigInt[tempMetricIndex] == 1){
        buf[ln++]='k';
        buf[ln++]='m';
        //buf4[ln++]='/';
      }
      else{
        buf[ln++]='m';
        buf[ln++]='p';
      }
      buf[ln++]='h';
      buf[ln++]='\0';
      offset+=write_text2(ctx,buf,((verticalIconsSizes[position] && value_tempCurrent==-1000))?1:2,"",0,GSize(0,0),GRect(vpos.origin.x-10,
                                                          vpos.origin.y+offset,
                                                          vpos.size.w+20,
                                                          30),
                 GTextAlignmentCenter,value_appConfigInt[colorVertIndex]);
      if(d_error == 'w' || d_error == 'd'){
        graphics_context_set_fill_color(ctx,intToColor(value_appConfigInt[iconbgVertIndex]));
        graphics_fill_rect(ctx, GRect(vpos.size.w/2-5,vpos.origin.y+offset-10,9,10), 1, GCornersAll );
        write_text2(ctx,"x",2,"",0,GSize(0,0),GRect(vpos.size.w/2-5,
                                                    vpos.origin.y+offset-10,
                                                    9,
                                                    30),
                    GTextAlignmentCenter,value_appConfigInt[iconVertIndex]);
      }
      offset+=ICON_MARGIN;
    }
    if(value_weatherHum < 200){
      snprintf(buf, sizeof(buf), "%d", value_weatherHum);
      
      offset+=write_text2(ctx,buf,0,"%",2,GSize(0,100),GRect(vpos.origin.x-10,
                                                             vpos.origin.y+offset,
                                                             vpos.size.w+20,
                                                             30),
                 GTextAlignmentCenter,value_appConfigInt[colorVertIndex]);
      
      offset+=ICON_MARGIN;
    }
  }
  if(value_tempCurrent > -1000){
    GRect iconrect=GRect(((vpos.size.w-ICON_WEATHER_WIDTH)/2)+vpos.origin.x,vpos.origin.y+offset,ICON_WEATHER_WIDTH,ICON_WEATHER_HEIGHT);
    int imageresource=(WEATHER_ICONS[value_weatherIconC]);
    draw_bitmap(ctx, imageresource, iconrect, value_appConfigInt[iconVertIndex], value_appConfigInt[iconbgVertIndex]);
    offset+=iconrect.size.h;
    offset+=3;
    //d_error='w';
    if(d_error == 'w' || d_error == 'd'){
      draw_derror(ctx,value_appConfigInt[iconbgVertIndex],value_appConfigInt[iconVertIndex],GPoint(iconrect.origin.x+ICON_WEATHER_WIDTH-9,iconrect.origin.y+ICON_WEATHER_HEIGHT-10));
      /*graphics_context_set_fill_color(ctx,intToColor(value_appConfigInt[iconbgVertIndex]));
      graphics_fill_rect(ctx, GRect(iconrect.origin.x+ICON_WEATHER_WIDTH-9,iconrect.origin.y+ICON_WEATHER_HEIGHT-10,9,10), 1, GCornersAll );
      write_text2(ctx,"x",2,"",0,GSize(0,0),GRect(iconrect.origin.x+ICON_WEATHER_WIDTH-9,
                                         iconrect.origin.y+ICON_WEATHER_HEIGHT-10,
                                         9,
                                         30),
                           GTextAlignmentCenter,value_appConfigInt[iconVertIndex]);*/
    }
    snprintf(buf, sizeof(buf), "%d", value_tempCurrent);
    write_text2(ctx,buf,0,(value_tempCurrent > -100 && value_tempCurrent < 100)?"°":"",1,GSize((value_tempCurrent<-9)?-2:-1,-20),GRect(vpos.origin.x-10,
                                                                                                            vpos.origin.y+offset,
                                                                                                            vpos.size.w+1+20,
                                                                                                            30),
               GTextAlignmentCenter,value_appConfigInt[colorVertIndex]);
  }
}
void update_weather_f_v(GContext *ctx,uint8_t position,int value_tempMin, int value_tempMax,uint8_t value_weatherIconF,char d_error,uint16_t offset){
  //value_tempMax=-99;
  //value_tempMin=-99;
  GRect vpos=get_vertical_status_GRect(position);
  vpos.origin.y+=offset;
  char buf[6]; 
  offset=0;
  uint8_t small=2;
  if(verticalIconsSizes[position]) {
    small=1;
  }
  GRect iconrect=GRect(((vpos.size.w-ICON_WEATHER_WIDTH)/2)+vpos.origin.x,vpos.origin.y+offset,ICON_WEATHER_WIDTH,ICON_WEATHER_HEIGHT);
  int imageresource=(WEATHER_ICONS[value_weatherIconF]);
  draw_bitmap(ctx, imageresource, iconrect, value_appConfigInt[iconVertIndex], value_appConfigInt[iconbgVertIndex]);
  offset+=iconrect.size.h;
  offset+=ICON_MARGIN+1-small;
  if(d_error == 'w' || d_error == 'd'){
    draw_derror(ctx,value_appConfigInt[iconbgVertIndex],value_appConfigInt[iconVertIndex],GPoint(iconrect.origin.x+ICON_WEATHER_WIDTH-9,iconrect.origin.y+ICON_WEATHER_HEIGHT-10));
    /*graphics_context_set_fill_color(ctx,intToColor(value_appConfigInt[iconbgVertIndex]));
    graphics_fill_rect(ctx, GRect(iconrect.origin.x+ICON_WEATHER_WIDTH-9,iconrect.origin.y+ICON_WEATHER_HEIGHT-10,9,10), 1, GCornersAll );
    write_text2(ctx,"x",2,"",0,GSize(0,0),GRect(iconrect.origin.x+ICON_WEATHER_WIDTH-9,
                                       iconrect.origin.y+ICON_WEATHER_HEIGHT-10,
                                       9,
                                       30),
                         GTextAlignmentCenter,value_appConfigInt[iconVertIndex]);*/
  }
  snprintf(buf, sizeof(buf), "%d", value_tempMax);
  offset+=write_text2(ctx,buf,small,"°",small,GSize(small-1,0),GRect(vpos.origin.x-10,
                                                          vpos.origin.y+offset,
                                                          vpos.size.w+20,
                                                          30),
             GTextAlignmentCenter,value_appConfigInt[colorVertIndex]);
  offset+=ICON_MARGIN+1-small;
  draw_rect(ctx,intToColor(value_appConfigInt[colorVertIndex]),GColorClear, (uint8_t[4]){0,0,0,0}, GRect(iconrect.origin.x+((small==2)?2:0),
                                                                                                         vpos.origin.y+offset,
                                                                                                         iconrect.size.w-((small==2)?4:0),
                                                                                                         ICON_MARGIN) );
  offset+=ICON_MARGIN*2+1-small;
  snprintf(buf, sizeof(buf), "%d", value_tempMin);
  offset+=write_text2(ctx,buf,small,"°",small,GSize(small-1,0),GRect(vpos.origin.x-10,
                                                          vpos.origin.y+offset,
                                                          vpos.size.w+20,
                                                          30),
             GTextAlignmentCenter,value_appConfigInt[colorVertIndex]);
}
#ifdef PBL_HEALTH
void update_steps_v(GContext *ctx,uint8_t position,int steps,uint16_t offset){
  //int steps=value_steps;
  GRect vpos=get_vertical_status_GRect(position);
  vpos.origin.y+=offset;
  offset=0;
  GRect iconrect=GRect(((vpos.size.w-ICON_STEPS_WIDTH)/2)+vpos.origin.x,vpos.origin.y+offset,ICON_STEPS_WIDTH,ICON_STEPS_HEIGHT);
  int imageresource=(RESOURCE_ID_IMAGE_STEPS);
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "update_steps vpos.x=%d, vpos.y=%d, steps:%d, position:%i",vpos.x,vpos.y,steps,position);
	#endif 
  draw_bitmap(ctx, imageresource, iconrect, value_appConfigInt[iconVertIndex], value_appConfigInt[iconbgVertIndex]);
  offset+=iconrect.size.h;
  offset+=ICON_MARGIN;
  char buf[5]; 
  //int steps=get_storage_int(stepsIndex,0,0);
  if(steps < 1000) snprintf(buf, sizeof(buf), "%d", steps);
  else if(steps < 10000)  snprintf(buf, sizeof(buf), "%d.%dk", steps/1000,(steps%1000)/100);
  else if(steps < 100000) snprintf(buf, sizeof(buf), "%dk", steps/1000);
  else snprintf(buf, sizeof(buf), "%dM", steps/1000000);
  write_text2(ctx,buf,1,"",0,GSize(0,0),GRect(vpos.origin.x-10,
                                              vpos.origin.y+offset,
                                              vpos.size.w+20,
                                              30),
             GTextAlignmentCenter,value_appConfigInt[colorVertIndex]);
}
void update_hr_v(GContext *ctx,uint8_t position,int value_hrbpm,uint16_t offset){
  GRect vpos=get_vertical_status_GRect(position);
  vpos.origin.y+=offset;
  offset=0;
  GRect iconrect=GRect(((vpos.size.w-ICON_HR_WIDTH)/2)+vpos.origin.x,vpos.origin.y+offset,ICON_HR_WIDTH,ICON_HR_HEIGHT);
  int imageresource=(RESOURCE_ID_IMAGE_HR);
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "update_hr vpos.x=%d, vpos.y=%d, bpm:%i",vpos.x,vpos.y,value_hrbpm);
	#endif 
  draw_bitmap(ctx, imageresource, iconrect, value_appConfigInt[iconVertIndex], value_appConfigInt[iconbgVertIndex]);
  offset+=iconrect.size.h;
  offset+=ICON_MARGIN;
  char buf[4]; 
  snprintf(buf, sizeof(buf), "%i", value_hrbpm);
  write_text2(ctx,buf,0,"",0,GSize(0,0),GRect(vpos.origin.x-10,
                                              vpos.origin.y+offset,
                                              vpos.size.w+20,
                                              30),
             GTextAlignmentCenter,value_appConfigInt[colorVertIndex]);
}
#endif
void update_status_v(GContext *ctx, char downloaderror, bool btConnected, bool showSeconds){
  int8_t x=(value_appConfigInt[vertPosIndex] == 2)?1:0;
  int16_t y=ICON_STATUS_MARGIN/2;
  #ifdef PBL_ROUND
  y=42;
  y=45;
  if(((value_appConfigInt[statusPositionIndex]%5)%2)==0) {
    y=PBL_DISPLAY_HEIGHT-ICON_STATUS_HEIGHT-y;
  } 
  //else y+=35;
  x=-3;
  if((value_appConfigInt[statusPositionIndex]%5) < 3) x=x*-1;
  #else
  if(((value_appConfigInt[statusPositionIndex]%5)%2)==0) {
    y=PBL_DISPLAY_HEIGHT-(y+ICON_STATUS_HEIGHT);
  }
  #endif
  GRect iconrect=GRect(((get_vert_width()-ICON_STATUS_WIDTH)/2)+x,y,ICON_STATUS_WIDTH,ICON_STATUS_HEIGHT);
  if(showSeconds){
    char buf[4];
    time_t now = time(NULL);
    struct tm *tick = localtime(&now);
    uint8_t secs=tick->tm_sec;
    iconrect.origin.x-=2;
    iconrect.size.w+=4;
    //snprintf(buf, sizeof(buf), "%s%02d", (secs%2)?":":" ",secs);
    snprintf(buf, sizeof(buf), "%02d",secs);
    write_text2(ctx,":",0,buf,0,GSize(0,1),iconrect,
             GTextAlignmentCenter,value_appConfigInt[colorVertIndex]);
  }
  else{
    int resource=RESOURCE_ID_IMAGE_NOSILENT;
    if(((uint8_t)downloaderror) > 0) resource=RESOURCE_ID_IMAGE_DERROR;
    if(get_quiet_time_enabled()) {
      resource=RESOURCE_ID_IMAGE_SILENT;
      if(((uint8_t)downloaderror) > 0) resource=RESOURCE_ID_IMAGE_DERROR_SILENT;
    }
    //no internet (error on download info or temp)
    if(!btConnected) {
      resource=RESOURCE_ID_IMAGE_DISCONNECTED;
    }
    draw_bitmap(ctx, resource, iconrect, value_appConfigInt[iconVertIndex], value_appConfigInt[iconbgVertIndex]);
  }
}
