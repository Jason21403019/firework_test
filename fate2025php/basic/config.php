<?php
date_default_timezone_set("Asia/Taipei");
header('Content-Type: application/json charset=utf-8');

// 載入環境變數函數
function loadEnv($path) {
    if (!file_exists($path)) {
        return false;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue; // 跳過註解
        }
        
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            
            if (!array_key_exists($name, $_ENV) && !getenv($name)) {
                putenv(sprintf('%s=%s', $name, $value));
                $_ENV[$name] = $value;
            }
        }
    }
    return true;
}

// 載入 .env 文件
loadEnv(__DIR__ . '/../.env');

// CORS 允許來源設定
define('CORS_ALLOWED_ORIGIN', 'https://lab-event.udn.com');
// define('CORS_ALLOWED_ORIGIN', 'https://event.udn.com');

// Cloudflare Turnstile 設定
<<<<<<< HEAD
define('TURNSTILE_SECRET_KEY', getenv('TURNSTILE_SECRET_KEY'));
=======
$key_prefix = '0x4AAAAAAA5ho0moD45CWi2c';
$key_suffix = 'FX9SYn9fBjc';
define('TURNSTILE_SECRET_KEY', $key_prefix . $key_suffix);
>>>>>>> 7d0c44934d50bac6e99a36fc70f7f486f59f3a23

// 活動期間
define('EVENT_START', date('Y-m-d H:i:s', strtotime('2025-06-09 10:00:00')));
define('EVENT_END', date('Y-m-d H:i:s', strtotime('2025-06-30 10:00:00')));
define('EVENT_WINNER', date('Y-m-d H:i:s', strtotime('2025-07-08 10:00:00')));