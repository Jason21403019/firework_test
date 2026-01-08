<?php
// Session Cookie 配置輔助函數
function configureSessionCookie() {
    // 檢測是否為 HTTPS 環境
    $isHttps = (
        (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
        $_SERVER['SERVER_PORT'] == 443 ||
        (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
    );
    
    // 檢測是否為本地開發環境
    $isLocalhost = (
        in_array($_SERVER['SERVER_NAME'], ['localhost', '127.0.0.1', '::1']) ||
        strpos($_SERVER['SERVER_NAME'], 'localhost') !== false
    );
    
    error_log("Session Cookie 配置:");
    error_log("- HTTPS: " . ($isHttps ? "是" : "否"));
    error_log("- Localhost: " . ($isLocalhost ? "是" : "否"));
    error_log("- Server Name: " . $_SERVER['SERVER_NAME']);
    
    if (session_status() === PHP_SESSION_NONE) {
        $params = [
            'lifetime' => 3600,
            'path' => '/',
            'domain' => '',
            'httponly' => true,
        ];
        
        // 根據環境設定 secure 和 samesite
        if ($isHttps) {
            // HTTPS 環境：使用嚴格設定
            $params['secure'] = true;
            $params['samesite'] = 'None';  // 允許跨站請求
            error_log("- 使用 HTTPS 嚴格模式 (Secure=true, SameSite=None)");
        } else {
            // HTTP 環境（本地開發）：使用寬鬆設定
            $params['secure'] = false;
            $params['samesite'] = 'Lax';   // Lax 模式在 HTTP 下工作
            error_log("- 使用 HTTP 寬鬆模式 (Secure=false, SameSite=Lax)");
        }
        
        session_set_cookie_params($params);
        error_log("Session Cookie 參數已設定");
    }
}
?>

