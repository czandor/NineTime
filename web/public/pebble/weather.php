<?php
require_once __DIR__ . '/../../weather.php';
if (isset($_GET['url'])) {
    require_once __DIR__ . '/../../weather-legacy.php';
    ninetime_weather_legacy_serve(null);
    exit;
}
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        header('Allow: GET');
        http_response_code(405);
        echo json_encode(array('error' => 'Use GET for weather requests.'));
        exit;
    }
    echo json_encode(ninetime_weather_request($_GET), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (InvalidArgumentException $error) {
    http_response_code(400);
    echo json_encode(array('error' => $error->getMessage()));
} catch (RuntimeException $error) {
    http_response_code(503);
    echo json_encode(array('error' => $error->getMessage()));
}
