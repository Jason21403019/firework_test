<?php
require_once('config.php');

// 回傳資料 param: $data(array or string), $status(boolean)
function JSONReturn($data, $status = false)
{   
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
    echo filter_var(json_encode($dataRes));
    die;
}

// Cloudflare Turnstile 驗證
function checkTurnstileAuth($token)
{
    $secretKey = '0x4AAAAAAA5ho0moD45CWi2cFX9SYn9fBjc'; 
    
    $data = [
        'secret' => $secretKey,
        'response' => $token,
        'remoteip' => getIP()
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpcode != 200) {
        return false;
    }
    
    $result = json_decode($response, true);
    return isset($result['success']) && $result['success'] === true;
}

// 強制使用 HTTPS，確保請求安全性
function isHttps() {
    if (isset($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] === 'on' || $_SERVER['HTTPS'] == 1)) {
        return true;
    }
    if (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443) {
        return true;
    }
    if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
        return true;
    }
    return false;
}


// 確認是否有資料，並增加 post 安全性
function postEmpty($field)
{
    if (empty($field)) {
        return false;
    }
    return htmlspecialchars(stripslashes(trim($field)));
}

// 檢查 email 格式
function checkEmailFormat($email)
{
    if (filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match("/([\w\-]+\@[\w\-]+\.[\w\-]+)/", $email)) {
        return true;
    } else {
        return false;
    }
}

// 取得用戶資料
function getUdnMember($udnmember, $um2)
{
    $data = [
        'account' => $udnmember,
        'um2' => $um2,
        'json' => 'Y',
        'site' => 'bd_game2024'
    ];
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://umapi.udn.com/member/wbs/MemberUm2Check");
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        $arrResponse = json_decode($error, true);
        $logData = initLog("U01", $arrResponse, getUser());
        insertFile($logData);
    } else {
        $arrResponse = json_decode($response, true);
    }
    curl_close($ch);
    return $arrResponse;
}

// 取得用戶 email
function getMail()
{
    $udnmember = $_COOKIE["udnmember"];
    $um2 = urlencode($_COOKIE["um2"]);
    $response = getUdnMember($udnmember, $um2);
    $email = filter_var($response["response"]["email"], FILTER_SANITIZE_EMAIL);
    return $email;
}

// 取得用戶 IP
function getIP()
{
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
function getUser()
{
    if (isset($_COOKIE["udnmember"])) {
        $user = $_COOKIE["udnmember"];
    } else {
        $user = getIP();
    }
    return $user;
}

// 檢查 email 是否已是 udn 會員
function checkEmail($email)
{
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