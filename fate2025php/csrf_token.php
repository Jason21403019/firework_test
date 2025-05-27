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

// 處理 CSRF 令牌生成請求
$action = isset($_GET['action']) ? $_GET['action'] : 'default';

try {
    // 生成新的 CSRF 令牌
    $token = CSRFHandler::generate($action);
    
    // 將令牌存入 cookie，使用 HttpOnly 標記
    $cookie_options = [
        'expires' => time() + 300, // 5分鐘
        'path' => '/',
        'domain' => '', // 自動使用當前域名
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict'
    ];
    
    // 設置包含令牌的 HttpOnly cookie
    setcookie("fate2025_csrf_{$action}", $token, $cookie_options);
    
    // 回傳成功訊息和令牌（僅供前端檢查用，實際驗證使用 HttpOnly cookie）
    echo json_encode([
        'status' => 'success',
        'token' => $token,
        'expires_in' => 300, // 5分鐘
        'message' => 'CSRF 令牌生成成功'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => '生成 CSRF 令牌時發生錯誤: ' . $e->getMessage()
    ]);
}
?>