#include <pebble.h>
#include "functions.h"

void set_dayname(uint8_t dayw, char *value_daynames,char *dayname){
  uint8_t i=0;
  uint8_t j=0;
  int8_t found_start=-1;
  int8_t found_end=-1;
  uint8_t count_div=0;
  for(i = 0 ; i <= strlen(value_daynames) ; i++){
    if(value_daynames[i] == ',') count_div++;
    if(count_div == dayw && dayw > 0 && found_start < 0) found_start=i;
    if(count_div == (dayw+1) && found_end < 0) found_end=i;
  }
  if(found_end < 0) found_end=strlen(value_daynames);
  if((found_end-found_start+1) > 9) {
    strcpy(dayname,"ERR");
    return;
  }
  for(i=(found_start+1) ; i < found_end ; i++){
    dayname[j]=value_daynames[i];
    j++;
  }
  dayname[j]='\0';
  
}
void set_monthname(uint8_t month,char *value_monthnames, char *monthname){
  uint8_t i=0;
  uint8_t j=0;
  int8_t found_start=-1;
  int8_t found_end=-1;
  uint8_t count_div=0;
  for(i = 0 ; i <= strlen(value_monthnames) ; i++){
    if(value_monthnames[i] == ',') count_div++;
    if(count_div == month && month > 0 && found_start < 0) found_start=i;
    if(count_div == (month+1) && found_end < 0) found_end=i;
  }
  if(found_end < 0) found_end=strlen(value_monthnames);
  if((found_end-found_start+1) > 9) {
    strcpy(monthname,"ERR");
    return;
  }
  for(i=(found_start+1) ; i < found_end ; i++){
    monthname[j]=value_monthnames[i];
    j++;
  }
  monthname[j]='\0';
  
}

