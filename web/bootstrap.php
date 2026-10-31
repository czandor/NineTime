<?php
// Private configuration is deliberately outside web/public.
function ninetime_config($name, $fallback = null) {
    static $settings = null;
    if ($settings === null) {
        $settings = require __DIR__ . '/config/config.example.php';
        $privateFile = getenv('NINETIME_CONFIG_FILE');
        if ($privateFile === false || $privateFile === '') {
            $privateFile = __DIR__ . '/config/config.local.php';
        }
        if (is_file($privateFile)) {
            $private = require $privateFile;
            if (!is_array($private)) {
                throw new RuntimeException('NineTime configuration must return an array.');
            }
            $settings = array_replace_recursive($settings, $private);
        }
        $environment = array(
            'NINETIME_PUBLIC_BASE_URL' => array('public_base_url'),
            'NINETIME_DB_HOST' => array('db', 'host'),
            'NINETIME_DB_PORT' => array('db', 'port'),
            'NINETIME_DB_USER' => array('db', 'user'),
            'NINETIME_DB_PASSWORD' => array('db', 'password'),
            'NINETIME_DB_NAME' => array('db', 'database'),
            'NINETIME_YAHOO_APP_ID' => array('yahoo', 'app_id'),
            'NINETIME_YAHOO_CONSUMER_KEY' => array('yahoo', 'consumer_key'),
            'NINETIME_YAHOO_CONSUMER_SECRET' => array('yahoo', 'consumer_secret'),
            'NINETIME_ADMIN_TOKEN' => array('admin_token')
        );
        foreach ($environment as $variable => $keys) {
            $value = getenv($variable);
            if ($value === false) continue;
            if (count($keys) === 1) $settings[$keys[0]] = $value;
            else $settings[$keys[0]][$keys[1]] = $value;
        }
        foreach (array('wu', 'owm') as $provider) {
            $value = getenv('NINETIME_' . strtoupper($provider) . '_KEYS');
            if ($value !== false) {
                $settings['weather'][$provider]['keys'] = array_values(array_filter(array_map('trim', explode(',', $value))));
            }
        }
    }
    $value = $settings;
    foreach (explode('.', $name) as $key) {
        if (!is_array($value) || !array_key_exists($key, $value)) return $fallback;
        $value = $value[$key];
    }
    return $value;
}

function ninetime_db($required = true) {
    if (!function_exists('mysqli_connect')) {
        if (!$required) return false;
        throw new RuntimeException('The PHP mysqli extension is required.');
    }
    mysqli_report(MYSQLI_REPORT_OFF);
    $link = @mysqli_connect(
        ninetime_config('db.host'),
        ninetime_config('db.user'),
        ninetime_config('db.password'),
        ninetime_config('db.database'),
        (int) ninetime_config('db.port', 3306)
    );
    if (!$link) {
        if (!$required) return false;
        http_response_code(503);
        exit('Database unavailable. Check the private server configuration.');
    }
    mysqli_set_charset($link, 'utf8mb4');
    return $link;
}

function ninetime_url($suffix = '') {
    return rtrim(ninetime_config('public_base_url'), '/') . $suffix;
}

function ninetime_require_admin() {
    $expected = ninetime_config('admin_token', '');
    $authorization = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    $provided = substr($authorization, 0, 7) === 'Bearer ' ? substr($authorization, 7) : '';
    if ($expected === '' || $provided === '' || !hash_equals($expected, $provided)) {
        http_response_code(403);
        exit('Administrative endpoint disabled or authentication required.');
    }
}
