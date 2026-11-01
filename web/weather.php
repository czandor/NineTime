<?php
// Keyless weather adapters. Callers cannot choose an upstream URL or host.
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/locations.php';

function ninetime_weather_coordinate($value, $limit) {
    if (!is_scalar($value) || !is_numeric($value) || !is_finite((float) $value) || abs((float) $value) > $limit) {
        throw new InvalidArgumentException('Invalid weather coordinates.');
    }
    return number_format(round((float) $value, 4), 4, '.', '');
}

function ninetime_weather_http($url, $headers) {
    $host = parse_url($url, PHP_URL_HOST);
    if (parse_url($url, PHP_URL_SCHEME) !== 'https' ||
        !in_array($host, array('api.open-meteo.com', 'geocoding-api.open-meteo.com', 'api.met.no'), true)) {
        throw new RuntimeException('Unsupported weather service.');
    }
    if (!function_exists('curl_init')) throw new RuntimeException('The weather service requires PHP cURL.');
    $responseHeaders = array();
    $request = curl_init($url);
    curl_setopt_array($request, array(
        CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 15, CURLOPT_ENCODING => '',
        CURLOPT_USERAGENT => ninetime_config('weather.user_agent'),
        CURLOPT_HTTPHEADER => array_merge(array('Accept: application/json'), $headers),
        CURLOPT_HEADERFUNCTION => function ($curl, $line) use (&$responseHeaders) {
            $parts = explode(':', $line, 2);
            if (count($parts) === 2) $responseHeaders[strtolower(trim($parts[0]))] = trim($parts[1]);
            return strlen($line);
        }
    ));
    $body = curl_exec($request);
    $status = curl_getinfo($request, CURLINFO_HTTP_CODE);
    if (PHP_VERSION_ID < 80000) curl_close($request);
    if ($body === false) throw new RuntimeException('Weather service temporarily unavailable.');
    return array('status' => $status, 'headers' => $responseHeaders, 'body' => $body);
}

function ninetime_weather_cached_json($url, $transport = null, $now = null, $validate = null) {
    if ($now === null) $now = time();
    if ($transport === null) $transport = 'ninetime_weather_http';
    $directory = ninetime_config('weather.cache_dir');
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
        throw new RuntimeException('Weather cache directory is not writable.');
    }
    $path = $directory . '/' . hash('sha256', $url) . '.json';
    $lock = @fopen($path . '.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('Weather cache unavailable.');
    try {
        $cached = is_file($path) ? json_decode(file_get_contents($path), true) : null;
        if (is_array($cached) && isset($cached['data']) && $validate !== null) {
            try { call_user_func($validate, $cached['data']); }
            catch (RuntimeException $error) { $cached = null; }
        }
        if (is_array($cached) && isset($cached['expires'], $cached['data']) && $cached['expires'] > $now) {
            return array('data' => $cached['data'], 'fetchedAt' => $cached['fetchedAt']);
        }
        $headers = array();
        if (isset($cached['lastModified'])) $headers[] = 'If-Modified-Since: ' . $cached['lastModified'];
        $response = call_user_func($transport, $url, $headers);
        $minimum = max(900, (int) ninetime_config('weather.cache_seconds', 900));
        $expires = isset($response['headers']['expires']) ? strtotime($response['headers']['expires']) : false;
        $expires = max($now + $minimum, $expires === false ? 0 : $expires);
        if ($response['status'] === 304 && isset($cached['data'])) {
            $cached['expires'] = $expires;
        } else {
            if ($response['status'] < 200 || $response['status'] >= 300) throw new RuntimeException('Weather service temporarily unavailable.');
            $data = json_decode($response['body'], true);
            if (!is_array($data) || !empty($data['error'])) throw new RuntimeException('Invalid weather service response.');
            if ($validate !== null) call_user_func($validate, $data);
            $cached = array('data' => $data, 'fetchedAt' => $now, 'expires' => $expires);
            if (isset($response['headers']['last-modified'])) $cached['lastModified'] = $response['headers']['last-modified'];
        }
        if (file_put_contents($path, json_encode($cached), LOCK_EX) === false) throw new RuntimeException('Weather cache is not writable.');
        return array('data' => $cached['data'], 'fetchedAt' => $cached['fetchedAt']);
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

function ninetime_weather_number($value, $min, $max) {
    if (!is_numeric($value) || !is_finite((float) $value) || $value < $min || $value > $max) throw new RuntimeException('Incomplete weather service response.');
    return (float) $value;
}

function ninetime_weather_wmo_icon($code, $night) {
    $code = (int) $code;
    if ($code === 0) return $night ? 9 : 6;
    if ($code === 1 || $code === 2) return $night ? 8 : 0;
    if ($code === 3) return 1;
    if ($code === 45 || $code === 48) return 11;
    if (in_array($code, array(56, 57, 66, 67), true)) return 7;
    if (in_array($code, array(71, 77, 85), true)) return 2;
    if (in_array($code, array(73, 75, 86), true)) return 5;
    if (in_array($code, array(51, 53, 55, 61, 80), true)) return 3;
    if (in_array($code, array(63, 65, 81, 82), true)) return 4;
    if ($code >= 95 && $code <= 99) return 10;
    return 1;
}

function ninetime_weather_met_icon($symbol) {
    if (!is_string($symbol) || $symbol === '') return 1;
    $night = substr($symbol, -6) === '_night';
    if (strpos($symbol, 'thunder') !== false) return 10;
    if (strpos($symbol, 'sleet') !== false) return 7;
    if (strpos($symbol, 'snow') !== false) return strpos($symbol, 'light') !== false ? 2 : 5;
    if (strpos($symbol, 'rain') !== false) return strpos($symbol, 'light') !== false ? 3 : 4;
    if (strpos($symbol, 'fog') !== false) return 11;
    if (strpos($symbol, 'clearsky') !== false) return $night ? 9 : 6;
    if (strpos($symbol, 'fair') !== false || strpos($symbol, 'partlycloudy') !== false) return $night ? 8 : 0;
    return 1;
}

function ninetime_weather_forecast_icon($icons) {
    $severity = array(6 => 0, 9 => 0, 0 => 1, 8 => 1, 1 => 2, 11 => 3, 3 => 4, 2 => 5, 4 => 6, 5 => 7, 7 => 8, 10 => 9);
    $worst = 6;
    foreach ($icons as $icon) if (isset($severity[$icon]) && $severity[$icon] > $severity[$worst]) $worst = $icon;
    return $worst === 9 ? 6 : ($worst === 8 ? 0 : $worst);
}

function ninetime_weather_condition($icon, $language) {
    $labels = array(
        'en' => array('Partly cloudy', 'Cloudy', 'Light snow', 'Light rain', 'Heavy rain', 'Heavy snow', 'Clear', 'Sleet', 'Partly cloudy', 'Clear', 'Thunderstorm', 'Fog'),
        'hu' => array('Gyengén felhős', 'Felhős', 'Gyenge havazás', 'Gyenge eső', 'Erős eső', 'Erős havazás', 'Derült', 'Havas eső', 'Gyengén felhős', 'Derült', 'Zivatar', 'Köd'),
        'de' => array('Leicht bewölkt', 'Bewölkt', 'Leichter Schnee', 'Leichter Regen', 'Starker Regen', 'Starker Schnee', 'Klar', 'Schneeregen', 'Leicht bewölkt', 'Klar', 'Gewitter', 'Nebel')
    );
    if (!isset($labels[$language])) $language = 'en';
    return $labels[$language][$icon];
}

function ninetime_weather_openmeteo($json) {
    if (!isset($json['current'], $json['hourly']['time']) || !is_array($json['hourly']['time'])) throw new RuntimeException('Incomplete weather service response.');
    $current = $json['current'];
    $at = ninetime_weather_number(isset($current['time']) ? $current['time'] : null, 0, PHP_INT_MAX);
    $temperature = ninetime_weather_number(isset($current['temperature_2m']) ? $current['temperature_2m'] : null, -100, 70);
    $humidity = ninetime_weather_number(isset($current['relative_humidity_2m']) ? $current['relative_humidity_2m'] : null, 0, 100);
    $wind = ninetime_weather_number(isset($current['wind_speed_10m']) ? $current['wind_speed_10m'] : null, 0, 500);
    if (!isset($current['weather_code'], $current['is_day'])) throw new RuntimeException('Incomplete weather service response.');
    $icon = ninetime_weather_wmo_icon($current['weather_code'], !$current['is_day']);
    $temperatures = array($temperature);
    $icons = array($icon);
    $hours = 0;
    foreach ($json['hourly']['time'] as $i => $time) {
        if ($time < $at || $time > $at + 86400) continue;
        $temperatures[] = ninetime_weather_number(isset($json['hourly']['temperature_2m'][$i]) ? $json['hourly']['temperature_2m'][$i] : null, -100, 70);
        $icons[] = ninetime_weather_wmo_icon(isset($json['hourly']['weather_code'][$i]) ? $json['hourly']['weather_code'][$i] : 3, false);
        $hours = max($hours, ($time - $at) / 3600);
    }
    if ($hours < 18) throw new RuntimeException('Incomplete weather forecast.');
    return array('current' => array('temperatureC' => $temperature, 'humidity' => $humidity, 'windKph' => $wind, 'icon' => $icon),
        'forecast' => array('minC' => min($temperatures), 'maxC' => max($temperatures), 'icon' => ninetime_weather_forecast_icon($icons), 'hours' => 24));
}

function ninetime_weather_metno($json, $now) {
    if (empty($json['properties']['timeseries']) || !is_array($json['properties']['timeseries'])) throw new RuntimeException('Incomplete weather service response.');
    $series = $json['properties']['timeseries'];
    $nearest = null;
    $distance = PHP_INT_MAX;
    foreach ($series as $entry) {
        $time = isset($entry['time']) ? strtotime($entry['time']) : false;
        if ($time !== false && abs($time - $now) < $distance) { $distance = abs($time - $now); $nearest = $entry; }
    }
    if ($nearest === null || $distance > 7200) throw new RuntimeException('Outdated weather service response.');
    $details = isset($nearest['data']['instant']['details']) ? $nearest['data']['instant']['details'] : array();
    $temperature = ninetime_weather_number(isset($details['air_temperature']) ? $details['air_temperature'] : null, -100, 70);
    $humidity = ninetime_weather_number(isset($details['relative_humidity']) ? $details['relative_humidity'] : null, 0, 100);
    $wind = ninetime_weather_number(isset($details['wind_speed']) ? $details['wind_speed'] : null, 0, 140) * 3.6;
    $symbol = function ($entry) {
        foreach (array('next_1_hours', 'next_6_hours', 'next_12_hours') as $period) {
            if (isset($entry['data'][$period]['summary']['symbol_code'])) return $entry['data'][$period]['summary']['symbol_code'];
        }
        return 'cloudy';
    };
    $icon = ninetime_weather_met_icon($symbol($nearest));
    $temperatures = array($temperature);
    $icons = array($icon);
    $hours = 0;
    foreach ($series as $entry) {
        $time = strtotime($entry['time']);
        if ($time < $now || $time > $now + 86400) continue;
        $temperatures[] = ninetime_weather_number(isset($entry['data']['instant']['details']['air_temperature']) ? $entry['data']['instant']['details']['air_temperature'] : null, -100, 70);
        $icons[] = ninetime_weather_met_icon($symbol($entry));
        $hours = max($hours, ($time - $now) / 3600);
    }
    if ($hours < 18) throw new RuntimeException('Incomplete weather forecast.');
    return array('current' => array('temperatureC' => $temperature, 'humidity' => $humidity, 'windKph' => $wind, 'icon' => $icon),
        'forecast' => array('minC' => min($temperatures), 'maxC' => max($temperatures), 'icon' => ninetime_weather_forecast_icon($icons), 'hours' => 24));
}

function ninetime_weather_request($query, $transport = null, $now = null) {
    if ($now === null) $now = time();
    if (isset($query['url'])) throw new InvalidArgumentException('Arbitrary upstream URLs are not supported.');
    $action = isset($query['action']) ? $query['action'] : 'weather';
    if ($action === 'geocode') {
        $name = isset($query['q']) && is_string($query['q']) ? trim($query['q']) : '';
        if (!preg_match('/^.{2,80}$/us', $name)) throw new InvalidArgumentException('Enter a city name between 2 and 80 characters.');
        $language = isset($query['language']) && is_string($query['language']) && preg_match('/^[a-z]{2}$/', $query['language']) ? $query['language'] : 'en';
        $url = 'https://geocoding-api.open-meteo.com/v1/search?' . http_build_query(array('name' => $name, 'count' => 5, 'language' => $language, 'format' => 'json'));
        $response = ninetime_weather_cached_json($url, $transport, $now);
        $locations = array();
        foreach (isset($response['data']['results']) ? $response['data']['results'] : array() as $place) {
            if (!isset($place['name'], $place['latitude'], $place['longitude'])) continue;
            $latitude = ninetime_weather_coordinate($place['latitude'], 90);
            $longitude = ninetime_weather_coordinate($place['longitude'], 180);
            $parts = array_unique(array_filter(array($place['name'], isset($place['admin1']) ? $place['admin1'] : '', isset($place['country']) ? $place['country'] : '')));
            $locations[] = array('name' => implode(', ', $parts), 'latitude' => (float) $latitude, 'longitude' => (float) $longitude);
        }
        return array('locations' => $locations, 'attribution' => 'Location search by Open-Meteo / GeoNames');
    }
    if ($action !== 'weather') throw new InvalidArgumentException('Unsupported weather action.');
    $provider = isset($query['provider']) ? $query['provider'] : 'openmeteo';
    if (!in_array($provider, array('openmeteo', 'metno'), true)) throw new InvalidArgumentException('Unsupported weather provider.');
    $latitude = ninetime_weather_coordinate(isset($query['latitude']) ? $query['latitude'] : null, 90);
    $longitude = ninetime_weather_coordinate(isset($query['longitude']) ? $query['longitude'] : null, 180);
    if ($provider === 'openmeteo') {
        $url = 'https://api.open-meteo.com/v1/forecast?' . http_build_query(array(
            'latitude' => $latitude, 'longitude' => $longitude,
            'current' => 'temperature_2m,relative_humidity_2m,weather_code,is_day,wind_speed_10m',
            'hourly' => 'temperature_2m,weather_code', 'forecast_days' => 2,
            'timeformat' => 'unixtime', 'timezone' => 'UTC', 'wind_speed_unit' => 'kmh'
        ));
    } else {
        $url = 'https://api.met.no/weatherapi/locationforecast/2.0/compact?' . http_build_query(array('lat' => $latitude, 'lon' => $longitude));
    }
    $validate = function ($data) use ($provider, $now) {
        if ($provider === 'openmeteo') ninetime_weather_openmeteo($data);
        else ninetime_weather_metno($data, $now);
    };
    $response = ninetime_weather_cached_json($url, $transport, $now, $validate);
    $weather = $provider === 'openmeteo' ? ninetime_weather_openmeteo($response['data']) : ninetime_weather_metno($response['data'], $now);
    $language = isset($query['language']) && is_string($query['language']) ? $query['language'] : 'en';
    $weather['condition'] = ninetime_weather_condition($weather['current']['icon'], $language);
    $weather['provider'] = $provider;
    $weather['fetchedAt'] = $response['fetchedAt'];
    $weather['location'] = array('latitude' => (float) $latitude, 'longitude' => (float) $longitude);
    $place = ninetime_location_nearest($latitude, $longitude);
    if ($place !== null) $weather['location'] = array_merge($weather['location'], $place);
    $weather['attribution'] = $provider === 'openmeteo' ? 'Weather data by Open-Meteo (CC BY 4.0)' : 'Weather forecast from MET Norway (CC BY 4.0)';
    if ($place !== null) $weather['attribution'] .= '; nearest populated place by GeoNames (CC BY 4.0)';
    return $weather;
}
