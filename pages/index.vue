<template>
  <div class="divination-container">
    <h1 class="title">2025蛇年運勢占卜</h1>
    <div class="description">
      <p>探索您在蛇年的財運、事業與人際關係</p>
    </div>

    <!-- 主要占卜按鈕 -->
    <button @click="startDivination" class="fortune-btn">立即占卜</button>

    <!-- 開發工具區域 - 按 Shift+D 顯示 -->
    <div v-if="showDebugTools" class="debug-tools">
      <h3>開發測試工具</h3>
      <div class="debug-actions">
        <button @click="clearPlayRecord" class="debug-btn">清除占卜記錄</button>
        <button @click="resetDatabase" class="debug-btn danger">
          重置資料庫
        </button>
        <button @click="logout" class="debug-btn logout">登出</button>
      </div>
      <div class="debug-info">
        <p>登入狀態: {{ isLoggedIn ? "已登入" : "未登入" }}</p>
        <p>
          會員ID: {{ isLoggedIn ? getCookieValue("udnmember") || "無" : "無" }}
        </p>
        <p>今日已占卜: {{ hasPlayed ? "是" : "否" }}</p>
        <p>驗證狀態: {{ isTurnstileVerified ? "已驗證" : "未驗證" }}</p>
        <p>
          本地儲存鍵:
          {{ `fate2025_last_played_${getCookieValue("udnmember") || ""}` }}
        </p>
        <button @click="debugCheckDatabase" class="debug-btn">
          檢查資料庫狀態
        </button>
      </div>
      <div class="shortcut-info">
        <p>按下 Shift+D 可隱藏此工具</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import Swal from "sweetalert2";
import axios from "axios";

// ==================== 基本狀態管理 ====================
const config = useRuntimeConfig();
const showDebugTools = ref(false);
const turnstileToken = ref(null);
const turnstileWidgetId = ref(null);
const isTurnstileVerified = ref(false);
const hasPlayed = ref(false);
const isLoggedIn = ref(false);

// 判斷是否為開發環境
const isDevelopment = computed(() => {
  return import.meta.env?.DEV || false;
});

// Cloudflare Turnstile 配置
const TURNSTILE_SITE_KEY = isDevelopment.value
  ? "1x00000000000000000000AA" // 測試用 key (總是通過)
  : "0x4AAAAAAA5howw-D6z-rI8z"; // 實際 key

// ==================== API URL 管理 ====================
// 根據環境生成適當的 API URL
function getApiUrl(endpoint) {
  const baseUrl = (() => {
    if (config.public.domain?.includes("lab-event")) {
      return "https://lab-event.udn.com/bd_fate2025_test/fate2025php";
    } else if (config.public.domain?.includes("event.udn")) {
      return "https://event.udn.com/bd_fate2025/fate2025php";
    } else {
      return "https://lab-event.udn.com/bd_fate2025_test/fate2025php";
    }
  })();

  return `${baseUrl}/${endpoint}`;
}

// 使用固定的登入 URL
const loginUrl = computed(() => {
  if (typeof window === "undefined") return "#";

  // 獲取當前頁面 URL 作為重定向目標
  const currentUrl = window.location.href;

  // 根據當前 URL 判斷重定向目標
  let redirectUrl;
  if (currentUrl.includes("lab-event.udn.com")) {
    redirectUrl = "https://lab-event.udn.com/bd_fate2025_test/";
  } else if (currentUrl.includes("event.udn.com")) {
    redirectUrl = "https://event.udn.com/bd_fate2025/";
  } else {
    // 本機開發環境下，重定向到測試環境
    redirectUrl = "https://lab-event.udn.com/bd_fate2025_test/";
  }

  return `https://member.udn.com/member/login.jsp?site=bd_fate2025&again=y&redirect=${redirectUrl}`;
});

// ==================== Cookie 與本地存儲管理 ====================
// 獲取 Cookie 值
function getCookieValue(name) {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    let parts = cookie.trim().split("=");
    if (parts[0].trim() === name) {
      return parts.slice(1).join("=");
    }
  }
  return null;
}

// 檢查是否登入
function checkLogin() {
  updateLoginStatus();
  return isLoggedIn.value;
}

// 更新登入狀態
function updateLoginStatus() {
  const udnmember = getCookieValue("udnmember");
  const um2 = getCookieValue("um2");
  isLoggedIn.value = !!(udnmember && um2);
}

// ==================== Turnstile 機器人驗證 ====================
// 載入 Turnstile 腳本
function loadTurnstileScript() {
  if (typeof window === "undefined") return;

  if (!document.getElementById("cf-turnstile-script")) {
    const script = document.createElement("script");
    script.id = "cf-turnstile-script";
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // 腳本加載完成後渲染 Turnstile
      setTimeout(renderTurnstile, 100);
    };
    document.head.appendChild(script);
  } else {
    // 如果腳本已加載，直接渲染
    setTimeout(renderTurnstile, 100);
  }
}

// 渲染 Turnstile 驗證
function renderTurnstile() {
  if (typeof window === "undefined" || !window.turnstile) return;

  // 確保容器存在
  const container = document.getElementById("turnstile-container");
  if (!container) return;

  // 如果已有 widget，先重置
  if (turnstileWidgetId.value) {
    try {
      window.turnstile.remove(turnstileWidgetId.value);
    } catch (e) {
      console.error("Turnstile 移除錯誤:", e);
    }
  }

  // 渲染 Turnstile widget
  try {
    turnstileWidgetId.value = window.turnstile.render("#turnstile-container", {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "light",
      callback: function (token) {
        console.log(
          "Turnstile 驗證成功，取得 token:",
          token.substring(0, 10) + "...",
        );

        // 驗證成功，保存 token
        turnstileToken.value = token;
        isTurnstileVerified.value = true;

        // 為確保可靠性，將 token 同時保存到 window 對象和 sessionStorage
        window.temp_turnstile_token = token;
        sessionStorage.setItem("turnstile_token", token);

        // 啟用繼續按鈕
        const verifyBtn = document.getElementById("verify-continue-btn");
        if (verifyBtn) {
          verifyBtn.disabled = false;
          verifyBtn.classList.add("verified");
        }
      },
      "expired-callback": function () {
        console.warn("Turnstile token 已過期");
        turnstileToken.value = null;
        isTurnstileVerified.value = false;
        window.temp_turnstile_token = null;
        sessionStorage.removeItem("turnstile_token");

        // 禁用繼續按鈕
        const verifyBtn = document.getElementById("verify-continue-btn");
        if (verifyBtn) {
          verifyBtn.disabled = true;
          verifyBtn.classList.remove("verified");
        }
      },
    });
  } catch (error) {
    console.error("Turnstile 渲染錯誤:", error);
  }
}

// 設置驗證成功狀態
function setVerificationSuccess() {
  if (typeof window === "undefined") return;
  localStorage.setItem("fate2025_verified", "true");
  isTurnstileVerified.value = true;
}

// 確認安全驗證狀態
async function checkSecurityVerification() {
  try {
    // 在實際環境中，可以向後端發送請求檢查驗證狀態
    // 這裡簡化為使用本地記錄
    const isVerified = localStorage.getItem("fate2025_verified") === "true";
    return isVerified || isDevelopment.value; // 開發環境始終視為已驗證
  } catch (error) {
    return false;
  }
}

// ==================== 占卜相關功能 ====================
// 檢查用戶今天是否已經占卜過
async function hasPlayedToday() {
  if (typeof window === "undefined") return false;

  // 獲取當前登入的會員 ID
  const udnmember = getCookieValue("udnmember") || "";

  // 如果已登入，優先檢查資料庫記錄
  if (checkLogin() && udnmember) {
    try {
      const apiUrl = getApiUrl("checkPlayStatus.php");
      const um2 = getCookieValue("um2") || "";

      const response = await axios.post(
        apiUrl,
        { udnmember, um2 },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );

      if (
        response.data.status === "success" &&
        response.data.played_today === true
      ) {
        // 如果服務器確認用戶今天已占卜過，更新本地存儲
        const storageKey = `fate2025_last_played_${udnmember}`;
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 格式
        localStorage.setItem(storageKey, today);
        return true;
      }

      // 如果資料庫顯示尚未占卜，再檢查本地儲存
      const storageKey = `fate2025_last_played_${udnmember}`;
      const lastPlayedDate = localStorage.getItem(storageKey);
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 格式
      if (lastPlayedDate === today) return true;

      // 兩者都沒有記錄，代表尚未占卜過
      return false;
    } catch (error) {
      console.error("檢查占卜狀態時發生錯誤:", error);

      // 出錯時，退回到本地存儲的結果
      const storageKey = `fate2025_last_played_${udnmember}`;
      const lastPlayedDate = localStorage.getItem(storageKey);
      const today = new Date().toISOString().split("T")[0];
      return lastPlayedDate === today;
    }
  } else {
    // 未登入時使用本地存儲判斷
    const storageKey = udnmember
      ? `fate2025_last_played_${udnmember}`
      : "fate2025_last_played";
    const lastPlayedDate = localStorage.getItem(storageKey);
    const today = new Date().toISOString().split("T")[0];
    return lastPlayedDate === today;
  }
}

// 更新已玩過狀態
async function updatePlayedStatus() {
  hasPlayed.value = await hasPlayedToday();
}

// 記錄用戶今天已占卜
function recordPlayToday() {
  if (typeof window === "undefined") return;

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 格式
  const udnmember = getCookieValue("udnmember") || "";
  const storageKey = udnmember
    ? `fate2025_last_played_${udnmember}`
    : "fate2025_last_played";

  localStorage.setItem(storageKey, today);
  hasPlayed.value = true;
}

// ==================== 流程控制函數 ====================
// 1. 占卜流程啟動函數
async function startDivination() {
  try {
    if (typeof window === "undefined") return;

    // 顯示處理中訊息
    Swal.fire({
      title: "處理中...",
      text: "正在準備占卜流程",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    // 1. 先更新狀態
    await updatePlayedStatus();

    // 2. 檢查用戶今天是否已經占卜過
    if (hasPlayed.value) {
      Swal.close();
      showAlreadyPlayedMessage();
      return;
    }

    // 3. 獲取 session token
    const apiUrl = getApiUrl("auth_token.php");

    console.log("正在獲取安全令牌...");
    const tokenResponse = await axios.get(apiUrl, { withCredentials: true });

    if (tokenResponse.data.status !== "success") {
      throw new Error("無法生成安全令牌");
    }

    console.log("安全令牌獲取成功");
    // 保存 token 到 localStorage 以便登入後使用
    localStorage.setItem("fate2025_auth_token", tokenResponse.data.token);

    // 同時也保存到 sessionStorage 作為備份
    sessionStorage.setItem("fate2025_auth_token", tokenResponse.data.token);

    // 4. 設置 session storage 標記，表示用戶剛開始進行登入流程
    sessionStorage.setItem("fate2025_just_logged_in", "true");

    // 新增: 設置標記表示使用正確路徑進入登入流程
    localStorage.setItem("fate2025_normal_flow", "true");

    console.log("正在跳轉到登入頁面...");
    // 跳轉到登入頁面
    window.location.href = loginUrl.value;
  } catch (error) {
    console.error("占卜流程錯誤:", error);
    Swal.fire({
      icon: "error",
      title: "系統錯誤",
      text: "啟動占卜流程時發生錯誤，請稍後再試",
    });
  }
}

// 2. 驗證成功後執行占卜流程
async function proceedToPerformDivination() {
  try {
    // 清除登入標記，確保一次性使用
    sessionStorage.removeItem("fate2025_just_logged_in");

    console.log("檢查安全令牌...");
    // 從 localStorage 或 sessionStorage 備份中獲取令牌
    let authToken = localStorage.getItem("fate2025_auth_token");

    // 如果 localStorage 中沒有找到，嘗試從備份中恢復
    if (!authToken) {
      console.log("嘗試從備份恢復安全令牌...");
      authToken = sessionStorage.getItem("fate2025_auth_backup");

      // 如果從備份中恢復成功，則回寫到 localStorage
      if (authToken) {
        console.log("從備份成功恢復安全令牌");
        localStorage.setItem("fate2025_auth_token", authToken);
      }
    }

    // 如果沒有令牌，嘗試重新開始占卜流程
    if (!authToken) {
      console.error("安全令牌不存在，嘗試重新開始占卜流程");
      Swal.fire({
        icon: "warning",
        title: "安全驗證失敗",
        text: "需要重新開始占卜流程",
        confirmButtonText: "重新開始",
        showCancelButton: false,
      }).then(() => {
        // 重新開始占卜
        startDivination();
      });
      return;
    }

    // 檢查 Turnstile token 是否存在
    if (!turnstileToken.value && !isDevelopment.value) {
      console.error("Turnstile token 不存在，需要重新驗證");
      showPostLoginVerificationDialog(); // 再次顯示驗證對話框
      return;
    }

    console.log("所有令牌就緒，繼續占卜流程");

    // 顯示處理中訊息
    Swal.fire({
      title: "占卜中...",
      text: "正在解讀您的命運",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    // 暫時保存令牌以便 saveUserData 使用
    window.temp_auth_token = authToken;
    window.temp_turnstile_token = turnstileToken.value;

    console.log("驗證令牌已保存:", {
      auth_token: !!window.temp_auth_token,
      turnstile_token: !!window.temp_turnstile_token,
    });

    // 保存用戶資料
    console.log("正在發送占卜資料...");
    const result = await saveUserData();

    localStorage.removeItem("fate2025_auth_token");
    sessionStorage.removeItem("fate2025_auth_backup");

    // 清除暫存數據
    delete window.temp_auth_token;
    delete window.temp_turnstile_token;

    // 關閉處理中訊息
    Swal.close();

    console.log("API 回應:", result);

    // 檢查回應
    if (result.status === "error") {
      // 檢查是否為驗證失敗錯誤
      if (result.message && result.message.includes("機器人驗證失敗")) {
        Swal.fire({
          icon: "warning",
          title: "機器人驗證失敗",
          text: "請重新進行驗證",
          confirmButtonText: "重新驗證",
        }).then(() => {
          // 重新顯示驗證對話框
          showPostLoginVerificationDialog();
        });
        return;
      }

      // 檢查是否為bot自動化行為相關的錯誤
      if (result.message && result.message.includes("系統檢測到自動化行為")) {
        Swal.fire({
          icon: "error",
          title: "安全警告",
          text: "系統檢測到自動化行為，請勿使用機器人或腳本，請使用正常瀏覽器操作。",
          confirmButtonText: "重新驗證",
          confirmButtonColor: "#ff4d4f",
        }).then(() => {
          // 重新顯示驗證對話框
          showPostLoginVerificationDialog();
        });
        return;
      }

      // 檢查是否為timeout或重複提交的錯誤
      if (
        result.message &&
        result.message.includes("請勿重複提交或驗證已過期")
      ) {
        Swal.fire({
          icon: "warning",
          title: "驗證已過期",
          text: "請勿重複提交或驗證已過期，請重新進行驗證。",
          confirmButtonText: "重新驗證",
        }).then(() => {
          // 重新顯示驗證對話框
          showPostLoginVerificationDialog();
        });
        return;
      }

      throw new Error(result.message || "伺服器錯誤");
    }

    // 如果已經占卜過
    if (result.already_played) {
      showAlreadyPlayedMessage();
      return;
    }

    // 記錄占卜成功
    recordPlayToday();

    // 使用 showFortuneResult 展示占卜結果
    if (result.fortune_data) {
      showFortuneResult(result.fortune_data);
    } else {
      // 如果後端沒有返回占卜結果，生成一個默認結果
      const defaultFortuneData = {
        title: "今日運勢",
        description: "今天是個好日子，財運亨通，事事順利！",
        lucky_number: Math.floor(Math.random() * 100),
        lucky_color: ["紅色", "藍色", "綠色", "黃色"][
          Math.floor(Math.random() * 4)
        ],
      };
      showFortuneResult(defaultFortuneData);
    }

    // 更新狀態
    await updatePlayedStatus();
  } catch (error) {
    console.error("占卜流程執行錯誤:", error);

    // 錯誤處理
    try {
      const checkAgain = await hasPlayedToday();
      if (checkAgain) {
        showAlreadyPlayedMessage();
      } else {
        Swal.fire({
          icon: "error",
          title: "系統錯誤",
          text: "執行占卜時發生錯誤: " + (error.message || "未知錯誤"),
        });
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "系統錯誤",
        text: "執行占卜時發生錯誤，請稍後再試",
      });
    }
  }
}

// 3. 保存用戶數據到資料庫
async function saveUserData() {
  try {
    console.log("開始執行 saveUserData 函數");

    // 檢查 turnstile token 存在性
    const turnstileTokenValue =
      window.temp_turnstile_token ||
      turnstileToken.value ||
      sessionStorage.getItem("turnstile_token") ||
      null;
    console.log("Turnstile Token 狀態:", !!turnstileTokenValue);

    if (!turnstileTokenValue && !isDevelopment.value) {
      console.error("缺少 Turnstile Token");
      throw new Error("機器人驗證資料不完整，請重新驗證");
    }

    const apiUrl = getApiUrl("saveUserData.php");
    console.log("使用的 API 路徑:", apiUrl);

    // 從 cookie 中取得會員資料
    const udnmember = getCookieValue("udnmember") || "";
    const um2 = getCookieValue("um2") || "";
    let email = udnmember || `user_${Date.now()}@example.com`;

    const userData = {
      udnmember,
      um2,
      email,
      session_token: window.temp_auth_token || null,
      turnstile_token: turnstileTokenValue || null,
    };

    console.log("準備發送的用戶數據:", userData);

    console.log("開始發送 API 請求...");
    const response = await axios.post(apiUrl, userData, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
      timeout: 60000, // 60秒超時
    });

    console.log("API 回應成功:", response.data);
    return response.data;
  } catch (error) {
    console.error("保存用戶數據失敗:", error);
    let errorMessage = "保存用戶數據失敗";

    if (error.response) {
      console.error(
        "服務器回應錯誤:",
        error.response.status,
        error.response.data,
      );
      errorMessage = `伺服器錯誤: ${error.response.status}, ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      console.error("請求無回應:", error.request);
      errorMessage = "無法連接到伺服器，請檢查網路連接或API是否可用";
    } else {
      console.error("請求錯誤:", error.message);
      errorMessage = `請求錯誤: ${error.message}`;
    }
    if (error.response && error.response.data) {
      const responseData = error.response.data;

      // 檢查特定的錯誤條件
      if (
        responseData.message &&
        responseData.message.includes("系統檢測到自動化行為")
      ) {
        errorMessage = "安全警告：系統檢測到自動化行為，請使用正常的瀏覽器操作";
      } else if (
        responseData.message &&
        responseData.message.includes("驗證已過期")
      ) {
        errorMessage = "驗證已過期，請重新驗證";
      }
    }

    return { status: "error", error: errorMessage, message: errorMessage };
  }
}

// ==================== 用戶界面函數 ====================
// 顯示「今天已經玩過」的提示
function showAlreadyPlayedMessage() {
  Swal.fire({
    title: "您今天已經占卜過了",
    text: "每人每天只能占卜一次，請明天再來！",
    icon: "info",
    confirmButtonText: "我知道了",
    confirmButtonColor: "#1890ff",

    // 在開發環境中添加重置按鈕
    showDenyButton: isDevelopment.value,
    denyButtonText: "開發模式：重置記錄",
    denyButtonColor: "#ff4d4f",
  }).then((result) => {
    if (result.isDenied) {
      clearPlayRecord();
    }
  });
}

// 顯示占卜結果
function showFortuneResult(fortuneData) {
  Swal.fire({
    title: fortuneData.title || "您的占卜結果",
    html: `
      <div class="divination-content">
        <p>${fortuneData.description || "您的運勢將會非常好！"}</p>
        <p>幸運數字: ${fortuneData.lucky_number || "8"}</p>
        <p>幸運顏色: ${fortuneData.lucky_color || "紅色"}</p>
      </div>
    `,
    imageUrl: fortuneData.image_url || "https://example.com/fortune-image.jpg",
    imageWidth: 200,
    imageHeight: 300,
    imageAlt: "占卜卡片",
    showCloseButton: true,
    confirmButtonText: "了解",
    confirmButtonColor: "#1890ff",
    backdrop: `rgba(0,0,123,0.4)`,
    customClass: {
      popup: "custom-popup-class",
      title: "custom-title-class",
      content: "custom-content-class",
    },
  }).then(() => {
    clearCookiesAfterDivination();
  });
}

// 登入後的驗證對話框
function showPostLoginVerificationDialog() {
  // 先檢查並保存當前的 auth token，避免後續操作丟失它
  const currentAuthToken = localStorage.getItem("fate2025_auth_token");
  if (currentAuthToken) {
    // 保存到 sessionStorage 作為備份
    sessionStorage.setItem("fate2025_auth_backup", currentAuthToken);
  }

  Swal.fire({
    title: "安全驗證",
    html: `
      <div class="verification-content">
        <p>請先完成下方安全驗證以繼續占卜</p>
        <div id="turnstile-container" class="turnstile-wrapper"></div>
        <button id="verify-continue-btn" class="continue-btn" disabled>繼續占卜</button>
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true,
    allowOutsideClick: false,
    didOpen: () => {
      // 載入 Turnstile
      loadTurnstileScript();

      // 綁定繼續按鈕事件
      const continueBtn = Swal.getPopup().querySelector("#verify-continue-btn");
      if (continueBtn) {
        continueBtn.addEventListener("click", () => {
          if (isTurnstileVerified.value && turnstileToken.value) {
            try {
              // 立即設置驗證成功狀態
              setVerificationSuccess();
              // 關閉彈窗
              Swal.close();
              // 執行占卜流程
              proceedToPerformDivination();
            } catch (e) {
              console.error("驗證成功處理錯誤:", e);
            }
          }
        });
      }
    },
    willClose: () => {
      // 清理 Turnstile
      if (
        typeof window !== "undefined" &&
        window.turnstile &&
        turnstileWidgetId.value
      ) {
        try {
          window.turnstile.remove(turnstileWidgetId.value);
        } catch (e) {}
      }
    },
  });
}

// 切換開發工具顯示
function toggleDebugTools() {
  showDebugTools.value = !showDebugTools.value;
}

// ==================== 調試功能 ====================
// 清除占卜記錄 (用於測試)
async function clearPlayRecord() {
  if (typeof window === "undefined") return;

  const udnmember = getCookieValue("udnmember") || "";
  const storageKey = udnmember
    ? `fate2025_last_played_${udnmember}`
    : "fate2025_last_played";

  localStorage.removeItem(storageKey);

  // 重要：立即更新占卜狀態
  hasPlayed.value = false;

  Swal.fire({
    toast: true,
    icon: "success",
    title: "占卜記錄已清除",
    position: "top-end",
    showConfirmButton: false,
    timer: 1500,
  });
}

// 檢查資料庫狀態
async function debugCheckDatabase() {
  try {
    const udnmember = getCookieValue("udnmember") || "";
    const um2 = getCookieValue("um2") || "";

    if (!udnmember) {
      Swal.fire({
        icon: "warning",
        title: "未登入",
        text: "請先登入以檢查資料庫記錄",
      });
      return;
    }

    // 顯示檢查中訊息
    Swal.fire({
      title: "檢查中...",
      text: "正在檢查資料庫記錄",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const apiUrl = getApiUrl("checkPlayStatus.php");

    console.log("檢查資料庫 API 路徑:", apiUrl);
    console.log("發送參數:", { udnmember, um2 });

    // 發送請求並帶上詳細的錯誤處理
    const response = await axios.post(
      apiUrl,
      { udnmember, um2 },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        timeout: 10000, // 設置10秒超時
      },
    );

    console.log("API 回應:", response.data);

    // 顯示結果
    Swal.fire({
      icon: "info",
      title: "資料庫檢查結果",
      html: `
        <pre style="text-align: left; margin: 15px 0; padding: 10px; background: #f5f5f5; overflow: auto;">
${JSON.stringify(response.data, null, 2)}
        </pre>
      `,
    });
  } catch (error) {
    console.error("檢查資料庫時發生錯誤:", error);

    // 提供更詳細的錯誤訊息
    let errorMessage = "未知錯誤";

    if (error.response) {
      // 伺服器回應了錯誤
      errorMessage = `服務器回應錯誤 (${error.response.status}): ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      // 請求已發出但沒有收到回應
      errorMessage = "無法連接到伺服器，請檢查網路連接或API是否可用";
    } else {
      // 請求設置有誤
      errorMessage = `請求錯誤: ${error.message}`;
    }

    Swal.fire({
      icon: "error",
      title: "檢查失敗",
      text: errorMessage,
      confirmButtonText: "了解",
    });
  }
}

// 重置資料庫 - 刪除所有記錄並重置 ID
async function resetDatabase() {
  if (typeof window === "undefined") return;

  const result = await Swal.fire({
    title: "確定要重置資料庫?",
    text: "這將刪除所有記錄並重置 ID！這個操作無法撤銷！",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "是，重置！",
    cancelButtonText: "取消",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
  });

  if (!result.isConfirmed) return;

  try {
    const apiUrl = getApiUrl("resetDatabase.php");

    // 發送重置請求，包含安全密鑰
    const response = await axios.post(
      apiUrl,
      { security_key: "reset2025fate" },
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    if (response.data.status === "success") {
      Swal.fire({
        title: "重置成功",
        text: "資料庫已成功重置。",
        icon: "success",
        confirmButtonText: "確定",
      });

      // 同時清除本地存儲
      localStorage.clear();

      // 重新載入頁面
      setTimeout(() => window.location.reload(), 1500);
    } else {
      throw new Error(response.data.message || "重置失敗");
    }
  } catch (error) {
    console.error("重置資料庫時發生錯誤:", error);
    Swal.fire({
      title: "重置失敗",
      text: `發生錯誤: ${error.message}`,
      icon: "error",
      confirmButtonText: "確定",
    });
  }
}

// 登出功能
function logout() {
  if (typeof window === "undefined") return;

  try {
    // 清除 cookie 的更全面方法
    const domains = [
      "", // 無域名版本
      window.location.hostname, // 當前域名
      `.${window.location.hostname}`, // 帶點的當前域名
      "udn.com", // 頂層域名
      ".udn.com", // 帶點的頂層域名
      "event.udn.com",
      "lab-event.udn.com",
    ];

    const paths = ["/", "/bd_fate2025", "/bd_fate2025_test"];
    const cookieNames = ["udnmember", "um2", "nickname", "fg_mail"];

    // 對每個可能的域名和路徑嘗試清除 cookie
    domains.forEach((domain) => {
      paths.forEach((path) => {
        cookieNames.forEach((name) => {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}${domain ? "; domain=" + domain : ""}`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}${domain ? "; domain=" + domain : ""}; secure`;
        });
      });
    });

    // 特別處理：清除所有 fate2025 相關的本地存儲
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes("fate2025")) {
        localStorage.removeItem(key);
      }
    }

    // 清除登入檢查標記
    sessionStorage.removeItem("login_checked");

    sessionStorage.clear();

    // 立即更新 UI 狀態
    hasPlayed.value = false;
    isTurnstileVerified.value = false;
    isLoggedIn.value = false;

    console.log("已清除所有登入相關狀態");
  } catch (e) {
    console.error("清除 Cookie 過程中發生錯誤:", e);
  }

  // 提示用戶
  Swal.fire({
    icon: "success",
    title: "登出成功",
    text: "您已成功登出系統",
    confirmButtonText: "確定",
  }).then(() => {
    // 使用更可靠的頁面刷新方法 - 設定不使用快取
    window.location.href =
      window.location.pathname + "?t=" + new Date().getTime();
  });
}
// 修改 clearCookiesAfterDivination 函數
function clearCookiesAfterDivination() {
  if (typeof window === "undefined") return;

  try {
    console.log("清除占卜後的 cookie...");

    // 保存用戶的 udnmember 以便仍然可以記錄他們今天已經占卜過
    const udnmember = getCookieValue("udnmember") || "";

    // 不同的方法清除 cookie
    const cookieNames = ["udnmember", "um2", "nickname", "fg_mail"];

    // 方法 1: 直接設置過期時間為過去
    cookieNames.forEach((name) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });

    // 方法 2: 使用更多的域名組合
    const domains = [
      window.location.hostname,
      `.${window.location.hostname}`,
      "udn.com",
      ".udn.com",
      "event.udn.com",
      ".event.udn.com",
      "lab-event.udn.com",
      ".lab-event.udn.com",
    ];

    const paths = ["/", "/bd_fate2025/", "/bd_fate2025_test/"];

    domains.forEach((domain) => {
      paths.forEach((path) => {
        cookieNames.forEach((name) => {
          // 透過設置空值和過期時間來清除 cookie
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
          // 同時嘗試帶 secure 屬性的版本
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; secure`;
        });
      });
    });

    // 方法 3: 對於 UDN 域名的特殊處理
    cookieNames.forEach((name) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.udn.com`;
    });

    // 特別處理：清除驗證相關的資料，但保留已占卜記錄
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // 不清除該用戶的占卜記錄
      if (key && key.includes("fate2025") && !key.includes("last_played")) {
        keysToRemove.push(key);
      }
    }

    // 避免在迭代過程中修改集合
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    // 清除登入檢查標記
    sessionStorage.removeItem("login_checked");

    // 新增: 清除流程標記
    localStorage.removeItem("fate2025_normal_flow");

    // 清除 session storage (同樣收集後再刪除)
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      sessionKeysToRemove.push(key);
    }

    sessionKeysToRemove.forEach((key) => {
      sessionStorage.removeItem(key);
    });

    // 更新 UI 狀態，但保留已占卜狀態
    isTurnstileVerified.value = false;
    isLoggedIn.value = false;

    console.log("已清除占卜後的 cookie 和認證資料");
  } catch (e) {
    console.error("清除 Cookie 過程中發生錯誤:", e);
  }
}
// ==================== 生命週期鉤子 ====================
onMounted(async () => {
  // 設置 Shift + D 組合鍵顯示開發工具
  const handleKeyDown = (event) => {
    if (event.shiftKey && event.key === "D") {
      toggleDebugTools();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // 初始化: 更新登入狀態
  updateLoginStatus();

  // 設置定期檢查登入狀態
  const loginCheckInterval = setInterval(updateLoginStatus, 5000);

  // 初始化占卜狀態
  try {
    await updatePlayedStatus();

    // 新增: 如果已登入並且今天已經占卜過，立即顯示提示
    if (isLoggedIn.value && hasPlayed.value) {
      console.log("檢測到用戶今天已經占卜過了");
      showAlreadyPlayedMessage();
      return;
    }
  } catch (err) {
    console.error("更新占卜狀態錯誤:", err);
  }

  // 從 localStorage 中讀取驗證狀態
  if (typeof window !== "undefined") {
    isTurnstileVerified.value =
      localStorage.getItem("fate2025_verified") === "true";
  }

  // 檢查用戶是否剛剛登入成功
  const isNewlyLoggedIn =
    isLoggedIn.value && !sessionStorage.getItem("login_checked");

  // 只要用戶登入了，就檢查他們是否走了正確的流程
  if (isLoggedIn.value) {
    // 標記已經檢查過登入狀態
    sessionStorage.setItem("login_checked", "true");

    // 檢查是否通過正常流程登入
    const isNormalFlow =
      localStorage.getItem("fate2025_normal_flow") === "true";

    // 如果沒有通過正確流程但已經登入，顯示提示
    if (!isNormalFlow) {
      console.log("檢測到用戶不是從正常流程登入");

      Swal.fire({
        icon: "warning",
        title: "請使用正確的占卜流程",
        text: "請從活動首頁點擊「立即占卜」按鈕來完成占卜流程，直接使用登入網址將無法取得占卜結果。",
        confirmButtonText: "我知道了",
        confirmButtonColor: "#1890ff",
      });

      return;
    }
  }

  // 檢查是否從會員登入跳轉回來
  const justLoggedIn =
    sessionStorage.getItem("fate2025_just_logged_in") === "true";

  // 原有的登入後流程檢查邏輯保持不變
  if (justLoggedIn && isLoggedIn.value) {
    console.log("檢測到從登入頁面返回");

    // 檢查是否有備份的令牌需要還原
    if (
      !localStorage.getItem("fate2025_auth_token") &&
      sessionStorage.getItem("fate2025_auth_token")
    ) {
      console.log("從 sessionStorage 恢復安全令牌");
      localStorage.setItem(
        "fate2025_auth_token",
        sessionStorage.getItem("fate2025_auth_token"),
      );
    }

    // 檢查是否使用了正確的流程
    const isNormalFlow =
      localStorage.getItem("fate2025_normal_flow") === "true";

    if (!isNormalFlow) {
      Swal.fire({
        icon: "warning",
        title: "請使用正確的占卜流程",
        text: "請從活動首頁點擊「立即占卜」按鈕來完成占卜流程，直接使用登入網址將無法取得占卜結果。",
        confirmButtonText: "我知道了",
        confirmButtonColor: "#1890ff",
      }).then(() => {
        window.location.href =
          window.location.origin + window.location.pathname;
      });

      // 清除登入標記
      sessionStorage.removeItem("fate2025_just_logged_in");
      localStorage.removeItem("fate2025_auth_token");
      sessionStorage.removeItem("fate2025_auth_token");
      return;
    }

    try {
      // 等待檢查占卜狀態
      const alreadyPlayed = await hasPlayedToday();

      // 如果已經占卜過，顯示提示訊息
      if (alreadyPlayed) {
        showAlreadyPlayedMessage();
        return;
      }

      // 如果還沒有占卜過且已經通過驗證，進行占卜
      const verified = await checkSecurityVerification();

      if (verified) {
        proceedToPerformDivination();
      } else {
        // 需要再次驗證
        showPostLoginVerificationDialog();
      }
    } catch (error) {
      console.error("登入後流程錯誤:", error);
      Swal.fire({
        icon: "error",
        title: "系統錯誤",
        text: "執行占卜流程時發生錯誤: " + (error.message || "未知錯誤"),
        confirmButtonText: "確定",
      });
    }
  }

  // 組件卸載時移除事件監聽器和清理定時器
  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeyDown);
    clearInterval(loginCheckInterval);
  });
});
</script>

<style lang="scss" scoped>
.divination-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.title {
  font-size: 32px;
  color: #d4380d;
  margin-bottom: 20px;
}

.description {
  font-size: 18px;
  margin-bottom: 30px;
  color: #666;
}

.fortune-btn {
  display: inline-block;
  padding: 15px 30px;
  background-color: #ff7a45;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 122, 69, 0.4);

  &:hover {
    background-color: #fa541c;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 122, 69, 0.5);
  }
}

/* 開發工具樣式 */
.debug-tools {
  margin-top: 50px;
  padding: 15px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #f5f5f5;
  text-align: left;

  h3 {
    margin-top: 0;
    color: #666;
    font-size: 18px;
  }

  .danger {
    background-color: #d33 !important;
    color: white !important;
  }

  .danger:hover {
    background-color: #c22 !important;
  }

  .debug-actions {
    margin: 15px 0;
    display: flex;
    gap: 10px;
  }

  .debug-btn {
    padding: 8px 16px;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &.logout {
      background-color: #ff4d4f;
    }

    &:hover {
      opacity: 0.9;
    }
  }

  .debug-info {
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;

    p {
      margin: 5px 0;
    }
  }

  .shortcut-info {
    font-size: 12px;
    color: #999;
    font-style: italic;
  }
}

/* Turnstile 驗證相關樣式 */
:global(.verification-content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0;
}

:global(.turnstile-wrapper) {
  margin: 15px auto;
  min-height: 65px;
}

:global(.continue-btn) {
  margin-top: 15px;
  padding: 8px 20px;
  background-color: #d9d9d9;
  color: #666;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: not-allowed;
  transition: all 0.3s;

  &:global(.verified) {
    background-color: #1890ff;
    color: white;
    cursor: pointer;

    &:hover {
      background-color: #40a9ff;
    }
  }
}

/* SweetAlert2 自訂樣式 */
:global(.custom-popup-class) {
  font-family: "Microsoft JhengHei", sans-serif;
  border-radius: 15px;
}

:global(.divination-content) {
  padding: 15px;
  text-align: center;
}
</style>
