#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=file=>fs.readFileSync('web/public/pebble/ninetime/js/'+file+'.js','utf8');
let count=0;
function check(value,message){assert.ok(value,message);count++;}
function profile(selected, fallback=false) {
  const old={infoType:selected,info:[
    {url:'http://custom.example/draft',urlOK:'http://custom.example/confirmed',language:3,usePos:1,period:15,data:'my original parameters'},
    {url:'http://czandor.hu/pebble/words.php',urlOK:'http://czandor.hu/pebble/words.php',language:2,usePos:0,period:61,data:'1'}],
    verticalPositions:[1,2,3],horizontalPositions:[4,5,6],
    weatherProvider:1,weatherSettings:[{}, {apiKey:'old',refreshTime:30,language:0}],customText:'KEEP',dayNames:[],monthNames:[]};
  const elements={};
  const document={location:'',getElementById:id=>elements[id]||(elements[id]={style:{}})};
  const memory={[fallback?'settings-basalt':'old-watch-basalt']:JSON.stringify(old)};
  const page={document,NINETIME_BASE_URL:'https://ninetime.example/pebble',watchtoken:'old-watch',platform:'basalt',
    model:'pebble_time',CONFIG_VERSION:1.92,return_to:'pebblejs://close#',paypal:'',h24:1,
    localStorage:{getItem:key=>memory[key]||null,setItem:(key,value)=>memory[key]=value,removeItem:key=>delete memory[key]},
    settings:{},languages:[['en'],['fr'],['de'],['hu']],weatherProviders:['openmeteo','metno'],
    showBox:()=>{},hideBox:()=>{},getVerticalObject:()=>({info:true}),getHorizontalObject:()=>({info:false}),
    buildLanguages:()=>'',customTextEnabled:()=>true,dateNameEnabled:()=>false,weatherConditionTextEnabled:()=>false,
    weatherEnabled:()=>true,weatherForecastEnabled:()=>true,weatherLocationEnabled:()=>true};
  vm.createContext(page);
  for(const file of ['weather','info','draw','loadsave','send'])vm.runInContext(read(file),page);
  page.loadData();
  if(selected===1){old.info[1].url=old.info[1].urlOK='https://czandor.hu/pebble/words.php';}
  const before=JSON.stringify({info:old.info,infoType:old.infoType});
  page.drawInfo();
  check(JSON.stringify({info:page.settings.info,infoType:page.settings.infoType})===before,'opening 1.92 keeps both info records and selection '+selected);
  check(elements['info-config-url-0'].value===old.info[selected].urlOK,'form shows the original confirmed URL');
  page.buildIntStr=()=>'';page.sendData();
  const payload=JSON.parse(decodeURIComponent(document.location.split('#')[1]));
  check(payload.configInfoURL===old.info[selected].urlOK,'saving keeps custom URLs and upgrades the built-in words URL to HTTPS');
  check(payload.configInfoData===old.info[selected].data&&payload.configInfoLanguage===page.languages[old.info[selected].language][0]&&payload.configInfoUsePos===old.info[selected].usePos,'saving preserves data, language and GPS choice');
  check(payload.fetchInfoNow===1,'active legacy info refreshes on every save');
  const stored=JSON.parse(memory['old-watch-basalt']);
  check(JSON.stringify({info:stored.info,infoType:stored.infoType})===before,'saving retains legacy draft, confirmed URL, interval and inactive record');
  page.restoreInfoExample();
  check(page.settings.infoType===0&&page.settings.info[0].urlOK==='https://ninetime.example/pebble/info-example.php','explicit restore applies the new example');
  return page;
}
profile(0);profile(1);profile(0,true);profile(1,true);
const page=profile(0);page.settings.infoType=0;
page.settings.info[0]={url:'',urlOK:'',language:0,usePos:0,period:60,data:''};
page.drawInfo();page.sendData();
check(page.settings.info[0].urlOK===''&&page.settings.infoType===0,'existing empty custom script is not replaced with an example or words');
page.settings={};
check(page.getInfoSettings().urlOK.endsWith('/info-example.php'),'new profiles receive the example');
check(page.infoScriptURL('http://czandor.hu/pebble/words.php?example=1')==='https://czandor.hu/pebble/words.php?example=1','built-in URL query is kept during HTTPS upgrade');
check(page.infoScriptURL('http://custom.example/words.php')==='http://custom.example/words.php','custom words endpoint is untouched');

// Exercise the real phone transport and delivery path, not just the settings payload.
function phoneInfo(url,language) {
  const memory={configInfoURL:url,configInfoLanguage:language,configInfoUsePos:'0',configInfoData:'original-data',
    weatherDownloaded:'1',infoDownloaded:'0',lastRequestType:'3'};
  const localStorage={getItem:key=>memory[key]===undefined?null:memory[key],setItem:(key,value)=>memory[key]=String(value)};
  const requests=[],messages=[];
  const varsPage={module:{exports:{}},require:()=>({baseUrl:'https://czandor.hu/pebble'}),
    XMLHttpRequest:function(){this.headers={};this.open=(method,url)=>{this.method=method;this.url=url;};
      this.setRequestHeader=(key,value)=>this.headers[key]=value;
      this.send=body=>{const data=JSON.parse(body);requests.push({url:this.url,method:this.method,headers:this.headers,data});
        this.responseText=JSON.stringify({status:'ok',info:data.lang==='hu'?'Magyar próba':'English sample'});this.onload();};}};
  vm.createContext(varsPage);vm.runInContext(fs.readFileSync('watchface/src/pkjs/vars.js','utf8'),varsPage);
  const sendPage={module:{exports:{}},require:()=>varsPage.module.exports,localStorage,
    Pebble:{sendAppMessage:dict=>messages.push(dict)}};
  vm.createContext(sendPage);vm.runInContext(fs.readFileSync('watchface/src/pkjs/send.js','utf8'),sendPage);
  const phone={module:{exports:{}},localStorage,setTimeout:fn=>fn(),
    require:name=>name==='./vars'?varsPage.module.exports:sendPage.module.exports};
  vm.createContext(phone);vm.runInContext(fs.readFileSync('watchface/src/pkjs/info.js','utf8'),phone);
  phone.module.exports.downloadInfo();return {requests,messages};
}
let result=phoneInfo('http://czandor.hu/pebble/words.php','hu');
check(result.requests[0].url==='https://czandor.hu/pebble/words.php','phone avoids the HTTP redirect that drops POST language');
check(result.requests[0].headers['Content-Type']==='application/json'&&result.requests[0].data.lang==='hu','phone sends Hungarian in a JSON POST like the browser test');
check(result.requests[0].data.data==='original-data','phone preserves custom script parameters');
check(result.messages[0][100]==='Magyar próba','Hungarian response reaches the watch info field');
result=phoneInfo('http://custom.example/script.php','de');
check(result.requests[0].url==='http://custom.example/script.php'&&result.requests[0].data.lang==='de','custom URL and non-Hungarian language remain unchanged');
console.log('Info compatibility tests passed: '+count+' assertions, including original 1.92 custom and Positive words profiles.');
