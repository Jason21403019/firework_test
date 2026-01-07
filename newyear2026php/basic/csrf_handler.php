<?php
class CSRFHandler {
    public static function generate($action = 'default') {
        if (session_status() != PHP_SESSION_ACTIVE) {
            session_start();
        }
        
        $token = bin2hex(random_bytes(32));
        
        $_SESSION["fate2025_csrf_{$action}"] = $token;
        
        $_SESSION["fate2025_csrf_{$action}_expiry"] = time() + 300; // 5分鐘
        
        return $token;
    }
    
    public static function verify($token, $action = 'default') {
        if (session_status() != PHP_SESSION_ACTIVE) {
            session_start();
        }
        if (!isset($_SESSION["fate2025_csrf_{$action}"])) {
            return false;
        }
        if (isset($_SESSION["fate2025_csrf_{$action}_expiry"]) && 
            $_SESSION["fate2025_csrf_{$action}_expiry"] < time()) {
            self::clear($action);
            return false;
        }
        $stored_token = $_SESSION["fate2025_csrf_{$action}"];
        $valid = hash_equals($stored_token, $token);
        if (!$valid) {
        }
        self::clear($action);
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