var infoRequest = 0;
function infoExampleSettings() {
    var url = infoScriptURL(NINETIME_BASE_URL + '/info-example.php');
    return {url:url, urlOK:url, language:0, usePos:0, period:60, data:''};
}
function infoScriptURL(url) {
    // Upgrade only built-in endpoints. A user's own script URL must stay intact.
    return typeof url==='string' ? url.replace(/^http:\/\/(?:www\.)?czandor\.hu\/pebble\/(words|info-example)\.php(?=$|[?#])/i,
        'https://czandor.hu/pebble/$1.php') : url;
}
function getInfoSettings() {
    // Keep the selected 1.92 record, including its confirmed URL and custom data.
    if (!Array.isArray(settings.info)) settings.info = [infoExampleSettings()];
    if (!settings.info[settings.infoType]) settings.infoType = 0;
    if (!settings.info[settings.infoType]) settings.info[settings.infoType] = infoExampleSettings();
    var item=settings.info[settings.infoType];
    item.url=infoScriptURL(item.url); item.urlOK=infoScriptURL(item.urlOK);
    return item;
}
function restoreInfoExample() {
    settings.infoType = 0;
    settings.info[0] = infoExampleSettings();
    infoChanged(); drawInfo();
}
function infoStatus(text, state) {
    var element = document.getElementById('info-config-status-0');
    if (!element) return;
    element.textContent = text;
    element.className = 'script-result' + (state ? ' script-result-' + state : '');
}
function infoChanged() { infoRequest++; infoStatus('', ''); }
function infoCheck() {
    var item = getInfoSettings();
    var url = document.getElementById('info-config-url-0').value.trim();
    if (!/^https?:\/\//i.test(url)) return infoStatus('Enter a complete HTTP or HTTPS script URL.', 'error');
    var id = ++infoRequest, request = new XMLHttpRequest();
    request.open('POST', NINETIME_BASE_URL + '/xhr.php?url=' + encodeURIComponent(url));
    request.setRequestHeader('Content-Type', 'application/json'); request.timeout = 25000;
    infoStatus('Testing with sample watch data…', 'pending');
    request.onload = function () {
        if (id !== infoRequest) return;
        var data;
        try { data = JSON.parse(request.responseText); }
        catch (error) { return infoStatus('The script did not return valid JSON.', 'error'); }
        if (request.status < 200 || request.status >= 300 || data.status !== 'ok' || typeof data.info !== 'string') {
            return infoStatus('Expected JSON with status: "ok" and an info text.\n' + JSON.stringify(data, null, 2), 'error');
        }
        infoStatus('Preview: ' + data.info, 'success');
    };
    request.onerror = request.ontimeout = function () {
        if (id === infoRequest) infoStatus('Could not reach the script. Check the address and try again.', 'error');
    };
    var language = languages[item.language] ? languages[item.language][0] : 'en';
    request.send(JSON.stringify({watchtoken:watchtoken, platform:platform, model:model, lang:language,
        battery:80, steps:1234, hrbpm_avg:0, hrbpm_min:0, hrbpm_max:0,
        from_time:Math.floor(Date.now()/1000)-600, h24:h24, data:item.data, test:1,
        pos:item.usePos == 1 ? JSON.stringify({coords:{latitude:47.4979,longitude:19.0402,accuracy:1000}}) : ''}));
}
function infoDelete() { var item=getInfoSettings(); item.url=item.urlOK=''; infoChanged(); drawInfo(); }
function showInfoHelp() { document.getElementById('infohelp').style.display=''; }
function hideInfoHelp() { document.getElementById('infohelp').style.display='none'; }
function infoEnabled() {
    for (var i=0; i<3; i++) {
        if (getVerticalObject(settings.verticalPositions[i]).info || getHorizontalObject(settings.horizontalPositions[i]).info) return true;
    }
    return false;
}
