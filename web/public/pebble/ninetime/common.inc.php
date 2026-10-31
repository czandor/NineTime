<?php
require_once __DIR__ . '/../../../bootstrap.php';

$actualVersion=file_get_contents("version.txt");
$fonttypes=array("","9","o","r","a");
if($CONFIG_VERSION >= 1.80) $fonttypes=array("","9","o","r","a","l","b");
$analogtypes=array("analog-num-config","analog-partline-config","analog-fulline-config");
$digitnames=array("top left","top right","bottom left","bottom right");
$colororder=array(0,1,2,3,4,5,6,7,16,17,18,19,20,21,22,23,32,33,34,35,36,37,38,39,48,49,50,51,52,53,54,55,8,9,10,11,12,13,14,15,24,25,26,27,28,29,30,31,40,41,42,43,44,45,46,47,56,57,58,59,60,61,62,63);
$refreshtimes=array(5=>"5 minutes (very high battery usage)",
                    10=>"10 minutes (high battery usage)",
                    15=>"15 minutes (moderate battery usage)",
                    30=>"30 minutes (low battery usage)",
                    60=>"1 hour",
                    61=>"At morning and night",
                    62=>"At morning");
$infoTypes=array('Custom','Positive words');
$settingboxes=array(array('facebox','config-icon-face'.(($platform == "chalk" && $CONFIG_VERSION >= 1.3)?"-round":"")),
                    array('verticalbox','config-icon-vert'.(($platform == "chalk" && $CONFIG_VERSION >= 1.3)?"-round":"")),
                    array('horizontal1box','config-icon-hor'.(($platform == "chalk" && $CONFIG_VERSION >= 1.3)?"-round":"")),
                    array('horizontal2box','config-icon-hor2'.(($platform == "chalk" && $CONFIG_VERSION >= 1.3)?"-round":"")),
                    array('vibratebox','config-icon-vibrate2'),
                    array('weatherbox','config-icon-weather'),
                    array('datebox','config-icon-date'),
                    array('infobox','config-icon-info'),
                    array('customtextbox','config-icon-text'),
                    array('updatebox','config-icon-update')
                    );
function to2Digit($num) {
    if ($num > 9) return ''.$num;
    return '0'.$num;
}
function hourToNum($hour,$justnum=false){
    global $h24;
    if($h24) return to2Digit($hour);
    if($justnum) return date("h", strtotime("$hour:00"));
    return strtoupper(date("h a", strtotime("$hour:00")));
}

function faceRow($facetype,$number,$header,$digitpreview=false){
    global $fonttypes,$analogtypes,$CONFIG_VERSION;
    if($header) echo "<div class=\"config-row-explain\">$header</div>";
    if(substr($facetype,0,1)>5){ //horizontal icon
        ?>
        <div class="config-row config-row-icon2">
            <div class="config-image config-image-icon config-image-icon2">
                <img id="config-<?=$facetype?>-img" />
                <div id="config-<?=$facetype?>-month" class="month" id="config-<?=$facetype?>-img-text">34°|12°</div>
            </div>
            <div class="config-color config-color-icon">
                <div class="config-font-head">Text</div>
                <div class="select-color" id="config-<?=$facetype?>-textcolor" onclick="change(this)"></div>
            </div>
            <div class="config-color config-color-icon">
                <div class="config-font-head">Backg.</div>
                <div class="select-color" id="config-<?=$facetype?>-bg" onclick="change(this)"></div>
            </div>
            <div class="config-color config-color-icon">
                <div class="config-font-head">Line</div>
                <div class="select-color" id="config-<?=$facetype?>-line" onclick="change(this)"></div>
            </div>
            <div class="config-color config-color-icon">
                <div class="config-color-head">Icon</div>
                <div class="select-color" id="config-<?=$facetype?>-icon" onclick="change(this)"></div>
            </div>
            <div class="config-color config-color-icon">
                <div class="config-bg-head">Iconbg.</div>
                <div class="select-color" id="config-<?=$facetype?>-iconbg" onclick="change(this)"></div>
            </div>
            <div class="clear"></div>
        </div>
        <?php
    }
    elseif(substr($facetype,0,1)==5){ //vertical icon
        ?>
        <div class="config-row">
            <div class="config-image config-image-icon">
                <img id="config-<?=$facetype?>-img" />
                <div id="config-<?=$facetype?>-dayname" class="dayname" id="config-<?=$facetype?>-img-text">THU</div>
                <div id="config-<?=$facetype?>-day" class="day" id="config-<?=$facetype?>-img-textinner">15</div>
                <div id="config-<?=$facetype?>-month" class="month" id="config-<?=$facetype?>-img-text">NOV</div>
            </div>
            <div class="config-color config-color-icon">
                <div class="config-font-head">Text</div>
                <div class="select-color" id="config-<?=$facetype?>-textcolor" onclick="change(this)"></div>
            </div>
            <div class="config-color config-color-icon">
                <div class="config-font-head">Backg.</div>
                <div class="select-color" id="config-<?=$facetype?>-bg" onclick="change(this)"></div>
            </div>
            <div class="config-color config-color-icon">
                <div class="config-font-head">Line</div>
                <div class="select-color" id="config-<?=$facetype?>-line" onclick="change(this)"></div>
            </div>
            <div class="config-color config-color-icon">
                <div class="config-color-head">Icon</div>
                <div class="select-color" id="config-<?=$facetype?>-icon" onclick="change(this)"></div>
            </div>
            <div class="config-color config-color-icon">
                <div class="config-bg-head">Iconbg.</div>
                <div class="select-color" id="config-<?=$facetype?>-iconbg" onclick="change(this)"></div>
            </div>
            <div class="clear"></div>
        </div>
        <?php
    }
    elseif(substr($facetype,0,1)==2){ //analog
        list($semmi,$analogtype)=explode("-",$facetype);
        ?>
        <div class="config-row row-analog">
            <div class="config-image">
                <img id="config-face-<?=$facetype?>-img-<?=$number?>" />
            </div>
            <?php if($CONFIG_VERSION >= 1.5) {?>
            <div class="config-color" style="width: 25%;">
                <div class="config-color-head">Hour</div>
                <div class="select-color" id="config-face-<?=$facetype?>-hour-<?=$number?>" onclick="change(this)"></div>
            </div>
            <?php } ?>
            <div class="config-color"<?=($CONFIG_VERSION >= 1.5)?"style=\"width:25%;\"":""?>>
                <div class="config-color-head">Minute</div>
                <div class="select-color" id="config-face-<?=$facetype?>-font-<?=$number?>" onclick="change(this)"></div>
            </div>
            <div class="config-font"<?=($CONFIG_VERSION >= 1.5)?"style=\"width:25%;\"":""?>>
                <div class="config-font-head">Face</div>
                <div class="select-color" id="config-face-<?=$facetype?>-color-<?=$number?>" onclick="change(this)"></div>
            </div>
            <div class="config-bg"<?=($CONFIG_VERSION >= 1.5)?"style=\"width:25%;\"":""?>>
                <div class="config-bg-head">Backg.</div>
                <div class="select-color" id="config-face-<?=$facetype?>-bg-<?=$number?>" onclick="change(this)"></div>
            </div>
            <div class="clear"></div>
        </div>
        <?php
    }
    else{
        ?>
        <div class="config-row"<?=($facetype == 4)?" style='height:70px;'":""?>>
            <div class="config-image"<?=($facetype == 4)?" style='height:70px;'":""?>>
                <?php if($facetype == 4){ ?>
                <img class="digit-0a" id="config-face-<?=$facetype?>-img-0" />
                <img class="digit-1a" id="config-face-<?=$facetype?>-img-1" />
                <img class="digit-2a" id="config-face-<?=$facetype?>-img-2" />
                <img class="digit-3a" id="config-face-<?=$facetype?>-img-3" />
                <?php } else { ?>
                <img class="<?=($digitpreview!==false)?"digit-".($digitpreview):""?>" id="config-face-<?=$facetype?>-img-<?=$number?>" />
                <?php } ?>
            </div>
            <div<?=($number==100)?" style='visibility: hidden;'":""?> class="config-font">
                <div class="config-font-head">Font style</div>
                <?php foreach($fonttypes as $key=>$value){
                    ?><img style="width:<?=(100-20)/(count($fonttypes)-1)?>%;" onclick="change(this)" class="" id="config-face-<?=$facetype?>-font-<?=$number?>-<?=$key?>" src="images/<?=($number%10)?><?=$value?>.png" onchange="change(this)" /><?php } ?>
                <?php if($facetype == 4){ ?><div class="config-font-foot" id="config-face-<?=$facetype?>-foot-<?=$number?>"></div> <?php } ?>
            </div>
            <div<?=($number==100)?" style='visibility: hidden;'":""?> class="config-color">
                <div class="config-color-head">Color</div>
                <div class="select-color" id="config-face-<?=$facetype?>-color-<?=$number?>" onclick="change(this)"></div>
            </div>
            <div class="config-bg">
                <div class="config-bg-head">Backg.</div>
                <div class="select-color" id="config-face-<?=$facetype?>-bg-<?=$number?>" onclick="change(this)"></div>
            </div>
            <div class="clear"></div>
        </div>
        <?php
    }
}



?>