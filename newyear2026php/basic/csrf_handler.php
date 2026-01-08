<?php
class CSRFHandler {
    public static function generate($action = 'default') {
        if (session_status() != PHP_SESSION_ACTIVE) {
            session_start();
        }
        
        $token = bin2hex(random_bytes(32));
        
        $_SESSION["fate2025_csrf_{$action}"] = $token;
        
        $_SESSION["fate2025_csrf_{$action}_expiry"] = time() + 180; // 3分鐘
        
        return $token;
    }
    
    public static function verify($token, $action = 'default') {
        if (session_status() != PHP_SESSION_ACTIVE) {
            session_start();
        }
        
        // 檢查 token 是否存在
        if (!isset($_SESSION["fate2025_csrf_{$action}"])) {
            error_log("[E001] 安全驗證失敗：驗證碼不存在");
            return false;
        }
        
        // 檢查是否過期
        if (isset($_SESSION["fate2025_csrf_{$action}_expiry"]) && 
            $_SESSION["fate2025_csrf_{$action}_expiry"] < time()) {
            self::clear($action);
            error_log("[E002] 安全驗證失敗：驗證碼已過期（超過3分鐘）");
            return false;
        }
        
        // 驗證 token 是否匹配
        $stored_token = $_SESSION["fate2025_csrf_{$action}"];
        $valid = hash_equals($stored_token, $token);
        
        if (!$valid) {
            error_log("[E003] 安全驗證失敗：驗證碼不匹配");
        }
        
        // 方案2：不立即清除 token，讓它在3分鐘內可重複使用
        // 這樣可以處理網路延遲或重試的情況
        
        return $valid;
    }
    
    public static function clear($action = null) {
        if (session_status() != PHP_SESSION_ACTIVE) {
            session_start();
        }
        
        if ($action === null) {
            foreach ($_SESSION as $key => $value) {
                if (strpos($key, 'fate2025_csrf_') === 0) {
                    unset($_SESSION[$key]);
                }
            }
        } else {
            if (isset($_SESSION["fate2025_csrf_{$action}"])) {
                unset($_SESSION["fate2025_csrf_{$action}"]);
            }
            if (isset($_SESSION["fate2025_csrf_{$action}_expiry"])) {
                unset($_SESSION["fate2025_csrf_{$action}_expiry"]);
            }
        }
    }
}
?>