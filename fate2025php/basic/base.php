<?php
require_once('config.php');

define('FILTER_SANITIZE_FLAGS', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

function JSONReturn($data, $status = false) {   
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    
    $dataRes = [];
    if (is_array($data)) {
        $dataRes = $data;
        $dataRes['status'] = $status;
    } elseif (is_string($data)){
        $dataRes = [
            'message' => $data,  
            'status' => $status
        ];
    } else {
        $dataRes = [
            'message' => 'Parameter Error', 
            'status' => $status
        ];
    }
    
    $filteredData = sanitizeOutput($dataRes);
    
    echo json_encode($filteredData, JSON_UNESCAPED_UNICODE);
    die;
}

function sanitizeOutput($data) 
{
    if (is_array($data)) {
        $cleaned = [];
        foreach ($data as $key => $value) {
            if (is_string($key)) {
                $cleanKey = filter_var($key, FILTER_SANITIZE_FLAGS);
            } else {
                $cleanKey = $key;
            }
            $cleaned[$cleanKey] = sanitizeOutput($value);
        }
        return $cleaned;
    }
    
    if (is_string($data)) {
        return filter_var($data, FILTER_SANITIZE_FLAGS);
    }
    
    if (is_numeric($data)) {
        return is_int($data) ? intval($data) : floatval($data);
    }
    
    if (is_bool($data)) {
        return $data;
    }
    
    if (is_null($data)) {
        return null;
    }
    
    return filter_var((string)$data, FILTER_SANITIZE_FLAGS);
}
// Cloudflare Turnstile 驗證
function verifyTurnstileToken($token) {
    if (empty($token)) {
        return [
            'success' => false,
            'error_codes' => ['missing-input-response'],
            'is_bot' => true
        ];
    }
    
    $secret = defined('TURNSTILE_SECRET_KEY') ? TURNSTILE_SECRET_KEY : '0x4AAAAAAA5ho0moD45CWi2cFX9SYn9fBjc';
    $ip = getIP();
    
    $url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    $data = [
        'secret' => $secret,
        'response' => $token,
        'remoteip' => $ip
    ];
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query($data),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/x-www-form-urlencoded',
            'User-Agent: Mozilla/5.0 (compatible; Turnstile-Verifier/1.0)'
        ]
    ]);
    
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    
    curl_close($ch);
    
    if ($curlError) {
        return [
            'success' => false,
            'error_codes' => ['network-error'],
            'is_bot' => true
        ];
    }
    
    if ($httpCode !== 200) {
        return [
            'success' => false,
            'error_codes' => ['http-error-' . $httpCode],
            'is_bot' => true
        ];
    }
    
    $response = json_decode($result, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return [
            'success' => false,
            'error_codes' => ['json-parse-error'],
            'is_bot' => true
        ];
    }
    
    
    if (!isset($response['success']) || $response['success'] !== true) {
        $errorCodes = $response['error-codes'] ?? ['unknown_error'];
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

// 取得用戶資料
function getMemberMail($memberId){
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
            // cURL 錯誤處理 - 不記錄詳細錯誤訊息
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
                }
            } else {
                $verified = false;
            }
        }
    } else {
        $verified = false;
    }

    if (empty($email) && isset($_COOKIE['fg_mail'])) {
        $email = filter_var(urldecode($_COOKIE['fg_mail']), FILTER_SANITIZE_EMAIL);
    }
    $safeMemberId = sanitizeForLog($memberId, 50); 
    $safeEmail = sanitizeForLog($email ?: 'NULL', 100); 
    return [
        'member_id' => $memberId,
        'email' => $email,
        'verified' => $verified
    ];
}

// 取得用戶 IP
function getIP(){
    if (isset($_SERVER['HTTP_AKACIP'])) {
        $ip = $_SERVER['HTTP_AKACIP'];
    } elseif (isset($_SERVER['HTTP_VERCIP'])) {
        $ip = $_SERVER['HTTP_VERCIP'];
    } elseif (isset($_SERVER['HTTP_ECCIP'])) {
        $ip = $_SERVER['HTTP_ECCIP'];
    } elseif (isset($_SERVER['HTTP_L7CIP'])) {
        $ip = $_SERVER['HTTP_L7CIP'];
    } elseif (isset($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } elseif (isset($_SERVER['HTTP_X_FORWARDED'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED'];
    } elseif (isset($_SERVER['HTTP_X_CLUSTER_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_X_CLUSTER_CLIENT_IP'];
    } elseif (isset($_SERVER['HTTP_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_FORWARDED_FOR'];
    } elseif (isset($_SERVER['HTTP_FORWARDED'])) {
        $ip = $_SERVER['HTTP_FORWARDED'];
    } elseif (isset($_SERVER['REMOTE_ADDR'])) {
        $ip = $_SERVER['REMOTE_ADDR'];
    } else {
        $ip = 'UNKNOWN';
    }
    
    if (filter_var($ip, FILTER_VALIDATE_IP)) {
        return $ip;
    } else {
        return null;
    }
}

// 取得用戶名稱
function getUser(){
    if (isset($_COOKIE["udnmember"])) {
        $user = $_COOKIE["udnmember"];
    } else {
        $user = getIP();
    }
    return $user;
}

// 檢查 email 是否已是 udn 會員
function checkEmail($email){
    $data = array(
        'email' => "$email",
        'json' => 'Y',
    );
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://umapi.udn.com/member/wbs/MemberChkEmail");
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        $arrResponse = json_decode($error, true);
        $logData = initLog("U02", $arrResponse, getUser());
        insertFile($logData);
    } else {
        $arrResponse = json_decode($response, true);
    }
    curl_close($ch);
    return $arrResponse['status'];
}

// 設定 CORS 標頭
function setCorsHeaders($methods = 'GET, OPTIONS', $headers = 'Content-Type') {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: ' . CORS_ALLOWED_ORIGIN);
    header('Access-Control-Allow-Methods: ' . $methods);
    header('Access-Control-Allow-Headers: ' . $headers);
    header('Access-Control-Allow-Credentials: true');
}

// 將輸入數據轉換為日誌安全格式
 function sanitizeForLog($input, $maxLength = 1000) {
    if (!is_string($input)) {
        $input = (string) $input;
    }
    
    $sanitized = str_replace(["\n", "\r", "\t"], ['\n', '\r', '\t'], $input);
    
    if (strlen($sanitized) > $maxLength) {
        $sanitized = substr($sanitized, 0, $maxLength) . '...[truncated]';
    }
    
    $sanitized = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $sanitized);
    
    return $sanitized;
}

// 處理 API 請求
function handleApiRequest($allowedMethods = ['POST'], $requireJson = true) {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
    if (!in_array($_SERVER['REQUEST_METHOD'], $allowedMethods)) {
        $methodsStr = implode(', ', $allowedMethods);
        echo json_encode(['status' => false, 'message' => "請使用 {$methodsStr} 請求"]);
        exit;
    }
    if ($requireJson) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode(['status' => false, 'message' => 'JSON 格式錯誤']);
            exit;
        }
        
        return $data;
    }
    
    return null;
}