<?php
// Session Cookie 配置輔助函數（簡化版）
function configureSessionCookie() {
    if (session_status() === PHP_SESSION_NONE) {
        // 使用統一的寬鬆設定，適用於所有環境
        $params = [
            'lifetime' => 3600,
            'path' => '/',
            'domain' => '',
            'httponly' => true,
            'secure' => false,      // 統一使用 false
            'samesite' => 'Lax'     // 統一使用 Lax
        ];
        
        session_set_cookie_params($params);
    }
}
?>

