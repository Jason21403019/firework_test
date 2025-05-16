<?php
// csrf_token.php - 生成 CSRF 令牌

// 設置允許的請求來源
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://lab-event.udn.com'); 
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// 啟用 session
session_start();

// 處理 OPTIONS 請求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 檢查是否為 AJAX 請求
$isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
          strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';

// 如果不是 AJAX 請求則拒絕
if (!$isAjax) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request']);
    exit();
}

// 獲取操作類型參數
$action = isset($_GET['action']) ? preg_replace('/[^a-z_]/', '', $_GET['action']) : 'default';

// 生成安全的隨機令牌
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

// 生成 CSRF 令牌
$token = generateSecureToken();

// 把令牌與會話綁定，根據操作類型區分
$_SESSION['fate2025_csrf_' . $action] = $token;

// 記錄生成的令牌
error_log("為 {$action} 操作生成了 CSRF 令牌: {$token}");

// 返回令牌給客戶端
echo json_encode([
    'status' => 'success',
    'token' => $token,
    'action' => $action
]);
?>