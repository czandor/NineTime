#include <pebble.h>
#include "draw.h"
#include "colors.h"

////////////////// DRAW FUNCTIONS  ///////////////////////////////////////////////////////////////////////////////////////////

void draw_bitmap(GContext *ctx, int imageresource, GRect iconrect, uint8_t iconColor, uint8_t bgColor){
  GBitmap *digit_bitmap = gbitmap_create_with_resource(imageresource);
  replace_colors(iconColor,bgColor,digit_bitmap);
  graphics_draw_bitmap_in_rect(ctx, digit_bitmap,iconrect);
  gbitmap_destroy(digit_bitmap);
}
#ifdef PBL_ROUND
void draw_rect_round(GContext *ctx,GColor fillcolor,GColor borderColor, GPoint center, uint16_t radius){
  #ifdef SHOW_APP_LOGS
    APP_LOG(APP_LOG_LEVEL_DEBUG, "draw_rect_round start x:%d, y: %d, radius",center.x,center.y,radius);
  #endif 
  graphics_context_set_fill_color(ctx, borderColor);
  graphics_fill_circle(ctx, center,radius);
  graphics_context_set_fill_color(ctx, fillcolor);
  graphics_fill_circle(ctx, center,radius-1);
}
#endif
void draw_rect(GContext *ctx,GColor fillcolor,GColor borderColor, uint8_t borders[4], GRect bound){
  #ifdef SHOW_APP_LOGS
    APP_LOG(APP_LOG_LEVEL_DEBUG, "draw_rect start x:%d, y: %d, w: %d, h:%d",bound.origin.x,bound.origin.y,bound.size.w,bound.size.h);
  #endif 
  if((borders[0]+borders[1]+borders[2]+borders[3]) > 0){
    #ifdef SHOW_APP_LOGS
      APP_LOG(APP_LOG_LEVEL_DEBUG, "draw_rect draw border color");
    #endif 
    graphics_context_set_fill_color(ctx, borderColor);
    graphics_fill_rect(ctx, bound,0, GCornerNone);
  }
  graphics_context_set_fill_color(ctx, fillcolor);
  GRect bound2=GRect(bound.origin.x+borders[3],bound.origin.y+borders[0],bound.size.w-borders[3]-borders[1],bound.size.h-borders[0]-borders[2]);
  #ifdef SHOW_APP_LOGS
    APP_LOG(APP_LOG_LEVEL_DEBUG, "draw_rect draw inside x:%d, y: %d, w: %d, h:%d",bound2.origin.x,bound2.origin.y,bound2.size.w,bound2.size.h);
  #endif 
  graphics_fill_rect(ctx, bound2,0, GCornerNone);
}

uint8_t write_text2(GContext * ctx, const char *text, uint8_t small, const char *text2, uint8_t small2,GSize padding,GRect bound,GTextAlignment alignment,uint8_t color){
  #ifdef SHOW_APP_LOGS
	  APP_LOG(APP_LOG_LEVEL_DEBUG, "write_text2:%s, x:%d, y:%d",text,x,y);
	#endif 
  graphics_context_set_text_color(ctx, intToColor(color));
  GFont font=fonts_get_system_font((small)?((small==1)?TEXTFONTSMALL:TEXTFONTTINY):TEXTFONT);
  /*if(small==3){
    small=0;
    font=fonts_get_system_font(FONT_KEY_GOTHIC_24);
  }*/
  GFont font2=fonts_get_system_font((small2)?((small2==1)?TEXTFONTSMALL:TEXTFONTTINY):TEXTFONT);
  int16_t offset=(small)?((small==1)?FONT_SMALL_OFFSET:FONT_TINY_OFFSET):FONT_OFFSET;
  int16_t offset2=(small2)?((small2==1)?FONT_SMALL_OFFSET:FONT_TINY_OFFSET):FONT_OFFSET;
  uint8_t height=(small)?((small==1)?FONT_SMALL_HEIGHT:FONT_TINY_HEIGHT):FONT_HEIGHT;
  
  
  GSize size2=GSize(0,0);
  if(text2[0]==(char)0) {
    padding.w=0;
  }
  else {
    if(small2==2 && strcmp(text2, "%")==0){
      size2=GSize(8,9);
      //IMAGE_PERCENTSMALL
    }
    //else size2=graphics_text_layout_get_content_size(text2, font2, GRect(0,0,bound.size.w,bound.size.h), GTextOverflowModeWordWrap, GTextAlignmentCenter);
    else size2=get_text_size(text2,small2,bound.size.w);
    if(small < small2){
      if(padding.h) offset2+=(offset2-offset)/((uint16_t)100/padding.h);
    }
    else if(small > small2){
      if(padding.h) offset+=(offset-offset2)/((uint16_t)100/padding.h);
      height=(small2)?((small2==1)?FONT_SMALL_HEIGHT:FONT_TINY_HEIGHT):FONT_HEIGHT;
    }
    else offset2+=padding.h;
  }
  //GSize size=graphics_text_layout_get_content_size(text, font, GRect(0,0,bound.size.w,bound.size.h), GTextOverflowModeWordWrap, GTextAlignmentCenter);
  GSize size=get_text_size(text,small,bound.size.w);
  int16_t x=0;
  if(alignment != GTextAlignmentLeft) {
    x=(bound.size.w-(size.w+size2.w+padding.w))/((alignment==GTextAlignmentCenter)?2:1);
    //if(strcmp(text2, "%") == 0) x++;
  }
  if(strcmp(text, "100") == 0) write_text2(ctx, "1", small, "00", small,GSize((small==1)?-2:-1,0),GRect(bound.origin.x+x, bound.origin.y,size.w , bound.size.h),alignment,color);
  else 
    graphics_draw_text(ctx, text, font, GRect(bound.origin.x+x, bound.origin.y+offset,size.w , bound.size.h), GTextOverflowModeWordWrap, alignment, NULL);
  if(text2[0]!=(char)0){
    if(small2==2 && strcmp(text2, "%")==0) draw_bitmap(ctx, RESOURCE_ID_IMAGE_PERCENTSMALL,GRect(bound.origin.x+x+size.w+padding.w, bound.origin.y+offset2+5,size2.w , size2.h), color, 64);
    else graphics_draw_text(ctx, text2, font2, GRect(bound.origin.x+x+size.w+padding.w, bound.origin.y+offset2,size2.w , bound.size.h), GTextOverflowModeWordWrap, alignment, NULL);
  } 
  return height;
}
GSize get_text_size(const char *szoveg,uint8_t small,uint16_t width){
  //GFont font=fonts_get_system_font((small)?((small==1)?TEXTFONTSMALL:TEXTFONTTINY):TEXTFONT);
  return graphics_text_layout_get_content_size(szoveg, fonts_get_system_font((small)?((small==1)?TEXTFONTSMALL:TEXTFONTTINY):TEXTFONT), GRect(0,0,(width == 0)?2000:width,100), GTextOverflowModeWordWrap, GTextAlignmentCenter);
}
void draw_derror(GContext * ctx,uint8_t bgColor,uint8_t textColor,GPoint point){
  graphics_context_set_fill_color(ctx,intToColor(bgColor));
  graphics_fill_rect(ctx, GRect(point.x,point.y,9,10), 1, GCornersAll );
  write_text2(ctx,"x",2,"",0,GSize(0,0),GRect(point.x,
                                         point.y,
                                         9,
                                         30),
                           GTextAlignmentCenter,textColor);

}
