<?php
// 設置允許的請求來源
require_once('./basic/base.php');
setCorsHeaders('GET, OPTIONS', 'Content-Type');

session_start();

setCorsHeaders('POST, OPTIONS', 'Content-Type, X-CSRF-Token, X-Requested-With');

$isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
          strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
if (!$isAjax) {
    JSONReturn('請使用 AJAX 請求', 'error');
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
    
    $chars = 'Jason861001fate2025';
    $token = '';
    for ($i = 0; $i < $length * 2; $i++) {
        $token .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $token;
}

// 生成流程令牌
$token = generateSecureToken();

// 保存令牌到會話中
$_SESSION['fate2025_flow_token'] = $token;
$_SESSION['auth_token'] = $token; 

// 設置過期時間（10分鐘）
$expiryTime = time() + 600;
$_SESSION['fate2025_flow_token_expires'] = $expiryTime;

JSONReturn([
    'status' => sanitizeOutput('success'),
    'token' => sanitizeOutput($token),
    'expires_in' => 600, // 10 minutes
    'message' => sanitizeOutput('令牌生成成功')
], 'success');
?>