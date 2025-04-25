<?php
require_once('./basic/base.php');
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 處理 OPTIONS 請求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 確保是 POST 請求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => false, 'message' => '請使用 POST 請求']);
    exit;
}

// 獲取 POST 數據
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// 檢查是否有 token
if (!isset($data['token']) || empty($data['token'])) {
    echo json_encode(['status' => false, 'message' => '缺少 Turnstile token']);
    exit;
}

$token = $data['token'];

// 使用 base.php 中的 checkTurnstileAuth 函數
$isVerified = checkTurnstileAuth($token);

if ($isVerified) {
    echo json_encode(['status' => true, 'message' => 'Turnstile 驗證成功']);
} else {
    echo json_encode(['status' => false, 'message' => 'Turnstile 驗證失敗']);
}