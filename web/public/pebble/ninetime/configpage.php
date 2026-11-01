<?php
require_once __DIR__ . '/../../../bootstrap.php';

$https_enabled = ninetime_config('force_https', false);
if($https_enabled && (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == "off")){
    $redirect = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ' . $redirect);
    exit();
}
session_start();

header('Content-Type: text/html; charset=utf-8');

if(isset($_GET['paypal'])){
    if(empty($_SESSION["token"])) {
        header("Location: index.php?paypal=".$_GET['paypal']);
        exit();
    }
    $_GET['token']=$_SESSION["token"];
    $_GET['platform']=$_SESSION["platform"];
    $_GET['model']=$_SESSION["model"];
    $_GET['h24']=$_SESSION["h24"];
    $_GET['return_to']=$_SESSION["return_to"];
    $_GET['CONFIG_VERSION']=$_SESSION["CONFIG_VERSION"];
    $_GET['batt']=$_SESSION["batt"];
}
$watchtoken=$_SESSION["token"]=(isset($_GET['token']))?$_GET['token']:"";
$platform=$_SESSION["platform"]=(isset($_GET['platform']))?$_GET['platform']:"";
$PBL_HEALTH=($platform=='basalt'||$platform=='chalk'||$platform=='diorite'||$platform=='emery')?1:0;
$PBL_COLOR=($platform=='basalt'||$platform=='chalk'||$platform=='emery')?1:0;
$model=$_SESSION["model"]=(isset($_GET['model']))?$_GET['model']:"";
$PBL_HR=substr_count($model,"_hr_")+substr_count($model,"qemu_platform_diorite");
$h24=$_SESSION["h24"]=(isset($_GET['h24']))?($_GET['h24']*1):0;
if($h24 > 1) $h24=0;
$return_to=$_SESSION["return_to"]=isset($_GET['return_to'])?$_GET['return_to']:"pebblejs://close#";
$CONFIG_VERSION=$_SESSION["CONFIG_VERSION"]=(isset($_GET['CONFIG_VERSION']))?$_GET['CONFIG_VERSION']*1:1;
$batt=$_SESSION["batt"]=(isset($_GET['batt']))?$_GET['batt']:"-1";
$paypal=(isset($_GET['paypal']))?$_GET['paypal']:"";
$emulator=substr_count($model,"qemu");
//if($emulator) $CONFIG_VERSION=1;

$gadgetbridge=0;
if(substr_count($return_to,"gadgetbridge")) $gadgetbridge=1;
elseif(!empty($_SESSION['gadgetbridge'])) $gadgetbridge=$_SESSION['gadgetbridge']*1;
$_SESSION['gadgetbridge']=$gadgetbridge;

require("common.inc.php");

if(!$watchtoken || !$platform || !$model || !$CONFIG_VERSION) die("Please start from phone");
?>
<!doctype html>
<html lang="en">
    <head>
        <meta http-equiv="Content-type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>NineTime settings</title>
        <script>
            var NINETIME_BASE_URL = <?=json_encode(ninetime_url(''), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT)?>;
            var platform='<?=$platform?>';
            var model='<?=$model?>';
            var watchtoken='<?=$watchtoken?>';
            var return_to='<?=$return_to?>';
            var batt='<?=$batt?>';
            var h24=<?=$h24?>;
            var CONFIG_VERSION='<?=$CONFIG_VERSION?>';
            var actualVersion=<?=json_encode(trim(file_get_contents(__DIR__ . '/version.txt')))?>;
            var PBL_HEALTH=<?=$PBL_HEALTH?>;
            var PBL_COLOR=<?=$PBL_COLOR?>;
            var PBL_HR=<?=$PBL_HR?>;
            var paypal='<?=$paypal?>';
            var emulator=<?=$emulator?>;
            var gadgetbridge=<?=$gadgetbridge?>;
            var analogtypes=['<?=implode("','",$analogtypes)?>'];
            var imageurl='images.php?<?=filemtime("images.php")?>';
            if (paypal == 'success') localStorage.setItem('paypalsuccess','1');
        </script>
        <script src="js/loadsave.js?<?=filemtime("js/loadsave.js")?>"></script>
        <script src="js/send.js?<?=filemtime("js/send.js")?>"></script>
        <script src="js/info.js?<?=filemtime("js/info.js")?>"></script>
        <script src="js/weather.js?<?=filemtime("js/weather.js")?>"></script>
        <script src="js/languages.js?<?=filemtime("js/languages.js")?>"></script>
        <script src="js/draw.js?<?=filemtime("js/draw.js")?>"></script>
        <script src="js/const.js?<?=filemtime("js/const.js")?>"></script>
        <script src="js/js.js?<?=filemtime("js/js.js")?>"></script>
        <script src="js/settings-ui.js?<?=filemtime("js/settings-ui.js")?>"></script>
        <script>
            //loadData();
            //saveData(1);
            //console.log(localStorage.getItem(watchtoken+'-'+platform));
            //loadData(1);
        </script>


        <link rel="stylesheet" type="text/css" href="css/style.css?<?=filemtime("css/style.css")?>">
        <link rel="stylesheet" href="css/settings.css?<?=filemtime("css/settings.css")?>">
        <script>document.addEventListener("DOMContentLoaded",init);</script>
    </head>

<body class="ninetime-settings" onunload="deinit();">
<header class="header" id="div-header">
    <div class="header-main">
        <div class="brand"><img src="images/appicon-color.png" alt="" />NineTime <span class="version"><?=htmlspecialchars($actualVersion)?></span></div>
        <button onclick="cancelClose()">Cancel</button>
        <button onclick="showLoadSave()">Profiles</button>
        <button class="primary" onclick="sendData()">Save to watch</button>
    </div>
    <nav class="settingsboxnavigate" aria-label="Settings sections">
    <?php
    $navigationLabels=array('Face','Sidebar','Row','Extra rows','Alerts','Weather','Date','Info','Text','About');
    foreach($settingboxes as $key=>$box){ ?>
        <button type="button" data-section="<?=$box[0]?>" onclick="scrollToSettings('<?=$box[0]?>')"><img id="<?=$box[0]?>-scrollimg" src="images/<?=$box[1]?>.png" alt="" /><?=$navigationLabels[$key]?></button>
    <?php } ?>
    </nav>
</header>
<div class="page" id="div-page">
    <div class="settingsbox" id="facebox">
        <div class="head"><img src="images/config-icon-face<?=($platform == "chalk" && $CONFIG_VERSION >= 1.3)?"-round":""?>.png" />WatchFace style</div>
        <div class="tabs" id="tabs-face">
            <div class="tabs-tab" id="tabs-face-4" onclick="change(this)">Digital<br/><span>Simple</span></div>
            <div class="tabs-tab" id="tabs-face-0" onclick="change(this)">Digital<br/><span>Individually per digit</span></div>
            <div class="tabs-tab" id="tabs-face-1" onclick="change(this)">Digital<br/><span>Hourly custom style</span></div>
            <div class="tabs-tab" id="tabs-face-2" onclick="change(this)">Analog<br/><span>Customizable</span></div>
            <div class="clear"></div>
        </div>
        
        
        
        <div style="display: none;" class="config" id="config-face-4">
            <?php faceRow("4",0,"For all digits, at every hour",false)  ?>
        </div>
        <div style="display: none;" class="config" id="config-face-0-0">
            <div class="subtabs">
                <div class="tabs-tab selected" onclick="change(document.getElementById('config-face-0-0'))">Per Digit</div>
                <div class="tabs-tab" onclick="change(document.getElementById('config-face-0-1'))">Per Number</div>
                <div class="tabs-tab" onclick="change(document.getElementById('config-face-0-2'))">Detailed</div>
                <div class="clear"></div>
            </div>
            <?php for($a = 0 ; $a < 4 ; $a++) faceRow("0-0",$a,"For ".$digitnames[$a]." digit",$a)  ?>
        </div>
        <div style="display: none;" class="config" id="config-face-0-1">
            <div class="subtabs">
                <div class="tabs-tab" onclick="change(document.getElementById('config-face-0-0'))">Per Digit</div>
                <div class="tabs-tab selected" onclick="change(document.getElementById('config-face-0-1'))">Per Number</div>
                <div class="tabs-tab" onclick="change(document.getElementById('config-face-0-2'))">Detailed</div>
                <div class="clear"></div>
            </div>
            <?php for($a = 0 ; $a < 11 ; $a++) {
                if($a == 10) faceRow("0-1",100,"For empty number",false);
                else faceRow("0-1",$a,"For number #$a",false);
            }
            ?>
        </div>
        <div style="display: none;" class="config" id="config-face-0-2">
            <div class="subtabs">
                <div class="tabs-tab" onclick="change(document.getElementById('config-face-0-0'))">Per Digit</div>
                <div class="tabs-tab" onclick="change(document.getElementById('config-face-0-1'))">Per Number</div>
                <div class="tabs-tab selected" onclick="change(document.getElementById('config-face-0-2'))">Detailed</div>
                <div class="clear"></div>
                <div class="tabs-tab tabs-tab4" style="visibility: hidden;"></div>
                <div class="tabs-tab tabs-tab4" id="config-face-0-2-0" onclick="change(this)">Digit 0</div>
                <div class="tabs-tab tabs-tab4" id="config-face-0-2-1" onclick="change(this)">Digit 1</div>
                <div class="tabs-tab tabs-tab4" style="visibility: hidden;"></div>
                <div class="tabs-tab tabs-tab4" style="visibility: hidden;"></div>
                <div class="tabs-tab tabs-tab4" id="config-face-0-2-2" onclick="change(this)">Digit 2</div>
                <div class="tabs-tab tabs-tab4" id="config-face-0-2-3" onclick="change(this)">Digit 3</div>
                <div class="clear"></div>
            </div>
            <?php for ($i=0 ; $i<4 ; $i++){ ?>
            <div id="config-face-0-2-<?=$i?>-rows" style="display: none;">
                <?php
                $ig=9;
                if($i==0) $ig=3;
                if($i==2) $ig=5;
                for($a = 0 ; $a <= $ig ; $a++) {
                    if($i == 0 && $a == 3) faceRow("0-2-$i",100,"For empty number",$i);
                    else faceRow("0-2-$i",$a,"For number #$a",$i);
                }
                ?>
            </div>
            <?php } ?>
        </div>



        <div style="display: none;" class="config" id="config-face-1-0">
            <div class="subtabs">
                <div class="tabs-tab tabs-tab2 selected" onclick="change(document.getElementById('config-face-1-0'))">Day/Night</div>
                <div class="tabs-tab tabs-tab2" onclick="change(document.getElementById('config-face-1-1'))">Per Hour</div>
                <div class="clear"></div>
            </div>
            <?php
            faceRow("1-0",6,"During day <span>".hourToNum(6)." - ".hourToNum(21)."</span>",false);
            faceRow("1-0",9,"During night <span>".hourToNum(21)." - ".hourToNum(6)."</span>",false);
            ?>
        </div>
        <div style="display: none;" class="config" id="config-face-1-1">
            <div class="subtabs">
                <div class="tabs-tab tabs-tab2" onclick="change(document.getElementById('config-face-1-0'))">Day/Night</div>
                <div class="tabs-tab tabs-tab2 selected" onclick="change(document.getElementById('config-face-1-1'))">Per Hour</div>
                <div class="clear"></div>
            </div>
            <?php for($a = 0 ; $a < 24 ; $a++){
                faceRow("1-1",$a,"At hour ".hourToNum($a)."",false);
            }
            ?>
        </div>
        
        
        <?php foreach($analogtypes as $key=>$value){ ?>
        <div style="display: none;" class="config" id="config-face-2-<?=$key?>">
            <div class="analogface">
                <?php foreach($analogtypes as $key2=>$value2){ ?>
                <img class="<?=($key == $key2)?"selected":""?>" onclick="change(document.getElementById('config-face-2-<?=$key2?>'))" src="images.php?icon=<?=$value2?>&black=000000&white=000000" />
                <?php } ?>
            </div>
            <div class="subtabs">
                <div onclick="change(this)" id="config-face-2-<?=$key?>-2" class="tabs-tab">Simple</div>
                <div onclick="change(this)" id="config-face-2-<?=$key?>-0" class="tabs-tab">Day/Night</div>
                <div onclick="change(this)" id="config-face-2-<?=$key?>-1" class="tabs-tab">Per Hour</div>
                <div class="clear"></div>
            </div>
            <div style="display: none;" id="config-face-2-<?=$key?>-2-rows">
            <?php
            faceRow("2-$key-2",0,"Just a simple colors",false);
            ?>
            </div>
            <div style="display: none;" id="config-face-2-<?=$key?>-0-rows">
            <?php
            faceRow("2-$key-0",0,"During day <span>".hourToNum(6)." - ".hourToNum(21)."</span>",false);
            faceRow("2-$key-0",1,"During night <span>".hourToNum(21)." - ".hourToNum(6)."</span>",false);
            ?>
            </div>
            <div style="display: none;" id="config-face-2-<?=$key?>-1-rows">
            <?php for($a = 0 ; $a < 24 ; $a++){
                faceRow("2-$key-1",$a,"At hour ".hourToNum($a)."",false);
            }?>
            </div>
            <div class="inputrow" style="<?=($CONFIG_VERSION < 1.64)?" display: none;":""?>">
                <div class="left">Show Digital Time at</div>
                <div class="right">
                    <select id="config-face-2-<?=$key?>-0-showtime-0-0" onchange="change(this)">
                        <option value="0">Hide</option>
                        <option value="1">Top of the face</option>
                        <option value="2">Bottom of the face</option>
                    </select>
                </div>
                <div class="clear"></div>
            </div>
            <div class="inputrow" style="<?=($CONFIG_VERSION < 1.64)?" display: none;":""?>">
                <div class="left">Show Date at</div>
                <div class="right">
                    <select id="config-face-2-<?=$key?>-0-showdate-0-0" onchange="change(this)">
                        <option value="0">Hide</option>
                        <?php if($CONFIG_VERSION < 1.70) { ?>
                        <option value="1">Top of the face</option>
                        <option value="2">Bottom of the face</option>
                        <?php } else { ?>
                        <option value="1">Top of the face with Month name</option>
                        <option value="2">Bottom of the face with Month name</option>
                        <option value="3">Top of the face with Day name</option>
                        <option value="4">Bottom of the face with Day name</option>
                        <?php } ?>
                    </select>
                </div>
                <div class="clear"></div>
            </div>
        </div>
        <?php } ?>
        <div class="inputrow hidden-box" id="hour-leading">
            <input type='checkbox' id='hour-leading-0' onclick="change(this)" /><label for="hour-leading-0">Hour leading zero</label>
        </div>
    </div>
    
    <div class="settingsbox" id="verticalbox">
        
        <div class="head"><img src="images/config-icon-vert<?=($platform == "chalk" && $CONFIG_VERSION >= 1.3)?"-round":""?>.png" />Vertical column settings</div>
        <?php
        faceRow("5",0,"",false);
        ?>
        <div class="inputrow" style="<?=($platform == "chalk" && $CONFIG_VERSION >= 1.3)?" display: none;":""?>">
            <div class="left">Column position</div>
            <div class="right">
                <select id="vertical-position-0" onchange="change(this)">
                    <option value="1">Left</option>
                    <option value="2">Right</option>
                </select>
            </div>
            <div class="clear"></div>
        </div>
        <div class="inputrow">
            <div class="left">Status icon place</div>
            <div class="right">
                <select id="vertical-status-pos-0" onchange="change(this)">
                    <?php if($platform == "chalk" && $CONFIG_VERSION >= 1.3) { ?>
                    <option value="1">Left Top</option>
                    <option value="2">Left Bottom</option>
                    <option value="3">Right Top</option>
                    <option value="4">Right Bottom</option>
                    <?php } else { ?>
                    <option value="1">Top</option>
                    <option value="2">Bottom</option>
                    <?php } ?>
                </select>
            </div>
            <div class="clear"></div>
        </div>
        <div class="inputrow" style="<?=($CONFIG_VERSION >= 1.60)?"":" display: none;"?>">
            <div class="left">Status icon show</div>
            <div class="right vertical-status-icon"><img id="vertical-status-icon-0" onclick="change(this)" style="margin-left:0;" src="images/nosilent.png"
                /><img id="vertical-status-icon-1" onclick="change(this)" src="images/silent.png"
                /><img id="vertical-status-icon-2" onclick="change(this)" src="images/derror.png"
                /><img id="vertical-status-icon-3" onclick="change(this)" src="images/disconnected.png"
                /><img id="vertical-status-icon-4" onclick="change(this)" style="margin-right:0;" src="images/1x1.png" /></div>
            <div class="clear"></div>
        </div>
        <div class="inputrow" style="<?=($CONFIG_VERSION >= 1.60)?"":" display: none;"?>">
            <div class="left" style="width: 100%; padding:0;text-align: center;min-height:0;">
            <span id="vertical-status-icon-info"></span>
            </div>
            <div class="clear"></div>
        </div>
        <div class="inputrow" style="<?=($CONFIG_VERSION >= 1.70)?"":" display: none;"?>">
            <div class="left" style="padding-top:0;">Show seconds in<br/>status icon place</div>
            <div class="right">
                <select id="vertical-show-seconds-0" onchange="change(this)">
                    <option value="0">Never</option>
                    <option value="1">Show when icon is hidden (high battery usage)</option>
                    <option value="2">Show on tap/shake for 10secs (moderate battery usage)</option>
                    <option value="3">Show on double tap/shake for 10secs (low battery usage)</option>
                </select>
            </div>
            <div class="clear"></div>
        </div>
        <br/>
        <div class="inputrow" style="position: relative; <?=($CONFIG_VERSION >= 1.3)?"padding-bottom:".(($platform=="chalk")?"70":"30")."px;":""?>">
            <div class="left">Icon <?=($platform == "chalk" && $CONFIG_VERSION >= 1.3)?"Left":"Top"?></div>
            <div class="right">
                <select id="vertical-icon-pos-0" onchange="change(this)">
                </select>
            </div>
            <div class="clear"></div>
            <div class="verticons-box<?=($platform == "chalk")?" verticons-box-chalk":""?>" style="<?=($CONFIG_VERSION >= 1.3)?"":"display:none"?>">
                <div id="verticons-0"></div>
                <div id="verticons-1"></div>
                <div id="verticons-2"></div>
                <div id="verticons-3"></div>
            </div>
        </div>
        <div class="inputrow" style="<?=($CONFIG_VERSION >= 1.3)?"padding-bottom:30px;":""?><?=($platform == "chalk" && $CONFIG_VERSION >= 1.3)?" display: none;":""?>">
            <div class="left">Icon Middle</div>
            <div class="right">
                <select id="vertical-icon-pos-1" onchange="change(this)" <?=($platform=="chalk")?"disabled":""?>>
                </select>
            </div>
            <div class="clear"></div>
        </div>
        <div class="inputrow" style="<?=($CONFIG_VERSION >= 1.3 && $platform=="chalk")?"padding-bottom:30px;":""?>">
            <div class="left">Icon <?=($platform == "chalk" && $CONFIG_VERSION >= 1.3)?"Right":"Bottom"?></div>
            <div class="right">
                <select id="vertical-icon-pos-2" onchange="change(this)">
                </select>
            </div>
            <div class="clear"></div>
        </div>
    </div>
    
    <div class="settingsbox" id="horizontal1box">
        <div class="head"><img src="images/config-icon-hor<?=($platform == "chalk" && $CONFIG_VERSION >= 1.3)?"-round":""?>.png" />Horizontal row settings</div>
        <?php
        faceRow("6",0,"",false);
        ?>
        <div class="inputrow">
            <div class="left">Row position</div>
            <div class="right">
                <select id="horizontal-position-0" onchange="change(this)">
                    <option value="1">Top</option>
                    <option value="2">Bottom</option>
                </select>
            </div>
            <div class="clear"></div>
        </div>
        <div class="inputrow">
            <div class="left">Content</div>
            <div class="right">
                <select id="horizontal-content-0" onchange="change(this)">
                </select>
            </div>
            <div class="clear"></div>
        </div>
        <div class="inputrow">
            <div class="left">Second horizontal</div>
            <div class="right">
                <select id="horizontal2-show-0" onchange="change(this)">
                    <option value='0'>Do not show</option>
                    <option value='1'>On tap/shake</option>
                    <option value='2'>On double tap/shake</option>
                </select>
            </div>
            <div class="clear"></div>
        </div>
    </div>
    
    <div class="settingsbox hidden-box" id="horizontal2box" style="">
        <div class="head"><img src="images/config-icon-hor2<?=($platform == "chalk" && $CONFIG_VERSION >= 1.3)?"-round":""?>.png" />Horizontal (second) row settings</div>
        <?php
        faceRow("7",0,"",false);
        ?>
        <div class="inputrow">
            <div class="left">Content</div>
            <div class="right">
                <select id="horizontal-content-1" onchange="change(this)">
                </select>
            </div>
            <div class="clear"></div>
        </div>
         <div class="inputrow">
            <div class="left">Show for</div>
            <div class="right">
                <select id="horizontal2-seconds-0" onchange="change(this)">
                </select>
            </div>
            <div class="clear"></div>
        </div>
        <br/>
        <div class="inputrow">
            <div class="left">Third horizontal</div>
            <div class="right">
                <select id="horizontal-content-2" onchange="change(this)">
                </select>
            </div>
            <div class="clear"></div>
        </div>
         <div class="inputrow" id="showthirdfor">
            <div class="left">Hide third after</div>
            <div class="right">
                <select id="horizontal2-seconds-1" onchange="change(this)">
                </select>
            </div>
            <div class="clear"></div>
        </div>
    </div>
    
    <div class="settingsbox" id="vibratebox">
        <div class="head"><img src="images/config-icon-vibrate2.png?" />Vibration and Alert settings</div>
        <br/>
        <div class="inputrow hidden-box" id="phoneconnection-box">
            <div class="left">Phone connection check</div>
            <div class="right">
                <input type="checkbox" id="phoneconnection-0" onchange="change(this)" checked>
                <label for="phoneconnection-0">Enable</label>
                <script>var pci4ios=false;</script>
                <button onclick="obj=document.getElementById('phoneconnection-infoforios');if(pci4ios){pci4ios=false;hideBox(obj)}else{pci4ios=true;showBox(obj)}">Info</button>
            </div>
            <div class="clear"></div>
            <div class="left hidden-box" style="width:100%;padding:5px;text-align: left;" id="phoneconnection-infoforios">
                For iPhone and iPad users!!!<br/>
                <span>On iOS, when the Pebble App is not running (this happens when you close it manually), the watch can not determine the real connection state betwenn the watch and the phone<br/>
                      Here you can disable the connection checking between your Watch and your Pebble App completely.<br/>
                      When you always close(kill) the Pebble App on your phone, it is recommended to disable this feature.<br/>
                      But keep in mind, if you always close the App, the weather service will not working properly.<br/>
                      It's good if you know that when you always close and restart Pebble App using more battery, than when you always let it run.
                </span>
            </div>
            <div class="clear"></div>
        </div>
        <div class="inputrow hidden-box" id="disconnect-type-box">
            <div class="left">When<br/>disconnected</div>
            <div class="right" style="font-weight: normal">
                <input type="checkbox" id="disconnect-type-icon-0" onchange="change(this)" checked><label for="disconnect-type-icon-0">Show icon</label>
                <br/>
                <input type="checkbox" id="disconnect-type-invert-0" onchange="change(this)"><label for="disconnect-type-invert-0">Invert colors</label>
            </div>
            <div class="clear"></div>
        </div>
        <div class="inputrow hidden-box" id="vibrate-disconnect-box">
            <div class="left">Vibrate on disconnect</div>
            <div class="right">
                <select id="vibrate-disconnect-0" onchange="change(this)">
                </select>
            </div>
            <div class="clear"></div>
        </div>
        <div class="inputrow hidden-box" id="vibrate-reconnect-box">
            <div class="left">Vibrate on reconnect</div>
            <div class="right">
                <select id="vibrate-reconnect-0" onchange="change(this)">
                </select>
            </div>
            <div class="clear"></div>
        </div>
        <div class="inputrow">
            <div class="left">Vibrate on interval</div>
            <div class="right">
                <select id="vibrate-period-0" onchange="change(this)">
                    <option value='0'>Disable</option>
                    <option value='15'>Every 15 minutes</option>
                    <option value='30'>Every 30 minutes</option>
                    <option value='60'>Every hour</option>
                </select>
            </div>
            <div class="clear"></div>
        </div>
        <div class="inputrow hidden-box" id="quietcharge-row">
            <div class="left">Quiet when charge</div>
            <div class="right">
                <input type="checkbox" id="quietcharge-0" onchange="change(this)" checked>
                <label for="quietcharge-0">Enable</label>
            </div>
            <div class="clear"></div>
        </div>
        <div class="inputrow hidden-box" id="quiettime-row">
            <div class="left">Quiet time</div>
            <div class="right">
                <?php if($platform == "aplite") {?>
                <input type="checkbox" id="quiettime-0" onclick="change(this)" /><label for="quiettime-0">Enable</label>
                <table id='quiet-enabled' style="display: none"><tr>
                <td>Start</td><td><select id="quiettime-1" onchange="change(this)" style="width: <?=($h24)?"40":"65"?>px;">
                    <?php for($a=0 ; $a<24 ; $a++){ ?>
                    <option value='<?=$a?>'><?=hourToNum($a)?></option>
                    <?php } ?>
                    </select>:<select id="quiettime-2" onchange="change(this)" style="width: 40px;">
                    <?php for($a=0 ; $a<60 ; $a++){ ?>
                    <option value='<?=$a?>'><?=to2Digit($a)?></option>
                    <?php } ?>
                    </select></td>
                </tr><tr>
                <td>End</td><td><select id="quiettime-3" onchange="change(this)" style="width: <?=($h24)?"40":"65"?>px;">
                    <?php for($a=0 ; $a<24 ; $a++){ ?>
                    <option value='<?=$a?>'><?=hourToNum($a)?></option>
                    <?php } ?>
                    </select>:<select id="quiettime-4" onchange="change(this)" style="width: 40px;">
                    <?php for($a=0 ; $a<60 ; $a++){ ?>
                    <option value='<?=$a?>'><?=to2Digit($a)?></option>
                    <?php } ?>
                    </select></td>
                </tr></table>
                <span>On Aplite platform (like your wrist) I can not read your watch quiet time state due the API limitation, so you have to set it here.<br/>This also means, I can not respect when you set quiet time manually on your watch</span>
                <?php } else {?>
                <span>You can set the calendar aware quiet time on your watch, I will respect the value set there and also I will not vibe the watch when you enabled quit time manually.</span>
                <?php } ?>
            </div>
            <div class="clear"></div>
        </div>
        
    </div>

    <div class="settingsbox hidden-box" id="weatherbox">
        <div class="head"><img src="images/config-icon-weather.png" />Weather settings</div>
        <?php if($CONFIG_VERSION < 2) { ?>
        <p class="weather-note">Weather requests reaching this server use new weather data in the original response format. Your phone's existing weather preferences are preserved. Upgrade to 2.00 to choose the new providers and fixed locations.</p>
        <?php } ?>
        <div <?=($CONFIG_VERSION < 2)?'style="display:none"':''?>>
        <div class="inputrow weather-providers">
            <button type="button" class="weather-provider" id="weather-provider-0" onclick="change(this)">Open-Meteo</button>
            <button type="button" class="weather-provider" id="weather-provider-1" onclick="change(this)">MET Norway</button>
        </div>
        <p class="weather-note">Free weather without registration or an API key. Open-Meteo is free for personal, non-commercial use.</p>
        <?php if($gadgetbridge) { ?>
        <p class="weather-note">Gadgetbridge supplies weather through its own integration. These settings apply to the Pebble mobile companion.</p>
        <?php } ?>
        </div>
        <div class="inputrow">
            <div class="left">Refresh time</div>
            <div class="right">
                <select id="weather-refresh-0" onchange="change(this)">
                    <?php foreach($refreshtimes as $key=>$value) { if($key < 15) continue; ?>
                    <option value="<?=$key?>"><?=$value?></option>
                    <?php } ?>
                </select>
            </div>
            <div class="clear"></div>
        </div>
        <div <?=($CONFIG_VERSION < 2)?'style="display:none"':''?>>
        <div class="inputrow hidden-box" id="condition-language">
            <div class="left">Condition language</div>
            <div class="right"><select id="condition-language-0" onchange="change(this)"></select></div>
            <div class="clear"></div>
        </div>
        <div class="inputrow">
            <div class="left">Fixed location</div>
            <div class="right weather-city-search">
                <input placeholder="City name" id="weather-city-input" type="text" maxlength="80" />
                <input id="weather-city-check-0" onclick="change(this)" type="button" value="Find city" />
            </div>
            <div class="clear"></div>
        </div>
        <div class="inputrow">
            <div class="status" id="weather-city-status" role="status" aria-live="polite"></div>
            <select id="weather-city-results" aria-label="Matching cities" hidden onchange="weatherCitySelect(this.value)"></select>
        </div>
        <div class="inputrow">
            <input id="weather-city-saved" type="text" readonly aria-label="Selected weather location" />
            <button type="button" id="weather-city-delete-0" onclick="change(this)">Use phone GPS</button>
        </div>
        <p class="weather-note" id="weather-city-info">Leave the fixed location empty to follow your phone's location.</p>
        <div class="inputrow">
            <div class="left">Units</div>
            <div class="right">
                <select id="weather-units-0" onchange="change(this)">
                    <option value="0">Imperial (°F, mph)</option>
                    <option value="1">Metric (°C, km/h)</option>
                </select>
            </div>
            <div class="clear"></div>
        </div>
        </div>
        <p class="automatic-note">Weather refreshes automatically when you save settings to the watch.</p>
        <p class="weather-note">Forecast: next 24 hours. Data from
            <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a> or
            <a href="https://www.met.no/" target="_blank" rel="noopener">MET Norway</a>
            under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>.
            Location search: Open-Meteo / GeoNames. GPS city names: nearest populated place from <a href="https://www.geonames.org/" target="_blank" rel="noopener">GeoNames</a>.</p>
    </div>

    <div class="settingsbox hidden-box" id="datebox" style="">
        <div class="head"><img src="images/config-icon-date.png" />Date and Time settings</div>
        <div class="hidden-box" id="date-config-date">
            <div class="inputrow">
                <div class="left">Datum format</div>
                <div class="right">
                    <select id="date-config-dateformat-0" onchange="change(this)"></select> 
                </div>
                <div class="clear"></div>
            </div>
        </div>
        <div class="hidden-box" id="date-config-time">
            <div class="inputrow">
                <div class="left">Time format</div>
                <div class="right">
                    <select id="date-config-timeformat-0" onchange="change(this)"></select> 
                </div>
                <div class="clear"></div>
            </div>
        </div>
        <div class="hidden-box" id="date-config-names">
            <div class="inputrow">
                <div class="left">Load from Language</div>
                <div class="right">
                    <select id="loadlanguages-0" onchange="change(this)"></select> 
                </div>
                <div class="clear"></div>
            </div>
            <div class="inputrow">
                <?php
                for($a = 0 ; $a < 7 ; $a++){
                    ?>
                    <div class="left" style="width:25%"><?=date("l",strtotime( 'next Sunday +' . $a . ' days' ))?></div>
                    <div class="right" style="width:25%">
                        <input type="text" id="date-dayname-<?=$a?>" onchange="change(this)" style="width: 50px; font-weight: bold;" maxlength="3" onkeyup="checkInputName(this)" />
                    </div>
                    <?php
                }
                ?> <div class="clear"></div><?php
                for($a = 0 ; $a < 12 ; $a++){
                    ?>
                    <div class="left" style="width:25%"><?=date("F",strtotime( '2000-' .($a+1). '-01' ))?></div>
                    <div class="right" style="width:25%">
                        <input type="text" id="date-monthname-<?=$a?>" onchange="change(this)" style="width: 50px; font-weight: bold;" maxlength="3" onkeyup="checkInputName(this)" />
                    </div>
                    <?php
                }
                ?>
                <div class="clear"></div>
            </div>
        </div>
    </div>
    <div class="settingsbox hidden-box" id="infobox">
        <div class="head"><img src="images/config-icon-info.png" alt="" />Info script</div>
        <fieldset class="settings-group"><legend>Script</legend>
            <div class="inputrow"><div class="left"><label for="info-config-url-0">Script URL</label></div>
                <div class="right"><input type="url" id="info-config-url-0" onchange="change(this)" placeholder="https://your-site.example/info" /></div></div>
            <p class="field-hint" id="info-http-note" hidden>Your existing HTTP address is kept. You can switch to HTTPS if your script supports it.</p>
            <div class="script-actions"><button id="info-config-url-check-0" onclick="change(this)">Test script</button><button onclick="showInfoHelp()">Script help</button></div>
            <pre id="info-config-status-0" class="script-result" role="status" aria-live="polite"></pre>
            <div class="inputrow"><div class="left"><label for="info-config-data-0">Custom data</label></div>
                <div class="right"><input type="text" id="info-config-data-0" onchange="change(this)" /></div></div>
            <p class="field-hint">Passed to your script as the data field. Leave it empty if your script does not need it.</p>
            <div class="inputrow"><input type="checkbox" id="info-config-usepos-0" onchange="change(this)" /><label for="info-config-usepos-0">Share GPS position with this script</label></div>
        </fieldset>
        <fieldset class="settings-group"><legend>Updates</legend>
            <div class="inputrow"><div class="left"><label for="info-refresh-0">Refresh interval</label></div><div class="right">
                <select id="info-refresh-0" onchange="change(this)"><?php foreach($refreshtimes as $key=>$value){ ?><option value="<?=$key?>"><?=$value?></option><?php } ?></select>
            </div></div>
            <div class="inputrow"><div class="left"><label for="info-config-language-0">Script language</label></div>
                <div class="right"><select id="info-config-language-0" onchange="change(this)"></select></div></div>
        </fieldset>
        <p class="automatic-note">When Info is selected on your watch face, saving settings also downloads fresh script text.</p>
        <div class="script-actions"><button onclick="restoreInfoExample()">Restore example</button><button onclick="infoDelete()">Clear script URL</button></div>
        <p class="field-hint">The example shows the ISO week and day of the year, such as W44 305/365. It needs no account or location. Restoring it replaces the selected script settings.</p>
    </div>
    <div class="settingsbox hidden-box" id="customtextbox" style="">
        <div class="head"><img src="images/config-icon-text.png" />**Custom text</div>
        <br/>
        <div class="inputrow">
            <div class="left">
                <span>You can write any text here, it will show on the watch. It is recommended not to exceed ~30 characters.</span>
            </div>
            <div class=right>
                <input type="text" id="customtext-0" onchange="change(this)" style="width: 100%;" />
            </div>
            <div class="clear"></div>
        </div>
    </div>
    <div class="settingsbox" id="updatebox">
        <div class="head"><img id="config-icon-updatex" src="images/config-icon-update.png" />Update</div>
        <div class="inputrow">
            <div id="paypalSuccess-0" class="left" style="display: none;text-align:center; width: 100%; padding-right:0;">
                Thank you for supporting me.
            </div>
            <script>
                if (0 || (localStorage.getItem('paypalsuccess') && localStorage.getItem('paypalsuccess')=='1')) document.getElementById('paypalSuccess-0').style.display='';
                //else document.getElementById('config-icon-updatex').src='images/config-icon-updatex.png';
            </script>
            <?php if($actualVersion != $CONFIG_VERSION){ ?>
            <div class="left" style="text-align:center; width: 100%; padding-right:0;">
                UPDATE AVAILABLE!
                <script>
                    document.getElementById('config-icon-updatex').src='images/config-icon-updatex.png';
                </script>
            </div>
            <?php } ?>
            <div class="left" style="text-align:center; width: 100%; padding-right:0;">
                <span>
                    Due the Pebble server is not fully functioning, I can not guarantie, that the app is updating automatically from Pabble AppStore.<br/>
                    You can download my latest version of this watchface from<br/>
                    <a href="https://czandor.hu/pebble/NineTime.pbw">https://czandor.hu/pebble/NineTime.pbw</a><br/>
                    <input type="text" value="https://czandor.hu/pebble/NineTime.pbw" id="downloadUrlInput">&nbsp;<button onclick="copyClipboard(document.getElementById('downloadUrlInput'))">Copy URL</button><br/>
                    If you like my watchface, and when you want to receive an update notification by e-mail, please donate me any contribution amount (eg 1 USD), and then I can send an update link to your PayPal email address.<br/>
                    With your support, you really help me keep the application up-to-date.
                </span>
            </div>
            <div class="right" style="text-align:center; width: 100%; padding-left:0;">
                <form style="margin-bottom: 0;" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top" onsubmit="gotoPaypal(); return true;">
                <input type="hidden" name="cmd" value="_s-xclick">
                <input type="hidden" name="hosted_button_id" value="4RX9SQV493LQL">
                <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
                <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
                </form>
                <span>
                    When you can not click on Donate button, please open this link in your browser:<br/>
                    <input type="text" value="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=4RX9SQV493LQL" id="paypalUrlInput">&nbsp;<button onclick="copyClipboard(document.getElementById('paypalUrlInput'))">Copy URL</button><br/>
                </span>
            </div>
            
            <div class="clear"></div>
        </div>
    </div>
<small>
    <br/>
    <b>C64</b> font by Devin D. Cook (www.DevinCook.com)<br/>
    <b>9GAG</b> font by 9GAG and bhavin (9gag.com/u/wendysoffical)<br/>
    <b>Ubuntu</b> font by Canonical Ltd. (launchpad.net/ubuntu-font-licence)<br/>
    <b>Mr. Robot</b> font by Justinionn (fontmeme.com/fonts/mr-robot-font/)<br/>
    <b>Atari</b> font by Genshichi Yasui (yasn@osk4.3web.ne.jp)<br/>
    <b>LECO</b>1976 font by Samuel Čarnoký from Slovakia (carnoky.com)<br/>
    <b>Bosa Nova</b> font by W.Chufarofsky &amp; M.Slutsker (arsenal@itco.msk.su)<br/>
</small>
</div>    

<?php

//echo "token: $watchtoken<br/>";
//echo "platform: $platform<br/>";
//echo "model: $model<br/>";
//echo "batt: $batt<br/>";
//echo "return_to: $return_to<br/>";
?>
<div id="colorpicker" style="display: none;" onclick="colorChoose(null)";>
    <div class="colorpickercontent">
    <?php
    //for($b=0 ; $b<16 ; $b++) for($a=0 ; $a<4 ; $a++){
    //    $i=($a*16)+$b;
    for($i = 0; $i < 64 ; $i++){
        ?>
        <div class="colorpickerbox" onclick="colorChoose(this)" id="colorpicker-<?=$colororder[$i]?>"></div>
    <?php } ?>
    </div>
</div>
<div id="loadsave" style="display: none;">
    <div class="loadsavecontent">
        <div class="settingsbox">
            <?php
            $link=ninetime_db(false);
            $slots=array();
            $res=null;
            if($link){
                
                $sql="select name,slot from ninetime_settings where watchtoken = '$watchtoken' and platform = '$platform' order by slot";
                $res=mysqli_query($link,$sql);
                if($res) while($row=mysqli_fetch_object($res)) $slots[$row->slot]=$row->name;
                mysqli_close($link);
            }
            ?>
            <div class="head">Load/Save</div>
            <!--div class="inputrow">
                <div class="left" style="text-align: center;">Load</div>
                <div class="left" style="text-align: center;">Save</div>
                <div class="clear"></div>
            </div-->
            <div class="inputrow">
                <div class="left" style="text-align: left; padding-left: 20px; width: 100%;">
                    <pre style="max-height: 100px; width: 100%; overflow: scroll;font-size: 10px;font-weight: normal;line-height: 60%; padding-top: 10px;">Watchtoken:<?=$watchtoken?><br/>
Platform: <?=$platform?><br/>
Model: <?=$model?><br/>
MySQL connection: <?=($res)?"OK":"ERROR"?><br/>
<?php if($CONFIG_VERSION >= 1.90 && isset($_GET['d0'])) { ?>
<b>Pebble Watch debug data:</b><br/>
WatchFaceVersion: <?=number_format($CONFIG_VERSION,2,".","")?><br/>
weatherLastDownload: <?=date("Y-m-d H:i:s",$_GET['d0']*1)?><br/>
weatherLocation: <?=$_GET['d1']?><br/>
tempCurrent: <?=$_GET['d2']?><br/>
humCurrent: <?=$_GET['d3']?><br/>
tempMin: <?=$_GET['d4']?><br/>
tempMax: <?=$_GET['d5']?><br/>
weatherIconC: <?=$_GET['d6']?><br/>
weatherIconF: <?=$_GET['d7']?><br/>
weatherWindspeed: <?=$_GET['d8']?><br/>
infoText: <?=$_GET['d9']?><br/>
configTextString: <?=$_GET['da']?><br/>
pebbleLastData: <?=date("Y-m-d H:i:s",$_GET['db']*1)?><br/>
pebbleSteps: <?=$_GET['dc']?><br/>
pebbleHrbpm: <?=$_GET['dd']?><br/>
pebbleHrbpmMin: <?=$_GET['de']?><br/>
pebbleHrbpmMax: <?=$_GET['df']?><br/>
pebbleBatt: <?=$_GET['batt']?><br/>

<?php } ?>
</pre>
                </div>
                <div class="clear"></div>
            </div>
            <?php
            for($a = 1 ; $a <= 5 ; $a++) {?>
                <div class="inputrow">
                    <div class="right" style="text-align: left; padding-left:0; width: 30%">
                        <input type="text" id="slotname-<?=$a?>" style="width: 100%" value="<?=(isset($slots[$a]))?$slots[$a]:"Slot#$a"?>" />
                    </div>
                    <div class="right" style="text-align: center; padding-left:0; width: 25%">
                        <input type="button" id="loadbutton-<?=$a?>" onclick="loadData(<?=$a?>);" value="Load"<?=(isset($slots[$a]))?"":" disabled"?> />
                        
                    </div>
                    <div class="right" style="text-align: left; padding-left:0; width: 25%">
                        <input type="button" onclick="saveData(<?=$a?>)" value="Save" />
                    </div>
                    <div class="right" style="text-align: right; padding-left:0; width: 20%">
                        <input type="text" id="slotstatus-<?=$a?>" style="width: 100%;background-color: #EEEEEE;" readonly />
                    </div>
                    <div class="clear"></div>
                </div>
            <?php } ?>
            <div class="inputrow">
                <div class="right" style="text-align: center; padding-left:0; width: 50%">
                    <input type="button" value="Load defaults" onclick="loadDefaults();" style="width: 100px;" />
                </div>
                <div class="right" style="text-align: center; padding-left:0; width: 50%">
                    <input type="button" value="Back" id="loadsaveokbutton" onclick="hideLoadSave();" style="width: 100px;" />
                </div>
                <div class="clear"></div>
            </div>
        </div>
    </div>
</div>
<div id="infohelp" style="display: none;">
    <div class="infohelpcontent">
        <div class="settingsbox">
            <div class="head">Info Script Help</div>
            <div class="inputrow">
                <div class="left" style="text-align: left; padding-right:0; width: 100%">
                    You can make your own info script, when you have some code skill.<br/>
                    <span>The pebble can send a request to your script with some data in json format with raw POST, and will display your script result on your hand.</span><br/>
                    The data structure, that will be sent:<br/>
<pre>{
    watchtoken: Your watch unique id,
    platform: Your watch plarform, eg "basalt",
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
                    Enter your script URL and use Test script for a preview with sample data. Save to watch applies the URL and downloads fresh text. Testing is optional.
                </div>
            </div>

            <div class="inputrow">
                <div class="right" style="text-align: center; padding-left:0; width: 100%">
                    <input type="button" value="OK" onclick="hideInfoHelp();" style="width: 100px;" />
                </div>
                <div class="clear"></div>
            </div>
        </div>
    </div>
</div>
</body>
</html>

