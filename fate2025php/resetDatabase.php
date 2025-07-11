<?php
require_once('./basic/base.php');
require_once('./basic/connetDB.php');

session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 安全密鑰 - 確保只有正確的請求才能重置資料庫
$securityKey = "reset2025fate"; // 請在實際使用中更改這個密鑰

// 處理 OPTIONS 請求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 確保是 POST 請求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => '請使用 POST 請求']);
    exit;
}

// 獲取 POST 數據
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// 驗證密鑰
$submittedKey = isset($data['security_key']) ? $data['security_key'] : '';
if ($submittedKey !== $securityKey) {
    echo json_encode(['status' => 'error', 'message' => '安全密鑰不正確']);
    exit;
}

// 獲取要刪除的 email（使用 filter_var 過濾）
$targetEmail = isset($data['email']) ? filter_var($data['email'], FILTER_SANITIZE_EMAIL) : '';

// 如果沒有提供 email，使用預設值
if (empty($targetEmail)) {
    $targetEmail = 'jason86100110@gmail.com';
}

// 驗證 email 格式
if (!filter_var($targetEmail, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Email 格式不正確']);
    exit;
}

try {
    // 先檢查該 email 是否存在
    $checkStmt = $pdo->prepare("SELECT id, username, email, created_at, updated_at FROM test_fate_event WHERE email = :email");
    $checkStmt->bindParam(':email', $targetEmail);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        echo json_encode([
            'status' => 'warning', 
            'message' => "找不到 email: {$targetEmail} 的記錄",
            'email' => $targetEmail
        ]);
        exit;
    }
    
    // 獲取要刪除的記錄資訊
    $recordInfo = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    // 刪除特定 email 的記錄
    $deleteStmt = $pdo->prepare("DELETE FROM test_fate_event WHERE email = :email");
    $deleteStmt->bindParam(':email', $targetEmail);
    $deleteStmt->execute();
    
    $deletedRows = $deleteStmt->rowCount();
    
    echo json_encode([
        'status' => 'success', 
        'message' => "已成功刪除 {$deletedRows} 筆記錄",
        'deleted_email' => $targetEmail,
        'deleted_record' => $recordInfo,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => '刪除記錄失敗: ' . $e->getMessage()]);
} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => '系統錯誤: ' . $e->getMessage()]);
}
?>