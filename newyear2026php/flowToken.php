<?php
require_once('./basic/base.php');

session_start();

setCorsHeaders('POST, OPTIONS', 'Content-Type, X-Requested-With');

$data = handleApiRequest(['POST'], true);
$action = isset($data['action']) ? $data['action'] : null;

// 生成流程 token（存在 Session 中）
if ($action === 'generate') {
    // 生成隨機 token（32 字元）
    $token = bin2hex(random_bytes(16));
    $expiresAt = time() + 600; // 10 分鐘有效
    
    // 儲存到 Session
    $_SESSION['fate2025_flow_token'] = $token;
    $_SESSION['fate2025_flow_token_expires'] = $expiresAt;
    
    error_log("[FLOW] 生成 token: {$token}，過期時間: " . date('Y-m-d H:i:s', $expiresAt));
    
    JSONReturn([
        'status' => 'success',
        'token' => $token,
        'expires_in' => 600
    ], 'success');
}

// 檢查並消費流程 token（從 Session 中檢查）
if ($action === 'consume') {
    // 檢查 Session 中是否有 token
    if (!isset($_SESSION['fate2025_flow_token']) || !isset($_SESSION['fate2025_flow_token_expires'])) {
        error_log("[FLOW] 消費失敗：Session 中無 token");
        JSONReturn([
            'status' => 'error',
            'valid' => false,
            'message' => '流程驗證碼不存在'
        ], 'error');
    }
    
    $storedToken = $_SESSION['fate2025_flow_token'];
    $expiresAt = $_SESSION['fate2025_flow_token_expires'];
    
    // 檢查是否過期
    if (time() > $expiresAt) {
        error_log("[FLOW] 消費失敗：token 已過期");
        unset($_SESSION['fate2025_flow_token']);
        unset($_SESSION['fate2025_flow_token_expires']);
        JSONReturn([
            'status' => 'error',
            'valid' => false,
            'message' => '流程驗證碼已過期'
        ], 'error');
    }
    
    // Token 有效，消費掉（從 Session 中刪除）
    error_log("[FLOW] 消費成功：token {$storedToken}");
    unset($_SESSION['fate2025_flow_token']);
    unset($_SESSION['fate2025_flow_token_expires']);
    
    JSONReturn([
        'status' => 'success',
        'valid' => true,
        'message' => '流程驗證成功'
    ], 'success');
}

JSONReturn('無效的操作', 'error');

