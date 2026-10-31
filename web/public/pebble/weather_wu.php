<?php
require_once __DIR__ . '/../../bootstrap.php';

$provider='wu';
$limit_minute=6;
$limit_day=600;
$limit_month=0;

$url=$_GET['url'];
$forecast=substr_count($url,"/forecast/");
function kiszed($mibol,$eleje,$vege){
    $mibol=strstr($mibol,$eleje);
    $mibol=substr($mibol,strlen($eleje));
    $mibol=substr($mibol,0,strpos($mibol,$vege));
    return $mibol;
}
$latitude=kiszed($url,"/q/",",")*1;
$longitude=kiszed($url,",",".json")*1;
$location="";
if(($longitude==0 && $latitude==0)) $location=kiszed($url,"/q/",".json");
//if(substr_count($location,"%3A")) $location=substr($location,0,strpos($location,"%3A"));
$yahooNights=array(27,29,31,33);
$yahooCond2wuCond=array(0=>'chancetstorms',//"tornado",
                        1=>'chancetstorms',//"tropical storm",
                        2=>'chancetstorms',//"hurricane",
                        3=>'chancetstorms',//"severe thunderstorms",
                        4=>'chancetstorms',//"thunderstorms",
                        5=>'chancesleet',//"mixed rain and snow",
                        6=>'chancesleet',//"mixed rain and sleet",
                        7=>'chancesleet',//"mixed snow and sleet",
                        8=>'chancesleet',//"freezing drizzle",
                        9=>'chancerain',//"drizzle",
                        10=>'chancesleet',//"freezing rain",
                        11=>'rain',//"showers",
                        12=>'rain',//"showers",
                        13=>'flurries',//"snow flurries",
                        14=>'chancesnow',//"light snow showers",
                        15=>'snow',//"blowing snow",
                        16=>'snow',//"snow",
                        17=>'chancesleet',//"hail",
                        18=>'chancesleet',//"sleet",
                        19=>'fog',//"dust",
                        20=>'fog',//"foggy",
                        21=>'fog',//"haze",
                        22=>'fog',//"smoky",
                        23=>'cloudy',//"blustery",
                        24=>'cloudy',//"windy",
                        25=>'cloudy',//"cold",
                        26=>'cloudy',//"cloudy",
                        27=>'mostlycloudy',//"mostly cloudy (night)",
                        28=>'mostlycloudy',//"mostly cloudy (day)",
                        29=>'partlycloudy',//"partly cloudy (night)",
                        30=>'partlycloudy',//"partly cloudy (day)",
                        31=>'clear',//"clear (night)",
                        32=>'mostlysunny',//"sunny",
                        33=>'partlysunny',//"fair (night)",
                        34=>'partlysunny',//"fair (day)",
                        35=>'chancesleet',//"mixed rain and hail",
                        36=>'sunny',//"hot",
                        37=>'tstorms',//"isolated thunderstorms",
                        38=>'tstorms',//"scattered thunderstorms",
                        39=>'tstorms',//"scattered thunderstorms",
                        40=>'rain',//"scattered showers",
                        41=>'snow',//"heavy snow",
                        42=>'snow',//"scattered snow showers",
                        43=>'snow',//"heavy snow",
                        44=>'partlycloudy',//"partly cloudy",
                        45=>'rain',//"thundershowers",
                        46=>'sleet',//"snow showers",
                        47=>'tstorms',//"isolated thundershowers",
                        3200=>"not available");   
    

if(false && ($longitude==0 && $latitude==0 && $location=="")) require("weather.php");
else{
    //echo $url."<br/>";
    //echo "latitude: $latitude , longitude:$longitude<br/>";
    if($location) $rf=file_get_contents("http://czandor.hu/pebble/weather_yahoo.php?location=$location&uniqueid=");
    else $rf=file_get_contents("http://czandor.hu/pebble/weather_yahoo.php?lat=$latitude&lon=$longitude&uniqueid=");
    $json = json_decode($rf, false);
    //echo $location;
    //var_dump($json);
    if($json && $json->forecasts && count($json->forecasts)){
        //var_dump($json);
        if($forecast){
            $todaysForecast = $json->forecasts[0];
            $tomorrowForecast = $json->forecasts[1];
            $conditionCode = $todaysForecast->code;
            if(date("H") > 20) $conditionCode = $tomorrowForecast->code;
            if(empty($yahooCond2wuCond[$conditionCode])) $conditionCode=3200;
            $iconToLoad=$conditionCode=$yahooCond2wuCond[$conditionCode];
            $lowTemp=$todaysForecast->low;
            $lowTemp2=$todaysForecast->high;
            $highTemp=$tomorrowForecast->low;
            $highTemp2=$tomorrowForecast->high;
            $json=json_decode("false");
            $todaysForecast=json_decode("false");
            $tomorrowForecast=json_decode("false");
            $json->response->features->forecast = 1;
            $todaysForecast->icon=$conditionCode;
            $todaysForecast->low->celsius=round(($lowTemp - 32) / 1.8);
            $todaysForecast->high->celsius=round(($highTemp - 32) / 1.8);
            $tomorrowForecast->low->celsius=round(($lowTemp2 - 32) / 1.8);
            $tomorrowForecast->high->celsius=round(($highTemp2 - 32) / 1.8);
            $todaysForecast->low->fahrenheit=round($lowTemp);
            $todaysForecast->high->fahrenheit=round($highTemp);
            $tomorrowForecast->low->fahrenheit=round($lowTemp2);
            $tomorrowForecast->high->fahrenheit=round($highTemp2);
            $json->forecast->simpleforecast->forecastday=array($todaysForecast,$tomorrowForecast);
            //echo "<pre>".json_encode($json)."</pre>";
        }
        else{
            $temperature=($json->current_observation->condition->temperature);
            $wind=($json->current_observation->wind->speed);
            $city=$json->location->city;
            $hum=round($json->current_observation->atmosphere->humidity);
            
            $conditionCode=$json->current_observation->condition->code*1;
            if(empty($yahooCond2wuCond[$conditionCode])) $conditionCode=3200;
            $condition=$json->current_observation->condition->text;
            $isNight=in_array($conditionCode,$yahooNights);
            $iconToLoad=$conditionCode=$yahooCond2wuCond[$conditionCode];
            //echo 'Current weather downloaded successfully condition: '.$condition.', temp:' . $temperature . ', Wind:'.$wind . ', Humidity:'.$hum . ', City:'.$city . ', conditionCode:'.$conditionCode.', Icon:' . $iconToLoad;
            $json=json_decode("false");
            $json->response->features->conditions=1;
            $json->current_observation->temp_c=round(($temperature - 32) / 1.8);
            $json->current_observation->wind_kph=round(1.609344 * $wind);
            $json->current_observation->temp_f=round($temperature);
            $json->current_observation->wind_mph=round($wind);
            $json->current_observation->display_location->city=$city;
            $json->current_observation->relative_humidity=$hum."%";
            $json->current_observation->icon=$conditionCode;
            $json->current_observation->weather=$condition;
            $json->current_observation->icon_url="fakeurl".(($isNight)?"_nt":"")."";
        }
        //echo "<pre>".json_encode($json)."</pre>";
        header("Content-Type: application/json;charset=utf-8");
        echo json_encode($json);
    }
    //echo $rf;
}
?>