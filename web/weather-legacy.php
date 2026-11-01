<?php
// Old URLs and response shapes, backed by the current keyless weather adapters.
require_once __DIR__ . '/weather.php';

function ninetime_weather_legacy_url($url) {
    if (!is_string($url) || strlen($url) > 4096) throw new InvalidArgumentException('Invalid legacy weather URL.');
    $parts = parse_url($url);
    $hosts = array('api.openweathermap.org' => 'owm', 'api.wunderground.com' => 'wu', 'query.yahooapis.com' => 'yql');
    if (!$parts || !isset($parts['host'], $parts['scheme']) || !isset($hosts[strtolower($parts['host'])]) ||
        !in_array(strtolower($parts['scheme']), array('http', 'https'), true) || isset($parts['user']) || isset($parts['pass'])) {
        throw new InvalidArgumentException('Unsupported legacy weather URL.');
    }
    $parameters = array();
    parse_str(isset($parts['query']) ? $parts['query'] : '', $parameters);
    return array('format' => $hosts[strtolower($parts['host'])], 'path' => isset($parts['path']) ? rawurldecode($parts['path']) : '', 'parameters' => $parameters);
}

function ninetime_weather_legacy_place($query, $format, $transport, $now) {
    if (isset($query['lat'], $query['lon'])) {
        return array('latitude' => ninetime_weather_coordinate($query['lat'], 90), 'longitude' => ninetime_weather_coordinate($query['lon'], 180), 'name' => '');
    }
    $location = isset($query['location']) ? $query['location'] : (isset($query['q']) ? $query['q'] : '');
    if (!is_string($location)) throw new InvalidArgumentException('Invalid legacy location.');
    if (preg_match('/^\(?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)?$/', $location, $match)) {
        return array('latitude' => ninetime_weather_coordinate($match[1], 90), 'longitude' => ninetime_weather_coordinate($match[2], 180), 'name' => '');
    }
    $identifier = isset($query['id']) ? $query['id'] : '';
    if (!is_scalar($identifier)) throw new InvalidArgumentException('Invalid legacy location ID.');
    $identifier = (string) $identifier;
    $mappingKey = $identifier !== '' ? $format . ':' . $identifier : $format . ':' . $location;
    $mappings = ninetime_config('weather.legacy_locations', array());
    if (isset($mappings[$mappingKey])) {
        $place = $mappings[$mappingKey];
        return array('latitude' => ninetime_weather_coordinate($place['latitude'], 90), 'longitude' => ninetime_weather_coordinate($place['longitude'], 180), 'name' => isset($place['name']) ? $place['name'] : '');
    }
    if ($identifier !== '' && $format === 'owm' && preg_match('/^[1-9]\d{0,9}$/', $identifier)) {
        // Many OpenWeather city IDs are GeoNames IDs; Yahoo WOEIDs are a different namespace.
        $response = ninetime_weather_cached_json('https://geocoding-api.open-meteo.com/v1/get?id=' . rawurlencode($identifier), $transport, $now);
        $place = $response['data'];
        if (isset($place['latitude'], $place['longitude'])) {
            return array('latitude' => ninetime_weather_coordinate($place['latitude'], 90), 'longitude' => ninetime_weather_coordinate($place['longitude'], 180), 'name' => isset($place['name']) ? $place['name'] : '');
        }
    }
    if ($identifier !== '' || preg_match('/^(?:woeid:|pws:|zmw:|\d+$)/i', $location)) {
        throw new InvalidArgumentException('Legacy location ID needs a server-side coordinate mapping.');
    }
    if (strpos($location, '/') !== false) {
        $parts = explode('/', trim($location, '/'));
        $location = array_pop($parts) . ', ' . array_pop($parts);
    }
    $location = str_replace('_', ' ', $location);
    $result = ninetime_weather_request(array('action' => 'geocode', 'q' => $location), $transport, $now);
    if (empty($result['locations'])) throw new InvalidArgumentException('Legacy location was not found.');
    return $result['locations'][0];
}

function ninetime_weather_legacy_request($format, $query, $transport = null, $now = null) {
    if ($now === null) $now = time();
    $path = '';
    if (isset($query['url'])) {
        $parsed = ninetime_weather_legacy_url($query['url']);
        if ($format === null) $format = $parsed['format'];
        if ($format !== $parsed['format']) throw new InvalidArgumentException('Legacy weather URL does not match its endpoint.');
        $path = $parsed['path'];
        $query = array_replace($parsed['parameters'], $query);
        unset($query['url']);
    }
    if (!in_array($format, array('owm', 'wu', 'yahoo', 'yql'), true)) throw new InvalidArgumentException('Unsupported legacy weather format.');
    if ($format === 'wu' && $path !== '') {
        if (!preg_match('~/q/(.+)\.json$~', $path, $match)) throw new InvalidArgumentException('Invalid legacy weather path.');
        $query['location'] = $match[1];
        if (preg_match('~/lang:([a-z]+)~i', $path, $language)) $query['lang'] = strtolower($language[1]);
    }
    if ($format === 'yql') {
        $yql = isset($query['q']) && is_string($query['q']) ? $query['q'] : '';
        if (preg_match('/text\s*=\s*["\x27]([^"\x27]+)["\x27]/i', $yql, $match)) $query['location'] = $match[1];
        elseif (preg_match('/woeid\s*=\s*(\d+)/i', $yql, $match)) $query['location'] = 'woeid:' . $match[1];
        else throw new InvalidArgumentException('Unsupported legacy weather query.');
        $query['units'] = preg_match('/\bu\s*=\s*["\x27]c["\x27]/i', $yql) ? 'metric' : 'imperial';
        unset($query['q']);
    }
    $place = ninetime_weather_legacy_place($query, $format, $transport, $now);
    $language = isset($query['lang']) && is_string($query['lang']) ? strtolower($query['lang']) : 'en';
    $languages = array('hu' => 'hu', 'hu-hu' => 'hu', 'dl' => 'de', 'de' => 'de', 'ge' => 'de', 'en' => 'en');
    $language = isset($languages[$language]) ? $languages[$language] : 'en';
    $weather = ninetime_weather_request(array('provider' => ninetime_config('weather.legacy_provider', 'metno'),
        'latitude' => $place['latitude'], 'longitude' => $place['longitude'], 'language' => $language), $transport, $now);
    $name = $place['name'] !== '' ? $place['name'] : (isset($weather['location']['name']) ? $weather['location']['name'] : 'Unknown location');
    $current = $weather['current'];
    $forecast = $weather['forecast'];
    $temperature = function ($celsius, $units) { return $units === 'metric' ? $celsius : ($units === 'standard' ? $celsius + 273.15 : $celsius * 1.8 + 32); };
    $units = isset($query['units']) && is_string($query['units']) ? $query['units'] : ($format === 'owm' ? 'standard' : 'imperial');
    $meta = array('provider' => $weather['provider'], 'attribution' => $weather['attribution'], 'forecast_hours' => 24);
    if ($format === 'owm') {
        $codes = array(801,804,600,500,502,602,800,611,801,800,200,741);
        $icon = function ($id) { $icons = array('02d','04d','13d','10d','10d','13d','01d','13d','02n','01n','11d','50d'); return $icons[$id]; };
        $result = array('cod' => '200', 'name' => $name, 'dt' => $weather['fetchedAt'],
            'coord' => array('lat' => (float) $place['latitude'], 'lon' => (float) $place['longitude']),
            'main' => array('temp' => $temperature($current['temperatureC'], $units), 'humidity' => $current['humidity']),
            'wind' => array('speed' => $units === 'imperial' ? $current['windKph'] / 1.609344 : $current['windKph'] / 3.6),
            'weather' => array(array('id' => $codes[$current['icon']], 'description' => $weather['condition'], 'icon' => $icon($current['icon']))), 'ninetime' => $meta);
        if (strpos($path, '/forecast') !== false || isset($query['cnt'])) {
            // The old client reads list[3] and merges min/max. These slots share the
            // next-24-hour summary, rather than pretending to be separate daily forecasts.
            $result['list'] = array();
            for ($i = 0; $i < 8; $i++) $result['list'][] = array('dt' => $now + $i * 10800,
                'main' => array('temp_min' => $temperature($forecast['minC'], $units), 'temp_max' => $temperature($forecast['maxC'], $units)),
                'weather' => array(array('id' => $codes[$forecast['icon']], 'icon' => $icon($forecast['icon']))));
            $result['cnt'] = 8;
            $result['city'] = array('name' => $name);
        }
        return $result;
    }
    if ($format === 'wu') {
        $icons = array('partlycloudy','cloudy','chancesnow','chancerain','rain','snow','clear','sleet','partlycloudy','clear','tstorms','fog');
        $degrees = function ($celsius) use ($temperature) { return array('celsius' => (string) round($celsius), 'fahrenheit' => (string) round($temperature($celsius, 'imperial'))); };
        return array('response' => array('features' => array('conditions' => 1, 'forecast' => 1)),
            'current_observation' => array('temp_c' => $current['temperatureC'], 'temp_f' => $temperature($current['temperatureC'], 'imperial'),
                'wind_kph' => $current['windKph'], 'wind_mph' => $current['windKph'] / 1.609344,
                'relative_humidity' => round($current['humidity']) . '%', 'display_location' => array('city' => $name),
                'icon' => $icons[$current['icon']], 'icon_url' => in_array($current['icon'], array(8,9), true) ? 'nt_' . $icons[$current['icon']] : $icons[$current['icon']], 'weather' => $weather['condition']),
            'forecast' => array('simpleforecast' => array('forecastday' => array(array('icon' => $icons[$forecast['icon']], 'low' => $degrees($forecast['minC']), 'high' => $degrees($forecast['maxC']))))), 'ninetime' => $meta);
    }
    $codes = array(30,26,14,9,12,16,32,18,29,31,4,20);
    $forecastRecord = array('day' => gmdate('D', $now), 'date' => $now, 'low' => $temperature($forecast['minC'], $units),
        'high' => $temperature($forecast['maxC'], $units), 'text' => ninetime_weather_condition($forecast['icon'], $language), 'code' => $codes[$forecast['icon']]);
    $condition = array('text' => $weather['condition'], 'code' => $codes[$current['icon']], 'temperature' => $temperature($current['temperatureC'], $units));
    $location = array('city' => $name, 'lat' => (float) $place['latitude'], 'long' => (float) $place['longitude']);
    $wind = array('speed' => $units === 'metric' ? $current['windKph'] : $current['windKph'] / 1.609344);
    if ($format === 'yql') {
        $condition['temp'] = $condition['temperature'];
        return array('query' => array('count' => 1, 'results' => array('channel' => array('location' => $location, 'wind' => $wind,
            'atmosphere' => array('humidity' => $current['humidity']), 'item' => array('condition' => $condition, 'forecast' => array($forecastRecord))))), 'ninetime' => $meta);
    }
    return array('location' => $location, 'current_observation' => array('condition' => $condition, 'wind' => $wind,
        'atmosphere' => array('humidity' => $current['humidity']), 'pubDate' => $weather['fetchedAt']), 'forecasts' => array($forecastRecord), 'ninetime' => $meta);
}

function ninetime_weather_legacy_serve($format) {
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') { http_response_code(405); header('Allow: GET'); echo json_encode(array('error' => 'GET required.')); return; }
    try { echo json_encode(ninetime_weather_legacy_request($format, $_GET), JSON_UNESCAPED_UNICODE); }
    catch (InvalidArgumentException $error) { http_response_code(400); echo json_encode(array('error' => $error->getMessage())); }
    catch (RuntimeException $error) { http_response_code(503); echo json_encode(array('error' => 'Weather service temporarily unavailable.')); }
}
