<?php
// Copy to config.local.php for private values. This example is safe to commit.
// This folder must remain outside the web server document root (web/public).
return array(
    'public_base_url' => 'http://127.0.0.1:8000/pebble',
    'force_https' => false,
    'db' => array(
        'host' => '127.0.0.1',
        'port' => 3306,
        'user' => 'ninetime',
        'password' => '',
        'database' => 'ninetime'
    ),
    'weather' => array(
        'user_agent' => 'NineTime/2.00 (https://github.com/czandor/NineTime)',
        'cache_dir' => __DIR__ . '/../var/weather',
        'cache_seconds' => 900,
        'legacy_provider' => 'metno',
        // Coordinates for old provider-specific IDs, keyed as e.g. 'wu:pws:STATION'.
        'legacy_locations' => array()
    ),
    // Empty means the administrative endpoints are inaccessible.
    'admin_token' => ''
);
