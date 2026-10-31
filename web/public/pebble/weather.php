<?php
require_once __DIR__ . '/../../bootstrap.php';

if(!function_exists('kiszed')){
    function kiszed($mibol,$eleje,$vege){
        $mibol=strstr($mibol,$eleje);
        $mibol=substr($mibol,strlen($eleje));
        $mibol=substr($mibol,0,strpos($mibol,$vege));
        return $mibol;
    }
}
$debug=0;

if(!isset($getApiKey)) $getApiKey=false;
if(!isset($keyUsage)) $keyUsage=1;
$keyUsage=$keyUsage*1;

if(empty($provider)) error_message("no provider");
if(!isset($limit_minute)) error_message();
if(!isset($limit_day)) error_message();
if(empty($_GET['url'])) error_message("no url");
// wu: api/' + key + '/
// owm: &appid=' + key;
$uniqueid="";
if(isset($_GET['uniqueid'])) $uniqueid=$_GET['uniqueid'];
$AppVersion="";
if(isset($_GET['v'])) $AppVersion=$_GET['v'];
$model="";
if(isset($_GET['m'])) $model=$_GET['m'];
$link=ninetime_db();
if(!$link) error_message("mysql connect error");

$url=$_GET['url'];
$apikey='';



if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
    $ip = $_SERVER['HTTP_CLIENT_IP'];
} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
} else {
    $ip = $_SERVER['REMOTE_ADDR'];
}
$actual_link = ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on')?"https":"http") ."://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
if(empty($error)) $error='';
$SQL="insert into weather_usage_log set provider = '$provider' , ip = '$ip' , browser = '".$_SERVER['HTTP_USER_AGENT']."' , `get` = '$actual_link' , datum = now(), error = '$error'";
if($error || $debug) mysqli_query($link,$SQL);



$apikey = '';
switch ($provider) {
    case 'wu':
        $apikey = kiszed($url, 'api/', '/');
        $marker = 'NINETIME_SERVER_WU';
        break;
    case 'owm':
        foreach (array('q', 'id', 'lat', 'lon', 'units') as $parameter) {
            if (isset($_GET[$parameter])) $url .= '&' . $parameter . '=' . rawurlencode($_GET[$parameter]);
        }
        $_GET['url'] = $url;
        $query = array();
        parse_str((string) parse_url($url, PHP_URL_QUERY), $query);
        $apikey = isset($query['APPID']) ? $query['APPID'] : (isset($query['appid']) ? $query['appid'] : '');
        $marker = 'NINETIME_SERVER_OWM';
        break;
    default:
        error_message('unknown provider');
}
if ($apikey === $marker) {
    $keys = array_values(array_filter(ninetime_config('weather.' . $provider . '.keys', array())));
    if (!$keys) error_message('No server weather key configured');
    $replacement = $keys[array_rand($keys)];
    $_GET['url'] = str_replace($marker, $replacement, $url);
    $apikey = $replacement;
}
if(!$apikey) error_message("no apikey");
date_default_timezone_set('US/Eastern');

$day=date("ymd")*1;
$minute=date("ymdHi")*1;
$month=date("ym")*1;
$counter_month=0;
if($limit_month){
    $sql="select sum(counter) as counter from weather_usage where provider = '$provider' and apikey = '$apikey' and month = $month
            group by month";
    //echo $sql;
    $res=mysqli_query($link,$sql);
    if($row=mysqli_fetch_object($res)) $counter_month=$row->counter*1;
    if($counter_month >= $limit_month) {
        if(!$getApiKey) error_message("month limit exceeded");
        $keyUsage=0;
    }
}
$counter_day=0;
if($limit_day){
    $sql="select sum(counter) as counter from weather_usage where provider = '$provider' and apikey = '$apikey' and day = $day
            group by day";
    //echo $sql;
    $res=mysqli_query($link,$sql);
    if($row=mysqli_fetch_object($res)) $counter_day=$row->counter*1;
    if($counter_day >= $limit_day) {
        if(!$getApiKey) error_message("day limit exceeded");
        $keyUsage=0;
    }
}
$counter_minute=0;
if($limit_minute){
    $sql="select counter from weather_usage where provider = '$provider' and apikey = '$apikey' and minute = $minute";
    //echo $sql;
    $res=mysqli_query($link,$sql);
    if($row=mysqli_fetch_object($res)) $counter_minute=$row->counter*1;
    if($counter_minute >= $limit_minute) {
        if(!$getApiKey) error_message("minute limit exceeded");
        $keyUsage=0;
    }
}
$sql="insert into weather_usage set provider = '$provider' , apikey = '$apikey' , minute = $minute , day = $day , month = $month , counter = $keyUsage
      on duplicate key update counter = counter + $keyUsage ";
$res=mysqli_query($link,$sql);
if(!$res) error_message(mysqli_error($link));

if(rand(0,10000) == 0){
    $sql="delete from weather_usage where minute < ".(date("ymdHi",strtotime("now - 2 month"))*1)."";
    mysqli_query($link,$sql);
    $sql="OPTIMIZE TABLE weather_usage ";
    mysqli_query($link,$sql);
}


mysqli_close($link);
if($getApiKey){
    header("Content-Type: application/json;charset=utf-8");
    $res=new StdClass();
    $res->status='ok';
    $res->key=$apikey."";
    $res->use_allowed=$keyUsage;
    $res->limit_month=$limit_month;
    $res->counter_month=$counter_month;
    $res->limit_day=$limit_day;
    $res->counter_day=$counter_day;
    $res->limit_minute=$limit_minute;
    $res->counter_minute=$counter_minute;
    echo json_encode($res);
}
else require("xhr.php");


function error_message($error="General error"){
    global $link,$provider,$debug,$ip,$actual_link;
    header("HTTP/1.1 400 Bad Request");
    //echo $error;
    
    $SQL="insert into weather_error_log set provider = '$provider' , ip = '$ip' , browser = '".$_SERVER['HTTP_USER_AGENT']."' , get = '$actual_link' , datum = now(), error = '$error'";
    
    
    /*header("Content-Type: application/json;charset=utf-8");
    $response=new StdClass();
    $response->status=$error;
    echo json_encode($response);*/
    if(!empty($link)) {
        if($debug) mysqli_query($link,$SQL);
        mysqli_close($link);
    }
    die();
}

?>