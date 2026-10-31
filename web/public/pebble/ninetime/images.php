<?php
require_once __DIR__ . '/../../../bootstrap.php';

if(empty($_GET['fonttype'])) $_GET['fonttype']=0;
if(empty($_GET['black'])) $_GET['black']='000000';
if(empty($_GET['white'])) $_GET['white']='FFFFFF';
if(empty($_GET['digit'])) $_GET['digit']=0;
if(empty($_GET['number'])) $_GET['number']=0;
if(empty($_GET['analog'])) $_GET['analog']=0;
if(empty($_GET['icon'])) $_GET['icon']='';



$fonttype=$_GET['fonttype']*1;
$black=$_GET['black'];
$white=$_GET['white'];
$gray=isset($_GET['gray'])?$_GET['gray']:$black;
$digit=$_GET['digit']*1;
$number=$_GET['number']*1;
$analog=$_GET['analog']*1;
$icon=$_GET['icon'];

$fonttypes=array("","9","o","r","a","l","b");
$analogs=array("num","partline","fulline");

if(!$analog && !$icon) $file="images/".($number%10)."".$fonttypes[$fonttype].".png";
if($analog && !$icon) $file="images/analog-".$analogs[$analog-1].".png";
if(!$analog && $icon) $file="images/".$icon.".png";
$offsetx=0;
$offsety=0;
$sizeplus=0;
if($digit){
    $sizeplus=40;
    if($digit == 3 || $digit == 4) $offsety = $sizeplus;
    if($digit == 2 || $digit == 4) $offsetx = $sizeplus;
}
$im = imagecreatefrompng($file);
$imnew=imagecreatetruecolor( imagesx($im)+$sizeplus  , imagesy($im)+$sizeplus );
imagefill ( $imnew , 0 , 0 , imagecolorallocatealpha($imnew, 255, 255, 255, 0) );
imagealphablending($imnew, false);
$whitergb = sscanf($white, "%02x%02x%02x");
$blackrgb = sscanf($black, "%02x%02x%02x");
$grayrgb = sscanf($gray, "%02x%02x%02x");
for ($x = imagesx($im); $x--;) {
    for ($y = imagesy($im); $y--;) {
        $rgb = imagecolorat($im, $x, $y);
        $c = imagecolorsforindex($im, $rgb);
        //var_dump($whitergb);
        $cnew=array($c['red'],$c['green'],$c['blue'],$c['alpha']);
        if ($c['red'] == 0 && $c['green'] ==0 && $c['blue'] ==0 && $c['alpha'] == 0) { // black
            // here we use the new color, but the original alpha channel
            //$colornew = imagecolorallocatealpha($im, $blackrgb[0], $blackrgb[1], $blackrgb[2], $c['alpha']);
            //imagesetpixel($im, $x, $y, $colorB);
            /*$c['red']=$blackrgb[0];
            $c['green']=$blackrgb[1];
            $c['blue']=$blackrgb[2];*/
            $cnew[0]=$blackrgb[0];
            $cnew[1]=$blackrgb[1];
            $cnew[2]=$blackrgb[2];
            //var_dump($c);
        }
        if ($c['red'] ==255 && $c['green'] == 255 && $c['blue'] == 255&& $c['alpha'] == 0) { // white
            // here we use the new color, but the original alpha channel
            //$colornew = imagecolorallocatealpha($im, $whitergb[0], $whitergb[1], $whitergb[2], $c['alpha']);
            //imagesetpixel($im, $x, $y, $colorW);
            /*$c['red']=$whitergb[0];
            $c['green']=$whitergb[1];
            $c['blue']=$whitergb[2];*/
            $cnew[0]=$whitergb[0];
            $cnew[1]=$whitergb[1];
            $cnew[2]=$whitergb[2];
            //var_dump($c);
        }
        if ($c['red'] ==100 && $c['green'] == 100 && $c['blue'] == 100&& $c['alpha'] == 0) { // gray
            // here we use the new color, but the original alpha channel
            //$colornew = imagecolorallocatealpha($im, $whitergb[0], $whitergb[1], $whitergb[2], $c['alpha']);
            //imagesetpixel($im, $x, $y, $colorW);
            /*$c['red']=$whitergb[0];
            $c['green']=$whitergb[1];
            $c['blue']=$whitergb[2];*/
            $cnew[0]=$grayrgb[0];
            $cnew[1]=$grayrgb[1];
            $cnew[2]=$grayrgb[2];
            //var_dump($c);
        }
        if($number>=10) {
            //$c['alpha']=127;
            $cnew[3]=127;
        }
        //$colornew = imagecolorallocatealpha($imnew, $c['red'], $c['green'], $c['blue'], $c['alpha']);
        $colornew = imagecolorallocatealpha($imnew, $cnew[0],$cnew[1],$cnew[2],$cnew[3]);
        imagesetpixel($imnew, $x+$offsetx, $y+$offsety, $colornew);
    }
}
imageAlphaBlending($imnew, true);
imageSaveAlpha($imnew, true);
header('Cache-Control: max-age=604800');
header('Content-Type: image/png');
imagepng($imnew);
imagedestroy($im);
imagedestroy($imnew);


?>