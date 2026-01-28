<?php
require_once('./basic/base.php');
require_once('./basic/connetDB.php');
require_once('./basic/csrf_handler.php');

session_start();

date_default_timezone_set('Asia/Taipei');

setCorsHeaders('POST, OPTIONS', 'Content-Type, X-CSRF-Token, X-Requested-With');

$data = handleApiRequest(['POST'], true);

// 從請求中獲取關鍵參數
$udnmember = isset($data['udnmember']) ? $data['udnmember'] : null;
$um2 = isset($data['um2']) ? $data['um2'] : null;
$turnstileToken = isset($data['turnstile_token']) ? $data['turnstile_token'] : null;

// 驗證 CSRF Token（可選，但強烈建議）
$csrfToken = null;
if (isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
    $csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'];
}

if (!empty($csrfToken)) {
    // 檢查 Session 是否活躍
    $sessionActive = (session_status() === PHP_SESSION_ACTIVE);
    $currentSessionId = session_id();
    
    // 記錄基本資訊
    error_log("[CSRF] 開始驗證 - Session ID: {$currentSessionId}");
    error_log("[CSRF] Session 活躍: " . ($sessionActive ? "是" : "否"));
    error_log("[CSRF] 收到的 Token（前15碼）: " . substr($csrfToken, 0, 15) . "...");
    
    if (!$sessionActive) {
        error_log("[E005] Session 不活躍 - 可能是第一次請求或 Cookie 未正確傳遞");
        // 第一次請求時 Session 可能還沒準備好，不阻擋流程
    } else {
        // 檢查 Session 中是否有對應的安全驗證碼
        $sessionKey = "fate2025_csrf_divination";
        $sessionKeyExpiry = "fate2025_csrf_divination_expiry";
        
        if (!isset($_SESSION[$sessionKey])) {
            error_log("[E004] Session 不一致 - Session ID: {$currentSessionId}");
            error_log("[E004] Session Keys: " . json_encode(array_keys($_SESSION)));
            JSONReturn('您的登入狀態有誤，請重新登入（E004）', 'error');
        }
        
        $storedToken = $_SESSION[$sessionKey];
        $tokenExpiry = $_SESSION[$sessionKeyExpiry] ?? null;
        
        error_log("[CSRF] Session 中的 Token（前15碼）: " . substr($storedToken, 0, 15) . "...");
        error_log("[CSRF] Token 過期時間: " . ($tokenExpiry ? date('Y-m-d H:i:s', $tokenExpiry) : '無'));
        error_log("[CSRF] 目前時間: " . date('Y-m-d H:i:s'));
        error_log("[CSRF] Token 是否匹配: " . ($storedToken === $csrfToken ? '是' : '否'));
        
        $csrfValid = CSRFHandler::verify($csrfToken, 'divination');
        if (!$csrfValid) {
            // CSRFHandler 已經記錄詳細錯誤 (E001, E002, E003)
            error_log("[E003] CSRF 驗證失敗 - Session ID: {$currentSessionId}");
            JSONReturn('系統驗證失敗，請重新操作（E003）', 'error');
        }
        error_log("[OK] CSRF 驗證通過 - Session ID: {$currentSessionId}");
    }
} else {
    error_log("[INFO] 未提供安全驗證碼（非必要）");
}

// 驗證 Turnstile（機器人驗證）
if (!empty($turnstileToken)) {
    $verificationResult = verifyTurnstileToken($turnstileToken);
    
    if (!is_array($verificationResult) || !isset($verificationResult['success']) || !$verificationResult['success']) {
        $errorMessage = '安全驗證失敗，請重新操作（E201）';
        $errorCode = 'E201';
        
        if (is_array($verificationResult) && isset($verificationResult['error_codes'])) {
            $errorCodes = implode(', ', $verificationResult['error_codes']);
            
            if (in_array('timeout-or-duplicate', $verificationResult['error_codes'])) {
                $errorMessage = '驗證已過期，請重新驗證（E202）';
                $errorCode = 'E202';
            } else if (in_array('invalid-input-response', $verificationResult['error_codes'])) {
                $errorMessage = '驗證資料有誤，請重新操作（E201）';
                $errorCode = 'E201';
            }
        }
        
        if (is_array($verificationResult) && isset($verificationResult['is_bot']) && $verificationResult['is_bot']) {
            $errorMessage = '系統檢測到異常操作，請使用正常方式操作（E203）';
            $errorCode = 'E203';
        }

        error_log("[{$errorCode}] Turnstile 驗證失敗: " . json_encode($verificationResult));
        JSONReturn($errorMessage, 'error');
    }
}

// 檢查是否取得必要的會員資訊
if (empty($udnmember) || empty($um2)) {
    error_log("[E101] 未提供會員資訊");
    JSONReturn('請先登入會員（E101）', 'error');
}

try {
    $username = $udnmember;
    $email = '';
    $isVerified = false;
    
    if (!empty($udnmember)) {
        $memberData = getMemberMail($udnmember);
        if (is_array($memberData)) {
            $isVerified = $memberData['verified'] ?? false;
            
            if ($isVerified && !empty($memberData['email'])) {
                $email = $memberData['email'];
            } else {
                if (!empty($um2)) {
                    try {
                        $userLogin = getUdnMember($udnmember, $um2);
                        if (isset($userLogin['response']['status']) && 
                            $userLogin['response']['status'] === 'success' &&
                            isset($userLogin['response']['email'])) {
                            $email = filter_var($userLogin['response']['email'], FILTER_SANITIZE_EMAIL);
                            $isVerified = true;
                        }
                    } catch (Exception $e) {
                        $isVerified = false;
                    }
                }
            }
        }
    }
    
    // 如果無法取得 email，使用預設格式
    if (empty($email)) {
        $email = $udnmember . '@example.com';
        error_log("Warning: Could not fetch email for user {$udnmember}, using default: {$email}");
    }
    
    $ip = getIP();
    $ipCheckStmt = $pdo->prepare("SELECT MAX(updated_at) AS last_attempt FROM act2026_bd_newyear_2026 WHERE ip = :ip");
    $ipCheckStmt->bindParam(':ip', $ip);
    $ipCheckStmt->execute();
    $ipResult = $ipCheckStmt->fetch(PDO::FETCH_ASSOC);
    $lastAttempt = $ipResult ? $ipResult['last_attempt'] : null;
    
    if ($lastAttempt) {
        $timeSinceLastAttempt = time() - strtotime($lastAttempt);
        if ($timeSinceLastAttempt < 60) {
            error_log("[LIMIT] 操作過於頻繁 - IP: {$ip}");
            JSONReturn('操作過於頻繁，請稍後再試', 'error', ['wait_time' => 60 - $timeSinceLastAttempt]);
        }
    }
    
    
    $today = date('Y-m-d');
    $stmt = $pdo->prepare("SELECT * FROM act2026_bd_newyear_2026 WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $lastUpdatedTimestamp = strtotime($row['updated_at']);
        $lastUpdatedDate = date('Y-m-d', $lastUpdatedTimestamp);
        if ($lastUpdatedDate === $today) {
           error_log("[E103] 用戶今天已占卜 - Email: {$email}, 累計次數: " . $row['play_times_total']);
           JSONReturn([
                'message' => sanitizeOutput('今天已經完成占卜了，明天再來吧！（E103）'),
                'already_played' => true,
                'last_play_date' => sanitizeOutput($lastUpdatedDate),
                'today' => sanitizeOutput($today),
                'db_info' => [
                    'email' => sanitizeOutput($row['email']),
                    'username' => sanitizeOutput($row['username']),
                    'ip' => sanitizeOutput($row['ip']),
                    'created_at' => sanitizeOutput($row['created_at']),
                    'updated_at' => sanitizeOutput($row['updated_at']),
                    'play_times_total' => (int)$row['play_times_total']
                ]
            ], 'error');
        }
        
        $play_times_total = intval($row['play_times_total']) + 1;
        $updateStmt = $pdo->prepare("UPDATE act2026_bd_newyear_2026 SET 
            username = :username,
            play_times_total = :play_times_total,
            updated_at = NOW(),
            ip = :ip
            WHERE email = :email");
        
        $updateStmt->bindParam(':username', $username);
        $updateStmt->bindParam(':play_times_total', $play_times_total);
        $updateStmt->bindParam(':ip', $ip);
        $updateStmt->bindParam(':email', $email);
        $updateStmt->execute();
        $fetchStmt = $pdo->prepare("SELECT * FROM act2026_bd_newyear_2026 WHERE email = :email");
        $fetchStmt->bindParam(':email', $email);
        $fetchStmt->execute();
        $userData = $fetchStmt->fetch(PDO::FETCH_ASSOC);
        JSONReturn([
            'message' => sanitizeOutput('占卜成功！'), 
            'already_played' => false,
            'db_info' => [
                'email' => sanitizeOutput($userData['email']),
                'username' => sanitizeOutput($userData['username']),
                'ip' => sanitizeOutput($userData['ip']),
                'created_at' => sanitizeOutput($userData['created_at']),
                'updated_at' => sanitizeOutput($userData['updated_at']),
                'play_times_total' => (int)$userData['play_times_total']
            ]
        ], 'success');
    } else {
        // 創建新用戶
        $stmt = $pdo->prepare("INSERT INTO act2026_bd_newyear_2026 
            (email, username, ip, play_times_total, created_at, updated_at) 
            VALUES (:email, :username, :ip, 1, NOW(), NOW())");
        
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':ip', $ip);
        $stmt->execute();
        
        // 獲取剛創建的用戶數據
        $newId = $pdo->lastInsertId();
        $fetchStmt = $pdo->prepare("SELECT * FROM act2026_bd_newyear_2026 WHERE id = :id");
        $fetchStmt->bindParam(':id', $newId);
        $fetchStmt->execute();
        $userData = $fetchStmt->fetch(PDO::FETCH_ASSOC);
         JSONReturn([
            'message' => sanitizeOutput('首次占卜成功！'), 
            'already_played' => false,
            'db_info' => [
                'email' => sanitizeOutput($userData['email']),
                'username' => sanitizeOutput($userData['username']),
                'ip' => sanitizeOutput($userData['ip']),
                'created_at' => sanitizeOutput($userData['created_at']),
                'updated_at' => sanitizeOutput($userData['updated_at']),
                'play_times_total' => (int)$userData['play_times_total']
            ]
        ], 'success');
    }
} catch(PDOException $e) {
    error_log("[E302] 資料庫錯誤: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    JSONReturn('系統忙碌中，請稍後再試（E302）', 'error');
} catch(Exception $e) {
    error_log("[E901] 系統錯誤: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    JSONReturn('系統發生錯誤，請稍後再試（E901）', 'error');
}