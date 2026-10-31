<?php
require_once __DIR__ . '/../../bootstrap.php';
// This legacy endpoint returns a provider key and is disabled by default.
if (!ninetime_config('legacy_key_endpoint_enabled', false)) {
    http_response_code(410);
    exit('Legacy key distribution is disabled.');
}
ninetime_require_admin();

$provider='owm';
$limit_month=1000000;
$limit_minute=50;
$limit_day=0;
$_GET['url']='https://api.openweathermap.org/data/2.5/weather?APPID=NINETIME_SERVER_OWM';
$getApiKey=true;
$keyUsage=isset($_GET['use'])?$_GET['use']*1:1;
$error=isset($_GET['error'])?$_GET['error']:'';



require("weather.php");

?>
