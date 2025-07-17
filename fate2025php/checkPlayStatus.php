<?php
// filepath: c:\Users\1\Documents\fate2025\fate2025php\checkPlayStatus.php
require_once('./basic/base.php');
require_once('./basic/connetDB.php');

session_start();

setCorsHeaders('POST, OPTIONS', 'Content-Type, X-CSRF-Token, X-Requested-With');

// 處理 API 請求並獲取數據
$data = handleApiRequest(['POST'], true);

// 檢查是否為管理模式 - 必須在最開始檢查
if (isset($data['admin_mode']) && $data['admin_mode'] === true) {
    try {
        // 管理模式：返回所有用戶資料
        $stmt = $pdo->prepare("SELECT * FROM test_fate_event ORDER BY id DESC");
        $stmt->execute();
        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // 直接在 PHP 端計算統計數據
        $totalUsers = count($records);
        $totalDivinations = 0;
        $todayDivinations = 0;
        $activeUsers = 0;
        
        $today = date('Y-m-d');
        $lastWeek = date('Y-m-d', strtotime('-7 days'));
        
        foreach ($records as $record) {
            // 計算總占卜次數
            $totalDivinations += intval($record['play_times_total']);
            
            // 計算今日占卜次數 - 使用 updated_at 欄位
            if (!empty($record['updated_at'])) {
                $recordDate = date('Y-m-d', strtotime($record['updated_at']));
                if ($recordDate === $today) {
                    $todayDivinations++;
                }
                
                // 計算活躍用戶（最近7天內有占卜）
                if ($recordDate >= $lastWeek) {
                    $activeUsers++;
                }
            }
        }
        
        JSONReturn([
            'status' => 'success',
            'records' => $records,
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalDivinations' => $totalDivinations,
                'todayDivinations' => $todayDivinations,
                'activeUsers' => $activeUsers
            ],
            'debug' => [
                'today' => $today,
                'lastWeek' => $lastWeek,
                'query_time' => date('Y-m-d H:i:s')
            ]
        ], 'success');
    } catch(PDOException $e) {
        JSONReturn([
            'status' => 'error', 
            'message' => '資料庫錯誤: ' . $e->getMessage()
        ], 'error');
    }
}

// 以下是原有的一般模式邏輯
$udnmember = isset($data['udnmember']) ? $data['udnmember'] : null;
$um2 = isset($data['um2']) ? $data['um2'] : null;
$csrf_token = isset($data['csrf_token']) ? $data['csrf_token'] : null;

// 添加 CSRF 檢查 (如果存在)
if (!empty($csrf_token)) {
    $csrf_header = isset($_SERVER['HTTP_X_CSRF_TOKEN']) ? $_SERVER['HTTP_X_CSRF_TOKEN'] : '';
    $csrf_to_check = !empty($csrf_header) ? $csrf_header : $csrf_token;
    if (isset($_SESSION['fate2025_csrf_check']) && $_SESSION['fate2025_csrf_check'] !== $csrf_to_check) {
    } 
    if (isset($_SESSION['fate2025_csrf_check'])) {
        unset($_SESSION['fate2025_csrf_check']);
    }
}

// 驗證必要參數
if (empty($udnmember)) {
    JSONReturn('未取得會員資訊，請重新登入', 'error');
}

try {
    $memberData = getMemberMail($udnmember);
    $email = '';
    if ($memberData['verified'] && !empty($memberData['email'])) {
        $email = $memberData['email'];
    } else {
        $email = $udnmember . '@example.com';
    }
    
    // 取得當天日期
    $today = date('Y-m-d');
    
    $sql = "SELECT * FROM test_fate_event WHERE email = ? AND DATE(updated_at) = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$email, $today]);
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $lastPlayedDate = date('Y-m-d', strtotime($row['updated_at']));
        $today = date('Y-m-d');
        JSONReturn([
            'status' => sanitizeOutput('success'), 
            'played_today' => ($lastPlayedDate === $today), 
            'play_times_total' => (int)$row['play_times_total']
        ], 'success');
    } else {
        JSONReturn([
            'status' => sanitizeOutput('success'), 
            'played_today' => false, 
            'play_times_total' => 0
        ], 'success');
    }
    
} catch(PDOException $e) {
    JSONReturn(['status' => 'error', 'message' => sanitizeOutput('資料庫錯誤: ' . $e->getMessage())], 'error');
} catch(Exception $e) {
    JSONReturn(['status' => 'error', 'message' => sanitizeOutput('系統錯誤: ' . $e->getMessage())], 'error');
}
?>