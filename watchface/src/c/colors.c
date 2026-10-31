#include <pebble.h>
#include "colors.h"

////////////////  COLOR FUNCTIONS   ////////////////////////////////////////////////////////////////////////

static uint8_t get_num_palette_colors(GBitmap *b){

	GBitmapFormat format = gbitmap_get_format(b);

	switch (format) {
		case GBitmapFormat1Bit: return 0;
		case GBitmapFormat8Bit: return 0;
		case GBitmapFormat1BitPalette: return 2;
		case GBitmapFormat2BitPalette: return 4;
		case GBitmapFormat4BitPalette: return 16;

		default: return 0;
	}

}

static void replace_gbitmap_color(GColor color_to_replace, GColor replace_with_color, GBitmap *im){

	//First determine what the number of colors in the palette
	uint8_t num_palette_items = get_num_palette_colors(im);

	//Get the gbitmap's current palette
	GColor *current_palette = gbitmap_get_palette(im);

	//Iterate through the palette finding the color we want to replace and replacing 
	//it with the new color

	for(uint8_t i = 0; i < num_palette_items; i++){
   	if ((color_to_replace.argb & 0x3F)==(current_palette[i].argb & 0x3F)){
			current_palette[i].argb = (current_palette[i].argb & 0xC0)| (replace_with_color.argb & 0x3F);
		}

	}
}

GColor intToColorNormal(uint8_t number){
  return (GColor8){.argb=((uint8_t)(0xC0|number))}; //|11000000
}
GColor intToColor(uint8_t number){
  if(inverted) number=63-number;
  return (GColor8){.argb=((uint8_t)(0xC0|number))}; //|11000000
}
static uint8_t first_available_color(bool colors[64]){
  for(uint8_t i = 0; i < 64; i++) if(colors[i] == true) return i;
  return 0;
}
void replace_colors(uint8_t colorBlack, uint8_t colorWhite, GBitmap *im){
  if(inverted) {
    colorBlack=63-colorBlack;
    colorWhite=63-colorWhite;
  }
  uint8_t tempcolorBlack;
  uint8_t tempcolorWhite;
  uint8_t origColorBlack=0;
  uint8_t origColorWhite=63;
  if(colorWhite>63) {
    replace_gbitmap_color(intToColorNormal(origColorBlack), intToColorNormal(colorBlack), im);
    return;
  }
  
  bool colors[64];
  for(uint8_t i = 0; i < 64; i++) colors[i] = true;
  colors[colorBlack]=false;
  colors[colorWhite]=false;
  colors[origColorBlack]=false;
  colors[origColorWhite]=false;
  tempcolorBlack=first_available_color(colors);
  colors[tempcolorBlack]=false;
  tempcolorWhite=first_available_color(colors);
  colors[tempcolorWhite]=false;
  
  replace_gbitmap_color(intToColorNormal(origColorBlack), intToColorNormal(tempcolorBlack), im);
  replace_gbitmap_color(intToColorNormal(origColorWhite), intToColorNormal(tempcolorWhite), im);
  
  replace_gbitmap_color(intToColorNormal(tempcolorBlack), intToColorNormal(colorBlack), im);
  replace_gbitmap_color(intToColorNormal(tempcolorWhite), intToColorNormal(colorWhite), im);
}
