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
$session_token = isset($data['flow_token']) ? $data['flow_token'] : null;
$csrf_token = null;
$action = 'save'; 

// 1. 從 header 中獲取
$csrf_header = isset($_SERVER['HTTP_X_CSRF_TOKEN']) ? $_SERVER['HTTP_X_CSRF_TOKEN'] : null;
if ($csrf_header) {
    $csrf_token = $csrf_header;
}

// 2. 從請求數據中獲取
if (!$csrf_token && isset($data['csrf_token'])) {
    $csrf_token = $data['csrf_token'];
}

// 3. 從 cookie 中獲取(此為備用方法，不推薦使用)
if (!$csrf_token && isset($_COOKIE["fate2025_csrf_{$action}"])) {
    $csrf_token = $_COOKIE["fate2025_csrf_{$action}"];
}

if ($csrf_token) {
    if (!CSRFHandler::verify($csrf_token, $action)) {
       JSONReturn('安全驗證失敗，請重新嘗試', 'error');
    }
} 

// 驗證 session token
if (empty($session_token)) {
    echo filter_var(json_encode(['status' => 'error', 'message' => sanitizeOutput('安全驗證失敗，請重新開始占卜流程 (缺少會話令牌)')]));
    exit;
}

if (!isset($_SESSION['fate2025_flow_token'])) {
    if (!isset($_SESSION['auth_token'])) {
        JSONReturn('安全驗證失敗，請重新開始占卜流程 (缺少會話令牌)', 'error');
    } else {
        if ($_SESSION['auth_token'] !== $session_token) {
             JSONReturn('安全驗證失敗，請重新開始占卜流程 (會話令牌無效)', 'error');
        }
    }
} else {
    if ($_SESSION['fate2025_flow_token'] !== $session_token) {
        JSONReturn('安全驗證失敗，請重新開始占卜流程 (令牌不匹配)', 'error');
    }
}

// 驗證 Turnstile token 
if (!empty($turnstileToken)) {
    $verificationResult = verifyTurnstileToken($turnstileToken);
    
    if (!is_array($verificationResult) || !isset($verificationResult['success']) || !$verificationResult['success']) {
        $errorMessage = '機器人驗證失敗';
        
        if (is_array($verificationResult) && isset($verificationResult['error_codes'])) {
            $errorCodes = implode(', ', $verificationResult['error_codes']);
            $errorMessage .= "：{$errorCodes}";
            
            if (in_array('timeout-or-duplicate', $verificationResult['error_codes'])) {
                $errorMessage = '請勿重複提交或驗證已過期，請刷新頁面重試';
            } else if (in_array('invalid-input-response', $verificationResult['error_codes'])) {
                $errorMessage = '驗證碼無效，請重新驗證';
            }
        }
        
        if (is_array($verificationResult) && isset($verificationResult['is_bot']) && $verificationResult['is_bot']) {
            $errorMessage = '系統檢測到自動化行為，請勿使用機器人或腳本';
        }

        JSONReturn($errorMessage, 'error');
    }
}

// 檢查是否取得必要的 cookie
if (empty($udnmember) || empty($um2)) {
    JSONReturn('未取得會員資訊，請重新登入', 'error');
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
    
    $ip = getIP();
    $ipCheckStmt = $pdo->prepare("SELECT MAX(updated_at) AS last_attempt FROM test_fate_event WHERE ip = :ip");
    $ipCheckStmt->bindParam(':ip', $ip);
    $ipCheckStmt->execute();
    $ipResult = $ipCheckStmt->fetch(PDO::FETCH_ASSOC);
    $lastAttempt = $ipResult ? $ipResult['last_attempt'] : null;
    
    if ($lastAttempt) {
        $timeSinceLastAttempt = time() - strtotime($lastAttempt);
        if ($timeSinceLastAttempt < 60) {
            JSONReturn('請稍後再試，系統限制短時間內不可重複占卜', 'error', ['wait_time' => 60 - $timeSinceLastAttempt]);
        }
    }
    
    
    $today = date('Y-m-d');
    $stmt = $pdo->prepare("SELECT * FROM test_fate_event WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $lastUpdatedTimestamp = strtotime($row['updated_at']);
        $lastUpdatedDate = date('Y-m-d', $lastUpdatedTimestamp);
        if ($lastUpdatedDate === $today) {
           JSONReturn([
                'message' => sanitizeOutput('您今天已經占卜過了，請明天再來'),
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
        $updateStmt = $pdo->prepare("UPDATE test_fate_event SET 
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
        $fetchStmt = $pdo->prepare("SELECT * FROM test_fate_event WHERE email = :email");
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
        $stmt = $pdo->prepare("INSERT INTO test_fate_event 
            (email, username, ip, play_times_total, created_at, updated_at) 
            VALUES (:email, :username, :ip, 1, NOW(), NOW())");
        
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':ip', $ip);
        $stmt->execute();
        
        // 獲取剛創建的用戶數據
        $newId = $pdo->lastInsertId();
        $fetchStmt = $pdo->prepare("SELECT * FROM test_fate_event WHERE id = :id");
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
    JSONReturn(['message' => sanitizeOutput('資料庫錯誤，請稍後再試')], 'error');
} catch(Exception $e) {
    JSONReturn(['message' => sanitizeOutput('系統錯誤，請稍後再試')], 'error');
}