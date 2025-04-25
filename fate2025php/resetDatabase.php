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

try {
    // 嘗試使用 TRUNCATE 清空表格並重置 ID
    $stmt = $pdo->prepare("TRUNCATE TABLE test_fate_event");
    $stmt->execute();
    
    // 如果 TRUNCATE 可能因權限問題失敗，可以使用下面的替代方法
    // $stmt = $pdo->prepare("DELETE FROM test_fate_event");
    // $stmt->execute();
    // $resetStmt = $pdo->prepare("ALTER TABLE test_fate_event AUTO_INCREMENT = 1");
    // $resetStmt->execute();
    
    echo json_encode([
        'status' => 'success', 
        'message' => '資料庫已重置，所有記錄已刪除，ID 已重新計數。',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} catch(PDOException $e) {
    error_log("重置資料庫錯誤: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => '資料庫重置失敗: ' . $e->getMessage()]);
} catch(Exception $e) {
    error_log("一般錯誤: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => '系統錯誤: ' . $e->getMessage()]);
}
?>