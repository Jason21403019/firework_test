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
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, X-Requested-With');

// 記錄請求
error_log("收到 checkPlayStatus 請求, 方法: " . $_SERVER['REQUEST_METHOD']);
error_log("Headers: " . json_encode(getallheaders()));

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
$csrf_token = isset($data['csrf_token']) ? $data['csrf_token'] : null;

// 添加 CSRF 檢查 (如果存在)
if (!empty($csrf_token)) {
    $csrf_header = isset($_SERVER['HTTP_X_CSRF_TOKEN']) ? $_SERVER['HTTP_X_CSRF_TOKEN'] : '';
    $csrf_to_check = !empty($csrf_header) ? $csrf_header : $csrf_token;
    
    // 檢查 CSRF 令牌 - 僅記錄不拒絕請求
    if (isset($_SESSION['fate2025_csrf_check']) && $_SESSION['fate2025_csrf_check'] !== $csrf_to_check) {
        error_log("CSRF 令牌不匹配: 預期 " . $_SESSION['fate2025_csrf_check'] . ", 收到 " . $csrf_to_check);
        // 不阻止請求繼續，但記錄此情況
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
?>