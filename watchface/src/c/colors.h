#pragma once
#include "const.h"

//void replace_gbitmap_color(GColor color_to_replace, GColor replace_with_color, GBitmap *im);
extern bool inverted;

GColor intToColor(uint8_t number);
//uint8_t first_available_color(bool colors[64]);
void replace_colors(uint8_t colorBlack, uint8_t colorWhite, GBitmap *im);
  
