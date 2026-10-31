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
        'wu' => array('keys' => array()),
        'owm' => array('keys' => array())
    ),
    'yahoo' => array(
        'app_id' => '',
        'consumer_key' => '',
        'consumer_secret' => ''
    ),
    // Empty means the administrative endpoints are inaccessible.
    'admin_token' => '',
    // The historical endpoint that returns an API key stays disabled.
    'legacy_key_endpoint_enabled' => false
);
