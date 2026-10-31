<?php
// Deterministic adapter/cache tests. No network requests or production configuration.
putenv('NINETIME_CONFIG_FILE=' . __DIR__ . '/../web/config/config.example.php');
$cacheDirectory = __DIR__ . '/../web/var/weather-tests-' . getmypid();
putenv('NINETIME_WEATHER_CACHE_DIR=' . $cacheDirectory);
require_once __DIR__ . '/../web/weather.php';
require_once __DIR__ . '/../web/weather-legacy.php';
$checks = 0;
function check_weather($condition, $label) {
    global $checks;
    if (!$condition) throw new RuntimeException('Weather test failed: ' . $label);
    $checks++;
}
function rejects_weather($callback, $label) {
    try { $callback(); } catch (InvalidArgumentException $error) { check_weather(true, $label); return; }
    catch (RuntimeException $error) { check_weather(true, $label); return; }
    throw new RuntimeException('Weather test failed: ' . $label);
}
$now = 1700000000;
$open = array(
    'current' => array('time' => $now, 'temperature_2m' => 12, 'relative_humidity_2m' => 70, 'wind_speed_10m' => 18, 'weather_code' => 0, 'is_day' => 0),
    'hourly' => array('time' => array(), 'temperature_2m' => array(), 'weather_code' => array())
);
$met = array('properties' => array('timeseries' => array()));
for ($hour = 0; $hour <= 30; $hour++) {
    $temperature = $hour === 5 ? -5 : ($hour === 15 ? 20 : 12);
    $open['hourly']['time'][] = $now + $hour * 3600;
    $open['hourly']['temperature_2m'][] = $hour > 24 ? 60 : $temperature;
    $open['hourly']['weather_code'][] = $hour === 8 ? 95 : 0;
    $met['properties']['timeseries'][] = array(
        'time' => gmdate('Y-m-d\TH:i:s\Z', $now + $hour * 3600),
        'data' => array(
            'instant' => array('details' => array('air_temperature' => $hour > 24 ? 60 : $temperature, 'relative_humidity' => 70, 'wind_speed' => 5)),
            'next_1_hours' => array('summary' => array('symbol_code' => $hour === 8 ? 'heavyrainandthunder_day' : 'clearsky_night'))
        )
    );
}
try {
    $a = ninetime_weather_openmeteo($open);
    $b = ninetime_weather_metno($met, $now);
    foreach (array($a, $b) as $weather) {
        check_weather($weather['current']['temperatureC'] === 12.0, 'current temperature');
        check_weather($weather['current']['windKph'] === 18.0, 'wind units');
        check_weather($weather['current']['icon'] === 9, 'night icon');
        check_weather($weather['forecast']['minC'] === -5.0 && $weather['forecast']['maxC'] === 20.0, 'next 24 hours only');
        check_weather($weather['forecast']['icon'] === 10, 'thunderstorm priority');
    }
    check_weather(ninetime_weather_wmo_icon(0, false) === 6, 'clear day');
    check_weather(ninetime_weather_wmo_icon(2, true) === 8, 'partly cloudy night');
    check_weather(ninetime_weather_wmo_icon(66, false) === 7, 'freezing rain');
    check_weather(ninetime_weather_met_icon('lightsnowshowers_day') === 2, 'light snow');
    check_weather(ninetime_weather_met_icon('sleetshowers_night') === 7, 'sleet');
    check_weather(ninetime_weather_condition(10, 'hu') === 'Zivatar', 'Hungarian condition text');
    check_weather(ninetime_weather_condition(10, 'xx') === 'Thunderstorm', 'language fallback');
    check_weather(ninetime_weather_coordinate('0', 90) === '0.0000', 'equator is valid');
    check_weather(ninetime_weather_coordinate('47.49791234', 90) === '47.4979', 'coordinate precision');
    rejects_weather(function () { ninetime_weather_coordinate('NaN', 90); }, 'invalid coordinate');
    rejects_weather(function () { ninetime_weather_coordinate(array(1), 90); }, 'coordinate array');
    rejects_weather(function () { ninetime_weather_request(array('latitude' => 91, 'longitude' => 0)); }, 'latitude bounds');
    rejects_weather(function () { ninetime_weather_request(array('provider' => 'legacy')); }, 'provider allowlist');
    rejects_weather(function () { ninetime_weather_request(array('url' => 'http://127.0.0.1/')); }, 'URL proxy removed');
    rejects_weather(function () { ninetime_weather_request(array('action' => 'geocode', 'q' => 'a')); }, 'short city name');
    rejects_weather(function () { ninetime_weather_openmeteo(array()); }, 'missing forecast');
    $bad = $open; $bad['current']['temperature_2m'] = null;
    rejects_weather(function () use ($bad) { ninetime_weather_openmeteo($bad); }, 'missing current value');
    rejects_weather(function () use ($met, $now) { ninetime_weather_metno($met, $now + 40 * 86400); }, 'old response');

    $requests = 0;
    $seen = array();
    $transport = function ($url, $headers) use (&$requests, &$seen, $open, $now) {
        $requests++; $seen[] = array($url, $headers);
        return array('status' => $requests === 1 ? 200 : 304,
            'headers' => array('expires' => gmdate('D, d M Y H:i:s \G\M\T', $now + 1800), 'last-modified' => 'Tue, 14 Nov 2023 20:00:00 GMT'),
            'body' => json_encode($open));
    };
    $query = array('provider' => 'openmeteo', 'latitude' => '47.49791234', 'longitude' => '19.0402', 'language' => 'hu');
    $first = ninetime_weather_request($query, $transport, $now);
    $second = ninetime_weather_request($query, $transport, $now + 100);
    check_weather($requests === 1 && $first === $second, 'cache avoids repeated calls');
    ninetime_weather_request($query, $transport, $now + 1900);
    check_weather($requests === 2 && count($seen[1][1]) === 1 && strpos($seen[1][1][0], 'If-Modified-Since:') === 0, 'conditional cache revalidation');
    check_weather(strpos($seen[0][0], 'latitude=47.4979') !== false, 'rounded upstream coordinate');
    check_weather(strpos($seen[0][0], 'apikey') === false && strpos($seen[0][0], 'APPID') === false, 'no authentication query');

    $geocode = function ($url, $headers) {
        return array('status' => 200, 'headers' => array(), 'body' => json_encode(array('results' => array(
            array('name' => 'Budapest', 'admin1' => 'Budapest', 'country' => 'Hungary', 'latitude' => 47.49791234, 'longitude' => 19.0402),
            array('name' => '<City>', 'latitude' => 0, 'longitude' => 0)
        ))));
    };
    $places = ninetime_weather_request(array('action' => 'geocode', 'q' => 'Budapest'), $geocode, $now);
    check_weather(count($places['locations']) === 2 && $places['locations'][0]['latitude'] === 47.4979, 'city search');
    check_weather($places['locations'][1]['latitude'] === 0.0, 'zero coordinates in search');
    $legacyCalls = array();
    $legacyTransport = function ($url, $headers) use ($met, &$legacyCalls) {
        $legacyCalls[] = $url;
        if (strpos($url, '/v1/get?') !== false) $data = array('name' => 'Budapest', 'latitude' => 47.4979, 'longitude' => 19.0402);
        elseif (strpos($url, '/v1/search?') !== false) $data = array('results' => array(array('name' => 'Berlin', 'latitude' => 52.52, 'longitude' => 13.405)));
        else $data = $met;
        return array('status' => 200, 'headers' => array(), 'body' => json_encode($data));
    };
    $owm = ninetime_weather_legacy_request('owm', array('url' => 'http://api.openweathermap.org/data/2.5/weather?lat=0&lon=0&units=metric&appid=ignored'), $legacyTransport, $now);
    check_weather($owm['cod'] === '200' && $owm['main']['temp'] === 12.0 && $owm['wind']['speed'] === 5.0, 'legacy OWM metric contract');
    check_weather($owm['weather'][0]['id'] === 800 && $owm['weather'][0]['icon'] === '01n', 'legacy OWM night');
    $owmImperial = ninetime_weather_legacy_request('owm', array('lat' => 0, 'lon' => 0, 'units' => 'imperial'), $legacyTransport, $now);
    check_weather(abs($owmImperial['main']['temp'] - 53.6) < 0.001 && abs($owmImperial['wind']['speed'] - 11.1847) < 0.001, 'legacy OWM imperial contract');
    $owmForecast = ninetime_weather_legacy_request(null, array('url' => 'https://api.openweathermap.org/data/2.5/forecast?lat=0&lon=0&cnt=8&units=metric'), $legacyTransport, $now);
    check_weather(count($owmForecast['list']) === 8 && $owmForecast['list'][3]['weather'][0]['id'] === 200, 'legacy OWM list[3] forecast');
    check_weather($owmForecast['list'][0]['main']['temp_min'] === -5.0 && $owmForecast['list'][0]['main']['temp_max'] === 20.0, 'legacy OWM 24-hour range');
    $wu = ninetime_weather_legacy_request('wu', array('url' => 'http://api.wunderground.com/api/ignored/conditions/lang:HU/q/0,0.json'), $legacyTransport, $now);
    check_weather($wu['response']['features']['conditions'] === 1 && $wu['current_observation']['relative_humidity'] === '70%', 'legacy WU current contract');
    check_weather($wu['current_observation']['icon'] === 'clear' && strpos($wu['current_observation']['icon_url'], 'nt_') !== false, 'legacy WU night contract');
    check_weather($wu['current_observation']['weather'] === 'Derült', 'legacy WU language');
    $wuForecast = ninetime_weather_legacy_request('wu', array('url' => 'https://api.wunderground.com/api/ignored/forecast/q/0,0.json'), $legacyTransport, $now);
    $day = $wuForecast['forecast']['simpleforecast']['forecastday'][0];
    check_weather($wuForecast['response']['features']['forecast'] === 1 && $day['low']['celsius'] === '-5' && $day['high']['fahrenheit'] === '68', 'legacy WU forecast contract');
    $yahoo = ninetime_weather_legacy_request('yahoo', array('lat' => 0, 'lon' => 0), $legacyTransport, $now);
    check_weather($yahoo['current_observation']['condition']['code'] === 31 && abs($yahoo['current_observation']['condition']['temperature'] - 53.6) < 0.001, 'legacy Yahoo current contract');
    check_weather($yahoo['forecasts'][0]['code'] === 4 && $yahoo['forecasts'][0]['low'] === 23.0, 'legacy Yahoo forecast contract');
    $yqlUrl = 'https://query.yahooapis.com/v1/public/yql?q=' . rawurlencode('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="(0,0)") and u="c"');
    $yql = ninetime_weather_legacy_request(null, array('url' => $yqlUrl), $legacyTransport, $now);
    check_weather($yql['query']['count'] === 1 && $yql['query']['results']['channel']['item']['condition']['temp'] === 12.0, 'legacy Yahoo YQL contract');
    $city = ninetime_weather_legacy_request('owm', array('id' => 3054643, 'units' => 'metric'), $legacyTransport, $now);
    check_weather($city['name'] === 'Budapest', 'legacy OWM GeoNames city ID');
    $city = ninetime_weather_legacy_request('wu', array('location' => 'Germany/Berlin'), $legacyTransport, $now);
    check_weather($city['current_observation']['display_location']['city'] === 'Berlin', 'legacy WU city name');
    foreach ($legacyCalls as $url) check_weather(strpos($url, 'appid') === false && strpos($url, 'wunderground') === false && strpos($url, 'yahoo') === false, 'legacy request uses only new services, without old credentials');
    foreach (array('http://127.0.0.1/', 'file:///etc/passwd', 'https://api.openweathermap.org.evil.test/?lat=0&lon=0') as $url) {
        rejects_weather(function () use ($url) { ninetime_weather_legacy_request(null, array('url' => $url)); }, 'legacy arbitrary URL rejected');
    }
    rejects_weather(function () use ($legacyTransport, $now) { ninetime_weather_legacy_request('wu', array('location' => 'pws:UNKNOWN'), $legacyTransport, $now); }, 'unresolved station ID is not guessed');
    echo 'Weather PHP tests passed: ' . $checks . " assertions; no external service contacted.\n";
} finally {
    // Delete only generated files in this test's own cache directory.
    if (is_dir($cacheDirectory)) {
        foreach (glob($cacheDirectory . '/*') as $file) if (is_file($file)) unlink($file);
        rmdir($cacheDirectory);
    }
}
