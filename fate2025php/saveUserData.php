<?php
require_once('./basic/base.php');
require_once('./basic/connetDB.php');
require_once('./basic/csrf_handler.php');
session_start();

// 設定台灣時區
date_default_timezone_set('Asia/Taipei');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://lab-event.udn.com'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// 記錄所有請求以方便調試
error_log("saveUserData.php 收到請求 - Method: " . $_SERVER['REQUEST_METHOD']);

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

// 檢查 JSON 解析是否成功
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("JSON 解析錯誤: " . json_last_error_msg());
    echo json_encode(['status' => 'error', 'message' => 'JSON 格式錯誤']);
    exit;
}

// 記錄收到的數據
error_log("收到的請求數據: " . $json);

// 從請求中獲取關鍵參數
$udnmember = isset($data['udnmember']) ? $data['udnmember'] : null;
$um2 = isset($data['um2']) ? $data['um2'] : null;
$turnstileToken = isset($data['turnstile_token']) ? $data['turnstile_token'] : null;
$session_token = isset($data['flow_token']) ? $data['flow_token'] : null;

// 從 header 或請求數據或 cookie 中獲取 CSRF 令牌
$csrf_token = null;
$action = 'save'; // 當前操作類型

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

// 驗證 CSRF 令牌
if ($csrf_token) {
    if (!CSRFHandler::verify($csrf_token, $action)) {
        error_log("CSRF 驗證失敗");
        echo json_encode(['status' => 'error', 'message' => '安全驗證失敗，請重新嘗試']);
        exit;
    } else {
        error_log("CSRF 驗證成功");
    }
} else {
    // 可選：根據安全需求決定是否強制要求 CSRF 令牌
    error_log("請求中未找到 CSRF 令牌");
    // echo json_encode(['status' => 'error', 'message' => '安全驗證失敗，請重新嘗試 (缺少令牌)']);
    // exit;
}

// 驗證 session token
if (empty($session_token)) {
    error_log("缺少 flow_token");
    echo json_encode(['status' => 'error', 'message' => '安全驗證失敗，請重新開始占卜流程 (缺少令牌)']);
    exit;
}

if (!isset($_SESSION['fate2025_flow_token'])) {
    if (!isset($_SESSION['auth_token'])) {
        error_log("Session 中沒有 fate2025_flow_token 或 auth_token");
        echo json_encode(['status' => 'error', 'message' => '安全驗證失敗，請重新開始占卜流程 (會話令牌無效)']);
        exit;
    } else {
        if ($_SESSION['auth_token'] !== $session_token) {
            error_log("auth_token 不匹配: " . $_SESSION['auth_token'] . " vs " . $session_token);
            echo json_encode(['status' => 'error', 'message' => '安全驗證失敗，請重新開始占卜流程 (令牌不匹配)']);
            exit;
        }
    }
} else {
    if ($_SESSION['fate2025_flow_token'] !== $session_token) {
        error_log("flow_token 不匹配: " . $_SESSION['fate2025_flow_token'] . " vs " . $session_token);
        echo json_encode(['status' => 'error', 'message' => '安全驗證失敗，請重新開始占卜流程 (令牌不匹配)']);
        exit;
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
        
        echo json_encode(['status' => 'error', 'message' => $errorMessage]);
        exit;
    }
}

// 檢查是否取得必要的 cookie
if (empty($udnmember) || empty($um2)) {
    echo json_encode(['status' => 'error', 'message' => '未取得會員資訊，請重新登入']);
    exit;
}

try {
    // 直接使用 udnmember 作為用戶名
    $username = $udnmember;
    
    // 獲取會員 Email
    $email = '';
    $isVerified = false;
    
    if (!empty($udnmember)) {
        // 嘗試獲取 email
        $memberData = getMemberMail($udnmember);
        if (is_array($memberData)) {
            $isVerified = $memberData['verified'] ?? false;
            
            if ($isVerified && !empty($memberData['email'])) {
                $email = $memberData['email'];
            } else {
                // 備用方法
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
                        error_log("getUdnMember 失敗: " . $e->getMessage());
                    }
                }
            }
        }
    }
    
    // 如果仍然無法獲取 email，使用 udnmember 作為備用
    if (empty($email)) {
        $email = $udnmember . '@example.com';
    }
    
    error_log("最終使用的 email: " . $email);
    
    // 獲取用戶 IP
    $ip = getIP();
    
    // 檢查 IP 是否在短時間內重複嘗試
    $ipCheckStmt = $pdo->prepare("SELECT MAX(updated_at) AS last_attempt FROM test_fate_event WHERE ip = :ip");
    $ipCheckStmt->bindParam(':ip', $ip);
    $ipCheckStmt->execute();
    $ipResult = $ipCheckStmt->fetch(PDO::FETCH_ASSOC);
    $lastAttempt = $ipResult ? $ipResult['last_attempt'] : null;
    
    if ($lastAttempt) {
        $timeSinceLastAttempt = time() - strtotime($lastAttempt);
        if ($timeSinceLastAttempt < 60) { // 1分鐘內不可重複嘗試
            echo json_encode([
                'status' => 'error', 
                'message' => '請稍後再試，系統限制短時間內不可重複占卜',
                'wait_time' => 60 - $timeSinceLastAttempt
            ]);
            exit;
        }
    }
    
    // 獲取當前日期（台灣時區）
    $today = date('Y-m-d');
    error_log("今天日期 (台灣時區): " . $today);
    
    // 檢查用戶是否已存在
    $stmt = $pdo->prepare("SELECT * FROM test_fate_event WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        // 用戶已存在
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // 從 updated_at 欄位提取上次更新日期
        $lastUpdatedTimestamp = strtotime($row['updated_at']);
        $lastUpdatedDate = date('Y-m-d', $lastUpdatedTimestamp);
        
        error_log("用戶 {$email} 上次占卜日期: " . $lastUpdatedDate . " (完整時間: " . $row['updated_at'] . ")");
        error_log("今天日期: " . $today);
        error_log("日期比較結果: " . ($lastUpdatedDate === $today ? '相同 - 今天已占卜' : '不同 - 可以占卜'));
        
        // 檢查是否在今天已經占卜過
        if ($lastUpdatedDate === $today) {
            echo json_encode([
                'status' => 'error',
                'message' => '您今天已經占卜過了，請明天再來',
                'already_played' => true,
                'last_play_date' => $lastUpdatedDate,
                'today' => $today,
                'db_info' => [
                    'email' => $row['email'],
                    'username' => $row['username'],
                    'ip' => $row['ip'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at'],
                    'play_times_total' => $row['play_times_total']
                ]
            ]);
            exit;
        }
        
        // 如果今天尚未占卜，則更新記錄
        $play_times_total = intval($row['play_times_total']) + 1;
        
        error_log("用戶 {$email} 今天尚未占卜，準備更新記錄 (第 {$play_times_total} 次)");
        
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
        
        // 更新後重新查詢獲取最新數據
        $fetchStmt = $pdo->prepare("SELECT * FROM test_fate_event WHERE email = :email");
        $fetchStmt->bindParam(':email', $email);
        $fetchStmt->execute();
        $userData = $fetchStmt->fetch(PDO::FETCH_ASSOC);
        
        error_log("用戶 {$email} 占卜成功，記錄已更新");
        
        echo json_encode([
            'status' => 'success', 
            'message' => '占卜成功！', 
            'already_played' => false,
            'db_info' => [
                'email' => $userData['email'],
                'username' => $userData['username'],
                'ip' => $userData['ip'],
                'created_at' => $userData['created_at'],
                'updated_at' => $userData['updated_at'],
                'play_times_total' => $userData['play_times_total']
            ],
        ]);
    } else {
        // 創建新用戶
        error_log("新用戶 {$email} 首次占卜，創建記錄");
        
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
        
        error_log("新用戶 {$email} 記錄創建成功");
        
        echo json_encode([
            'status' => 'success', 
            'message' => '首次占卜成功！', 
            'already_played' => false,
            'db_info' => [
                'email' => $userData['email'],
                'username' => $userData['username'],
                'ip' => $userData['ip'],
                'created_at' => $userData['created_at'],
                'updated_at' => $userData['updated_at'],
                'play_times_total' => $userData['play_times_total']
            ],
        ]);
    }
} catch(PDOException $e) {
    error_log("資料庫錯誤: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => '資料庫錯誤，請稍後再試']);
} catch(Exception $e) {
    error_log("一般錯誤: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => '系統錯誤，請稍後再試']);
}

/**
 * Turnstile token 驗證函數
 */
function verifyTurnstileToken($token) {
    $secret = TURNSTILE_SECRET_KEY;
    $ip = getIP();
    
    $url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    $data = [
        'secret' => $secret,
        'response' => $token,
        'remoteip' => $ip
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    $response = json_decode($result, true);
    
    error_log("Turnstile API response: " . print_r($response, true));
    
    if (!isset($response['success']) || $response['success'] !== true) {
        $errorCodes = $response['error-codes'] ?? ['unknown_error'];
        error_log("Turnstile validation failed: " . implode(', ', $errorCodes));
        
        return [
            'success' => false,
            'error_codes' => $errorCodes,
            'is_bot' => true
        ];
    }
    
    return [
        'success' => true,
        'cdata' => $response['cdata'] ?? null,
        'hostname' => $response['hostname'] ?? null,
        'challenge_ts' => $response['challenge_ts'] ?? null
    ];
}

/**
 * 獲取會員信箱函數
 */
function getMemberMail($memberId)
{
    $email = null;
    $verified = false;
    $apiUrl = "https://umapi.udn.com/member/wbs/MemberUm2Check";

    $udnmember = !empty($_COOKIE['udnmember']) ? $_COOKIE['udnmember'] : ($_COOKIE['udnland'] ?? '');
    $um2 = $_COOKIE['um2'] ?? '';

    if (!empty($udnmember) && !empty($um2)) {
        $um2Encoded = urlencode($um2);

        $data = [
            'account' => $udnmember,
            'um2' => $um2Encoded,
            'json' => 'Y',
            'site' => 'fate_event',
            'check_ts' => 'S'
        ];

        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => $apiUrl,
            CURLOPT_POSTFIELDS => http_build_query($data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false
        ]);

        $response = curl_exec($ch);
        
        if (curl_error($ch)) {
            error_log("cURL 錯誤: " . curl_error($ch));
        }
        
        curl_close($ch);

        if ($response) {
            $data = json_decode($response, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                if (isset($data['response']) && isset($data['response']['status']) && $data['response']['status'] === 'success') {
                    if (isset($data['response']['email'])) {
                        $email = filter_var($data['response']['email'], FILTER_SANITIZE_EMAIL);
                    }
                    $verified = true;
                } else {
                    $verified = false;
                    error_log("Member verification failed: " . json_encode($data));
                }
            } else {
                $verified = false;
                error_log("Failed to parse member API response: " . $response);
            }
        }
    } else {
        $verified = false;
    }

    if (empty($email) && isset($_COOKIE['fg_mail'])) {
        $email = filter_var(urldecode($_COOKIE['fg_mail']), FILTER_SANITIZE_EMAIL);
    }

    error_log("Member email fetched: " . ($email ?: 'NULL') . " for ID: " . $memberId);

    return [
        'member_id' => $memberId,
        'email' => $email,
        'verified' => $verified
    ];
}