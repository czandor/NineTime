<?php
require_once __DIR__ . '/../../bootstrap.php';

$uniqueid="";
if(isset($_GET['uniqueid'])) $uniqueid=$_GET['uniqueid'];
$AppVersion="";
if(isset($_GET['v'])) $AppVersion=$_GET['v'];
$model="";
if(isset($_GET['m'])) $model=$_GET['m'];

$link=ninetime_db();


if(isset($_GET['lat']) && isset($_GET['lon'])){
    $latitude=$_GET['lat'];
    $longitude=$_GET['lon'];
    $language="en";
    //$rf=file_get_contents($url);
    //$json=json_decode($rf);
    $city="";
    /*if($json && isset($json->features) && isset($json->features[0]) && isset($json->features[0]->properties) && isset($json->features[0]->properties->geocoding)){
        $geocoding=$json->features[0]->properties->geocoding;
        $city=$geocoding->city;
        
    }
    */
    //echo $city;
    //$url="https://www.metaweather.com/api/location/search/?query=".urlencode(remove_accents( $city));
    
    $SQL="select id,woeid from pebble.weather_woeids where latitude = ".round($latitude,6)." and longitude = ".round($longitude,6)."";
    if($row=mysqli_fetch_object(mysqli_query($link,$SQL))){
        $woeid=$row->woeid;
        //echo $woeid;
        $SQL="update pebble.weather_woeids set updated = now() , update_count = update_count + 1 where id = ".$row->id;
        mysqli_query($link,$SQL);
    }
    else{
        $url="https://www.metaweather.com/api/location/search/?lattlong=$latitude,$longitude";
        //echo $url;
        $rf=file_get_contents($url);
        $json=json_decode($rf);
        $woeid=0;
        if($json && is_array($json) && count($json)) $woeid=$json[0]->woeid*1;
        $SQL="insert into pebble.weather_woeids set latitude = ".round($latitude,6)." , longitude = ".round($longitude,6)." , woeid = $woeid ,
            updated = now() , update_count = 1 ";
        mysqli_query($link,$SQL);
    }

    //echo $woeid;
    $url="https://www.metaweather.com/api/location/$woeid/";
    //echo $url;
    $rf=file_get_contents($url);
    $json=json_decode($rf);
    $sunrise="";
    $sunset="";
    $temperature="";
    $hum="";
    $wind="";
    $windDir="";
    $conditionCode="";
    $condition="";
    
    $fConditionCode="";
    $fConditionCode2="";
    $fCondition="";
    $fCondition2="";
    $lowTemp="";
    $lowTemp2="";
    $highTemp="";
    $highTemp2="";
    
    $local_time="";
    
    if(!$city && json && $json->title) $city=$json->title;
    //if($json && $json->sun_rise) $sunrise=date("H:i",strtotime($json->sun_rise));
    //if($json && $json->sun_set) $sunset=date("H:i",strtotime($json->sun_set));
    if($json && $json->sun_rise) $sunrise=substr($json->sun_rise,11,5);
    if($json && $json->sun_set) $sunset=substr($json->sun_set,11,5);
    if($json && $json->time) $local_time=substr($json->time,11,5);
    if($json && $json->consolidated_weather){
        $temperature=celsius_to_fahrenheit($json->consolidated_weather[0]->the_temp);
        $hum=$json->consolidated_weather[0]->humidity;
        $wind=$json->consolidated_weather[0]->wind_speed;
        $windDir=$json->consolidated_weather[0]->wind_direction;
        $conditionCode=$json->consolidated_weather[0]->weather_state_abbr;
        $condition=$json->consolidated_weather[0]->weather_state_name;
        
        $fConditionCode=$json->consolidated_weather[0]->weather_state_abbr;
        $fCondition=$json->consolidated_weather[0]->weather_state_name;
        $lowTemp=celsius_to_fahrenheit($json->consolidated_weather[0]->min_temp);
        $highTemp=celsius_to_fahrenheit($json->consolidated_weather[0]->max_temp);
        
        $fConditionCode2=$json->consolidated_weather[1]->weather_state_abbr;
        $fCondition2=$json->consolidated_weather[1]->weather_state_name;
        $lowTemp2=celsius_to_fahrenheit($json->consolidated_weather[1]->min_temp);
        $highTemp2=celsius_to_fahrenheit($json->consolidated_weather[1]->max_temp);
        
    }
    /*
    $url="https://goweather.herokuapp.com/weather/$latitude,$longitude";
    //echo $url;
    $rf=file_get_contents($url);
    $json=json_decode($rf);
    if($json && $json->temperature) $temperature=celsius_to_fahrenheit(str_replace(array(" ","+","°C"),"",$json->temperature)*1);
    if($json && $json->wind) $wind=str_replace(array(" ","km/h"),"",$json->wind)*0.621371192;
    if($json && $json->description) $condition=$json->description;
    */
    $conditionCode=condToYahoo($conditionCode,$local_time,$sunrise,$sunset);
    $fConditionCode=condToYahoo($fConditionCode);
    $fConditionCode2=condToYahoo($fConditionCode2);
    $wind=round($wind,3);
    $windDir=round($windDir);
    /*
    echo nl2br("sunrise=$sunrise;
    sunset=$sunset;
    temperature=$temperature;
    hum=$hum;
    wind=$wind;
    windDir=$windDir;
    city=$city;
    conditionCode=$conditionCode;
    condition=$condition;
    
    fConditionCode=$fConditionCode;
    fConditionCode2=$fConditionCode2;
    fCondition=$fCondition;
    fCondition2=$fCondition2;
    lowTemp=$lowTemp;
    lowTemp2=$lowTemp2;
    highTemp=$highTemp;
    highTemp2=$highTemp2;
    local_time=$local_time;");
    */
    $yahoo=new StdClass();
    $yahoo->location=new StdClass();
    $yahoo->current_observation=new StdClass();
    $yahoo->current_observation->condition=new StdClass();
    $yahoo->current_observation->wind=new StdClass();
    $yahoo->current_observation->atmosphere=new StdClass();
    $yahoo->current_observation->astronomy=new StdClass();
    $yahoo->current_observation->condition=new StdClass();
    $yahoo->forecasts=array(new StdClass(),new StdClass());
    
    $yahoo->location->woeid=$woeid;
    $yahoo->location->city=$city;
    $yahoo->location->region="";
    $yahoo->location->country="";
    $yahoo->location->lat=$latitude;
    $yahoo->location->long=$longitude;
    $yahoo->location->timezone_id="";
    
    $yahoo->current_observation->wind->chill="";
    $yahoo->current_observation->wind->direction=$windDir;
    $yahoo->current_observation->wind->speed=$wind;

    $yahoo->current_observation->atmosphere->humidity=$hum;
    $yahoo->current_observation->atmosphere->visibility="";
    $yahoo->current_observation->atmosphere->pressure="";

    $yahoo->current_observation->astronomy->sunrise=$sunrise;
    $yahoo->current_observation->astronomy->sunset=$sunset;
    
    $yahoo->current_observation->condition->text=$condition;
    $yahoo->current_observation->condition->code=$conditionCode;
    $yahoo->current_observation->condition->temperature=$temperature;

    $yahoo->current_observation->pubDate=time();

    $yahoo->forecasts[0]->day=date("D",strtotime("now + 3 hour"));
    $yahoo->forecasts[0]->date=strtotime("now + 12 hour");
    $yahoo->forecasts[0]->low=$lowTemp;
    $yahoo->forecasts[0]->high=$highTemp;
    $yahoo->forecasts[0]->text=$fCondition;
    $yahoo->forecasts[0]->code=$fConditionCode;

    $yahoo->forecasts[1]->day=date("D",strtotime("now + 27 hour"));
    $yahoo->forecasts[1]->date=strtotime("now + 36 hour");
    $yahoo->forecasts[1]->low=$lowTemp2;
    $yahoo->forecasts[1]->high=$highTemp2;
    $yahoo->forecasts[1]->text=$fCondition2;
    $yahoo->forecasts[1]->code=$fConditionCode2;
    
    echo json_encode($yahoo);
    //echo "<pre>$rf</pre>";
}



//https://www.metaweather.com/api/location/search/?query=san //városra keresés woid miatt
//https://www.metaweather.com/api/location/search/?lattlong=36.96,-122.02 //koordinátára keresés woid miatt
//https://www.metaweather.com/api/location/804365/ //időjárás lekér (baromi pontatlan)
//https://goweather.herokuapp.com/weather/san


if(0){
    $ip = isset($_SERVER['HTTP_CLIENT_IP'])?$_SERVER['HTTP_CLIENT_IP']:(isset($_SERVER['HTTP_X_FORWARDE‌​D_FOR'])?$_SERVER['HTTP_X_FORWARDED_FOR']:$_SERVER['REMOTE_ADDR']);
    $SQL="insert into weather_usage_log set provider = 'czandor' , ip = '$ip' , browser = '".$_SERVER['HTTP_USER_AGENT']."' , `get` = '".json_encode($query)."' , datum = now(), error = ''";
    mysqli_query($link,$SQL);
}




date_default_timezone_set('US/Eastern');
$day=date("ymd")*1;
$minute=date("ymdHi")*1;
$month=date("ym")*1;
$sql="insert into weather_usage set provider = 'czandor' , apikey = 'server-weather' , minute = $minute , day = $day , month = $month , counter = 1
      on duplicate key update counter = counter + 1 ";
$res=mysqli_query($link,$sql);

mysqli_close($link);

        
function condToYahoo($cond,$time="",$sunrise="",$sunset=""){
    if($time && $sunrise && $sunset) $isNight=(strtotime($time)<strtotime($sunrise) || strtotime($time)>strtotime($sunset));
    else $isNight=false;
    if($cond == "sn") return 16;//	Snow
	if($cond == "sl") return 46;//	Sleet
    if($cond == "h") return 17;//   Hail
    if($cond == "t") return 38;//	Thunderstorm
    if($cond == "hr") return 45;//	Heavy Rain
    if($cond == "lr") return 12;//	Light Rain
    if($cond == "s") return 12;//	Showers
    if($isNight && $cond == "hc") return 27;//	Heavy Cloud
    if(!$isNight && $cond == "hc") return 28;//	Heavy Cloud
    if($isNight && $cond == "lc") return 33;//	Light Cloud
    if(!$isNight && $cond == "lc") return 34;//	Light Cloud
    if($isNight && $cond == "c") return 31;// Clear
    if(!$isNight && $cond == "c") return 32;// Clear
    if($isNight) return 29;
    else return 30;
}
function celsius_to_fahrenheit($given_value)
{
	$fahrenheit=$given_value*9/5+32;
	return round($fahrenheit,3) ;
}    
        
function remove_accents($string) {
    if ( !preg_match('/[\x80-\xff]/', $string) )
        return $string;

    $chars = array(
    // Decompositions for Latin-1 Supplement
    chr(195).chr(128) => 'A', chr(195).chr(129) => 'A',
    chr(195).chr(130) => 'A', chr(195).chr(131) => 'A',
    chr(195).chr(132) => 'A', chr(195).chr(133) => 'A',
    chr(195).chr(135) => 'C', chr(195).chr(136) => 'E',
    chr(195).chr(137) => 'E', chr(195).chr(138) => 'E',
    chr(195).chr(139) => 'E', chr(195).chr(140) => 'I',
    chr(195).chr(141) => 'I', chr(195).chr(142) => 'I',
    chr(195).chr(143) => 'I', chr(195).chr(145) => 'N',
    chr(195).chr(146) => 'O', chr(195).chr(147) => 'O',
    chr(195).chr(148) => 'O', chr(195).chr(149) => 'O',
    chr(195).chr(150) => 'O', chr(195).chr(153) => 'U',
    chr(195).chr(154) => 'U', chr(195).chr(155) => 'U',
    chr(195).chr(156) => 'U', chr(195).chr(157) => 'Y',
    chr(195).chr(159) => 's', chr(195).chr(160) => 'a',
    chr(195).chr(161) => 'a', chr(195).chr(162) => 'a',
    chr(195).chr(163) => 'a', chr(195).chr(164) => 'a',
    chr(195).chr(165) => 'a', chr(195).chr(167) => 'c',
    chr(195).chr(168) => 'e', chr(195).chr(169) => 'e',
    chr(195).chr(170) => 'e', chr(195).chr(171) => 'e',
    chr(195).chr(172) => 'i', chr(195).chr(173) => 'i',
    chr(195).chr(174) => 'i', chr(195).chr(175) => 'i',
    chr(195).chr(177) => 'n', chr(195).chr(178) => 'o',
    chr(195).chr(179) => 'o', chr(195).chr(180) => 'o',
    chr(195).chr(181) => 'o', chr(195).chr(182) => 'o',
    chr(195).chr(182) => 'o', chr(195).chr(185) => 'u',
    chr(195).chr(186) => 'u', chr(195).chr(187) => 'u',
    chr(195).chr(188) => 'u', chr(195).chr(189) => 'y',
    chr(195).chr(191) => 'y',
    // Decompositions for Latin Extended-A
    chr(196).chr(128) => 'A', chr(196).chr(129) => 'a',
    chr(196).chr(130) => 'A', chr(196).chr(131) => 'a',
    chr(196).chr(132) => 'A', chr(196).chr(133) => 'a',
    chr(196).chr(134) => 'C', chr(196).chr(135) => 'c',
    chr(196).chr(136) => 'C', chr(196).chr(137) => 'c',
    chr(196).chr(138) => 'C', chr(196).chr(139) => 'c',
    chr(196).chr(140) => 'C', chr(196).chr(141) => 'c',
    chr(196).chr(142) => 'D', chr(196).chr(143) => 'd',
    chr(196).chr(144) => 'D', chr(196).chr(145) => 'd',
    chr(196).chr(146) => 'E', chr(196).chr(147) => 'e',
    chr(196).chr(148) => 'E', chr(196).chr(149) => 'e',
    chr(196).chr(150) => 'E', chr(196).chr(151) => 'e',
    chr(196).chr(152) => 'E', chr(196).chr(153) => 'e',
    chr(196).chr(154) => 'E', chr(196).chr(155) => 'e',
    chr(196).chr(156) => 'G', chr(196).chr(157) => 'g',
    chr(196).chr(158) => 'G', chr(196).chr(159) => 'g',
    chr(196).chr(160) => 'G', chr(196).chr(161) => 'g',
    chr(196).chr(162) => 'G', chr(196).chr(163) => 'g',
    chr(196).chr(164) => 'H', chr(196).chr(165) => 'h',
    chr(196).chr(166) => 'H', chr(196).chr(167) => 'h',
    chr(196).chr(168) => 'I', chr(196).chr(169) => 'i',
    chr(196).chr(170) => 'I', chr(196).chr(171) => 'i',
    chr(196).chr(172) => 'I', chr(196).chr(173) => 'i',
    chr(196).chr(174) => 'I', chr(196).chr(175) => 'i',
    chr(196).chr(176) => 'I', chr(196).chr(177) => 'i',
    chr(196).chr(178) => 'IJ',chr(196).chr(179) => 'ij',
    chr(196).chr(180) => 'J', chr(196).chr(181) => 'j',
    chr(196).chr(182) => 'K', chr(196).chr(183) => 'k',
    chr(196).chr(184) => 'k', chr(196).chr(185) => 'L',
    chr(196).chr(186) => 'l', chr(196).chr(187) => 'L',
    chr(196).chr(188) => 'l', chr(196).chr(189) => 'L',
    chr(196).chr(190) => 'l', chr(196).chr(191) => 'L',
    chr(197).chr(128) => 'l', chr(197).chr(129) => 'L',
    chr(197).chr(130) => 'l', chr(197).chr(131) => 'N',
    chr(197).chr(132) => 'n', chr(197).chr(133) => 'N',
    chr(197).chr(134) => 'n', chr(197).chr(135) => 'N',
    chr(197).chr(136) => 'n', chr(197).chr(137) => 'N',
    chr(197).chr(138) => 'n', chr(197).chr(139) => 'N',
    chr(197).chr(140) => 'O', chr(197).chr(141) => 'o',
    chr(197).chr(142) => 'O', chr(197).chr(143) => 'o',
    chr(197).chr(144) => 'O', chr(197).chr(145) => 'o',
    chr(197).chr(146) => 'OE',chr(197).chr(147) => 'oe',
    chr(197).chr(148) => 'R',chr(197).chr(149) => 'r',
    chr(197).chr(150) => 'R',chr(197).chr(151) => 'r',
    chr(197).chr(152) => 'R',chr(197).chr(153) => 'r',
    chr(197).chr(154) => 'S',chr(197).chr(155) => 's',
    chr(197).chr(156) => 'S',chr(197).chr(157) => 's',
    chr(197).chr(158) => 'S',chr(197).chr(159) => 's',
    chr(197).chr(160) => 'S', chr(197).chr(161) => 's',
    chr(197).chr(162) => 'T', chr(197).chr(163) => 't',
    chr(197).chr(164) => 'T', chr(197).chr(165) => 't',
    chr(197).chr(166) => 'T', chr(197).chr(167) => 't',
    chr(197).chr(168) => 'U', chr(197).chr(169) => 'u',
    chr(197).chr(170) => 'U', chr(197).chr(171) => 'u',
    chr(197).chr(172) => 'U', chr(197).chr(173) => 'u',
    chr(197).chr(174) => 'U', chr(197).chr(175) => 'u',
    chr(197).chr(176) => 'U', chr(197).chr(177) => 'u',
    chr(197).chr(178) => 'U', chr(197).chr(179) => 'u',
    chr(197).chr(180) => 'W', chr(197).chr(181) => 'w',
    chr(197).chr(182) => 'Y', chr(197).chr(183) => 'y',
    chr(197).chr(184) => 'Y', chr(197).chr(185) => 'Z',
    chr(197).chr(186) => 'z', chr(197).chr(187) => 'Z',
    chr(197).chr(188) => 'z', chr(197).chr(189) => 'Z',
    chr(197).chr(190) => 'z', chr(197).chr(191) => 's'
    );

    $string = strtr($string, $chars);

    return $string;
}
?>