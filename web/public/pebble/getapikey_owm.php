<?php
require_once __DIR__ . '/../../bootstrap.php';

// Compatibility for installed clients that obtain a key here and query OpenWeather
// directly. The credential belongs in private configuration, never in this file.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
$response = array('status' => 'error', 'use_allowed' => 0, 'key' => '');
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Allow: GET');
    $response['message'] = 'GET required.';
} elseif (!ninetime_config('legacy_key_endpoint_enabled', false)) {
    http_response_code(410);
    $response['status'] = 'disabled';
    $response['message'] = 'The legacy OpenWeather key endpoint is disabled.';
} else {
    $key = trim((string) ninetime_config('weather.legacy_openweather_key', ''));
    if (!preg_match('/^[a-f0-9]{32}$/i', $key)) {
        http_response_code(503);
        $response['message'] = 'The legacy OpenWeather key is not configured.';
    } else {
        http_response_code(200);
        $response = array('status' => 'ok', 'use_allowed' => 1, 'key' => $key);
    }
}
echo json_encode($response);
