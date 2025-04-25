<?php
require_once('./basic/base.php');
require_once('./basic/connetDB.php');

// 設置錯誤報告，方便找出問題
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 記錄請求
error_log("收到 checkPlayStatus 請求");

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

error_log("接收到的數據: " . $json);

$udnmember = isset($data['udnmember']) ? $data['udnmember'] : null;
$um2 = isset($data['um2']) ? $data['um2'] : null;

// 驗證必要參數
if (empty($udnmember)) {
    echo json_encode(['status' => 'error', 'message' => '缺少必要參數 udnmember']);
    exit;
}

try {
    // 簡化的處理 - 直接使用 udnmember 而不調用複雜的函數
    $email = $udnmember . '@example.com'; // 簡單的預設值
    
    // 取得當天日期
    $today = date('Y-m-d');
    
    error_log("檢查用戶: $udnmember, email: $email, 日期: $today");
    
// 檢查用戶今天是否已經占卜過 - 只使用存在的欄位
$sql = "SELECT * FROM test_fate_event WHERE email = ? AND DATE(updated_at) = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$email, $today]);
    
    if ($stmt->rowCount() > 0) {
        // 用戶今天已經占卜過
        error_log("用戶今天已占卜過");
        echo json_encode(['status' => 'success', 'played_today' => true]);
    } else {
        // 用戶今天還沒有占卜過
        error_log("用戶今天尚未占卜");
        echo json_encode(['status' => 'success', 'played_today' => false]);
    }
    
} catch(PDOException $e) {
    error_log("資料庫錯誤: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => '資料庫錯誤: ' . $e->getMessage()]);
} catch(Exception $e) {
    error_log("系統錯誤: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => '系統錯誤: ' . $e->getMessage()]);
}
?>