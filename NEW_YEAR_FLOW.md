# 新年活動流程說明

## 📝 流程概述

### 舊流程（占卜活動）
1. 點擊 Banner 按鈕
2. 跳轉登入頁面
3. 登入後返回活動頁
4. 顯示驗證彈窗
5. 驗證成功後顯示占卜結果

### 新流程（新年活動）
1. 點擊 Banner 按鈕
2. 跳轉登入頁面
3. 登入後返回活動頁
4. **轉盤開始轉動（3秒）**
5. **顯示待跳轉彈窗（4秒）**
6. **跳轉到外部網頁並顯示占卜結果**

## 🎯 技術實作

### 1. 新增檔案

#### `components/Redirect_popup.vue`
待跳轉彈窗組件，顯示倒數計時

#### `composables/useRedirectFlow.js`
新年活動流程處理邏輯
- `handleNewYearFlow()` - 處理完整的新年活動流程
- `buildRedirectUrl()` - 建立帶參數的跳轉網址

#### `public/divination-card.js`
獨立的占卜卡片 JS 模組，供外部網頁使用
- 可讀取 URL 參數（first, count, udnmember）
- 自動顯示首次完成彈窗
- 生成並顯示占卜卡片

#### `public/divination-card-example.html`
使用範例頁面，展示如何在外部網頁使用占卜卡片

### 2. 修改檔案

#### `components/Banner.vue`
- 新增轉盤動畫層 `<div class="banner__wheel">`
- 新增 `startWheelSpin()` 方法
- 新增 CSS 轉盤動畫（旋轉 1080 度，持續 3 秒）

#### `stores/popup.js`
- 新增 `showRedirectPopup` 狀態
- 新增 `redirectPopupData` 資料
- 新增 `openRedirectPopup()` 和 `closeRedirectPopup()` 方法

#### `pages/index.vue`
- 引入 `Redirect_popup` 組件
- 引入 `useRedirectFlow` composable
- 修改登入後的處理流程，改用新年活動流程

#### `nuxt.config.js`
- 新增 `externalRedirectUrl` 設定項

## 🔧 使用方式

### 在本專案中

流程會自動執行，登入後會：
1. 觸發轉盤動畫
2. 顯示待跳轉彈窗
3. 自動跳轉到外部網頁

### 在外部網頁中使用占卜卡片

#### 步驟 1: 引入 JS 檔案

```html
<script src="https://your-domain.com/divination-card.js"></script>
```

#### 步驟 2: 建立容器元素

```html
<div id="divination-container"></div>
```

#### 步驟 3: 初始化占卜卡片

```html
<script>
  DivinationCard.init({
    containerId: 'divination-container',
    showFirstTimePopup: true
  });
</script>
```

### URL 參數說明

從活動頁跳轉時會自動帶入以下參數：

- `first` - 是否首次完成（1 = 是，0 = 否）
- `count` - 累計占卜次數
- `udnmember` - 會員 ID
- `timestamp` - 時間戳記

範例網址：
```
https://your-company-site.com/newyear?first=1&count=1&udnmember=12345&timestamp=1234567890
```

## ⚙️ 環境變數設定

在 `.env` 檔案中設定外部跳轉網址：

```env
NUXT_PUBLIC_EXTERNAL_REDIRECT_URL=https://your-company-site.com/newyear
```

若未設定，預設會跳轉到：
```
https://udn.com/news/cate/2/6638
```

## 🎨 樣式自訂

占卜卡片 JS 檔案已內建樣式，如需自訂可以覆寫以下 CSS 類別：

```css
.divination-card { /* 卡片容器 */ }
.divination-card__inner { /* 卡片內容 */ }
.divination-card__img { /* 卡片圖片 */ }
.divination-card__title { /* 卡片標題 */ }
.divination-card__desc { /* 卡片描述 */ }
.divination-first-popup { /* 首次完成彈窗 */ }
```

## 📊 流程時間軸

```
0s     點擊 Banner → 跳轉登入
登入完成 → 返回活動頁
0s     轉盤開始轉動
3s     轉盤動畫結束
3s     顯示待跳轉彈窗
7s     倒數結束，跳轉到外部網頁
```

## 🐛 除錯資訊

### Console 輸出

在開發過程中，可以在 Console 看到以下訊息：

```
=== 開始新年活動流程 ===
觸發轉盤動畫...
轉盤動畫結束
獲取會員資料...
API 回應結果: {...}
會員資料: { isFirstTime, playCount, udnmember }
顯示待跳轉彈窗...
準備跳轉到: https://...
```

### 測試用參數

可以手動在 URL 加入參數來測試外部網頁：

```
http://localhost:3000/divination-card-example.html?first=1&count=1&udnmember=test123
```

## 📦 相關檔案結構

```
fate2025/
├── components/
│   ├── Banner.vue (已修改 - 加入轉盤動畫)
│   └── Redirect_popup.vue (新增 - 待跳轉彈窗)
├── composables/
│   └── useRedirectFlow.js (新增 - 新年活動流程)
├── stores/
│   └── popup.js (已修改 - 加入 redirect 狀態)
├── pages/
│   └── index.vue (已修改 - 整合新流程)
├── public/
│   ├── divination-card.js (新增 - 占卜卡片模組)
│   └── divination-card-example.html (新增 - 使用範例)
├── nuxt.config.js (已修改 - 加入外部跳轉網址設定)
└── NEW_YEAR_FLOW.md (此檔案)
```

## 🎯 待辦事項

1. [ ] 設定正確的外部跳轉網址 (環境變數)
2. [ ] 在外部網站部署 divination-card.js
3. [ ] 在外部網站建立占卜結果頁面
4. [ ] 測試完整流程
5. [ ] 可選：更換轉盤動畫樣式（目前是旋轉動畫）

## 📞 聯絡資訊

如有任何問題，請聯絡開發團隊。

