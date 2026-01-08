<?php
require_once('./basic/base.php');
require_once('./basic/csrf_handler.php');
require_once('./basic/session_config.php');

// 動態配置 Session Cookie（自動適應 HTTP/HTTPS 環境）
configureSessionCookie();
session_start();

setCorsHeaders('POST, OPTIONS', 'Content-Type, X-Requested-With');

// 處理 API 請求
$data = handleApiRequest(['POST'], true);

// 生成安全驗證碼
$action = isset($data['action']) ? $data['action'] : 'divination';
$csrfToken = CSRFHandler::generate($action);

// 記錄 Session 資訊
$sessionId = session_id();
error_log("[CSRF-GEN] Token 已生成 - Session ID: {$sessionId}");
error_log("[CSRF-GEN] Token（前15碼）: " . substr($csrfToken, 0, 15) . "...");
error_log("[CSRF-GEN] 過期時間: " . date('Y-m-d H:i:s', time() + 180));

JSONReturn([
    'status' => 'success',
    'csrf_token' => $csrfToken,
    'action' => $action,
    'expires_in' => 180, // 3 分鐘
    'message' => '安全驗證已準備',
    'session_id' => session_id(),
    'debug' => [
        'session_active' => (session_status() === PHP_SESSION_ACTIVE),
        'session_id' => session_id()
    ]
], 'success');
?>

