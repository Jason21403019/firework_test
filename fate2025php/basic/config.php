<?php
date_default_timezone_set("Asia/Taipei");
header('Content-Type: application/json charset=utf-8');

// Cloudflare Turnstile 設定
define('TURNSTILE_SECRET_KEY', '0x4AAAAAAA5ho0moD45CWi2cFX9SYn9fBjc'); 

// 活動期間
define('EVENT_START', date('Y-m-d H:i:s', strtotime('2025-06-09 10:00:00')));
define('EVENT_END', date('Y-m-d H:i:s', strtotime('2025-06-30 10:00:00')));
define('EVENT_WINNER', date('Y-m-d H:i:s', strtotime('2025-07-08 10:00:00')));
