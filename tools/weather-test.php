<?php
// Adapter/cache tests use an isolated MySQL database and synthetic upstream responses.
$testConfig = getenv('NINETIME_TEST_CONFIG_FILE');
putenv('NINETIME_CONFIG_FILE=' . ($testConfig ?: __DIR__ . '/../web/config/config.example.php'));
if (!$testConfig) putenv('NINETIME_DB_NAME=ninetime_weather_test');
$migrationDirectory = __DIR__ . '/../web/var/weather-migration-tests-' . getmypid();
$locationDirectory = __DIR__ . '/../web/var/location-tests-' . getmypid();
putenv('NINETIME_LOCATION_DIR=' . $locationDirectory);
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
function weather_test_process($arguments) {
    $process = proc_open(array_merge(array(PHP_BINARY), $arguments), array(0 => array('pipe', 'r'), 1 => array('pipe', 'w'), 2 => array('pipe', 'w')), $pipes);
    if (!is_resource($process)) throw new RuntimeException('Cannot start cache test subprocess.');
    fclose($pipes[0]);
    return array($process, $pipes[1], $pipes[2]);
}
function weather_test_result($process) {
    $output = stream_get_contents($process[1]);
    $errors = stream_get_contents($process[2]);
    fclose($process[1]);
    fclose($process[2]);
    check_weather(proc_close($process[0]) === 0, 'cache subprocess: ' . $errors);
    $result = json_decode($output, true);
    check_weather(is_array($result), 'cache subprocess returns JSON');
    return $result;
}
if (!preg_match('/^ninetime_weather_test(?:_[a-z0-9_]+)?$/D', ninetime_config('db.database'))) {
    throw new RuntimeException('Weather tests require a database named ninetime_weather_test or ninetime_weather_test_*');
}
$testDb = ninetime_db(false);
if (!$testDb) throw new RuntimeException('Configure an isolated MySQL database using NINETIME_TEST_CONFIG_FILE.');
if (isset($argv[1]) && $argv[1] === 'cache-worker') {
    $result = ninetime_weather_cached_json('https://api.open-meteo.com/cache-concurrency-fixture', function () use ($testDb) {
        mysqli_query($testDb, 'UPDATE weather_cache_test_calls SET calls = calls + 1');
        usleep(300000);
        return array('status' => 200, 'headers' => array(), 'body' => '{"value":"parallel"}');
    }, 1700001901);
    mysqli_close($testDb);
    echo json_encode($result) . PHP_EOL;
    exit;
}
weather_test_result(weather_test_process(array(__DIR__ . '/migrate-weather-cache.php')));
mysqli_query($testDb, 'DELETE FROM weather_cache');
$now = 1700000000;
mkdir($locationDirectory, 0700, true);
file_put_contents($locationDirectory . '/metadata.json', json_encode(array('schema' => 1)));
$locations = array(
    array(47.4979, 19.0402, 'Budapest', 'HU', 3054643, 1700000, 'Europe/Budapest'),
    array(0, 0, 'Equator town', 'ZZ', 1, 1000, 'UTC'),
    array(-16.5, 179.9, 'Date line town', 'FJ', 2, 1000),
    array(89.9, 170, 'Polar town', 'ZZ', 3, 1000),
    array(49.99, 5.01, 'Across the tile edge', 'ZZ', 4, 1000),
    array(49.85, 4.9, 'Farther in the same tile', 'ZZ', 5, 1000)
);
$tiles = array();
foreach ($locations as $place) $tiles[(int) floor(($place[0] + 90) / 5) . '_' . (int) floor(($place[1] + 180) / 5)][] = $place;
foreach ($tiles as $tile => $places) file_put_contents($locationDirectory . '/' . $tile . '.json', json_encode($places));
$open = array(
    'current' => array('time' => $now, 'temperature_2m' => 12, 'relative_humidity_2m' => 70, 'wind_speed_10m' => 18, 'wind_direction_10m' => 225, 'weather_code' => 0, 'is_day' => 0),
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
            'instant' => array('details' => array('air_temperature' => $hour > 24 ? 60 : $temperature, 'relative_humidity' => 70, 'wind_speed' => 5, 'wind_from_direction' => 225)),
            'next_1_hours' => array('summary' => array('symbol_code' => $hour === 8 ? 'heavyrainandthunder_day' : 'clearsky_night'))
        )
    );
}
try {
    check_weather(ninetime_location_nearest(47.498, 19.04)['name'] === 'Budapest', 'GPS city name');
    check_weather(ninetime_location_nearest(47.498, 19.04)['timeZone'] === 'Europe/Budapest', 'offline time zone lookup');
    check_weather(!isset(ninetime_location_nearest(-16.5, -179.95)['timeZone']), 'old six-field gazetteer tiles remain supported');
    check_weather(ninetime_location_nearest(0, 0)['name'] === 'Equator town', 'zero GPS coordinate lookup');
    check_weather(ninetime_location_nearest(-16.5, -179.95)['name'] === 'Date line town', 'nearest city across the date line');
    check_weather(ninetime_location_nearest(90, -10)['name'] === 'Polar town', 'nearest city at the pole');
    check_weather(ninetime_location_nearest(49.99, 4.99)['name'] === 'Across the tile edge', 'nearest city in an adjacent tile');
    $a = ninetime_weather_openmeteo($open);
    $b = ninetime_weather_metno($met, $now);
    foreach (array($a, $b) as $weather) {
        check_weather($weather['current']['temperatureC'] === 12.0, 'current temperature');
        check_weather($weather['current']['windKph'] === 18.0, 'wind units');
        check_weather($weather['current']['windDegrees'] === 225.0, 'wind direction from upstream');
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
    $oldOpen = $open; unset($oldOpen['current']['wind_direction_10m']);
    check_weather(ninetime_weather_openmeteo($oldOpen)['current']['windDegrees'] === null, 'old cached weather without wind direction remains usable');
    check_weather(ninetime_weather_wind_direction(array('direction' => 'bad'), 'direction') === null, 'invalid optional wind direction is not invented');
    foreach (array(array('Europe/Budapest', 47.4979, 19.0402), array('Pacific/Auckland', -41.2865, 174.7762),
        array('Pacific/Kiritimati', 1.8721, -157.4278), array('America/New_York', 40.7128, -74.006)) as $place) {
        $zone = new DateTimeZone($place[0]);
        $date = new DateTimeImmutable('2026-11-04 12:00:00', $zone);
        $solarWeather = array('location' => array('timeZone' => $place[0], 'latitude' => $place[1], 'longitude' => $place[2]));
        $sun = ninetime_weather_legacy_sun($solarWeather, $date->getTimestamp());
        check_weather(count($sun) === 2, 'sun events available: ' . $place[0]);
        foreach ($sun as $event) {
            $local = (new DateTimeImmutable('@' . $event['timestamp']))->setTimezone($zone);
            check_weather($local->format('Y-m-d') === '2026-11-04', 'sun event belongs to local date: ' . $place[0]);
            check_weather(preg_match('/^\d{1,2}:\d{2} (am|pm)$/', $event['text']) === 1, 'Fitbit-compatible local clock format');
        }
    }
    $polar = array('location' => array('timeZone' => 'Arctic/Longyearbyen', 'latitude' => 78.2232, 'longitude' => 15.6469));
    check_weather(ninetime_weather_legacy_sun($polar, strtotime('2026-06-21T12:00:00Z')) === array(), 'polar day does not fabricate sunrise or sunset');
    check_weather(ninetime_weather_legacy_sun(array('location' => array()), $now) === array(), 'missing time zone does not guess local sun times');
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
    check_weather($first['location']['name'] === 'Budapest' && $first['location']['source'] === 'GeoNames', 'weather response includes GPS city');
    check_weather($requests === 1 && $first === $second, 'cache avoids repeated calls');
    ninetime_weather_request($query, $transport, $now + 1900);
    check_weather($requests === 2 && count($seen[1][1]) === 1 && strpos($seen[1][1][0], 'If-Modified-Since:') === 0, 'conditional cache revalidation');
    check_weather(strpos($seen[0][0], 'latitude=47.4979') !== false, 'rounded upstream coordinate');
    check_weather(strpos($seen[0][0], 'apikey') === false && strpos($seen[0][0], 'APPID') === false, 'no authentication query');

    $cleanupNow = $now + 1901;
    $cutoff = $cleanupNow - 30 * 86400;
    $cachedFixture = array('data' => array('value' => 'fixture'), 'fetchedAt' => $now, 'expires' => $now + 900);
    foreach (array('old' => $cutoff - 1, 'boundary' => $cutoff, 'fresh' => $cleanupNow) as $name => $updatedAt) {
        ninetime_weather_cache_store($testDb, hash('sha256', $name), $cachedFixture, $updatedAt);
    }
    ninetime_weather_cache_cleanup($testDb, $cleanupNow);
    $keys = array_column(mysqli_fetch_all(mysqli_query($testDb, 'SELECT cache_key FROM weather_cache'), MYSQLI_ASSOC), 'cache_key');
    check_weather(!in_array(hash('sha256', 'old'), $keys, true), 'cleanup removes entries older than 30 days');
    check_weather(in_array(hash('sha256', 'boundary'), $keys, true), 'cleanup keeps exactly 30-day-old entries');
    check_weather(in_array(hash('sha256', 'fresh'), $keys, true), 'cleanup keeps recently refreshed entries');

    // Force the random branch through the normal cache-hit entry point.
    for ($seed = 0; ; $seed++) {
        mt_srand($seed);
        if (rand(0, 999) === 0) break;
    }
    ninetime_weather_cache_store($testDb, hash('sha256', 'old'), $cachedFixture, $cutoff - 1);
    mt_srand($seed);
    $cachedAgain = ninetime_weather_request($query, $transport, $cleanupNow);
    $remaining = mysqli_fetch_row(mysqli_query($testDb, "SELECT COUNT(*) FROM weather_cache WHERE cache_key = '" . hash('sha256', 'old') . "'"));
    check_weather((int) $remaining[0] === 0, 'request randomly deletes expired database entries');
    check_weather($requests === 2 && $cachedAgain['current']['temperatureC'] === 12.0, 'cleanup preserves cache hits without upstream requests');
    mt_srand();

    $failureUrl = 'https://api.open-meteo.com/cache-failure-fixture';
    $failureKey = hash('sha256', $failureUrl);
    ninetime_weather_cache_store($testDb, $failureKey, $cachedFixture, $now);
    rejects_weather(function () use ($failureUrl, $now) {
        ninetime_weather_cached_json($failureUrl, function () { throw new RuntimeException('Synthetic upstream failure.'); }, $now + 1000);
    }, 'upstream failure is reported');
    $saved = mysqli_fetch_assoc(mysqli_query($testDb, "SELECT payload FROM weather_cache WHERE cache_key = '" . $failureKey . "'"));
    check_weather(json_decode($saved['payload'], true) === $cachedFixture, 'failed refresh preserves the old response');
    $lockName = hash('sha256', 'ninetime-weather:' . ninetime_config('db.database') . ':' . $failureKey);
    $free = mysqli_fetch_row(mysqli_query($testDb, "SELECT IS_FREE_LOCK('" . $lockName . "')"));
    check_weather((string) $free[0] === '1', 'upstream failure releases the database lock');

    mysqli_query($testDb, "UPDATE weather_cache SET updated_at = " . ($now - 31 * 86400) . " WHERE cache_key = '" . $failureKey . "'");
    $refreshed = ninetime_weather_cached_json($failureUrl, function () use ($testDb, $now) {
        ninetime_weather_cache_cleanup($testDb, $now + 1001);
        return array('status' => 200, 'headers' => array(), 'body' => json_encode(array('value' => "árvíztűrő ' quoted")));
    }, $now + 1001);
    check_weather($refreshed['data']['value'] === "árvíztűrő ' quoted", 'refresh survives concurrent cleanup and stores Unicode and quotes');
    $saved = mysqli_fetch_assoc(mysqli_query($testDb, "SELECT payload FROM weather_cache WHERE cache_key = '" . $failureKey . "'"));
    check_weather(json_decode($saved['payload'], true)['data'] === $refreshed['data'], 'deleted entry is recreated atomically');

    mysqli_query($testDb, 'CREATE TABLE IF NOT EXISTS weather_cache_test_calls (calls int NOT NULL)');
    mysqli_query($testDb, 'DELETE FROM weather_cache_test_calls');
    mysqli_query($testDb, 'INSERT INTO weather_cache_test_calls VALUES (0)');
    $workers = array();
    for ($worker = 0; $worker < 3; $worker++) $workers[] = weather_test_process(array(__FILE__, 'cache-worker'));
    foreach ($workers as $worker) {
        check_weather(weather_test_result($worker)['data']['value'] === 'parallel', 'parallel request receives cached response');
    }
    $calls = mysqli_fetch_row(mysqli_query($testDb, 'SELECT calls FROM weather_cache_test_calls'));
    check_weather((int) $calls[0] === 1, 'parallel cache misses make only one upstream request');

    mkdir($migrationDirectory, 0700, true);
    $importKey = hash('sha256', 'file-import-fixture');
    $importPath = $migrationDirectory . '/' . $importKey . '.json';
    $importTime = time() - 3600;
    file_put_contents($importPath, json_encode($cachedFixture));
    touch($importPath, $importTime);
    $invalidPath = $migrationDirectory . '/' . hash('sha256', 'invalid-file') . '.json';
    file_put_contents($invalidPath, 'incomplete');
    $oldPath = $migrationDirectory . '/' . hash('sha256', 'old-file') . '.json';
    file_put_contents($oldPath, json_encode($cachedFixture));
    touch($oldPath, time() - 31 * 86400);
    $migrationArgs = array(__DIR__ . '/migrate-weather-cache.php', $migrationDirectory);
    $import = weather_test_result(weather_test_process($migrationArgs));
    check_weather($import['imported'] === 1 && $import['skipped'] === 2, 'migration imports valid files and skips malformed or old files');
    $again = weather_test_result(weather_test_process($migrationArgs));
    check_weather($again['imported'] === 0 && $again['unchanged'] === 1, 'migration is repeatable');
    $newer = $cachedFixture;
    $newer['data']['value'] = 'newer database response';
    ninetime_weather_cache_store($testDb, $importKey, $newer, $importTime + 60);
    weather_test_result(weather_test_process($migrationArgs));
    $saved = mysqli_fetch_assoc(mysqli_query($testDb, "SELECT payload, updated_at FROM weather_cache WHERE cache_key = '" . $importKey . "'"));
    check_weather(json_decode($saved['payload'], true) === $newer && (int) $saved['updated_at'] === $importTime + 60, 'migration cannot overwrite a newer database response');

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
    $legacyTransport = function ($url, $headers) use ($met, $open, &$legacyCalls) {
        $legacyCalls[] = $url;
        if (strpos($url, '/v1/get?') !== false) $data = array('name' => 'Budapest', 'latitude' => 47.4979, 'longitude' => 19.0402);
        elseif (strpos($url, '/v1/search?') !== false) $data = array('results' => array(array('name' => 'Berlin', 'latitude' => 52.52, 'longitude' => 13.405)));
        elseif (strpos($url, 'https://api.open-meteo.com/v1/forecast?') === 0) $data = $open;
        else $data = $met;
        return array('status' => 200, 'headers' => array(), 'body' => json_encode($data));
    };
    $owm = ninetime_weather_legacy_request('owm', array('url' => 'http://api.openweathermap.org/data/2.5/weather?lat=0&lon=0&units=metric&appid=ignored'), $legacyTransport, $now);
    check_weather($owm['cod'] === '200' && $owm['main']['temp'] === 12.0 && $owm['wind']['speed'] === 5.0, 'legacy OWM metric contract');
    check_weather($owm['ninetime']['provider'] === 'openmeteo', 'OpenWeather-formatted endpoint uses Open-Meteo');
    check_weather($owm['weather'][0]['id'] === 800 && $owm['weather'][0]['icon'] === '01n', 'legacy OWM night');
    check_weather($owm['wind']['deg'] === 225.0 && isset($owm['sys']['sunrise'], $owm['sys']['sunset']), 'legacy OWM wind direction and solar timestamps');
    $owmImperial = ninetime_weather_legacy_request('owm', array('lat' => 0, 'lon' => 0, 'units' => 'imperial'), $legacyTransport, $now);
    check_weather(abs($owmImperial['main']['temp'] - 53.6) < 0.001 && abs($owmImperial['wind']['speed'] - 11.1847) < 0.001, 'legacy OWM imperial contract');
    $owmForecast = ninetime_weather_legacy_request(null, array('url' => 'https://api.openweathermap.org/data/2.5/forecast?lat=0&lon=0&cnt=8&units=metric'), $legacyTransport, $now);
    check_weather(count($owmForecast['list']) === 8 && $owmForecast['list'][3]['weather'][0]['id'] === 200, 'legacy OWM list[3] forecast');
    check_weather($owmForecast['list'][0]['main']['temp_min'] === -5.0 && $owmForecast['list'][0]['main']['temp_max'] === 20.0, 'legacy OWM 24-hour range');
    check_weather($owmForecast['list'][3]['weather'][0]['description'] === 'Thunderstorm', 'legacy forecast condition text');
    $wu = ninetime_weather_legacy_request('wu', array('url' => 'http://api.wunderground.com/api/ignored/conditions/lang:HU/q/0,0.json'), $legacyTransport, $now);
    check_weather($wu['current_observation']['display_location']['city'] === 'Equator town', 'legacy GPS response includes city name');
    check_weather($wu['response']['features']['conditions'] === 1 && $wu['current_observation']['relative_humidity'] === '70%', 'legacy WU current contract');
    check_weather($wu['current_observation']['icon'] === 'clear' && strpos($wu['current_observation']['icon_url'], 'nt_') !== false, 'legacy WU night contract');
    check_weather($wu['current_observation']['weather'] === 'Derült', 'legacy WU language');
    $wuForecast = ninetime_weather_legacy_request('wu', array('url' => 'https://api.wunderground.com/api/ignored/forecast/q/0,0.json'), $legacyTransport, $now);
    $day = $wuForecast['forecast']['simpleforecast']['forecastday'][0];
    check_weather($wuForecast['response']['features']['forecast'] === 1 && $day['low']['celsius'] === '-5' && $day['high']['fahrenheit'] === '68', 'legacy WU forecast contract');
    $yahoo = ninetime_weather_legacy_request('yahoo', array('lat' => 0, 'lon' => 0), $legacyTransport, $now);
    check_weather($yahoo['current_observation']['condition']['code'] === 31 && abs($yahoo['current_observation']['condition']['temperature'] - 53.6) < 0.001, 'legacy Yahoo current contract');
    check_weather($yahoo['forecasts'][0]['code'] === 4 && $yahoo['forecasts'][0]['low'] === 23.0, 'legacy Yahoo forecast contract');
    check_weather($yahoo['ninetime']['provider'] === 'metno', 'MetaWeather and Yahoo-formatted endpoints use MET Norway');
    check_weather($yahoo['current_observation']['wind']['direction'] === 225.0 && isset($yahoo['current_observation']['astronomy']['sunrise']), 'Fitbit Yahoo wind direction and local sun time');
    $yqlUrl = 'https://query.yahooapis.com/v1/public/yql?q=' . rawurlencode('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="(0,0)") and u="c"');
    $yql = ninetime_weather_legacy_request(null, array('url' => $yqlUrl), $legacyTransport, $now);
    check_weather($yql['query']['count'] === 1 && $yql['query']['results']['channel']['item']['condition']['temp'] === 12.0, 'legacy Yahoo YQL contract');
    check_weather($yql['ninetime']['provider'] === 'metno', 'legacy YQL endpoint uses MET Norway');
    $city = ninetime_weather_legacy_request('owm', array('id' => 3054643, 'units' => 'metric'), $legacyTransport, $now);
    check_weather($city['name'] === 'Budapest', 'legacy OWM GeoNames city ID');
    $city = ninetime_weather_legacy_request('wu', array('location' => 'Germany/Berlin'), $legacyTransport, $now);
    check_weather($city['current_observation']['display_location']['city'] === 'Berlin', 'legacy WU city name');
    foreach ($legacyCalls as $url) check_weather(strpos($url, 'appid') === false && strpos($url, 'wunderground') === false && strpos($url, 'yahoo') === false, 'legacy request uses only new services, without old credentials');
    foreach (array('http://127.0.0.1/', 'file:///etc/passwd', 'https://api.openweathermap.org.evil.test/?lat=0&lon=0') as $url) {
        rejects_weather(function () use ($url) { ninetime_weather_legacy_request(null, array('url' => $url)); }, 'legacy arbitrary URL rejected');
    }
    rejects_weather(function () use ($legacyTransport, $now) { ninetime_weather_legacy_request('wu', array('location' => 'pws:UNKNOWN'), $legacyTransport, $now); }, 'unresolved station ID is not guessed');
    unlink($locationDirectory . '/metadata.json');
    check_weather(ninetime_location_nearest(47.4979, 19.0402) === null, 'missing gazetteer has a safe fallback');
    $withoutCity = ninetime_weather_request($query, $transport, $now);
    check_weather($withoutCity['current']['temperatureC'] === 12.0 && !isset($withoutCity['location']['name']), 'weather remains usable if offline locations are unavailable');
    echo 'Weather PHP tests passed: ' . $checks . " assertions using an isolated MySQL database; no weather service contacted.\n";
} finally {
    mysqli_query($testDb, 'DELETE FROM weather_cache');
    mysqli_query($testDb, 'DROP TABLE IF EXISTS weather_cache_test_calls');
    mysqli_close($testDb);
    // Delete only generated files in this test's own cache directory.
    foreach (array($locationDirectory, $migrationDirectory) as $directory) {
        if (!is_dir($directory)) continue;
        foreach (glob($directory . '/*') as $file) if (is_file($file)) unlink($file);
        rmdir($directory);
    }
}
