#pragma once
void draw_bitmap(GContext *ctx, int imageresource, GRect iconrect, uint8_t iconColor, uint8_t bgColor);
void draw_rect(GContext *ctx,GColor fillcolor,GColor borderColor, uint8_t borders[4], GRect bound);
#ifdef PBL_ROUND
void draw_rect_round(GContext *ctx,GColor fillcolor,GColor borderColor, GPoint center, uint16_t radius);
#endif
uint8_t write_text2(GContext * ctx, char text[100], uint8_t small, char text2[10], uint8_t small2,GSize padding,GRect bound,GTextAlignment alignment,uint8_t color);
GSize get_text_size(char szoveg[100],uint8_t small,uint16_t width);
void draw_derror(GContext * ctx,uint8_t bgColor,uint8_t textColor,GPoint point);