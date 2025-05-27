<?php
/**
 * CSRF 保護處理類別
 * 所有 CSRF 令牌處理邏輯集中在此
 */
class CSRFHandler {
    /**
     * 生成新的 CSRF 令牌
     * 
     * @param string $action 操作類型
     * @return string 生成的令牌
     */
    public static function generate($action = 'default') {
        // 啟動會話（如果尚未啟動）
        if (session_status() != PHP_SESSION_ACTIVE) {
            session_start();
        }
        
        // 生成包含 action 名稱的令牌
        $token = bin2hex(random_bytes(32));
        
        // 儲存到會話中
        $_SESSION["fate2025_csrf_{$action}"] = $token;
        
        // 設定過期時間（5分鐘）
        $_SESSION["fate2025_csrf_{$action}_expiry"] = time() + 300; // 5分鐘
        
        return $token;
    }
    
    /**
     * 驗證 CSRF 令牌
     * 
     * @param string $token 要驗證的令牌
     * @param string $action 操作類型
     * @return bool 驗證是否成功
     */
    public static function verify($token, $action = 'default') {
        // 啟動會話（如果尚未啟動）
        if (session_status() != PHP_SESSION_ACTIVE) {
            session_start();
        }
        
        // 檢查令牌是否存在
        if (!isset($_SESSION["fate2025_csrf_{$action}"])) {
            error_log("CSRF 驗證失敗：找不到 {$action} 的令牌");
            return false;
        }
        
        // 檢查過期時間
        if (isset($_SESSION["fate2025_csrf_{$action}_expiry"]) && 
            $_SESSION["fate2025_csrf_{$action}_expiry"] < time()) {
            error_log("CSRF 驗證失敗：{$action} 令牌已過期");
            self::clear($action);
            return false;
        }
        
        // 比較令牌
        $stored_token = $_SESSION["fate2025_csrf_{$action}"];
        $valid = hash_equals($stored_token, $token);
        
        if (!$valid) {
            error_log("CSRF 驗證失敗：令牌不匹配 (提供的: {$token}, 儲存的: {$stored_token})");
        }
        
        // 使用後清除令牌（一次性使用）
        self::clear($action);
        
        return $valid;
    }
    
    /**
     * 清除 CSRF 令牌
     * 
     * @param string $action 操作類型，如果為空則清除所有令牌
     */
    public static function clear($action = null) {
        // 啟動會話（如果尚未啟動）
        if (session_status() != PHP_SESSION_ACTIVE) {
            session_start();
        }
        
        if ($action === null) {
            // 清除所有 CSRF 令牌
            foreach ($_SESSION as $key => $value) {
                if (strpos($key, 'fate2025_csrf_') === 0) {
                    unset($_SESSION[$key]);
                }
            }
        } else {
            // 清除特定操作的令牌
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