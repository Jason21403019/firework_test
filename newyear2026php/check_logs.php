<?php
// 快速查看最近的 PHP 錯誤日誌
header('Content-Type: text/plain; charset=utf-8');

echo "=== PHP Error Log 檢查工具 ===\n\n";

// 嘗試找到錯誤日誌文件
$possibleLogPaths = [
    ini_get('error_log'),
    __DIR__ . '/error.log',
    __DIR__ . '/../error.log',
    '/var/log/php_errors.log',
    '/var/log/apache2/error.log',
    '/var/log/nginx/error.log',
    'C:/xampp/apache/logs/error.log',
    'C:/wamp64/logs/php_error.log',
];

echo "1. PHP 配置資訊:\n";
echo "   - error_log 設定: " . ini_get('error_log') . "\n";
echo "   - display_errors: " . ini_get('display_errors') . "\n";
echo "   - log_errors: " . ini_get('log_errors') . "\n\n";

echo "2. Session 配置:\n";
echo "   - session.save_path: " . session_save_path() . "\n";
echo "   - session.cookie_samesite: " . ini_get('session.cookie_samesite') . "\n";
echo "   - session.cookie_secure: " . ini_get('session.cookie_secure') . "\n\n";

echo "3. 搜尋日誌文件:\n";
foreach ($possibleLogPaths as $path) {
    if ($path && file_exists($path)) {
        echo "   ✓ 找到: $path\n";
        echo "   文件大小: " . filesize($path) . " bytes\n";
        
        // 讀取最後 50 行
        $lines = file($path);
        if ($lines) {
            $recentLines = array_slice($lines, -50);
            echo "\n--- 最近 50 行日誌 ---\n";
            foreach ($recentLines as $line) {
                // 只顯示與我們相關的日誌
                if (stripos($line, 'csrf') !== false || 
                    stripos($line, 'session') !== false ||
                    stripos($line, 'saveUserData') !== false ||
                    stripos($line, 'getCsrfToken') !== false) {
                    echo $line;
                }
            }
            echo "--- 日誌結束 ---\n\n";
        }
        break;
    }
}

// 如果沒找到日誌文件，提供替代方案
if (!file_exists(ini_get('error_log'))) {
    echo "\n4. 替代方案 - 啟用臨時日誌:\n";
    echo "   請在 getCsrfToken.php 頂部加入:\n";
    echo "   ini_set('log_errors', 1);\n";
    echo "   ini_set('error_log', __DIR__ . '/csrf_debug.log');\n";
}
?>

