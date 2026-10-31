<?php
require_once __DIR__ . '/../../../bootstrap.php';

$json = file_get_contents('php://input');
$obj = json_decode($json);

$type=$obj->type;
$name=$obj->name;
$watchtoken=$obj->watchtoken;
$platform=$obj->platform;
$model=$obj->model;
$slot=$obj->slot*1;
$jsondata=$obj->jsondata;
if(!$watchtoken || !$platform || !$model || !$type) die("Heyy something wrong!");
header("Content-Type: application/json;charset=utf-8");
$response=new StdClass();

$link=ninetime_db();

if($type == "load"){
    $sql="select jsondata from ninetime_settings where watchtoken = '$watchtoken' and platform = '$platform' and slot = $slot";
    $res=mysqli_query($link,$sql);
    if($row=mysqli_fetch_object($res)) $response->jsondata=$row->jsondata;
    else $response->jsondata="";
}
if($type == "save" && json_decode($jsondata)){
    $sql="insert into ninetime_settings set watchtoken = '$watchtoken' , platform = '$platform' , model = '$model' , slot = $slot , name = '$name', jsondata = '$jsondata'
          ON DUPLICATE KEY UPDATE name = '$name' , jsondata = '$jsondata' , model = '$model' , updated = now() ";
    if(mysqli_query($link,$sql)) $response->status="Saved";
    else $response->status="Save error";
}


mysqli_close($link);

echo json_encode($response);
?>