var weatherLanguages = [['en', 'English'], ['hu', 'Magyar'], ['de', 'Deutsch']];
var weatherSearchResults = [];
var weatherSearchRequest = 0;

function weatherCoordinatesValid(latitude, longitude) {
    return latitude !== null && longitude !== null && latitude !== '' && longitude !== '' &&
        isFinite(Number(latitude)) && isFinite(Number(longitude)) &&
        Math.abs(Number(latitude)) <= 90 && Math.abs(Number(longitude)) <= 180;
}

function normalizeWeatherSettings() {
    var old = settings.weatherSettings || [];
    var selected = old[settings.weatherProvider] || {};
    var legacy = settings.weatherSchemaVersion !== 2;
    var provider = !legacy && (settings.weatherProvider === 0 || settings.weatherProvider === 1) ? settings.weatherProvider : 0;
    settings.weatherSettings = [0, 1].map(function (index) {
        var source = legacy ? selected : (old[index] || {});
        var refresh = Number(source.refreshTime);
        if ([0, 15, 30, 60, 61, 62].indexOf(refresh) < 0) refresh = 30;
        var language = source.language;
        if (typeof language === 'number' && typeof languages !== 'undefined' && languages[language]) language = languages[language][0];
        if (['en', 'hu', 'de'].indexOf(language) < 0) language = 'en';
        var fixed = weatherCoordinatesValid(source.latitude, source.longitude);
        return {
            refreshTime: refresh, language: language,
            cityName: fixed && typeof source.cityName === 'string' ? source.cityName.slice(0, 160) : '',
            latitude: fixed ? Number(source.latitude) : null,
            longitude: fixed ? Number(source.longitude) : null
        };
    });
    settings.weatherProvider = provider;
    settings.weatherSchemaVersion = 2;
    ['weather-pmkey-email-input', 'weather-pmkey-pin-input', 'configWeatherAPIKey', 'configWeatherLocationId'].forEach(function (key) {
        localStorage.removeItem(key);
    });
}

function weatherJsonRequest(parameters, callback) {
    var xhr = new XMLHttpRequest();
    var finished = false;
    function complete(data, error) {
        if (finished) return;
        finished = true;
        callback(data, error);
    }
    var query = Object.keys(parameters).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(parameters[key]);
    }).join('&');
    xhr.open('GET', NINETIME_BASE_URL + '/weather.php?' + query);
    xhr.timeout = 25000;
    xhr.onload = function () {
        var data;
        try { data = JSON.parse(xhr.responseText); } catch (error) { return complete(null, 'Weather service returned an invalid response.'); }
        if (xhr.status < 200 || xhr.status >= 300 || data.error) return complete(null, data.error || 'Weather service unavailable.');
        complete(data, '');
    };
    xhr.onerror = xhr.ontimeout = function () { complete(null, 'Unable to contact the weather service. Please try again.'); };
    xhr.send();
}

function weatherCityStatus(message, error) {
    var status = document.getElementById('weather-city-status');
    if (status) {
        status.textContent = message;
        removeClassname(status, 'status-ok');
        removeClassname(status, 'status-error');
        if (message) addClassname(status, error ? 'status-error' : 'status-ok');
    }
}

function weatherCityCheck() {
    var input = document.getElementById('weather-city-input');
    var name = input ? input.value.trim() : '';
    if (name.length < 2 || name.length > 80) return weatherCityStatus('Enter a city name (2–80 characters).', true);
    var request = ++weatherSearchRequest;
    weatherCityStatus('Searching…', false);
    weatherJsonRequest({ action: 'geocode', q: name, language: settings.weatherSettings[settings.weatherProvider].language }, function (data, error) {
        if (request !== weatherSearchRequest) return;
        if (error) return weatherCityStatus(error, true);
        weatherSearchResults = (data.locations || []).filter(function (place) {
            return place && typeof place.name === 'string' && weatherCoordinatesValid(place.latitude, place.longitude);
        });
        var select = document.getElementById('weather-city-results');
        select.textContent = '';
        select.hidden = true;
        if (!weatherSearchResults.length) return weatherCityStatus('No matching city found.', true);
        if (weatherSearchResults.length === 1) return weatherCitySelect(0);
        var placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Choose a location…';
        select.appendChild(placeholder);
        weatherSearchResults.forEach(function (place, index) {
            var option = document.createElement('option');
            option.value = String(index);
            option.textContent = place.name;
            select.appendChild(option);
        });
        select.hidden = false;
        weatherCityStatus('Choose the matching location below.', false);
    });
}

function weatherCitySelect(index) {
    if (index === '') return;
    var place = weatherSearchResults[Number(index)];
    if (!place) return;
    var location = settings.weatherSettings[settings.weatherProvider];
    location.cityName = place.name.slice(0, 160);
    location.latitude = Number(place.latitude);
    location.longitude = Number(place.longitude);
    document.getElementById('weather-city-results').hidden = true;
    weatherCityStatus('Location saved.', false);
    saveData();
    drawWeather();
}

function weatherCityDelete() {
    weatherSearchRequest++;
    var location = settings.weatherSettings[settings.weatherProvider];
    location.cityName = '';
    location.latitude = null;
    location.longitude = null;
    var results = document.getElementById('weather-city-results');
    if (results) results.hidden = true;
    weatherCityStatus('', false);
    drawWeather();
}

function weatherEnabled() { 
    return (weatherCurrentEnabled() || weatherForecastEnabled());
}
function weatherCurrentEnabled() {
    for (a=0 ; a<3 ; a++) {
        /*if (settings.verticalPositions[a] == STATUS_V_WEATHER_C_WIN) return true;
        if (settings.verticalPositions[a] == STATUS_V_WEATHER_WH) return true;
        if (settings.horizontalPositions[a] == STATUS_H_WEATHER_C) return true;
        if (settings.horizontalPositions[a] == STATUS_H_WEATHER_CITY) return true;*/
        if (getVerticalObject(settings.verticalPositions[a]).weather) return true;
        if (getHorizontalObject(settings.horizontalPositions[a]).weather) return true;
    }
    return false;
}
function weatherForecastEnabled() {
    for (a=0 ; a<3 ; a++) {
        /*if (settings.verticalPositions[a] == STATUS_V_WEATHER_F) return true;
        if (settings.horizontalPositions[a] == STATUS_H_WEATHER_F) return true;
        */
        if (getVerticalObject(settings.verticalPositions[a]).forecast) return true;
        if (getHorizontalObject(settings.horizontalPositions[a]).forecast) return true;
    }
    return false;
}
function weatherConditionTextEnabled() {
    for (a=0 ; a<3 ; a++) {
      if (('weathercondition' in getHorizontalObject(settings.horizontalPositions[a])) && getHorizontalObject(settings.horizontalPositions[a]).weathercondition) return true;
    }
    return false;
}
function weatherLocationEnabled() {
    for (a=0 ; a<3 ; a++) {
      if (('weatherlocation' in getHorizontalObject(settings.horizontalPositions[a])) && getHorizontalObject(settings.horizontalPositions[a]).weatherlocation) return true;
    }
    return false;
}
