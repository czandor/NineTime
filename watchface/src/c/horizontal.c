#include <pebble.h>
#include "horizontal.h"
#include "colors.h"
#include "draw.h"

////////////////////////////  HORIZONTAL FUNCTIONS   //////////////////////////////////////////////////////////////////////////////////////

static GRect get_horizontal_status_GRect(uint8_t position){
  int8_t y=0;
  int8_t x=0;
  if(value_appConfigInt[horPosIndex] == 2) {
    y++;
  }
  #ifdef PBL_ROUND
  else{
    y+=PBL_DISPLAY_OFFSET_Y;
  }
  x+=get_vert_width()/2;
  return GRect(x,y,get_hor_width_full()-(x*2),get_hor_height());
  #else
  return GRect(x,y,get_hor_width()-(x*2),get_hor_height());
  #endif
}

void update_date_h(GContext *ctx,uint8_t position,char *dayname,uint8_t mday,char *monthname){
  GRect vpos=get_horizontal_status_GRect(position);
  GRect iconrect=GRect(((vpos.size.w-ICON_DATE_WIDTH)/2)+vpos.origin.x,((vpos.size.h-ICON_DATE_HEIGHT)/2)+vpos.origin.y,ICON_DATE_WIDTH,ICON_DATE_HEIGHT);
  int imageresource=(RESOURCE_ID_IMAGE_DATE);
  draw_bitmap(ctx, imageresource, iconrect, value_appConfigInt[iconHorIndex+position], value_appConfigInt[iconbgHorIndex+position]);
  uint8_t iconpaddings[4]={4,2,3,(mday>9 && mday < 20)?1:2};
  write_text2(ctx,dayname,0,"",0,GSize(0,0),GRect(0,
                                              iconrect.origin.y+iconpaddings[0],
                                              iconrect.origin.x-(ICON_MARGIN),
                                              30),
                       GTextAlignmentRight,value_appConfigInt[colorHorIndex+position]);
  char buf[3]; 
  snprintf(buf, sizeof(buf), "%d", mday);
  write_text2(ctx,buf,0,"",0,GSize(0,0),GRect(iconrect.origin.x+iconpaddings[3],
                                              iconrect.origin.y+iconpaddings[0],
                                              iconrect.size.w-(iconpaddings[3]+iconpaddings[1]),
                                              30),
                       GTextAlignmentCenter,value_appConfigInt[iconHorIndex+position]);
  write_text2(ctx,monthname,0,"",0,GSize(0,0),GRect(iconrect.origin.x+iconrect.size.w+ICON_MARGIN,
                                                    iconrect.origin.y+iconpaddings[0],
                                                    iconrect.origin.x-(ICON_MARGIN),
                                                    30),
                       GTextAlignmentLeft,value_appConfigInt[colorHorIndex+position]);
  
}
void update_string_h(GContext *ctx,uint8_t position,char* szoveg, char d_error,int16_t offset_x,GTextAlignment alignment){
  GRect vpos=get_horizontal_status_GRect(position);
  if(offset_x > 0) {
    vpos.origin.x+=offset_x;
    vpos.size.w-=offset_x;
  }
  if(offset_x < 0) {
    vpos.size.w+=offset_x;
  }
  //GSize size=graphics_text_layout_get_content_size(szoveg, fonts_get_system_font(TEXTFONT), GRect(0,0,2000,100), GTextOverflowModeWordWrap, alignment);
  uint8_t small=0;
  GSize size=get_text_size(szoveg,small,0);
  uint8_t padding=1;
  int8_t textypos=((vpos.size.h-FONT_HEIGHT)/2);
  if(size.w > (vpos.size.w-padding*2)) {
    small=1;
    textypos=((vpos.size.h-FONT_SMALL_HEIGHT)/2);
    #ifdef PBL_ROUND
    if(value_appConfigInt[horPosIndex] == 1) textypos+=4;
    else textypos-=4;
    #endif
    //size=graphics_text_layout_get_content_size(szoveg, fonts_get_system_font(TEXTFONTSMALL), GRect(0,0,vpos.size.w-padding*2,100), GTextOverflowModeWordWrap, alignment);
    size=get_text_size(szoveg,small,vpos.size.w-padding*2);
    if(size.h > 20) {
      textypos=((vpos.size.h-FONT_TINY_HEIGHT)/2);
      small=2;
      //size=graphics_text_layout_get_content_size(szoveg, fonts_get_system_font(TEXTFONTTINY), GRect(0,0,vpos.size.w-padding*2,100), GTextOverflowModeWordWrap, alignment);
      size=get_text_size(szoveg,small,vpos.size.w-padding*2);
      if(size.h > 16) textypos=(value_appConfigInt[horPosIndex] == 1)?1:3;
    }
  }
  write_text2(ctx,szoveg,small,"",0,GSize(0,0),GRect(vpos.origin.x+padding,
                                                     textypos,
                                                     vpos.size.w-padding*2,
                                                     30),
                       alignment,value_appConfigInt[colorHorIndex+position]);
  
  if(d_error == 'i' || d_error == 'd'){
    //GRect vpos=get_horizontal_status_GRect(position);
    //GRect iconrect=GRect((vpos.size.w/2)-4,vpos.size.h-10,9,10);
    draw_derror(ctx,value_appConfigInt[iconbgHorIndex+position],value_appConfigInt[iconHorIndex+position],GPoint((vpos.size.w/2)-4+vpos.origin.x,vpos.size.h-10));
    /*graphics_context_set_fill_color(ctx,intToColor(value_appConfigInt[iconbgHorIndex+position]));
    graphics_fill_rect(ctx, GRect(iconrect.origin.x,iconrect.origin.y,iconrect.size.w,iconrect.size.h), 1, GCornersAll );
    write_text2(ctx,"x",2,"",0,GSize(0,0),GRect(iconrect.origin.x,
                                          iconrect.origin.y,
                                          iconrect.size.w,
                                          30),
                  GTextAlignmentCenter,value_appConfigInt[iconHorIndex+position]);*/
  }
}
static bool format_date(char *bufdate,uint8_t bufsize,bool withname,char *dayname){
  uint8_t dateformat=(value_appConfigInt[dateformatIndex]%20)%10;
  char bufdatename[11];
  if(((value_appConfigInt[dateformatIndex]%20)/10)==0 || !withname) bufdatename[0]=(char)0;
  else snprintf(bufdatename, sizeof(bufdatename), "%s ", dayname);
  time_t now = time(NULL);
  struct tm *tick = localtime(&now);
  uint8_t year=tick->tm_year%100;
  uint8_t month=tick->tm_mon+1;
  uint8_t mday=tick->tm_mday;
  uint8_t digit1=year;
  uint8_t digit2=month;
  uint8_t digit3=mday;
  char datesep[2]="-";
  if(dateformat==3 || dateformat==4 || dateformat==5){
    digit3=year;
    digit1=mday;
  }
  if(dateformat==6){
    digit3=year;
    digit1=month;
    digit2=mday;
  }
  if(dateformat==1 || dateformat==3) datesep[0]='.';
  if(dateformat==2 || dateformat==4 || dateformat==6) datesep[0]='/';
  /*switch(dateformat){
    case 0:
    snprintf(bufdate,bufsize, "%s%02d-%02d-%02d", bufdatename,year,month,mday);
    break;
    case 1:
    snprintf(bufdate, bufsize, "%s%02d.%02d.%02d", bufdatename,year,month,mday);
    break;
    case 2:
    snprintf(bufdate, bufsize, "%s%02d/%02d/%02d", bufdatename,year,month,mday);
    break;
    case 3:
    snprintf(bufdate, bufsize, "%s%02d.%02d.%02d", bufdatename,mday,month,year);
    break;
    case 4:
    snprintf(bufdate, bufsize, "%s%02d/%02d/%02d", bufdatename,mday,month,year);
    break;
    case 5:
    snprintf(bufdate, bufsize, "%s%02d-%02d-%02d", bufdatename,mday,month,year);
    break;
    case 6:
    snprintf(bufdate, bufsize, "%s%02d/%02d/%02d", bufdatename,month,mday,year);
    break;
    default:
    //vandate=false;
    //bufdate[0]=(char)0;
    return false;
    break;
  }
  return true;*/
  snprintf(bufdate, bufsize, "%s%02d%s%02d%s%02d", bufdatename,digit1,datesep,digit2,datesep,digit3);
  return (dateformat<7);
}
bool format_time(char *buftime,uint8_t bufsize,bool needsecs){
  time_t now = time(NULL);
  struct tm *tick = localtime(&now);
  uint8_t h=tick->tm_hour;
  uint8_t m=tick->tm_min;
  uint8_t s=tick->tm_sec;
  char bufampm[7];
  uint8_t timeformat=value_appConfigInt[dateformatIndex]/20;
  if(!clock_is_24h_style()) if(h >=13) {
    h-=12;
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
        return false;
        break;
    }
  }
  else{
    h+=(h<1)?12:0;
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
        return false;
        break;
    }
  }
  else bufampm[0]='\0';
  char timesep[2]=":";
  if(timeformat==1) timesep[0]='.';
  /*switch(timeformat){
    case 2:
    case 0:
      snprintf(buftime, bufsize, "%d:%02d%s", h,m,bufampm);
      break;
    case 1:
      snprintf(buftime, bufsize, "%d.%02d%s", h,m,bufampm );
      break;
    default:
      return false;
      break;
  }*/
  if(needsecs) snprintf(buftime, bufsize, "%d%s%02d%s%02d%s", h,timesep,m,timesep,s,bufampm );
  else snprintf(buftime, bufsize, "%d%s%02d%s", h,timesep,m,bufampm );
  return (timeformat<3);
}
void update_date_txt_h(GContext *ctx,uint8_t position,uint8_t type,char *dayname,bool needsecs){
  char buf[21]; 
  char bufdate[23]; 
  char buftime[15]; 
  bool vandate=true;
  bool vantime=true;
  //time_t now = time(NULL);
  //struct tm *tick = localtime(&now);
  //uint8_t dateformat=(value_appConfigInt[dateformatIndex]%20)%10;
  //char bufdatename[11];
  //if(((value_appConfigInt[dateformatIndex]%20)/10)==0) bufdatename[0]=(char)0;
  //else snprintf(bufdatename, sizeof(bufdatename), "%s ", dayname);
  //uint8_t timeformat=value_appConfigInt[dateformatIndex]/20;
  if(type == STATUS_H_DATE_FULL || type == STATUS_H_DATETIME){
    vandate=format_date(bufdate,sizeof(bufdate),true,dayname);
    /*uint8_t year=tick->tm_year%100;
    uint8_t month=tick->tm_mon+1;
    uint8_t mday=tick->tm_mday;
    switch(dateformat){
      case 0:
        snprintf(bufdate, sizeof(bufdate), "%s%02d-%02d-%02d", bufdatename,year,month,mday);
        break;
      case 1:
        snprintf(bufdate, sizeof(bufdate), "%s%02d.%02d.%02d", bufdatename,year,month,mday);
        break;
      case 2:
        snprintf(bufdate, sizeof(bufdate), "%s%02d/%02d/%02d", bufdatename,year,month,mday);
        break;
      case 3:
        snprintf(bufdate, sizeof(bufdate), "%s%02d.%02d.%02d", bufdatename,mday,month,year);
        break;
      case 4:
        snprintf(bufdate, sizeof(bufdate), "%s%02d/%02d/%02d", bufdatename,mday,month,year);
        break;
      case 5:
        snprintf(bufdate, sizeof(bufdate), "%s%02d-%02d-%02d", bufdatename,mday,month,year);
        break;
      case 6:
        snprintf(bufdate, sizeof(bufdate), "%s%02d/%02d/%02d", bufdatename,month,mday,year);
        break;
      default:
        vandate=false;
        break;
    }*/
  }
  else vandate=false;
  
  if(type == STATUS_H_DATETIME || type == STATUS_H_TIME || type == STATUS_H_TIME_SEC){
    vantime=format_time(buftime,sizeof(buftime),needsecs);
    /*uint8_t h=tick->tm_hour;
    uint8_t m=tick->tm_min;
    char bufampm[7];
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
          return false;
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
          return false;
          break;
      }
    }
    else bufampm[0]='\0';
    if(vantime) switch(timeformat){
      case 2:
      case 0:
        snprintf(buftime, sizeof(buftime), "%d:%02d%s", h,m,bufampm);
        break;
      case 1:
        snprintf(buftime, sizeof(buftime), "%d.%02d%s", h,m,bufampm );
        break;
      default:
        vantime=false;
        break;
    }*/
  }
  else vantime=false;
  if(vantime&&vandate) snprintf(buf, sizeof(buf), "%s %s", bufdate, buftime);
  else if(vantime) snprintf(buf, sizeof(buf), "%s", buftime);
  else snprintf(buf, sizeof(buf), "%s", bufdate);
  update_string_h(ctx,position,buf,(char)0,0,GTextAlignmentCenter);
}
void update_weather_c_h(GContext *ctx,uint8_t position,int value_tempCurrent,int value_weatherWindspeed,uint8_t value_weatherIconC,uint8_t value_humCurrent, char d_error){
  GRect vpos=get_horizontal_status_GRect(position);
  uint8_t ln=0;
  char buf[8]; 
  snprintf(buf, sizeof(buf), "%d°", value_tempCurrent);
  
  char buf3[8]="humid."; 
  if (value_weatherWindspeed >= 0){
    snprintf(buf3, sizeof(buf3), "%d ", value_weatherWindspeed);
    ln=strlen(buf3);
    if(value_appConfigInt[tempMetricIndex] == 1){
      buf3[ln++]='k';
      buf3[ln++]='m';
    }
    else{
      buf3[ln++]='m';
      buf3[ln++]='p';
    }
    
    buf3[ln++]='h';
    buf3[ln++]='\0';
    }
  char buf4[4]; 
  snprintf(buf4, sizeof(buf4), "%d", value_humCurrent);
  
  //GSize textsize=graphics_text_layout_get_content_size(buf, fonts_get_system_font(TEXTFONT), GRect(0,0,2000,30), GTextOverflowModeWordWrap, GTextAlignmentCenter);
  GSize textsize=get_text_size(buf,0,0);
  //GSize textsize3=graphics_text_layout_get_content_size(buf3, fonts_get_system_font(TEXTFONTTINY), GRect(0,0,2000,30), GTextOverflowModeWordWrap, GTextAlignmentCenter);
  GSize textsize3=get_text_size(buf3,2,0);
  
  uint8_t fullwidth=ICON_WEATHER_WIDTH+ICON_MARGIN*1+textsize.w+textsize3.w;
  
  GRect iconrect=GRect(((vpos.size.w-fullwidth)/2)+vpos.origin.x,((vpos.size.h-ICON_WEATHER_HEIGHT)/2)+vpos.origin.y,ICON_WEATHER_WIDTH,ICON_WEATHER_HEIGHT);
  int imageresource=(WEATHER_ICONS[value_weatherIconC]);
  draw_bitmap(ctx, imageresource, iconrect, value_appConfigInt[iconHorIndex+position], value_appConfigInt[iconbgHorIndex+position]);
  
  if(d_error == 'w' || d_error == 'd'){
    draw_derror(ctx,value_appConfigInt[iconbgHorIndex+position],value_appConfigInt[iconHorIndex+position],GPoint(iconrect.origin.x+ICON_WEATHER_WIDTH-9,iconrect.origin.y+ICON_WEATHER_HEIGHT-10));
    /*graphics_context_set_fill_color(ctx,intToColor(value_appConfigInt[iconbgHorIndex+position]));
    graphics_fill_rect(ctx, GRect(iconrect.origin.x+ICON_WEATHER_WIDTH-9,iconrect.origin.y+ICON_WEATHER_HEIGHT-10,9,10), 1, GCornersAll );
    write_text2(ctx,"x",2,"",0,GSize(0,0),GRect(iconrect.origin.x,
                                                iconrect.origin.y+ICON_WEATHER_HEIGHT-10,
                                                ICON_WEATHER_WIDTH-1,
                                                30),
                  GTextAlignmentRight,value_appConfigInt[iconHorIndex+position]);*/
  }
  snprintf(buf, sizeof(buf), "%d", value_tempCurrent);
  write_text2(ctx,buf,0,"°",1,GSize(0,0),GRect(iconrect.origin.x+ICON_WEATHER_WIDTH+ICON_MARGIN*1,
                                              ((vpos.size.h-FONT_HEIGHT)/2)+vpos.origin.y,
                                              vpos.size.w/2,
                                              30),
                  GTextAlignmentLeft,value_appConfigInt[colorHorIndex+position]);
  write_text2(ctx,buf4,1,"%",2,GSize(0,100),GRect(iconrect.origin.x+ICON_WEATHER_WIDTH+ICON_MARGIN*1+textsize.w,
                                               ((vpos.size.h-FONT_TINY_HEIGHT-FONT_SMALL_HEIGHT-ICON_MARGIN-1)/2)+vpos.origin.y,
                                               textsize3.w,
                                               30),
                  GTextAlignmentCenter,value_appConfigInt[colorHorIndex+position]);
  write_text2(ctx,buf3,2,"",0,GSize(0,0),GRect(iconrect.origin.x+ICON_WEATHER_WIDTH+ICON_MARGIN*1+textsize.w,
                                               ((vpos.size.h-FONT_TINY_HEIGHT-FONT_SMALL_HEIGHT-ICON_MARGIN-1)/2)+FONT_SMALL_HEIGHT+ICON_MARGIN+1+vpos.origin.y,
                                               textsize3.w,
                                               30),
                  GTextAlignmentCenter,value_appConfigInt[colorHorIndex+position]);
}
void update_weather_f_h(GContext *ctx,uint8_t position,int value_tempMin, int value_tempMax,uint8_t value_weatherIconF,char d_error){
 GRect vpos=get_horizontal_status_GRect(position);
  
  char buf[8]; 
  char buf2[8]; 
  snprintf(buf, sizeof(buf), "%d ", value_tempMax);
  snprintf(buf2, sizeof(buf2), "/%d ", value_tempMin);

  //GSize textsize=graphics_text_layout_get_content_size(buf, fonts_get_system_font(TEXTFONT), GRect(0,0,2000,30), GTextOverflowModeWordWrap, GTextAlignmentCenter);
  GSize textsize=get_text_size(buf,0,0);
  //GSize textsize2=graphics_text_layout_get_content_size(buf2, fonts_get_system_font(TEXTFONT), GRect(0,0,2000,30), GTextOverflowModeWordWrap, GTextAlignmentCenter);
  GSize textsize2=get_text_size(buf2,0,0);
  
  uint8_t fullwidth=ICON_WEATHER_WIDTH+ICON_MARGIN*1+textsize.w+textsize2.w;
  
  GRect iconrect=GRect(((vpos.size.w-fullwidth)/2)+vpos.origin.x,((vpos.size.h-ICON_WEATHER_HEIGHT)/2)+vpos.origin.y,ICON_WEATHER_WIDTH,ICON_WEATHER_HEIGHT);
  int imageresource=(WEATHER_ICONS[value_weatherIconF]);
  draw_bitmap(ctx, imageresource, iconrect, value_appConfigInt[iconHorIndex+position], value_appConfigInt[iconbgHorIndex+position]);
  if(d_error == 'w' || d_error == 'd'){
    //draw_bitmap(ctx, imageresource, iconrect, value_appConfigInt[iconHorIndex+position], value_appConfigInt[iconbgHorIndex+position]);
    draw_derror(ctx,value_appConfigInt[iconbgHorIndex+position],value_appConfigInt[iconHorIndex+position],GPoint(iconrect.origin.x+ICON_WEATHER_WIDTH-9,iconrect.origin.y+ICON_WEATHER_HEIGHT-10));
    /*graphics_context_set_fill_color(ctx,intToColor(value_appConfigInt[iconbgHorIndex+position]));
    graphics_fill_rect(ctx, GRect(iconrect.origin.x+ICON_WEATHER_WIDTH-9,iconrect.origin.y+ICON_WEATHER_HEIGHT-10,9,10), 1, GCornersAll );
    write_text2(ctx,"x",2,"",0,GSize(0,0),GRect(iconrect.origin.x,
                                                iconrect.origin.y+ICON_WEATHER_HEIGHT-10,
                                                ICON_WEATHER_WIDTH-1,
                                                30),
                         GTextAlignmentRight,value_appConfigInt[iconHorIndex+position]);*/
  }
  snprintf(buf, sizeof(buf), "%d", value_tempMax);
  snprintf(buf2, sizeof(buf2), "/%d", value_tempMin);
  write_text2(ctx,buf,0,"°",2,GSize(0,0),GRect(iconrect.origin.x+ICON_WEATHER_WIDTH+ICON_MARGIN*1,
                                               ((vpos.size.h-FONT_HEIGHT)/2)+vpos.origin.y,
                                               vpos.size.w,
                                               30),
                         GTextAlignmentLeft,value_appConfigInt[colorHorIndex+position]);
  write_text2(ctx,buf2,0,"°",2,GSize(0,0),GRect(iconrect.origin.x+ICON_WEATHER_WIDTH+ICON_MARGIN*1+textsize.w,
                                                ((vpos.size.h-FONT_HEIGHT)/2)+vpos.origin.y,
                                                vpos.size.w,
                                                30),
                         GTextAlignmentLeft,value_appConfigInt[colorHorIndex+position]);
}
void update_counter_h(GContext *ctx,uint8_t position,char *szoveg, int16_t number,GTextAlignment alignment){
  GRect vpos=get_horizontal_status_GRect(position);
  if(alignment == GTextAlignmentCenter) return;
  char buf[6];
  snprintf(buf, sizeof(buf), "%d", number);
  //GSize textsize=graphics_text_layout_get_content_size(buf, fonts_get_system_font(TEXTFONT), GRect(0,0,2000,30), GTextOverflowModeWordWrap, GTextAlignmentCenter);
  GSize textsize=get_text_size(buf,0,0);
  update_string_h(ctx,position,buf,(char)0,(vpos.size.w-(textsize.w+ICON_MARGIN*2))*((alignment==GTextAlignmentLeft)?-1:1),(alignment==GTextAlignmentLeft)?GTextAlignmentRight:GTextAlignmentLeft);
  update_string_h(ctx,position,szoveg,(char)0,(textsize.w+ICON_MARGIN*2)*((alignment==GTextAlignmentLeft)?1:-1),alignment);
}
#ifdef PBL_HEALTH
void update_health_h(GContext *ctx,uint8_t position,int value_steps, int value_hrbpm){
  GRect vpos=get_horizontal_status_GRect(position);
  char bufs[8];
  char bufh[8];
  GSize size;
  uint8_t offset_x;
  uint8_t steptextsize;
  uint8_t small;
  uint8_t fullsize=0;
  if(value_hrbpm==0){
    small=0;
    snprintf(bufs, sizeof(bufs), "%d", value_steps);
    //size=graphics_text_layout_get_content_size(bufs, fonts_get_system_font(TEXTFONT), GRect(0,0,100,100), GTextOverflowModeWordWrap, GTextAlignmentCenter);
    size=get_text_size(bufs,small,0);
    steptextsize=size.w;
    fullsize+=size.w;
    fullsize+=ICON_MARGIN;
    fullsize+=ICON_STEPSH_WIDTH;
  }
  else{
    small=1;
    if(value_steps < 1000) snprintf(bufs, sizeof(bufs), "%d", value_steps);
    else if(value_steps < 10000)  snprintf(bufs, sizeof(bufs), "%d.%dk", value_steps/1000,(value_steps%1000)/100);
    else if(value_steps < 100000) snprintf(bufs, sizeof(bufs), "%dk", value_steps/1000);
    else snprintf(bufs, sizeof(bufs), "%dM", value_steps/1000000);
    //size=graphics_text_layout_get_content_size(bufs, fonts_get_system_font(TEXTFONTSMALL), GRect(0,0,100,100), GTextOverflowModeWordWrap, GTextAlignmentCenter);
    size=get_text_size(bufs,small,0);
    steptextsize=size.w;
    fullsize+=size.w;
    fullsize+=ICON_MARGIN;
    fullsize+=ICON_STEPSH_WIDTH;
    //fullsize+=ICON_MARGIN*2;
    fullsize+=ICON_MARGIN*1;
    fullsize+=ICON_HRH_WIDTH;
    fullsize+=ICON_MARGIN;
    snprintf(bufh, sizeof(bufh), "%d", value_hrbpm);
    //size=graphics_text_layout_get_content_size(bufh, fonts_get_system_font(TEXTFONT), GRect(0,0,100,100), GTextOverflowModeWordWrap, GTextAlignmentCenter);
    size=get_text_size(bufh,0,0);
    fullsize+=size.w;
  }
  offset_x=((vpos.size.w-fullsize)/2)+vpos.origin.x;
  GRect iconrect=GRect(offset_x,((vpos.size.h-ICON_STEPSH_HEIGHT)/2)+vpos.origin.y,ICON_STEPSH_WIDTH,ICON_STEPSH_HEIGHT);
  int imageresource=(RESOURCE_ID_IMAGE_STEPSH);
  draw_bitmap(ctx, imageresource, iconrect, value_appConfigInt[iconHorIndex+position],value_appConfigInt[iconbgHorIndex+position]) ;
  offset_x+=iconrect.size.w;
  offset_x+=ICON_MARGIN/(small+1);
  write_text2(ctx,bufs,small,"",0,GSize(0,0),GRect(offset_x,
                                                (vpos.size.h-FONT_HEIGHT)/2+(FONT_HEIGHT-FONT_SMALL_HEIGHT)*small,
                                                vpos.size.w/2,
                                                30),
                         GTextAlignmentLeft,value_appConfigInt[colorHorIndex+position]);
  //steps=991+digitValues[3];
  if(value_hrbpm>0){
    offset_x+=steptextsize;
    offset_x+=ICON_MARGIN*2;
    iconrect=GRect(offset_x,((vpos.size.h-ICON_HRH_HEIGHT)/2)+vpos.origin.y,ICON_HRH_WIDTH,ICON_HRH_HEIGHT);
    imageresource=(RESOURCE_ID_IMAGE_HRH);
    draw_bitmap(ctx, imageresource, iconrect,value_appConfigInt[iconHorIndex+position], value_appConfigInt[iconbgHorIndex+position]);
    offset_x+=ICON_HRH_WIDTH;
    offset_x+=ICON_MARGIN/(small+1);
    write_text2(ctx,bufh,0,"",0,GSize(0,0),GRect(offset_x,
                                                (vpos.size.h-FONT_HEIGHT)/2,
                                                vpos.size.w/2,
                                                30),
                         GTextAlignmentLeft,value_appConfigInt[colorHorIndex+position]);
  }
}
#endif
#ifdef HOLIDAY
void setHolidayText(GContext *ctx,uint8_t rel,uint8_t position){
  time_t now = time(NULL);
  struct tm *tick = localtime(&now);
  uint8_t year=tick->tm_year;
  uint8_t month=tick->tm_mon;
  uint8_t mday=tick->tm_mday;
  //month=0;
  //mday=1;
  uint8_t holidaysChristian[HolidayChristianCount][3]={
    { 1, 1,  7},
    { 2,14,  1},
    { 3, 8,  1},
    { 4,17,  2},
    { 5, 7,  1},
    { 6,18,  1},
    { 7,1,  31},
    { 8,1,  31},
    {10,31,  1},
    {12,24,  3} 
  };
  
  
  switch(year){
    case 118:
      holidaysChristian[HolidayChristianEasterId][1]=1;
      holidaysChristian[HolidayChristianMotherId][1]=13;
      holidaysChristian[HolidayChristianFatherId][1]=17;
    break;
    case 119:
      holidaysChristian[HolidayChristianEasterId][1]=21;
      holidaysChristian[HolidayChristianMotherId][1]=12;
      holidaysChristian[HolidayChristianFatherId][1]=16;
    break;
    case 120:
      holidaysChristian[HolidayChristianEasterId][1]=12;
      holidaysChristian[HolidayChristianMotherId][1]=10;
      holidaysChristian[HolidayChristianFatherId][1]=21;
    break;
    case 121:
      holidaysChristian[HolidayChristianEasterId][1]=4;
      holidaysChristian[HolidayChristianMotherId][1]=9;
      holidaysChristian[HolidayChristianFatherId][1]=20;
    break;
    case 122:
      holidaysChristian[HolidayChristianEasterId][1]=17;
      holidaysChristian[HolidayChristianMotherId][1]=8;
      holidaysChristian[HolidayChristianFatherId][1]=19;
    break;
    case 123:
      holidaysChristian[HolidayChristianEasterId][1]=9;
      holidaysChristian[HolidayChristianMotherId][1]=14;
      holidaysChristian[HolidayChristianFatherId][1]=18;
    break;
    case 124:
      holidaysChristian[HolidayChristianEasterId][0]=3;
      holidaysChristian[HolidayChristianEasterId][1]=31;
      holidaysChristian[HolidayChristianMotherId][1]=12;
      holidaysChristian[HolidayChristianFatherId][1]=16;
    break;
    case 125:
      holidaysChristian[HolidayChristianEasterId][1]=20;
      holidaysChristian[HolidayChristianMotherId][1]=11;
      holidaysChristian[HolidayChristianFatherId][1]=15;
    break;
    case 126:
      holidaysChristian[HolidayChristianEasterId][1]=5;
      holidaysChristian[HolidayChristianMotherId][1]=10;
      holidaysChristian[HolidayChristianFatherId][1]=21;
    break;
  }
  
  
  
  
  int8_t i;
  int8_t j;
  int8_t current=-1;
  int8_t upcoming=-1;
  //month=2-1;
  //mday=4;
  if(rel == 1){
    // Christian
    for (i = 0 ; i < HolidayChristianCount ; i++){
      if((month+1) == holidaysChristian[i][0] && mday >= holidaysChristian[i][1] && mday < (holidaysChristian[i][1]+holidaysChristian[i][2])) current=i;
      else{
        j=i-1;
        if(j<0) j=HolidayChristianCount-1;
        if(( (month+1) == holidaysChristian[j][0] && mday >= (holidaysChristian[j][1]+holidaysChristian[j][2]) ) ||
           ( (month+1) == holidaysChristian[i][0] && mday < holidaysChristian[i][1] ) ||
           ( (month+1) > holidaysChristian[j][0] && (month+1) < holidaysChristian[i][0])
          ) upcoming=i;
      }
    }
  }
  char holidayText[31];
  if(current >=0 ) {
    snprintf(holidayText, sizeof(holidayText), "%s %s!",HolidayGreetings[HolidayChristianGreetingsId[current]],HolidayChristianTexts[current]);
    if(current == HolidayChristianNewYearId) update_counter_h(ctx,position,holidayText, 1900+year,GTextAlignmentRight);
    else update_string_h(ctx,position,holidayText,(char)0,0,GTextAlignmentCenter);
  }
  else if(upcoming >= 0) {
    uint8_t days=0;
    if((month+1)==holidaysChristian[upcoming][0]) days=holidaysChristian[upcoming][1]-mday;
    else {
      j=holidaysChristian[upcoming][0];
      if(j==1) j=13;
      for (i=(month+1) ; i <= j ; i++){
        if(i==j) days+=holidaysChristian[upcoming][1];
        else{
          uint8_t dayofmonths[12]= {31,28,31,30,31,30,31,31,30,31,30,31};
          if(year == 120) dayofmonths[1]=29;
          if(i==(month+1)) days+=dayofmonths[month]-mday;
          else days+=dayofmonths[i-1];
        }
      }
    }
    //if(days > 1) 
    snprintf(holidayText, sizeof(holidayText), "day%s until %s", ((days>1)?"s":""),HolidayChristianTexts[upcoming]);
    //else snprintf(holidayText, sizeof(holidayText), "day until %s", HolidayChristianTexts[upcoming]);
    update_counter_h(ctx,position,holidayText, days,GTextAlignmentLeft);
  }
  //APP_LOG(APP_LOG_LEVEL_INFO, "setHolidayText current:%d, upcoming:%d text:%s",current,upcoming,holidayText);
}
#endif
