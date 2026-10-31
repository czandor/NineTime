<html>
    <head>
        <meta http-equiv="Content-type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">
        <title>czandor.hu - NineTime for Pebble</title>
        <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
        <script>
          (adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "ca-pub-5655232235248299",
            enable_page_level_ads: true
          });
        </script>


        <style>
           
        </style>
    </head>
<body>
<?php
require_once __DIR__ . '/../../bootstrap.php';
 if(!isset($_GET['fitbit'])) {?>
<a href="/projects">&lt; czandor.hu</a><br/>
<?php } ?>
<h1>Info Script Help</h1>


You can make your own info script, when you have some code skill.<br/>
<span>The watchface can send a request to your script with some data in json format with raw POST, and it will display your script result on your hand.</span><br/>
The data structure, that will be sent:<br/>
<pre>{
    watchtoken: Your watch unique id,
    platform: Your watch platform, eg "basalt",
    model: Your watch model name,
    lang: 2 char language code from settings,
    battery: your watch battery in percent,
    steps: Delta steps from 'from_time',
    hrbpm_avg: Average heart rate from 'from_time',
    hrbpm_min: Minimum heart rate from 'from_time',
    hrbpm_max: Maximum heart rate from 'from_time',
    from_time: Health data collected from this time, unix epoch timestamp in seconds,
    h24: Your watch is in 24 hour style,
    data: Custom data field value,
    pos: Actual position in json stringified format, when you enabled it,
    test: this variable will exists, and will be 1, when you test your script from here. The watch will not send this variable to your script.
}
</pre>
I expect the following data structure from your script:<br/>
<pre>{
    status: must be 'ok', when everything is ok, otherwise I will not send the anknowledge to the watch, and it will not reset the 'from_time' value,
    info: The string you want to display on the watch. Please note that the watch can not display long text.
}
</pre>
<br/>
Here is some example php file:<br/>
Generating random word:<br/>
<pre>
&lt;?php
$words=array("Absolutely","Abundant","Accept");
$response=new StdClass();
$word=$words[rand(0,count($words)-1)];
$response->status='ok';
$response->info=$word;
header("Content-Type: application/json;charset=utf-8");
echo json_encode($response);
?&gt;
</pre>
Generating random word, but the language is coming from settings:<br/>
<pre>
&lt;?php
$words=array();
$words['en']=array("Absolutely","Abundant","Accept");
$words['hu']=array('Teljesség','Bőség','Elfogadó');
$json = file_get_contents('php://input');
$obj = json_decode($json);
$response=new StdClass();
if($obj && $obj->lang && isset($words[$obj->lang])){
    $word=$words[$obj->lang][rand(0,count($words[$obj->lang])-1)];
    $response->status='ok';
    $response->info=$word;
}
else{
    $response->status='error';
}
header("Content-Type: application/json;charset=utf-8");
echo json_encode($response);
?&gt;
</pre>
Store all the data coming from the watch to local variable to make data manipulation and generating random word based on language, but english is the default
<pre>
&lt;?php
$words=array();
$words['en']=array("Absolutely","Abundant","Accept");
$words['hu']=array('Teljesség','Bőség','Elfogadó');
$json = file_get_contents('php://input');
$obj = json_decode($json);
$response=new StdClass();
if($obj){
    $watchtoken=$obj->watchtoken;
    $platform=$obj->platform;
    $model=$obj->model;
    $language=$obj->lang;
    $battery=$obj->battery*1;
    $steps=$obj->steps*1;
    $hrbpm_avg=$obj->hrbpm_avg*1;
    $hrbpm_min=$obj->hrbpm_min*1;
    $hrbpm_max=$obj->hrbpm_max*1;
    $from_time=$obj->from_time*1;
    $h24=$obj->h24*1;
    $pos=$obj->pos;
    $data=$obj->data;
    $test=isset($obj->test)?$obj->test*1:0;
    if($pos) $position=json_decode($pos);
    
    // here you can put your php script to make data analyze
    if(empty($words[$language])) $words[$language]=$words['en'];
    $word=$words[$language][rand(0,count($words[$language])-1)];
    $response->status='ok';
    $response->info=$word;
}
else $response->status='error';
header("Content-Type: application/json;charset=utf-8");
echo json_encode($response);
?&gt;
</pre>