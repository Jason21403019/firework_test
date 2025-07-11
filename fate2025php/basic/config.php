<?php
date_default_timezone_set("Asia/Taipei");
header('Content-Type: application/json charset=utf-8');

// CORS 允許來源設定
define('CORS_ALLOWED_ORIGIN', 'https://lab-event.udn.com');
// define('CORS_ALLOWED_ORIGIN', 'https://event.udn.com');

// Cloudflare Turnstile 設定
$key_prefix = '0x4AAAAAAA5ho0moD45CWi2c';
$key_suffix = 'FX9SYn9fBjc';
define('TURNSTILE_SECRET_KEY', $key_prefix . $key_suffix);

// 活動期間
define('EVENT_START', date('Y-m-d H:i:s', strtotime('2025-06-09 10:00:00')));
define('EVENT_END', date('Y-m-d H:i:s', strtotime('2025-06-30 10:00:00')));
define('EVENT_WINNER', date('Y-m-d H:i:s', strtotime('2025-07-08 10:00:00')));