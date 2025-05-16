<?php
// 設置允許的請求來源
header("Access-Control-Allow-Origin: https://lab-event.udn.com");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// 開啟會話
session_start();

// 檢查是否為 AJAX 請求
$isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
          strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';

// 如果不是 AJAX 請求則拒絕
if (!$isAjax) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request']);
    exit();
}

// 檢查請求參數
$action = isset($_GET['action']) ? preg_replace('/[^a-z_]/', '', $_GET['action']) : 'default';

// 生成一個強隨機令牌
function generateSecureToken($length = 32) {
    if (function_exists('random_bytes')) {
        return bin2hex(random_bytes($length));
    }
    if (function_exists('openssl_random_pseudo_bytes')) {
        return bin2hex(openssl_random_pseudo_bytes($length));
    }
    
    // 備用方案
    $chars = '0123456789abcdef';
    $token = '';
    for ($i = 0; $i < $length * 2; $i++) {
        $token .= $chars[rand(0, strlen($chars) - 1)];
    }
    return $token;
}

// 生成CSRF令牌
$token = generateSecureToken();

// 把令牌與會話綁定，根據操作類型區分
$_SESSION['fate2025_csrf_' . $action] = $token;
$_SESSION['fate2025_csrf_' . $action . '_time'] = time();

// 返回令牌給客戶端
echo json_encode([
    'status' => 'success',
    'token' => $token,
    'action' => $action
]);
?>