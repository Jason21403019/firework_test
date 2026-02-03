<?php
// filepath: c:\Users\1\Documents\fate2025\fate2025php\checkPlayStatus.php
require_once('./basic/base.php');
require_once('./basic/connetDB.php');

setCorsHeaders('POST, OPTIONS', 'Content-Type, X-CSRF-Token, X-Requested-With');

// 處理 API 請求並獲取數據
$data = handleApiRequest(['POST'], true);

// 檢查是否為管理模式 - 必須在最開始檢查
if (isset($data['admin_mode']) && $data['admin_mode'] === true) {
    try {
        // 管理模式：返回所有用戶資料
        $stmt = $pdo->prepare("SELECT * FROM act2026_bd_newyear2026 ORDER BY id DESC");
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

// 驗證必要參數
if (empty($udnmember) || empty($um2)) {
    JSONReturn('未取得會員資訊，請重新登入', 'error');
}

try {
    // 呼叫 API 驗證會員資料
    $memberData = getMemberMail($udnmember, $um2);
    
    // 檢查 API 是否驗證成功
    if (!is_array($memberData) || !isset($memberData['verified']) || !$memberData['verified']) {
        $errorCode = $memberData['error'] ?? 'UNKNOWN';
        error_log("[checkPlayStatus] 會員驗證失敗 - Code: {$errorCode}, Member: {$udnmember}");
        JSONReturn('會員驗證失敗，請重新登入', 'error');
    }
    
    // 檢查是否有 email
    if (empty($memberData['email'])) {
        error_log("[checkPlayStatus] 無法取得會員 email - Member: {$udnmember}");
        JSONReturn('無法取得會員信箱，請聯繫客服', 'error');
    }
    
    $email = $memberData['email'];
    
    // 取得當天日期
    $today = date('Y-m-d');
    
    $sql = "SELECT * FROM act2026_bd_newyear2026 WHERE email = ? AND DATE(updated_at) = ?";
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