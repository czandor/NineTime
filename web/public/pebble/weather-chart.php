<?php
require_once __DIR__ . '/../../bootstrap.php';
ninetime_require_admin();

$link=ninetime_db();
if(!$link) error_message();

$sql="select provider,apikey,day
        from weather_usage
        where datum_insert >= '".date("Y-m-d 00:00:00",strtotime("now - 2 days"))."'
        group by provider,apikey,day
        order by provider, apikey, day desc";
$res=mysqli_query($link,$sql);
$minutes=array();
$_days=array();
$_providers=array();
$_apikeys=array();
while($row=mysqli_fetch_object($res)) {
    if(!isset($minutes[$row->provider])) $minutes[$row->provider]=array();
    if(!isset($minutes[$row->provider][$row->apikey])) $minutes[$row->provider][$row->apikey]=array();
    $minutes[$row->provider][$row->apikey][$row->day*1]=array();
    $_days[$row->day*1]=1;
    $_providers[$row->provider]=1;
    $_apikeys[$row->apikey]=1;
}
//var_dump($minutes);
foreach($minutes as $provider=>$apikeys) foreach($apikeys as $apikey=>$days) foreach($days as $day=>$data){
    $sql="select counter,minute
            from weather_usage
            where datum_insert >= '".date("Y-m-d 00:00:00",strtotime("now - 6 days"))."'
            and provider='$provider' and apikey='$apikey' and day=$day
            order by minute";
    $res=mysqli_query($link,$sql);
    //$actual_minute=0;
    while($row=mysqli_fetch_object($res)){
        $minute=substr($row->minute,6,2)*60+substr($row->minute,8,2);
        //$row->minute=$row->minute-$day*10000;
        //if(!$actual_minute) $actual_minute=$row->minute;
        //if($row->minute == ($actual_minute+1)) $actual_minute++;
        //while($row->minute > ($actual_minute+1)){
          //  $actual_minute++;
            //$minutes[$provider][$apikey][$day][$actual_minute]=0;
        //}
        //$minutes[$provider][$apikey][$day][$actual_minute]=$row->counter*1;
        $minutes[$provider][$apikey][$day][$minute]=$row->counter*1;
    }
}
//var_dump($minutes);
foreach($minutes as $provider=>$apikeys) foreach($apikeys as $apikey=>$days) foreach($days as $day=>$data){
    for($minute=0 ; $minute < 60*24 ; $minute++){
        if(!isset($minutes[$provider][$apikey][$day][$minute])) $minutes[$provider][$apikey][$day][$minute]=0;
    }
    ksort($minutes[$provider][$apikey][$day]);
}
mysqli_close($link);
?>
<html>
    <head>
        
        
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
  
    <script>
        google.charts.load('current', {packages: ['corechart', 'line']});
        google.charts.setOnLoadCallback(drawBackgroundColor);
        function drawBackgroundColor() {
            /*var data = new google.visualization.DataTable();
            data.addColumn('number', 'X');
            data.addColumn('number', 'Dogs');
        
            data.addRows([
              [0, 0],   [1, 10],  [2, 23],  [3, 17],  [4, 18],  [5, 9],
              [6, 11],  [7, 27],  [8, 33],  [9, 40],  [10, 32], [11, 35],
              [12, 30], [13, 40], [14, 42], [15, 47], [16, 44], [17, 48],
              [18, 52], [19, 54], [20, 42], [21, 55], [22, 56], [23, 57],
              [24, 60], [25, 50], [26, 52], [27, 51], [28, 49], [29, 53],
              [30, 55], [31, 60], [32, 61], [33, 59], [34, 62], [35, 65],
              [36, 62], [37, 58], [38, 55], [39, 61], [40, 64], [41, 65],
              [42, 63], [43, 66], [44, 67], [45, 69], [46, 69], [47, 70],
              [48, 72], [49, 68], [50, 66], [51, 65], [52, 67], [53, 70],
              [54, 71], [55, 72], [56, 73], [57, 75], [58, 70], [59, 68],
              [60, 64], [61, 60], [62, 65], [63, 67], [64, 68], [65, 69],
              [66, 70], [67, 72], [68, 75], [69, 80]
            ]);
        
            var options = {
              hAxis: {
                title: 'Time'
              },
              vAxis: {
                title: 'Popularity'
              },
              backgroundColor: '#f1f8e9'
            };
        
            var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
            chart.draw(data, options);*/
            <?php foreach($minutes as $provider=>$apikeys) foreach($apikeys as $apikey=>$days) foreach($days as $day=>$data){ ?>
            drawBackgroundColor_<?=$day?>_<?=$provider?>_<?=$apikey?>();    
            <?php } ?>
        }
        <?php
            foreach($minutes as $provider=>$apikeys) foreach($apikeys as $apikey=>$days) foreach($days as $day=>$data){ ?>
            function drawBackgroundColor_<?=$day?>_<?=$provider?>_<?=$apikey?>() {
                var data = new google.visualization.DataTable();
                data.addColumn('timeofday', 'Time');
                data.addColumn('number', 'Requests');
                data.addRows([<?php $counter2=0; foreach($data as $minute=>$counter) {
                    $counter2+=$counter;
                    ?>[{v:[<?=floor($minute/60)?>,<?=$minute%60?>,0],f:'<?=sprintf("%02d",floor($minute/60)).":".sprintf("%02d",$minute%60)." Sum: ".$counter2?>'},<?=$counter?>],<?php
                    } ?>]);
                var options = {
                    hAxis: {
                      title: '<?=htmlspecialchars(substr($day,0,2)."-".substr($day,2,2)."-".substr($day,4,2)." ".$provider, ENT_QUOTES, "UTF-8")?>'
                    },
                    vAxis: {
                      minValue:<?=($provider=="owm")?60:0?>,
                      title: '<?=$provider?>'
                    },
                    backgroundColor: '#f1f8e9'
                };
                    
                var chart = new google.visualization.LineChart(document.getElementById('chart_div_<?=$day?>_<?=$provider?>_<?=$apikey?>'));
                chart.draw(data, options);
            }
            <?php } ?>
    </script>
        
        
    </head>
<body>
<?php
//foreach($minutes as $provider=>$apikeys) foreach($apikeys as $apikey=>$days) foreach($days as $day=>$data){
$prevday=0;
foreach($_days as $day=>$daydata) foreach($_providers as $provider=>$providerdata) foreach($_apikeys as $apikey=>$apikeydata)
if(isset($minutes[$provider][$apikey]) && isset($minutes[$provider][$apikey][$day])){
if($prevday != $day){
    echo "<center><h1>".substr($day,0,2)."-".substr($day,2,2)."-".substr($day,4,2)."</h1></center>";
    $prevday=$day;
}
?>
<div id="chart_div_<?=$day?>_<?=$provider?>_<?=$apikey?>"></div>    
<?php } ?>
</body>
</html>