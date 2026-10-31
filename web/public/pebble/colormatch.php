<?php
require_once __DIR__ . '/../../bootstrap.php';
ninetime_require_admin();

class pebblecolor{
    protected $rgb;
    protected $rgbsun;
    protected $name;
    public function __construct($name,$rgb,$rgbsun){
        $this->rgb=$rgb;
        $this->rgbsun=$rgbsun;
        $this->name=$name;
    }
    public function getColor($vivid=true){
        if(!$vivid) return "#".$this->rgbsun;
        return "#".$this->rgb;
    }
}
$pebblecolors=Array();

$pebblecolors[0]=new pebblecolor("GColorBlack","000000","000000");
$pebblecolors[1]=new pebblecolor("GColorOxfordBlue","000055","001E41");
$pebblecolors[2]=new pebblecolor("GColorDukeBlue","0000AA","004387");
$pebblecolors[3]=new pebblecolor("GColorBlue","0000FF","0068CA");
$pebblecolors[4]=new pebblecolor("GColorDarkGreen","005500","2B4A2C");
$pebblecolors[5]=new pebblecolor("GColorMidnightGreen","005555","27514F");
$pebblecolors[6]=new pebblecolor("GColorCobaltBlue","0055AA","16638D");
$pebblecolors[7]=new pebblecolor("GColorBlueMoon","0055FF","007DCE");
$pebblecolors[8]=new pebblecolor("GColorIslamicGreen","00AA00","5E9860");
$pebblecolors[9]=new pebblecolor("GColorJaegerGreen","00AA55","5C9B72");
$pebblecolors[10]=new pebblecolor("GColorTiffanyBlue","00AAAA","57A5A2");
$pebblecolors[11]=new pebblecolor("GColorVividCerulean","00AAFF","4CB4DB");
$pebblecolors[12]=new pebblecolor("GColorGreen","00FF00","8EE391");
$pebblecolors[13]=new pebblecolor("GColorMalachite","00FF55","8EE69E");
$pebblecolors[14]=new pebblecolor("GColorMediumSpringGreen","00FFAA","8AEBC0");
$pebblecolors[15]=new pebblecolor("GColorCyan","00FFFF","84F5F1");
$pebblecolors[16]=new pebblecolor("GColorBulgarianRose","550000","4A161B");
$pebblecolors[17]=new pebblecolor("GColorImperialPurple","550055","482748");
$pebblecolors[18]=new pebblecolor("GColorIndigo","5500AA","40488A");
$pebblecolors[19]=new pebblecolor("GColorElectricUltramarine","5500FF","2F6BCC");
$pebblecolors[20]=new pebblecolor("GColorArmyGreen","555500","564E36");
$pebblecolors[21]=new pebblecolor("GColorDarkGray","555555","545454");
$pebblecolors[22]=new pebblecolor("GColorLiberty","5555AA","4F6790");
$pebblecolors[23]=new pebblecolor("GColorVeryLightBlue","5555FF","4180D0");
$pebblecolors[24]=new pebblecolor("GColorKellyGreen","55AA00","759A64");
$pebblecolors[25]=new pebblecolor("GColorMayGreen","55AA55","759D76");
$pebblecolors[26]=new pebblecolor("GColorCadetBlue","55AAAA","71A6A4");
$pebblecolors[27]=new pebblecolor("GColorPictonBlue","55AAFF","69B5DD");
$pebblecolors[28]=new pebblecolor("GColorBrightGreen","55FF00","9EE594");
$pebblecolors[29]=new pebblecolor("GColorScreaminGreen","55FF55","9DE7A0");
$pebblecolors[30]=new pebblecolor("GColorMediumAquamarine","55FFAA","9BECC2");
$pebblecolors[31]=new pebblecolor("GColorElectricBlue","55FFFF","95F6F2");
$pebblecolors[32]=new pebblecolor("GColorDarkCandyAppleRed","AA0000","99353F");
$pebblecolors[33]=new pebblecolor("GColorJazzberryJam","AA0055","983E5A");
$pebblecolors[34]=new pebblecolor("GColorPurple","AA00AA","955694");
$pebblecolors[35]=new pebblecolor("GColorVividViolet","AA00FF","8F74D2");
$pebblecolors[36]=new pebblecolor("GColorWindsorTan","AA5500","9D5B4D");
$pebblecolors[37]=new pebblecolor("GColorRoseVale","AA5555","9D6064");
$pebblecolors[38]=new pebblecolor("GColorPurpureus","AA55AA","9A7099");
$pebblecolors[39]=new pebblecolor("GColorLavenderIndigo","AA55FF","9587D5");
$pebblecolors[40]=new pebblecolor("GColorLimerick","AAAA00","AFA072");
$pebblecolors[41]=new pebblecolor("GColorBrass","AAAA55","AEA382");
$pebblecolors[42]=new pebblecolor("GColorLightGray","AAAAAA","ABABAB");
$pebblecolors[43]=new pebblecolor("GColorBabyBlueEyes","AAAAFF","A7BAE2");
$pebblecolors[44]=new pebblecolor("GColorSpringBud","AAFF00","C9E89D");
$pebblecolors[45]=new pebblecolor("GColorInchworm","AAFF55","C9EAA7");
$pebblecolors[46]=new pebblecolor("GColorMintGreen","AAFFAA","C7F0C8");
$pebblecolors[47]=new pebblecolor("GColorCeleste","AAFFFF","C3F9F7");
$pebblecolors[48]=new pebblecolor("GColorRed","FF0000","E35462");
$pebblecolors[49]=new pebblecolor("GColorFolly","FF0055","E25874");
$pebblecolors[50]=new pebblecolor("GColorFashionMagenta","FF00AA","E16AA3");
$pebblecolors[51]=new pebblecolor("GColorMagenta","FF00FF","DE83DC");
$pebblecolors[52]=new pebblecolor("GColorOrange","FF5500","E66E6B");
$pebblecolors[53]=new pebblecolor("GColorSunsetOrange","FF5555","E6727C");
$pebblecolors[54]=new pebblecolor("GColorBrilliantRose","FF55AA","E37FA7");
$pebblecolors[55]=new pebblecolor("GColorShockingPink","FF55FF","E194DF");
$pebblecolors[56]=new pebblecolor("GColorChromeYellow","FFAA00","F1AA86");
$pebblecolors[57]=new pebblecolor("GColorRajah","FFAA55","F1AD93");
$pebblecolors[58]=new pebblecolor("GColorMelon","FFAAAA","EFB5B8");
$pebblecolors[59]=new pebblecolor("GColorRichBrilliantLavender","FFAAFF","ECC3EB");
$pebblecolors[60]=new pebblecolor("GColorYellow","FFFF00","FFEEAB");
$pebblecolors[61]=new pebblecolor("GColorIcterine","FFFF55","FFF1B5");
$pebblecolors[62]=new pebblecolor("GColorPastelYellow","FFFFAA","FFF6D3");
$pebblecolors[63]=new pebblecolor("GColorWhite","FFFFFF","FFFFFF");


$link=ninetime_db();

if(isset($_POST['save'])){
    $SQL="TRUNCATE colors_notfit";
    $res=mysqli_query($link,$SQL);
    $colors=array();
    for($i=0 ; $i<64 ; $i++) $colors[$i]=array(0,array());
    foreach($_POST as $key=>$value){
        list($type,$bgId,$textId)=explode("-",$key);
        $value=$value*1;
        if($type=="bgdisabled" && $value==1){
            $colors[$bgId*1][0]=1;
        }
        if($type=="colordisabled" && $value==1){
            $colors[$bgId*1][1][]=$textId*1;
        }
    }
    foreach($colors as $bgId=>$value){
        list($bg_disabled,$disabled_text_colorids)=$value;
        $SQL="insert into colors_notfit set bg_colorid=$bgId , bg_disabled=$bg_disabled , disabled_text_colorids='".implode(",",$disabled_text_colorids)."' ";
        $res=mysqli_query($link,$SQL);
    }
}
//var_dump($colors);
//var_dump($_POST);

$SQL="select * from colors_notfit";
$res=mysqli_query($link,$SQL);
$colors=array();
for($i=0 ; $i<64 ; $i++) $colors[$i]=array(0,array());
while($row=mysqli_fetch_object($res)){
    $disabled_text_colorids_=explode(",",$row->disabled_text_colorids);
    $disabled_text_colorids=array();
    foreach($disabled_text_colorids_ as $value) if($value !== "") $disabled_text_colorids[]=$value*1;
    $colors[$row->bg_colorid]=array($row->bg_disabled*1,$disabled_text_colorids);
}

//var_dump($colors);
?>
<script>
    function bgChoose(bgId){
        for(let i=0 ; i < 64 ; i++){
            document.getElementById('bg-'+i).style.display='none';
        }
        document.getElementById('bg-'+bgId).style.display='block';
    }
    function colorClick(obj,bgId,colorId){
        let isEnabled=(document.getElementById('colordisabled-'+bgId+'-'+colorId).value)=='0';
        console.log(obj,bgId,colorId,isEnabled);
        isEnabled=!isEnabled;
        document.getElementById('X-'+bgId+'-'+colorId).style.display=isEnabled?"none":"block";
        document.getElementById('colordisabled-'+bgId+'-'+colorId).value=(isEnabled)?'0':'1';
    }
    function bgClick(obj,bgId){
        let isEnabled=(document.getElementById('bgdisabled-'+bgId).value)=='0';
        console.log(obj,bgId,isEnabled);
        isEnabled=!isEnabled;
        document.getElementById('X-'+bgId).style.display=isEnabled?"none":"block";
        document.getElementById('bgdisabled-'+bgId).value=(isEnabled)?'0':'1';
    }
</script>
<form method="post">
<?php

foreach($pebblecolors as $bgId=>$bgColor){
    ?>
    <div onclick="bgChoose(<?=$bgId?>)"
         style="cursor: pointer;text-align: center; border: 1px solid black; margin: 1%; float: left; width: 1%; height: 20px;
                color: <?=$pebblecolors[abs($bgId-63)]->getColor(true)?>; background-color: <?=$bgColor->getColor(false)?>;">
        <?=$bgId?>
    </div>
    <?php
}
?>
<div style="clear: both"></div>
<?php
foreach($pebblecolors as $bgId=>$bgColor){
    ?>
    <div id="bg-<?=$bgId?>"
         style="display: none; position: relative; text-align: center; border: 1px solid black; margin: 1%; width: 1000px; height: 500px;
                background-color: <?=$bgColor->getColor(false)?>;">
        <?php
        foreach($pebblecolors as $textId=>$textColor){
            $disabled=in_array($textId,$colors[$bgId][1]);
            ?>
            <div onclick="colorClick(this,<?=$bgId?>,<?=$textId?>)"
                    style="position: relative; cursor: pointer;font-size: 50px; font-weight: bold; width: 52px; border: 1px solid black; float: left; padding: 2px; margin: 2px;
                    -webkit-text-stroke: 2px black;font-family: sans-serif;
                    color: <?=$textColor->getColor(true)?>;"><?=$textId?><div id="X-<?=$bgId?>-<?=$textId?>" style="display: <?=($disabled)?"block":"none"?>; position: absolute; top:-4px; left:-4px; font-size:50px;">❌</div></div>
            <input type="hidden" name="colordisabled-<?=$bgId?>-<?=$textId?>" id="colordisabled-<?=$bgId?>-<?=$textId?>" value="<?=($disabled)?1:0?>" />
            <?php
        }
        ?>
        <div style="clear: both"></div>
        <div onclick="bgClick(this,<?=$bgId?>)"
            style="position: relative;margin: auto; padding: 5px;cursor: pointer;font-size: 150px; font-weight: bold; width: 180px; height:  180px; border: 1px solid black;">
            
            <div id="X-<?=$bgId?>" style="display: <?=($colors[$bgId][0])?"block":"none"?>; position: absolute; top:-15px; left:-10px; font-size:150px;">❌</div>
        </div>
        <input type="hidden" name="bgdisabled-<?=$bgId?>" id="bgdisabled-<?=$bgId?>" value="<?=$colors[$bgId][0]?>" />
                    
    </div>
    <?php
}



//$SQL="select id,woeid from pebble.weather_woeids where latitude = ".round($latitude,6)." and longitude = ".round($longitude,6)."";
  //  if($row=mysqli_fetch_object(mysqli_query($link,$SQL))){


?>
<input type="submit" name="save" value="Save" />
</form>


