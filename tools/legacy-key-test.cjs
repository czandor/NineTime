#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const synthetic='a'.repeat(32);
let checks=0;
function check(value,label){assert.ok(value,label);checks++;}
function request(enabled,key,method='GET'){
 const code="$_SERVER['REQUEST_METHOD']=$argv[2]; ob_start(); require $argv[1]; $body=ob_get_clean(); echo json_encode(array('status'=>http_response_code(),'body'=>json_decode($body,true)));";
 const result=cp.spawnSync(process.env.PHP_BINARY||'php',['-r',code,path.join(root,'web/public/pebble/getapikey_owm.php'),method],{
  cwd:root,encoding:'utf8',windowsHide:true,env:{...process.env,
   NINETIME_CONFIG_FILE:path.join(root,'web/config/config.example.php'),
   NINETIME_LEGACY_KEY_ENDPOINT_ENABLED:enabled,NINETIME_LEGACY_OWM_KEY:key}});
 check(result.status===0,'PHP endpoint executes');return JSON.parse(result.stdout);
}
let result=request('false',synthetic);
check(result.status===410&&result.body.key===''&&result.body.use_allowed===0,'disabled endpoint does not disclose a configured key');
result=request('0',synthetic);check(result.status===410,'string zero disables the endpoint');
result=request('true','');check(result.status===503&&result.body.key==='','enabled endpoint fails cleanly without a key');
result=request('true','invalid');check(result.status===503&&result.body.key==='','invalid key is never returned');
result=request('true',synthetic);
check(result.status===200&&result.body.status==='ok'&&result.body.use_allowed===1&&result.body.key===synthetic,'original Fitbit key discovery contract');
result=request('true',synthetic,'POST');check(result.status===405&&result.body.key==='','unsupported method cannot disclose a key');
const source=fs.readFileSync(path.join(root,'web/public/pebble/getapikey_owm.php'),'utf8');
check(source.includes("header('Cache-Control: no-store')"),'credential responses are not cacheable');
console.log('Legacy key tests passed: '+checks+' assertions; synthetic key only, no external requests.');
