<?php
require_once('./basic/base.php');
require_once('./basic/connetDB.php');

session_start();

setCorsHeaders('POST, OPTIONS', 'Content-Type, X-CSRF-Token, X-Requested-With');

// 處理 API 請求並獲取數據
$data = handleApiRequest(['POST'], true);

$udnmember = isset($data['udnmember']) ? $data['udnmember'] : null;
$um2 = isset($data['um2']) ? $data['um2'] : null;
$csrf_token = isset($data['csrf_token']) ? $data['csrf_token'] : null;

// 添加 CSRF 檢查 (如果存在)
if (!empty($csrf_token)) {
    $csrf_header = isset($_SERVER['HTTP_X_CSRF_TOKEN']) ? $_SERVER['HTTP_X_CSRF_TOKEN'] : '';
    $csrf_to_check = !empty($csrf_header) ? $csrf_header : $csrf_token;
    
    // 檢查 CSRF 令牌 - 僅記錄不拒絕請求
    if (isset($_SESSION['fate2025_csrf_check']) && $_SESSION['fate2025_csrf_check'] !== $csrf_to_check) {
        error_log("CSRF 令牌不匹配: 預期 " . $_SESSION['fate2025_csrf_check'] . ", 收到 " . $csrf_to_check);
    } else {
        error_log("CSRF 令牌驗證成功或不需要");
    }
    // 使用後清除令牌
    if (isset($_SESSION['fate2025_csrf_check'])) {
        unset($_SESSION['fate2025_csrf_check']);
    }
}

// 驗證必要參數
if (empty($udnmember)) {
    echo json_encode(['status' => 'error', 'message' => '缺少必要參數 udnmember']);
    exit;
}

try {
    // 使用 getMemberMail 函數獲取真實 email
    $memberData = getMemberMail($udnmember);
    $email = '';
    
    // 如果成功獲取到驗證的 email，使用它
    if ($memberData['verified'] && !empty($memberData['email'])) {
        $email = $memberData['email'];
        error_log("使用 API 取得的真實 email: $email");
    } else {
        // 如果無法獲取真實 email，使用默認值
        $email = $udnmember . '@example.com';
        error_log("使用預設 email: $email");
    }
    
    // 取得當天日期
    $today = date('Y-m-d');
    
    error_log("檢查用戶: $udnmember, email: $email, 日期: $today");
    
    // 檢查用戶今天是否已經占卜過 - 使用更靈活的查詢方式
    $sql = "SELECT * FROM test_fate_event WHERE email = ? AND DATE(updated_at) = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$email, $today]);
    
    if ($stmt->rowCount() > 0) {
        // 用戶存在，返回累計次數和是否今天已占卜
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $lastPlayedDate = date('Y-m-d', strtotime($row['updated_at']));
        $today = date('Y-m-d');
        
        echo json_encode([
            'status' => 'success', 
            'played_today' => ($lastPlayedDate === $today), 
            'play_times_total' => $row['play_times_total']
        ]);
    } else {
        // 用戶不存在，返回未占卜過和次數為0
        echo json_encode(['status' => 'success', 'played_today' => false, 'play_times_total' => 0]);
    }
    
} catch(PDOException $e) {
    error_log("資料庫錯誤: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => '資料庫錯誤: ' . $e->getMessage()]);
} catch(Exception $e) {
    error_log("系統錯誤: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => '系統錯誤: ' . $e->getMessage()]);
}


?>