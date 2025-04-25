<?php
session_start();

header('Access-Control-Allow-Origin: https://lab-event.udn.com'); // 確保與其他檔案一致
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// 處理 OPTIONS 請求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 生成新的隨機 token
$token = bin2hex(random_bytes(32)); // 生成一個 64 字符的隨機字符串
$_SESSION['auth_token'] = $token;

echo json_encode([
    'status' => 'success',
    'token' => $token
]);
?>