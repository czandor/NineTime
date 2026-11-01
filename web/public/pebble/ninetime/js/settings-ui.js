/* Presentation only: keep the original settings records and watch protocol intact. */
function settingsGroup(box, title, ids) {
    var fieldset=document.createElement('fieldset'), legend=document.createElement('legend');
    legend.textContent=title; fieldset.className='settings-group'; fieldset.appendChild(legend);
    ids.forEach(function(id) {
        var control=document.getElementById(id), row=control && control.closest('.inputrow, .config-row');
        if(row && !fieldset.contains(row)) fieldset.appendChild(row);
    });
    box.appendChild(fieldset);
    return fieldset;
}
function initSettingsUI() {
    var sidebar=document.getElementById('verticalbox');
    settingsGroup(sidebar,'Placement',['vertical-position-0','vertical-status-pos-0']);
    var content=settingsGroup(sidebar,'Content',['vertical-icon-pos-0','vertical-icon-pos-1','vertical-icon-pos-2']);
    var icons=content.querySelector('.verticons-box');
    var preview=document.createElement('div'); preview.className='widget-preview';
    preview.hidden=icons.style.display==='none';
    var caption=document.createElement('p'); caption.className='field-hint';
    caption.textContent='Preview of the selected sidebar content';
    preview.appendChild(caption); preview.appendChild(icons); content.appendChild(preview);
    content.querySelectorAll('.inputrow').forEach(function(row){row.style.paddingBottom='';});
    settingsGroup(sidebar,'Status & seconds',['vertical-status-icon-0','vertical-status-icon-info','vertical-show-seconds-0']);
    settingsGroup(sidebar,'Colour palette',['config-5-textcolor']);
    var horizontal=document.getElementById('horizontal1box');
    settingsGroup(horizontal,'Placement',['horizontal-position-0']);
    settingsGroup(horizontal,'Content',['horizontal-content-0']);
    settingsGroup(horizontal,'Extra row',['horizontal2-show-0']);
    settingsGroup(horizontal,'Colour palette',['config-6-textcolor']);
    var extra=document.getElementById('horizontal2box');
    settingsGroup(extra,'Second row',['horizontal-content-1','horizontal2-seconds-0']);
    settingsGroup(extra,'Third row',['horizontal-content-2','horizontal2-seconds-1']);
    settingsGroup(extra,'Colour palette',['config-7-textcolor']);
    [5,6,7].forEach(function(id) {
        var image=document.getElementById('config-'+id+'-img'), row=image.closest('.config-row');
        image.parentNode.hidden=true;
        var preview=document.createElement('div');
        preview.className='palette-preview'; preview.id='palette-preview-'+id;
        preview.innerHTML='<span class="palette-mark">◆</span><span class="palette-text">Aa 12:34</span>';
        row.insertBefore(preview,row.firstChild);
        var note=document.createElement('p'); note.className='field-hint';
        note.textContent='Colour sample · Your content is selected above.';
        row.parentNode.appendChild(note);
        row.querySelectorAll('.config-color').forEach(function(control,i) {
            control.firstElementChild.textContent=['Text','Background','Divider','Icon','Icon background'][i];
        });
    });
    var descriptions={facebox:['Watch face','Choose a style, then fine-tune its fonts and colours.'],
        verticalbox:['Sidebar','Place the column, choose its content, then set its colours.'],
        horizontal1box:['Horizontal row','Choose where it sits and what it displays.'],
        horizontal2box:['Extra rows','Set the additional content and how long it stays visible.'],
        vibratebox:['Alerts & vibration','Control connection alerts, reminders and quiet time.'],
        weatherbox:['Weather','Two free providers. No account or API key needed.'],
        datebox:['Date & time','Choose formats and the names displayed on your watch.'],
        infobox:['Info script','Text from a JSON endpoint. Your existing script is kept.'],
        customtextbox:['Custom text','A short personal message for your watch.'],
        updatebox:['About & updates','NineTime '+actualVersion+' · Original Pebble family']};
    Object.keys(descriptions).forEach(function(id) {
        var head=document.querySelector('#'+id+' > .head');
        Array.prototype.slice.call(head.childNodes).forEach(function(node){if(node.nodeType===3)head.removeChild(node);});
        var title=document.createElement('span'); title.textContent=descriptions[id][0]; head.appendChild(title);
        var description=document.createElement('p'); description.className='section-description';
        description.textContent=descriptions[id][1]; head.parentNode.insertBefore(description,head.nextSibling);
    });
    document.querySelectorAll('.inputrow').forEach(function(row) {
        var left=row.querySelector('.left'), control=row.querySelector('select[id],input[type="text"][id],input[type="url"][id]');
        if(left && control && !left.querySelector('label') && !left.querySelector('input,select,button')) {
            var label=document.createElement('label'); label.htmlFor=control.id;
            while(left.firstChild)label.appendChild(left.firstChild); left.appendChild(label);
        }
    });
    document.querySelectorAll('.settingsbox > br').forEach(function(br){br.remove();});
    window.addEventListener('scroll', scheduleSettingsNavigation, {passive:true});
    window.addEventListener('resize', scheduleSettingsNavigation);
    if(typeof ResizeObserver !== 'undefined') {
        var observer=new ResizeObserver(scheduleSettingsNavigation);
        observer.observe(document.getElementById('div-header'));
        observer.observe(document.getElementById('div-page'));
    }
}
function updateSettingsUI() {
    [5,6,7].forEach(function(id) {
        var preview=document.getElementById('palette-preview-'+id); if(!preview)return;
        function color(name) {
            var value=id===5?settings['vertical'+name]:settings['horizontal'+name][id-6];
            return '#'+pebblecolors[value].rgbsun;
        }
        preview.style.backgroundColor=color('Bg'); preview.style.color=color('Color');
        preview.style.borderColor=color('Line');
        var mark=preview.querySelector('.palette-mark');
        mark.style.color=color('Icon'); mark.style.backgroundColor=color('IconBg');
    });
    document.querySelectorAll('.settingsboxnavigate button').forEach(function(button) {
        var icon=button.querySelector('img');
        button.disabled=icon.style.pointerEvents==='none';
    });
    scheduleSettingsNavigation();
}
var settingsNavigationPending=false;
function scheduleSettingsNavigation() {
    if(settingsNavigationPending)return;
    settingsNavigationPending=true;
    window.requestAnimationFrame(function(){settingsNavigationPending=false;updateSettingsNavigation();});
}
function updateSettingsNavigation() {
    var header=document.getElementById('div-header'), active=null;
    var edge=header.getBoundingClientRect().bottom+24;
    document.body.style.setProperty('--settings-header-space',(header.offsetHeight+24)+'px');
    var buttons=document.querySelectorAll('.settingsboxnavigate button[data-section]');
    var atBottom=window.pageYOffset>0 && window.pageYOffset+window.innerHeight>=document.documentElement.scrollHeight-2;
    buttons.forEach(function(button){
        var section=document.getElementById(button.getAttribute('data-section'));
        if(button.disabled || !section || !section.getClientRects().length)return;
        if(active===null || section.getBoundingClientRect().top<=edge || atBottom)active=button;
    });
    buttons.forEach(function(button){
        if(button===active)button.setAttribute('aria-current','location');
        else button.removeAttribute('aria-current');
    });
}
function scrollToSettings(id) {
    var target=document.getElementById(id), header=document.getElementById('div-header');
    window.scrollTo({top:target.getBoundingClientRect().top+window.pageYOffset-header.offsetHeight-16,behavior:'smooth'});
}
