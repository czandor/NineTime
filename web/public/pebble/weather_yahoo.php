<?php
require_once __DIR__ . '/../../bootstrap.php';

include("weather_czandor.php");
die();

$uniqueid="";
if(isset($_GET['uniqueid'])) $uniqueid=$_GET['uniqueid'];
$AppVersion="";
if(isset($_GET['v'])) $AppVersion=$_GET['v'];
$model="";
if(isset($_GET['m'])) $model=$_GET['m'];


function buildBaseString($baseURI, $method, $params) {
    $r = array();
    ksort($params);
    foreach($params as $key => $value) {
        $r[] = "$key=" . rawurlencode($value);
    }
    return $method . "&" . rawurlencode($baseURI) . '&' . rawurlencode(implode('&', $r));
}
function buildAuthorizationHeader($oauth) {
    $r = 'Authorization: OAuth ';
    $values = array();
    foreach($oauth as $key=>$value) {
        $values[] = "$key=\"" . rawurlencode($value) . "\"";
    }
    $r .= implode(', ', $values);
    return $r;
}
$url = 'https://weather-ydn-yql.media.yahoo.com/forecastrss';
$app_id = ninetime_config('yahoo.app_id', '');
$consumer_key = ninetime_config('yahoo.consumer_key', '');
$consumer_secret = ninetime_config('yahoo.consumer_secret', '');
$query = array(
    'u' => 'f',
    'format' => 'json',
);
if(isset($_GET['lat']) && isset($_GET['lon'])){
    $query = array(
        'lat' => $_GET['lat'],
        'lon' => $_GET['lon'],
        'u' => 'f',
        'format' => 'json',
    );
}
if(isset($_GET['location'])){
    $query = array(
        'location' => $_GET['location'],
        'u' => 'f',
        'format' => 'json',
    );
}
$link=ninetime_db();
$ip = isset($_SERVER['HTTP_CLIENT_IP'])?$_SERVER['HTTP_CLIENT_IP']:(isset($_SERVER['HTTP_X_FORWARDE‌​D_FOR'])?$_SERVER['HTTP_X_FORWARDED_FOR']:$_SERVER['REMOTE_ADDR']);
$SQL="insert into weather_usage_log set provider = 'yahoo' , ip = '$ip' , browser = '".$_SERVER['HTTP_USER_AGENT']."' , `get` = '".json_encode($query)."' , datum = now(), error = ''";
mysqli_query($link,$SQL);
mysqli_close($link);

$oauth = array(
    'oauth_consumer_key' => $consumer_key,
    'oauth_nonce' => uniqid(mt_rand(1, 1000)),
    'oauth_signature_method' => 'HMAC-SHA1',
    'oauth_timestamp' => time(),
    'oauth_version' => '1.0'
);
$base_info = buildBaseString($url, 'GET', array_merge($query, $oauth));
$composite_key = rawurlencode($consumer_secret) . '&';
$oauth_signature = base64_encode(hash_hmac('sha1', $base_info, $composite_key, true));
$oauth['oauth_signature'] = $oauth_signature;
$header = array(
    buildAuthorizationHeader($oauth),
    'Yahoo-App-Id: ' . $app_id
);
$options = array(
    CURLOPT_HTTPHEADER => $header,
    CURLOPT_HEADER => false,
    CURLOPT_URL => $url . '?' . http_build_query($query),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_SSL_VERIFYPEER => false
);
$ch = curl_init();
curl_setopt_array($ch, $options);
$response = curl_exec($ch);
curl_close($ch);
print_r($response);
//$return_data = json_decode($response);
//print_r($return_data);
?>