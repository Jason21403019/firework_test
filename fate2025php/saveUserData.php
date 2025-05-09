<?php
require_once('./basic/base.php');
require_once('./basic/connetDB.php');
session_start(); // 啟用 session

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://lab-event.udn.com'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');


// 處理 OPTIONS 請求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 確保是 POST 請求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => '請使用 POST 請求']);
    exit;
}

// 檢查來源網址 (Referer)
$allowedReferers = ['lab-event.udn.com', 'event.udn.com'];
$refererValid = false;

if (isset($_SERVER['HTTP_REFERER'])) {
    foreach ($allowedReferers as $domain) {
        if (strpos($_SERVER['HTTP_REFERER'], $domain) !== false) {
            $refererValid = true;
            break;
        }
    }
}

// 開發環境可略過 referer 檢查
if (!$refererValid && !preg_match('/localhost|127\.0\.0\.1|192\.168\.|dev/i', $_SERVER['HTTP_HOST'])) {
    error_log("非法的請求來源: " . ($_SERVER['HTTP_REFERER'] ?? '未知'));
    echo json_encode(['status' => 'error', 'message' => '非法請求來源']);
    exit;
}

// 獲取 POST 數據
$json = file_get_contents('php://input');
$data = json_decode($json, true);

$udnmember = isset($data['udnmember']) ? $data['udnmember'] : null;
$um2 = isset($data['um2']) ? $data['um2'] : null;
$turnstileToken = isset($data['turnstile_token']) ? $data['turnstile_token'] : null;
$session_token = isset($data['session_token']) ? $data['session_token'] : null;

// 記錄收到的數據
error_log("收到的請求數據: " . $json);

// [步驟 6] 驗證 session token
if (empty($session_token) || !isset($_SESSION['auth_token']) || $_SESSION['auth_token'] !== $session_token) {
    echo json_encode(['status' => 'error', 'message' => '安全驗證失敗，請重新開始占卜流程']);
    exit;
}


// [步驟 7] 驗證 Turnstile token 
if (!empty($turnstileToken)) {
    $verificationResult = verifyTurnstileToken($turnstileToken);
    
    if (!is_array($verificationResult) || !isset($verificationResult['success']) || !$verificationResult['success']) {
        $errorMessage = '機器人驗證失敗';
        
        // 如果是數組且包含錯誤代碼，提供更具體的錯誤訊息
        if (is_array($verificationResult) && isset($verificationResult['error_codes'])) {
            $errorCodes = implode(', ', $verificationResult['error_codes']);
            $errorMessage .= "：{$errorCodes}";
            
            // 特定錯誤的處理
            if (in_array('timeout-or-duplicate', $verificationResult['error_codes'])) {
                $errorMessage = '請勿重複提交或驗證已過期，請刷新頁面重試';
            } else if (in_array('invalid-input-response', $verificationResult['error_codes'])) {
                $errorMessage = '驗證碼無效，請重新驗證';
            }
        }
        
        // 對於機器人，給出特定警告
        if (is_array($verificationResult) && isset($verificationResult['is_bot']) && $verificationResult['is_bot']) {
            $errorMessage = '系統檢測到自動化行為，請勿使用機器人或腳本';
        }
        
        echo json_encode(['status' => 'error', 'message' => $errorMessage]);
        exit;
    }
}

// [步驟 8 & 9] 檢查是否取得必要的 cookie
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
        $isVerified = $memberData['verified'];
        
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
    
    // 如果仍然無法獲取 email，使用 udnmember 作為備用
    if (empty($email)) {
        $email = $udnmember . '@example.com';
    }
    
    // 獲取用戶 IP
    $ip = getIP();
    
    // [步驟 10] 檢查 IP 是否在短時間內重複嘗試
    $ipCheckStmt = $pdo->prepare("SELECT MAX(updated_at) AS last_attempt FROM test_fate_event WHERE ip = :ip");
    $ipCheckStmt->bindParam(':ip', $ip);
    $ipCheckStmt->execute();
    $lastAttempt = $ipCheckStmt->fetch(PDO::FETCH_ASSOC)['last_attempt'];
    
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
    
    // 檢查用戶是否已存在
    $stmt = $pdo->prepare("SELECT * FROM test_fate_event WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    // 獲取當前日期（台灣時區）
    $today = date('Y-m-d', strtotime('+8 hours'));
    
    if ($stmt->rowCount() > 0) {
        // 用戶已存在
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // 從 updated_at 欄位提取上次更新日期
        $lastUpdatedDate = date('Y-m-d', strtotime($row['updated_at']));
        
        // [步驟 10] 檢查是否在今天已經占卜過
        if ($lastUpdatedDate === $today) {
            echo json_encode([
                'status' => 'error',
                'message' => '您今天已經占卜過了，請明天再來',
                'already_played' => true,
                'last_play_date' => $lastUpdatedDate,
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
        $play_times_total = $row['play_times_total'] + 1;
        
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
            'fortune_data' => generateFortuneData() // 產生占卜結果
        ]);
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
            'fortune_data' => generateFortuneData() // 產生占卜結果
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
    $secret = TURNSTILE_SECRET_KEY; // 應該配置在安全的環境變數中
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
    
    // 記錄完整回應以供調試
    error_log("Turnstile API response: " . print_r($response, true));
    
    if (!isset($response['success']) || $response['success'] !== true) {
        // 獲取錯誤代碼並記錄
        $errorCodes = $response['error-codes'] ?? ['unknown_error'];
        error_log("Turnstile validation failed: " . implode(', ', $errorCodes));
        
        // 返回更詳細的錯誤信息
        return [
            'success' => false,
            'error_codes' => $errorCodes,
            'is_bot' => true
        ];
    }
    
    return [
        'success' => true,
        'cdata' => $response['cdata'] ?? null,  // 客戶數據
        'hostname' => $response['hostname'] ?? null,  // 主機名稱
        'challenge_ts' => $response['challenge_ts'] ?? null  // 挑戰時間戳
    ];
}

/**
 * 產生占卜結果（模擬）
 */
function generateFortuneData() {
    // 定義占卜結果及其權重（機率百分比）
    $fortunes = [
        [
            'id' => 'fortune_1',
            'title' => '財運亨通',
            'description' => '今年財運亨通，可能會有意外之財。投資謹慎，避免衝動決策。',
            'lucky_number' => mt_rand(1, 99),
            'lucky_color' => ['紅色', '金色', '紫色'][mt_rand(0, 2)],
            'weight' => 40  // 40% 機率
        ],
        [
            'id' => 'fortune_2',
            'title' => '事業有成',
            'description' => '工作上將遇到貴人相助，把握機會表現自己，升職加薪指日可待。',
            'lucky_number' => mt_rand(1, 99),
            'lucky_color' => ['藍色', '綠色', '黑色'][mt_rand(0, 2)],
            'weight' => 30  // 30% 機率
        ],
        [
            'id' => 'fortune_3',
            'title' => '桃花朵朵',
            'description' => '感情生活甜蜜，單身者有機會遇到心儀對象，已有伴侶者關係更加穩固。',
            'lucky_number' => mt_rand(1, 99),
            'lucky_color' => ['粉色', '白色', '黃色'][mt_rand(0, 2)],
            'weight' => 20  // 20% 機率
        ],
        [
            'id' => 'fortune_4',
            'title' => '健康平安',
            'description' => '身體健康狀況良好，注意作息規律，適度運動。心情愉悅，遠離煩惱。',
            'lucky_number' => mt_rand(1, 99),
            'lucky_color' => ['湖水綠', '淺藍', '米白'][mt_rand(0, 2)],
            'weight' => 10  // 10% 機率
        ]
    ];
    
    // 計算權重總和
    $totalWeight = array_sum(array_column($fortunes, 'weight'));
    
    // 產生隨機數
    $randomValue = mt_rand(1, $totalWeight);
    
    // 根據權重選擇結果
    $currentWeight = 0;
    foreach ($fortunes as $fortune) {
        $currentWeight += $fortune['weight'];
        if ($randomValue <= $currentWeight) {
            // 移除 weight 欄位，不需要返回給前端
            unset($fortune['weight']);
            return $fortune;
        }
    }
    
    // 預設情況下返回第一個結果（理論上不會執行到這裡）
    unset($fortunes[0]['weight']);
    return $fortunes[0];
}

/**
 * 添加會員數據同步函數 - 用於獲取真實 email
 */
function getMemberMail($memberId)
{
    // 檢查 Cookie 取得會員信箱
    $email = null;
    $apiUrl = "https://umapi.udn.com/member/wbs/MemberUm2Check";

    // 優先使用 udnmember，如果不存在則嘗試使用 udnland
    $udnmember = !empty($_COOKIE['udnmember']) ? $_COOKIE['udnmember'] : $_COOKIE['udnland'] ?? '';
    $um2 = $_COOKIE['um2'] ?? '';

    // 如果有必要的 cookie 值
    if (!empty($udnmember) && !empty($um2)) {
        $um2Encoded = urlencode($um2);

        // 準備 API 請求數據 - 更新配置
        $data = [
            'account' => $udnmember,
            'um2' => $um2Encoded,
            'json' => 'Y',
            'site' => 'fate_event',  // 網站代碼，限制20字元
            'check_ts' => 'S'        // 檢查cookie時效是否超過30分鐘
        ];

        // 從會員系統 API 獲取資料
        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => $apiUrl,
            CURLOPT_POSTFIELDS => http_build_query($data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        // 解析 API 回應
        $data = json_decode($response, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            // 檢查 API 響應狀態
            if (isset($data['response']) && isset($data['response']['status']) && $data['response']['status'] === 'success') {
                if (isset($data['response']['email'])) {
                    $email = filter_var($data['response']['email'], FILTER_SANITIZE_EMAIL);
                }
                // 驗證成功的狀態
                $verified = true;
            } else {
                // 驗證失敗
                $verified = false;
                error_log("Member verification failed: " . json_encode($data));
            }
        } else {
            $verified = false;
            error_log("Failed to parse member API response: " . $response);
        }
    } else {
        $verified = false;
    }

    // 如果API請求失敗，嘗試從 fg_mail cookie 獲取
    if (empty($email) && isset($_COOKIE['fg_mail'])) {
        $email = filter_var(urldecode($_COOKIE['fg_mail']), FILTER_SANITIZE_EMAIL);
    }

    // 記錄會員信箱到日誌
    error_log("Member email fetched: " . ($email ?: 'NULL') . " for ID: " . $memberId);

    return [
        'member_id' => $memberId,
        'email' => $email,
        'verified' => $verified ?? false
    ];
}

/**
 * 驗證安全令牌
 */
function validateSecurityToken($userId, $um2, $token) {
    if (empty($userId) || empty($um2) || empty($token)) {
        return false;
    }
    
    // 在開發環境中可以註解這一行來略過安全檢查
    // return true;  
    
    // 產生預期的令牌
    $today = date('Y-m-d', strtotime('+8 hours'));  // 台灣時區 UTC+8
    $baseString = "{$userId}-{$um2}-{$today}-fate2025";
    
    // 產生安全雜湊
    $expectedHash = hash('md5', $baseString);
    
    // 由於前端使用的是簡單雜湊，這裡我們允許使用多種方式驗證
    // 這種方式可以讓我們在不中斷服務的情況下升級安全驗證方法
    $simpleHash = sprintf('%x', abs(hashString($baseString)));
    
    return ($token === $expectedHash || $token === $simpleHash);
}

?>