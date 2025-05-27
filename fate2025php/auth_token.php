<?php
// 設置允許的請求來源
require_once('./basic/base.php');
setCorsHeaders('GET, OPTIONS', 'Content-Type');

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

// 生成流程令牌
$token = generateSecureToken();

// 保存令牌到會話中
$_SESSION['fate2025_flow_token'] = $token;
$_SESSION['auth_token'] = $token; // 兼容原有代碼

// 設置過期時間（10分鐘）
$expiryTime = time() + 600;
$_SESSION['fate2025_flow_token_expires'] = $expiryTime;

// 記錄生成的令牌
error_log("生成了流程令牌: {$token}, 過期時間: " . date('Y-m-d H:i:s', $expiryTime));

// 返回令牌給客戶端
echo json_encode([
    'status' => 'success',
    'token' => $token,
    'expires' => $expiryTime
]);
?>