# 幸福花火轉一夏 - 運勢占卜活動

## 專案簡介

「幸福花火轉一夏」是聯合新聞網舉辦的互動式運勢占卜活動，讓用戶透過占卜獲得不同的煙火結果，並有機會參與抽獎活動。

## 網站網址

- **正式環境**: [https://event.udn.com/bd_fate2025/](https://event.udn.com/bd_fate2025/)
- **測試環境**: [https://lab-event.udn.com/bd_fate2025_test/](https://lab-event.udn.com/bd_fate2025_test/)

## 技術架構

### 前端技術

- **Framework**: Nuxt.js 3
- **UI Library**: Vue 3 + Composition API
- **樣式**: SCSS
- **HTTP Client**: Axios
- **彈窗組件**: SweetAlert2

### 後端技術

- **語言**: PHP
- **資料庫**: MySQL (PDO)
- **安全驗證**: Cloudflare Turnstile
- **會員系統**: 聯合新聞網會員 API

### 安全機制

- **CSRF 防護**: 自定義 CSRF Token 驗證
- **流程安全**: 一次性安全令牌機制
- **機器人防護**: Cloudflare Turnstile 驗證
- **輸入過濾**: XSS 和 SQL Injection 防護
- **自動化檢測**: 防止機器人和腳本攻擊

## 核心功能

### 占卜系統

- 每日限制一次占卜
- 4種煙火結果（心型、金浪、療癒、金光）
- 權重隨機分配系統
- 累計占卜次數統計

### 會員整合

- UDN 會員登入系統
- 會員資料驗證
- 占卜記錄追蹤

### 社群分享

- LINE 分享功能
- 自定義分享頁面
- Open Graph 標籤優化

### 獎勵機制

- 首次占卜獲得 LINE Points 5點
- 里程碑成就系統
- 抽獎活動參與資格

## 安全流程

1. **流程驗證**: 用戶必須透過正確流程（點擊占卜按鈕 → 登入 → 驗證）
2. **令牌管理**:
   - 流程安全令牌（10分鐘有效期）
   - CSRF 令牌（5分鐘有效期）
   - Turnstile 驗證令牌
3. **重複檢查**: 資料庫層級的每日占卜限制
4. **IP 限制**: 防止短時間內重複請求

## 開發環境設置

### 安裝依賴

````bash
# npm
npm install


### 開發伺服器

```bash
# npm
npm run dev


### 生產建置

```bash
# npm
npm run build


### 預覽生產版本

```bash
# npm
npm run preview


## 環境變數設置

```env
NUXT_PUBLIC_BASE_URL=你的基礎網址
NUXT_PUBLIC_DOMAIN=你的域名
NUXT_PUBLIC_BASE=基礎路徑
NUXT_PUBLIC_TURNSTILE_SITE_KEY=Cloudflare_Turnstile_網站金鑰
````

## 資料庫結構

### test_fate_event 表格

- `id`: 主鍵
- `email`: 用戶信箱
- `username`: 用戶名稱
- `ip`: 用戶 IP
- `play_times_total`: 累計占卜次數
- `created_at`: 創建時間
- `updated_at`: 最後更新時間

## API 端點

- `auth_token.php`: 生成流程安全令牌
- `saveUserData.php`: 保存占卜資料
- `checkPlayStatus.php`: 檢查占卜狀態
- `resetDatabase.php`: 重置資料庫（開發用）

## 開發工具

### 調試模式

按下 `Shift + D` 顯示開發工具面板，包含：

- 清除占卜記錄
- 重置資料庫
- 登出功能
- 資料庫狀態檢查

### 測試函數

在開發環境中可使用以下測試函數：

- `window.testApiError()`: 測試 API 錯誤
- `window.testRobotFail()`: 測試機器人驗證失敗
- `window.testAutomationDetection()`: 測試自動化檢測

## 部署說明

1. 確保 PHP 7.4+ 和 MySQL 環境
2. 配置 Cloudflare Turnstile
3. 設置正確的 CORS 域名
4. 配置 UDN 會員 API 金鑰
5. 建立資料庫表格
6. 設置適當的檔案權限

## 注意事項

- 活動期間：2025/06/09 10:00 ~ 2025/06/30 10:00
- 獎項公佈：2025/07/08 10:00
- 每人每日限制占卜一次
- 需要 UDN 會員帳號才能參與

## 聯絡資訊

如有技術問題或需要支援，請聯繫開發團隊。

---

更多詳細資訊請參考 [Nuxt.js 官方文件](https://nuxt.com/docs/getting-started/introduction)
