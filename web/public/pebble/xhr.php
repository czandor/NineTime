<?php
require_once __DIR__ . '/../../bootstrap.php';

$url=$_GET['url'];
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