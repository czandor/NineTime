<?php
require_once __DIR__ . '/../../bootstrap.php';
// Legacy weather URLs are parsed locally and translated; they are never forwarded.
if (isset($_GET['url']) && is_string($_GET['url']) &&
    in_array(strtolower((string) parse_url($_GET['url'], PHP_URL_HOST)),
        array('api.openweathermap.org', 'api.wunderground.com', 'query.yahooapis.com'), true)) {
    require_once __DIR__ . '/../../weather-legacy.php';
    ninetime_weather_legacy_serve(null);
    exit;
}

$url=$_GET['url'];
// Use HTTPS for our own endpoints without changing saved legacy script addresses.
$url=preg_replace('~^http://(www\.)?czandor\.hu/~i', 'https://czandor.hu/', $url);
$postdata=file_get_contents('php://input');

header("Content-Type: application/json;charset=utf-8");

$ch = curl_init($url);
if($postdata)curl_setopt_array($ch, array(
    CURLOPT_POST => TRUE,
    CURLOPT_POSTFIELDS => $postdata,
    CURLOPT_RETURNTRANSFER => TRUE,
    CURLOPT_HTTPHEADER => array(
        'Content-Type: application/json'
    )
));
else curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => TRUE,
    CURLOPT_HTTPHEADER => array(
        'Content-Type: application/json'
    )
));

// Send the request
$response = curl_exec($ch);

// Check for errors
if($response === FALSE){
    $res=new StdClass();
    $res->error='URL error';
    if (function_exists('error_message')) {
        error_message("URL parse error");
    }
    die( json_encode($res));
}
echo $response;



?>
