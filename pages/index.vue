<template>
  <!-- <Banner @startDivination="startDivination" :loginUrl="loginUrl" /> -->
  <div class="divination-container">
    <!-- <PlayCount
      :count="totalPlayCount"
      @milestone-achieved="handleMilestoneAchieved"
    />
    <Act_area />
    <Notice_popup />
    <ToTop /> -->

    <!-- 占卜結果彈窗 -->
    <!-- <Fortune_result_popup
      :is-visible="showFortuneResultPopup"
      :fortune-data="fortuneResultData"
      :custom-message="fortuneCustomMessage"
      @close="closeFortune"
    /> -->
    <!-- 已經占卜過的彈窗 -->
    <!-- <Already_played_popup
      :is-visible="showAlreadyPlayedPopup"
      :already-played-data="alreadyPlayedData"
      :total-play-count="totalPlayCount"
      :is-development="isDevelopment"
      @close="closeAlreadyPlayedPopup"
      @clear-record="clearPlayRecord"
    /> -->
    <!-- 加載中彈窗 -->
    <!-- <Loading_popup
      :is-visible="showLoadingPopup"
      :loading-data="loadingData"
      @close="closeLoadingPopup"
    /> -->
    <!-- 驗證彈窗 -->
    <!-- <Verification_popup
      :is-visible="showVerificationPopup"
      @close="closeVerificationPopup"
      @opened="onVerificationPopupOpened"
    /> -->
    <!-- 通用彈窗 -->
    <!-- <Universal_popup
      :is-visible="showUniversalPopup"
      :popup-data="universalPopupData"
      @close="closeUniversalPopup"
      @confirm="handleUniversalConfirm"
      @cancel="handleUniversalCancel"
    /> -->

    <!-- 開發工具區域 - 按 Shift+D 顯示 -->
    <!-- <div v-if="showDebugTools" class="debug-tools">
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
    </div> -->
    <Questionnaire />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import Swal from "sweetalert2";
import axios from "axios";
import Banner from "../components/Banner.vue";
import PlayCount from "../components/PlayCount.vue";
import Act_area from "../components/Act_area.vue";
import ToTop from "../components/ToTop.vue";
import Notice_popup from "../components/Notice_popup.vue";
import Fortune_result_popup from "../components/Fortune_result_popup.vue";
import Already_played_popup from "../components/Already_played_popup.vue";
import Loading_popup from "../components/Loading_popup.vue";
import Verification_popup from "../components/Verification_popup.vue";
import Universal_popup from "../components/Universal_popup.vue";

import Questionnaire from "../components/Questionnaire.vue";

// ==================== 基本狀態管理 ====================
const config = useRuntimeConfig();
const showDebugTools = ref(false);
const turnstileToken = ref(null);
const turnstileWidgetId = ref(null);
const isTurnstileVerified = ref(false);
const hasPlayed = ref(false);
const isLoggedIn = ref(false);
const totalPlayCount = ref(0);
const milestones = [1, 2, 3, 4, 5];
let lastAchievedMilestone = ref(0);
const showFortuneResultPopup = ref(false);

//測試彈窗
const fortuneResultData = ref({});
const fortuneCustomMessage = ref("");
const showAlreadyPlayedPopup = ref(false);
const alreadyPlayedData = ref({});
const showLoadingPopup = ref(false);
const loadingData = ref({});
const showVerificationPopup = ref(false);
const showUniversalPopup = ref(false);
const universalPopupData = ref({});

if (process.dev) {
  onMounted(() => {
    window.showFortuneResult = showFortuneResult;
    window.showAlreadyPlayedMessage = showAlreadyPlayedMessage;
    window.generateFortuneResult = generateFortuneResult;
    window.showLoadingPopup = showLoadingPopup;
    window.closeLoadingPopup = closeLoadingPopup;
    window.showUniversalPopup = showUniversalPopup;
    window.closeUniversalPopup = closeUniversalPopup;
    window.showUniversalDialog = showUniversalDialog;
    // 添加 Universal 彈窗測試函數
    window.testApiError = () => {
      showUniversalDialog({
        icon: "err  r",
        title: "占卜失敗",
        text: "測試：伺服器錯誤，請稍後再試",
        confirmButtonText: "確定",
        showCancelButton: true,
        cancelButtonText: "重新嘗試",
      }).then((modalResult) => {
        if (modalResult.isDismissed || modalResult.dismiss === "cancel") {
          console.log("用戶選擇重新嘗試");
        }
      });
    };

    window.testRobotFail = () => {
      showUniversalDialog({
        icon: "warning",
        title: "機器人驗證失敗",
        text: "請重新進行驗證",
        confirmButtonText: "重新驗證",
        showCancelButton: false,
      }).then(() => {
        console.log("機器人驗證失敗測試完成");
      });
    };

    window.testAutomationDetection = () => {
      showUniversalDialog({
        icon: "error",
        title: "安全警告",
        text: "系統檢測到自動化行為，請勿使用機器人或腳本，請使用正常瀏覽器操作。",
        confirmButtonText: "重新驗證",
        showCancelButton: false,
      }).then(() => {
        console.log("自動化行為檢測測試完成");
      });
    };

    window.testSystemError = () => {
      showUniversalDialog({
        icon: "error",
        title: "系統錯誤",
        text: "啟動占卜流程時發生錯誤，請稍後再試",
      });
    };

    window.testSecurityFail = () => {
      showUniversalDialog({
        icon: "warning",
        title: "安全驗證失敗",
        text: "驗證已過期，需要重新開始占卜流程",
        confirmButtonText: "重新開始",
        showCancelButton: false,
      }).then(() => {
        console.log("安全驗證失敗測試完成");
      });
    };

    window.testWrongFlow = () => {
      showUniversalDialog({
        icon: "warning",
        title: "請使用正確的占卜流程",
        text: "請從活動首頁點擊「立即占卜」按鈕來完成占卜流程，直接使用登入網址將無法取得占卜結果。",
        confirmButtonText: "我知道了",
        showCancelButton: false,
      });
    };

    window.testInvalidFlow = () => {
      showUniversalDialog({
        icon: "warning",
        title: "請注意",
        text: "建議從活動首頁點擊「立即占卜」按鈕開始。您要繼續嗎？",
        confirmButtonText: "繼續占卜",
        showCancelButton: true,
        cancelButtonText: "返回首頁",
      }).then((result) => {
        if (result.isConfirmed) {
          console.log("用戶選擇繼續占卜");
        } else {
          console.log("用戶選擇返回首頁");
        }
      });
    };
    window.showVerificationPopup = showVerificationPopup;
    window.testVerificationPopup = () => {
      showVerificationPopup.value = true;
      console.log("顯示驗證彈窗:", showVerificationPopup.value);
    };

    window.closeVerificationPopupTest = () => {
      showVerificationPopup.value = false;
      console.log("關閉驗證彈窗:", showVerificationPopup.value);
    };
  });
}

// 創建統一的彈窗顯示函數
function showUniversalDialog(options) {
  universalPopupData.value = {
    icon: options.icon || null,
    title: options.title || "",
    text: options.text || "",
    html: options.html || "",
    showConfirmButton: options.showConfirmButton !== false,
    showCancelButton: options.showCancelButton || false,
    confirmButtonText: options.confirmButtonText || "確定",
    cancelButtonText: options.cancelButtonText || "取消",
    allowOutsideClick: options.allowOutsideClick !== false,
    showCloseButton: options.showCloseButton !== false,
  };

  showUniversalPopup.value = true;

  return new Promise((resolve) => {
    const handleClose = (result) => {
      showUniversalPopup.value = false;
      resolve(result);
    };

    window._universalPopupResolve = handleClose;
  });
}

// 關閉彈窗的函數
const closeUniversalPopup = () => {
  showUniversalPopup.value = false;
};

const handleUniversalConfirm = () => {
  if (window._universalPopupResolve) {
    window._universalPopupResolve({ isConfirmed: true });
  }
};

const handleUniversalCancel = () => {
  if (window._universalPopupResolve) {
    window._universalPopupResolve({ isDismissed: true, dismiss: "cancel" });
  }
};

const fortuneResults = ref([
  {
    id: "fortune_1",
    title: "心型煙火 | 幸運指數:91%",
    description:
      "今日你愛情能量報表!特別適合告白、約會，\n你的魅力讓你閃閃發光。",
    image_url: "./imgs/heart.png",
    weight: 20,
  },
  {
    id: "fortune_2",
    title: "金浪煙火 | 幸運指數:88%",
    description:
      "財務上有不錯的直覺和機會，適合投資、\n做小額理財規劃。也有機會獲得意外之財或小獎喔!",
    image_url: "./imgs/goldwave.png",
    weight: 20,
  },
  {
    id: "fortune_3",
    title: "療癒煙火 | 幸運指數:75%",
    description:
      "今天適合慢下腳步，讓身心放鬆，\n多親近自然或早點休息，補充滿滿能量!",
    image_url: "./imgs/healing.png",
    weight: 40,
  },
  {
    id: "fortune_4",
    title: "金光煙火 | 幸運指數:80%",
    description:
      "你的工作運極佳，有重要會議或報告時表現亮眼，\n適合發展實力的好日子。",
    image_url: "./imgs/goldlight.png",
    weight: 20,
  },
]);

// 判斷是否為開發環境
const isDevelopment = computed(() => {
  return import.meta.env?.DEV || false;
});

// Cloudflare Turnstile 配置
const TURNSTILE_SITE_KEY = config.public.turnstileSiteKey;

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

  const hostname = window.location.hostname;

  const allowedHosts = ["lab-event.udn.com", "event.udn.com", "localhost"];

  let redirectUrl;
  if (hostname === "lab-event.udn.com") {
    redirectUrl = "https://lab-event.udn.com/bd_fate2025_test/";
  } else if (hostname === "event.udn.com") {
    redirectUrl = "https://event.udn.com/bd_fate2025/";
  } else if (
    allowedHosts.includes(hostname) ||
    hostname.startsWith("localhost")
  ) {
    redirectUrl = "https://lab-event.udn.com/bd_fate2025_test/";
  } else {
    redirectUrl = "https://lab-event.udn.com/bd_fate2025_test/";
  }

  return `https://member.udn.com/member/login.jsp?site=bd_fate2025&again=y&redirect=${redirectUrl}`;
});

// URL 安全驗證函數
function isUrlSafe(url) {
  try {
    const urlObj = new URL(url);
    const allowedHosts = [
      "member.udn.com",
      "lab-event.udn.com",
      "event.udn.com",
    ];

    if (urlObj.protocol !== "https:") {
      return false;
    }

    if (!allowedHosts.includes(urlObj.hostname)) {
      return false;
    }

    const allowedPaths = [
      "/member/login.jsp",
      "/bd_fate2025/",
      "/bd_fate2025_test/",
    ];

    const isValidPath = allowedPaths.some((path) =>
      urlObj.pathname.startsWith(path),
    );

    if (!isValidPath) {
      return false;
    }

    return true;
  } catch (e) {
    console.error("URL 驗證錯誤:", e);
    return false;
  }
}

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
    setTimeout(renderTurnstile, 100);
  }
}

// 渲染 Turnstile 驗證
function renderTurnstile() {
  if (typeof window === "undefined" || !window.turnstile) return;

  const container = document.getElementById("turnstile-container");
  if (!container) return;

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
      theme: "dark",
      callback: function (token) {
        console.log(
          "Turnstile 驗證成功，取得 token:",
          token.substring(0, 10) + "...",
        );

        turnstileToken.value = token;
        isTurnstileVerified.value = true;
        window.temp_turnstile_token = token;
        localStorage.setItem("turnstile_token", token);

        setVerificationSuccess();
        closeVerificationPopup();
        proceedToPerformDivination();
      },
      "expired-callback": function () {
        console.warn("Turnstile token 已過期");
        turnstileToken.value = null;
        isTurnstileVerified.value = false;
        window.temp_turnstile_token = null;
        localStorage.removeItem("turnstile_token");
      },
    });
  } catch (error) {
    console.error("Turnstile 渲染錯誤:", error);
  }
}

// 設置驗證成功狀態
function setVerificationSuccess() {
  if (typeof window === "undefined") return;
  isTurnstileVerified.value = true;
}

// ==================== 安全令牌管理模組 ====================
const securityManager = {
  flow: {
    // 生成和儲存流程令牌
    async generate() {
      try {
        const apiUrl = getApiUrl("auth_token.php");
        console.log("正在獲取流程安全令牌...");

        const response = await axios.get(apiUrl, {
          withCredentials: true,
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });

        if (response.data.status !== "success") {
          throw new Error("無法生成流程令牌");
        }

        const token = response.data.token;
        localStorage.setItem("fate2025_flow_token", token);
        const expiryTime = Date.now() + 5 * 60 * 1000;
        localStorage.setItem("fate2025_flow_token_expiry", String(expiryTime));

        console.log("流程令牌獲取成功:", token.substring(0, 10) + "...");
        localStorage.setItem("fate2025_flow_token_expiry", String(expiryTime));

        console.log("流程令牌獲取成功:", token.substring(0, 10) + "...");
        return token;
      } catch (error) {
        console.error("生成流程令牌錯誤:", error);
        throw error;
      }
    },

    // 獲取已存儲的流程令牌
    get() {
      const token = localStorage.getItem("fate2025_flow_token");
      const expiryTime = parseInt(
        localStorage.getItem("fate2025_flow_token_expiry") || "0",
      );

      const graceTime = 2 * 60 * 1000;

      if (expiryTime + graceTime < Date.now()) {
        console.warn("流程令牌已過期");
        this.clear();
        return null;
      }

      return token;
    },

    // 清除流程令牌
    clear() {
      localStorage.removeItem("fate2025_flow_token");
      localStorage.removeItem("fate2025_flow_token_expiry");
    },
  },

  clearAll() {
    this.flow.clear();
  },
};

// ==================== 占卜相關功能 ====================
// 檢查用戶今天是否已經占卜過
async function hasPlayedToday() {
  if (typeof window === "undefined") return false;

  const udnmember = getCookieValue("udnmember") || "";
  const um2 = getCookieValue("um2") || "";

  if (!udnmember || !um2) {
    console.log("用戶未登入，無法檢查占卜狀態");
    return false;
  }

  try {
    const apiUrl = getApiUrl("checkPlayStatus.php");
    console.log("從資料庫檢查占卜狀態...");

    const requestData = { udnmember, um2 };

    const response = await axios.post(apiUrl, requestData, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    if (
      response.data.status === "success" &&
      response.data.played_today === true
    ) {
      console.log("資料庫確認：用戶今天已占卜過");
      return true;
    }

    console.log("資料庫確認：用戶今天尚未占卜");
    return false;
  } catch (error) {
    console.error("檢查占卜狀態時發生錯誤:", error);
    return false;
  }
}

// 更新已玩過狀態
async function updatePlayedStatus() {
  if (!isLoggedIn.value) {
    hasPlayed.value = false;
    return;
  }
  hasPlayed.value = await hasPlayedToday();
}

// 記錄用戶今天已占卜
function recordPlayToday() {
  if (typeof window === "undefined") return;
  hasPlayed.value = true;
  console.log("占卜記錄已更新至資料庫");
}

// 檢查並顯示成就達成訊息 - 只在首次占卜時顯示
function checkMilestoneAchievement(newCount, oldCount, isFirstTime) {
  const newAchieved = milestones.find((m) => oldCount < m && newCount >= m);

  if (newAchieved && newAchieved > lastAchievedMilestone.value && isFirstTime) {
    lastAchievedMilestone.value = newAchieved;
  } else {
    if (newAchieved && newAchieved > lastAchievedMilestone.value) {
      lastAchievedMilestone.value = newAchieved;
    }
  }
}

// 處理里程碑達成
function handleMilestoneAchieved(milestone) {
  console.log(`達成里程碑: ${milestone.count} - ${milestone.prize}`);

  if (milestone.count > lastAchievedMilestone.value) {
    lastAchievedMilestone.value = milestone.count;
  }
}

// 產生占卜結果
function generateFortuneResult() {
  // 計算權重總和
  const totalWeight = fortuneResults.value.reduce(
    (sum, fortune) => sum + fortune.weight,
    0,
  );

  // 產生隨機數
  const randomBytes = new Uint32Array(1);
  crypto.getRandomValues(randomBytes);
  const randomValue = (randomBytes[0] % totalWeight) + 1;

  // 根據權重選擇結果
  let currentWeight = 0;
  for (const fortune of fortuneResults.value) {
    currentWeight += fortune.weight;
    if (randomValue <= currentWeight) {
      // 回傳一個拷貝，去掉 weight 欄位
      const result = { ...fortune };
      delete result.weight;
      return result;
    }
  }

  // 預設情況下返回第一個結果
  const defaultResult = { ...fortuneResults.value[0] };
  delete defaultResult.weight;
  return defaultResult;
}
// 處理成功占卜的輔助函數
async function handleSuccessfulDivination(result) {
  console.log("=== 處理成功的占卜結果 ===");

  securityManager.flow.clear();
  localStorage.removeItem("temp_turnstile_token");

  // 更新占卜次數
  const oldCount = totalPlayCount.value;
  if (result.db_info && result.db_info.play_times_total !== undefined) {
    totalPlayCount.value = parseInt(result.db_info.play_times_total);
    console.log("累計占卜次數更新為:", totalPlayCount.value);
  } else {
    totalPlayCount.value++;
    console.log("本地更新累計占卜次數為:", totalPlayCount.value);
  }

  const isFirstTime = result.message && result.message.includes("首次占卜成功");
  console.log("是否首次占卜:", isFirstTime);

  checkMilestoneAchievement(totalPlayCount.value, oldCount, isFirstTime);

  recordPlayToday();

  const fortuneData = generateFortuneResult();

  const resultMap = {
    fortune_1: "heart",
    fortune_2: "goldwave",
    fortune_3: "healing",
    fortune_4: "goldlight",
  };

  const shareResultType = resultMap[fortuneData.id] || "heart";
  localStorage.setItem("last_fortune_result", shareResultType);

  console.log("占卜結果:", fortuneData);

  // 根據占卜次數生成對應訊息
  let resultMessage = generateResultMessage(totalPlayCount.value);
  console.log("生成的結果訊息:", resultMessage);

  notifyOtherTabs();

  // 顯示占卜結果
  console.log("準備顯示占卜結果彈窗");
  showFortuneResult(fortuneData, resultMessage);

  // 更新狀態
  await updatePlayedStatus();

  console.log("=== 占卜流程完成 ===");
}

// 生成結果訊息
function generateResultMessage(playCount) {
  if (playCount === 1) {
    return "<div class='glowing-message'><span class='glowing-message-title'>占卜完成!</span><br>恭喜獲得 LINE Points 5點抽獎資格！</div>";
  } else if (playCount >= 2 && playCount <= 4) {
    return "<div class='glowing-message'><span class='glowing-message-title'>占卜完成!</span><br>明天可以再來占卜</div>";
  } else if (playCount >= 5) {
    return "<div class='glowing-message'><span class='glowing-message-title'>太棒了，占卜完成！</span><br>祝您有美好的一天</div>";
  }
  return "<div class='glowing-message'>占卜完成！</div>";
}

// ==================== 簡單跨分頁同步 ====================
// 監聽其他分頁的占卜完成
function initSimpleSync() {
  window.addEventListener("storage", (event) => {
    if (event.key === "fate2025_divination_sync") {
      const data = JSON.parse(event.newValue || "{}");
      console.log("檢測到其他分頁完成占卜");

      // 簡單更新狀態
      hasPlayed.value = true;
      if (data.totalCount) {
        totalPlayCount.value = data.totalCount;
      }

      // 顯示已占卜過訊息
      setTimeout(() => {
        showAlreadyPlayedMessage();
      }, 1000);
    }
  });
}

// 通知其他分頁占卜完成
function notifyOtherTabs() {
  localStorage.setItem(
    "fate2025_divination_sync",
    JSON.stringify({
      completed: true,
      totalCount: totalPlayCount.value,
      timestamp: Date.now(),
    }),
  );
}

// ==================== 流程控制函數 ====================
// 1. 占卜流程啟動函數
async function startDivination() {
  try {
    if (typeof window === "undefined") return;

    // 顯示處理中訊息
    loadingData.value = {
      message: "處理中...",
      subMessage: "正在準備占卜流程",
    };
    showLoadingPopup.value = true;

    // 1. 先更新狀態
    await updatePlayedStatus();

    // 2. 檢查用戶今天是否已經占卜過
    if (hasPlayed.value) {
      closeLoadingPopup();
      showAlreadyPlayedMessage();
      return;
    }

    // 3. 生成流程安全令牌
    await securityManager.flow.generate();

    // 4. 設置流程標記 - 只使用 localStorage
    localStorage.setItem("fate2025_just_logged_in", "true");
    localStorage.setItem("fate2025_normal_flow", "true");

    closeLoadingPopup();

    // // 跳轉到登入頁面
    // const targetUrl = loginUrl.value;
    // if (isUrlSafe(targetUrl)) {
    //   window.location.href = targetUrl;
    //   // window.open(targetUrl, "_blank");
    // } else {
    //   throw new Error("不安全的重定向 URL");
    // }
    return true;
  } catch (error) {
    console.error("占卜流程錯誤:", error);
    closeLoadingPopup();
    showUniversalDialog({
      icon: "error",
      title: "系統錯誤",
      text: "啟動占卜流程時發生錯誤，請稍後再試",
    });
  }
}
const closeLoadingPopup = () => {
  showLoadingPopup.value = false;
};

// 2. 驗證成功後執行占卜流程
async function proceedToPerformDivination() {
  try {
    console.log("=== 開始執行占卜流程 ===");

    // 清除登入標記，確保一次性使用
    localStorage.removeItem("fate2025_just_logged_in");

    // 步驟1: 檢查流程安全令牌
    console.log("檢查流程安全令牌...");
    const flowToken = securityManager.flow.get();

    if (!flowToken) {
      console.error("流程安全令牌不存在或已過期");
      showUniversalDialog({
        icon: "warning",
        title: "安全驗證失敗",
        text: "驗證已過期，需要重新開始占卜流程",
        confirmButtonText: "重新開始",
        showCancelButton: false,
      }).then(() => {
        startDivination();
      });
      return;
    }

    // 步驟2: 檢查 Turnstile token（非開發環境）
    console.log("檢查 Turnstile token...");
    if (!turnstileToken.value && !isDevelopment.value) {
      console.error("Turnstile token 不存在，需要重新驗證");
      showPostLoginVerificationDialog();
      return;
    }

    // 步驟3: 顯示占卜進行中的提示
    console.log("開始占卜處理...");
    loadingData.value = {
      message: "占卜中...",
    };
    showLoadingPopup.value = true;

    // 步驟4: 調用 API 保存用戶數據
    console.log("正在發送占卜資料...");
    const result = await saveUserData();

    closeLoadingPopup();

    console.log("API 回應結果:", result);

    // 步驟5: 處理 API 回應
    if (result.status === "error") {
      await handleApiError(result);
      return;
    }

    // 步驟6: 處理成功的占卜結果
    if (result.status === "success") {
      await handleSuccessfulDivination(result);
    }
  } catch (error) {
    console.error("占卜流程執行錯誤:", error);
    closeLoadingPopup();
    showUniversalDialog({
      icon: "error",
      title: "系統錯誤",
      text: "啟動占卜流程時發生錯誤，請稍後再試",
    }).then((result) => {
      if (result.isDismissed) {
        showPostLoginVerificationDialog();
      }
    });
  }
}
// 3. 保存用戶數據到資料庫
async function saveUserData() {
  try {
    console.log("開始執行 saveUserData 函數");

    // 檢查 turnstile token 存在性
    const turnstileTokenValue =
      turnstileToken.value ||
      localStorage.getItem("temp_turnstile_token") ||
      null;

    console.log("Turnstile Token 狀態:", !!turnstileTokenValue);

    if (!turnstileTokenValue && !isDevelopment.value) {
      console.error("缺少 Turnstile Token");
      throw new Error("機器人驗證資料不完整，請重新驗證");
    }

    // 獲取流程令牌
    const flowToken = securityManager.flow.get();
    if (!flowToken && !isDevelopment.value) {
      throw new Error("流程驗證失效，請重新開始占卜");
    }

    const apiUrl = getApiUrl("saveUserData.php");
    console.log("使用的 API 路徑:", apiUrl);

    // 從 cookie 中取得會員資料
    const udnmember = getCookieValue("udnmember") || "";
    const um2 = getCookieValue("um2") || "";
    let email = udnmember || `user_${Date.now()}@example.com`;

    const userData = {
      udnmember: sanitizeInput(udnmember),
      um2: sanitizeInput(um2),
      email: sanitizeInput(email),
      flow_token: flowToken,
      turnstile_token: turnstileTokenValue || null,
    };

    console.log("準備發送的用戶數據:", userData);

    console.log("開始發送 API 請求...");
    const response = await axios.post(apiUrl, userData, {
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      withCredentials: true,
      timeout: 30000,
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

// 處理 API 錯誤的輔助函數
async function handleApiError(result) {
  console.log("處理 API 錯誤:", result);

  // 只有在明確收到 already_played = true 時才設置為已占卜
  if (result.already_played === true) {
    console.log("用戶今天已經占卜過了");

    // 清理令牌
    securityManager.flow.clear();
    localStorage.removeItem("temp_turnstile_token");

    // 更新占卜次數
    if (result.db_info && result.db_info.play_times_total !== undefined) {
      totalPlayCount.value = parseInt(result.db_info.play_times_total);
      console.log("更新累計占卜次數為:", totalPlayCount.value);
    }

    // 只有在確認已占卜時才更新狀態
    hasPlayed.value = true;

    // 顯示已占卜過的訊息
    showAlreadyPlayedMessage();
    return;
  }

  // 機器人驗證失敗
  if (result.message && result.message.includes("機器人驗證失敗")) {
    console.log("機器人驗證失敗，要求重新驗證");
    showUniversalDialog({
      icon: "warning",
      title: "機器人驗證失敗",
      text: "請重新進行驗證",
      confirmButtonText: "重新驗證",
      showCancelButton: false,
    }).then(() => {
      showPostLoginVerificationDialog();
    });
    return;
  }

  // 自動化行為檢測
  if (result.message && result.message.includes("系統檢測到自動化行為")) {
    console.log("檢測到自動化行為");
    showUniversalDialog({
      icon: "error",
      title: "安全警告",
      text: "系統檢測到自動化行為，請勿使用機器人或腳本，請使用正常瀏覽器操作。",
      confirmButtonText: "重新驗證",
      showCancelButton: false,
    }).then(() => {
      showPostLoginVerificationDialog();
    });
    return;
  }

  console.log("其他 API 錯誤，不更新占卜狀態:", result.message);
  showUniversalDialog({
    icon: "error",
    title: "占卜失敗",
    text: result.message || "伺服器錯誤，請稍後再試",
    confirmButtonText: "確定",
    showCancelButton: true,
    cancelButtonText: "重新嘗試",
  }).then((modalResult) => {
    if (modalResult.isDismissed || modalResult.dismiss === "cancel") {
      showPostLoginVerificationDialog();
    }
  });
}

// ========== XSS 和 Script 注入防護函數 ==========
function sanitizeInput(input) {
  if (!input || typeof input !== "string") {
    return input;
  }

  return input
    .replace(/<[^>]*>/g, "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/\bon\w+\s*=/gi, "")
    .replace(/&lt;script/gi, "")
    .replace(/&lt;\/script/gi, "")
    .substring(0, 200);
}

// ==================== 用戶界面函數 ====================
// 顯示「今天已經玩過」的提示，區分是否為新會員首日占卜
function showAlreadyPlayedMessage() {
  const udnmember = getCookieValue("udnmember") || "";

  let imgUrl = "";
  let message = "";

  if (totalPlayCount.value < 5) {
    imgUrl = "./imgs/one_four.png";
  } else {
    imgUrl = "./imgs/five.png";
  }

  if (totalPlayCount.value === 1) {
    message =
      "恭喜獲得 LINE Points 5點抽獎\n(送完為止)兌換序號將於活動後寄送。";
  }

  alreadyPlayedData.value = {
    image_url: imgUrl,
    message: message,
    reminder:
      "小提醒: 天天能占卜，還可抽65吋LED電視、\n Dyson、咖啡機等好禮喔!",
  };

  showAlreadyPlayedPopup.value = true;
}

// 關閉已占卜過彈窗的函數
const closeAlreadyPlayedPopup = () => {
  showAlreadyPlayedPopup.value = false;
};

// 顯示占卜結果
function showFortuneResult(fortuneData, customResultMessage) {
  fortuneResultData.value = fortuneData;
  fortuneCustomMessage.value =
    customResultMessage || "<div class='glowing-message'>占卜已完成！</div>";

  showFortuneResultPopup.value = true;
}

// 關閉占卜結果彈窗的函數
const closeFortune = () => {
  showFortuneResultPopup.value = false;
  clearCookiesAfterDivination();
};

// 登入後的驗證對話框
function showPostLoginVerificationDialog() {
  showVerificationPopup.value = true;
}
// 關閉驗證彈窗的函數
const closeVerificationPopup = () => {
  showVerificationPopup.value = false;

  if (
    typeof window !== "undefined" &&
    window.turnstile &&
    turnstileWidgetId.value
  ) {
    try {
      window.turnstile.remove(turnstileWidgetId.value);
      turnstileWidgetId.value = null;
    } catch (e) {
      console.error("清理 Turnstile 時發生錯誤:", e);
    }
  }
};

// 驗證彈窗開啟時的處理
const onVerificationPopupOpened = () => {
  loadTurnstileScript();
};

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
}

// 檢查資料庫狀態
async function debugCheckDatabase() {
  try {
    const udnmember = getCookieValue("udnmember") || "";
    const um2 = getCookieValue("um2") || "";
    const isNewUser =
      localStorage.getItem(`fate2025_new_user_${udnmember}`) === "true";
    console.log(`是否為新用戶 (首次註冊當天): ${isNewUser}`);

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
    localStorage.removeItem("login_checked");

    localStorage.clear();

    // 立即更新 UI 狀態
    hasPlayed.value = false;
    isTurnstileVerified.value = false;
    isLoggedIn.value = false;

    console.log("已清除所有登入相關狀態");
  } catch (e) {
    console.error("清除 Cookie 過程中發生錯誤:", e);
  }
}
// clearCookiesAfterDivination 函數
function clearCookiesAfterDivination() {
  if (typeof window === "undefined") return;

  try {
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
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; secure`;
        });
      });
    });

    // 方法 3: 對於 UDN 域名的特殊處理
    cookieNames.forEach((name) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.udn.com`;
    });

    localStorage.clear(); // 直接清空

    // 清除 session storage
    localStorage.clear();

    // 更新 UI 狀態
    isTurnstileVerified.value = false;
    isLoggedIn.value = false;

    console.log("已清除占卜後的 cookie 和認證資料");
  } catch (e) {
    console.error("清除 Cookie 過程中發生錯誤:", e);
  }
}
// ==================== 生命週期 ====================
onMounted(async () => {
  initSimpleSync();
  // 第1部分：基本初始化設置
  // ------------------------------------------
  // 註冊開發工具鍵盤快捷鍵
  const handleKeyDown = (event) => {
    if (event.shiftKey && event.key === "D") {
      toggleDebugTools();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // 設置定期檢查登入狀態的計時器
  const loginCheckInterval = setInterval(updateLoginStatus, 5000);

  // 組件卸載時清理資源
  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeyDown);
    clearInterval(loginCheckInterval);
  });

  // 第2部分：更新用戶狀態
  // ------------------------------------------
  // 更新登入狀態
  updateLoginStatus();

  // 第3部分：獲取占卜次數與用戶資料
  // ------------------------------------------
  if (isLoggedIn.value) {
    await fetchUserPlayData();
  } else {
    console.log("用戶未登入，無法獲取累計次數");
  }

  // 第4部分：檢查占卜狀態
  // ------------------------------------------
  try {
    await updatePlayedStatus();

    // 如果已登入並且今天已占卜過，顯示提示
    if (isLoggedIn.value && hasPlayed.value) {
      console.log("檢測到用戶今天已經占卜過了");
      showAlreadyPlayedMessage();
      return;
    }
  } catch (err) {
    console.error("更新占卜狀態錯誤:", err);
  }

  // 第5部分：登入流程檢查
  // ------------------------------------------
  // 檢查是否首次訪問頁面
  const isFirstTimeCheck = !localStorage.getItem("login_checked");

  // 處理非正常流程登入的情況
  if (isLoggedIn.value && isFirstTimeCheck) {
    await handleNonNormalLogin();
  }

  // 第6部分：從登入頁返回的處理
  // ------------------------------------------
  // 檢查是否從會員登入頁面返回
  const justLoggedIn =
    localStorage.getItem("fate2025_just_logged_in") === "true";

  if (justLoggedIn && isLoggedIn.value) {
    await handlePostLoginProcess();
  } else if (isLoggedIn.value && isFirstTimeCheck) {
    await handleNonNormalLogin();
  }
});

// ==================== 主要占卜函數 ====================

// 獲取用戶占卜數據
async function fetchUserPlayData() {
  try {
    console.log("開始獲取累計占卜次數...");
    const apiUrl = getApiUrl("checkPlayStatus.php");
    const udnmember = getCookieValue("udnmember") || "";
    const um2 = getCookieValue("um2") || "";

    console.log("API路徑:", apiUrl);
    console.log("用戶ID:", udnmember);

    const response = await axios.post(
      apiUrl,
      { udnmember, um2 },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      },
    );

    console.log("完整API回應:", response.data);

    // 處理累計次數資訊
    if (response.data.status === "success") {
      if (response.data.play_times_total !== undefined) {
        totalPlayCount.value = parseInt(response.data.play_times_total);
        console.log("✅ 已獲取累計占卜次數:", totalPlayCount.value);
      } else {
        console.log("⚠️ API回應中沒有找到 play_times_total 欄位");
      }
    }

    // 處理新用戶檢測
    if (response.data.status === "success" && response.data.db_info) {
      checkNewUserStatus(response.data.db_info);
    }

    // 初始化已完成的最高里程碑
    initializeAchievedMilestone();
  } catch (error) {
    console.error("❌ 獲取累計占卜次數錯誤:", error);
  }
}

// 檢查是否為新用戶
function checkNewUserStatus(dbInfo) {
  if (!dbInfo || !dbInfo.created_at) return;

  const createdAt = new Date(dbInfo.created_at);
  const today = new Date();

  const isCreatedToday =
    createdAt.getDate() === today.getDate() &&
    createdAt.getMonth() === today.getMonth() &&
    createdAt.getFullYear() === today.getFullYear();

  if (isCreatedToday) {
    const udnmember = getCookieValue("udnmember") || "";
    if (udnmember) {
      localStorage.setItem(`fate2025_new_user_${udnmember}`, "true");
      console.log("已標記為新用戶 (首次註冊當天)");
    }
  }
}

// 初始化已完成的最高里程碑
function initializeAchievedMilestone() {
  if (totalPlayCount.value > 0) {
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (totalPlayCount.value >= milestones[i]) {
        lastAchievedMilestone.value = milestones[i];
        break;
      }
    }
    console.log("初始化已完成的最高里程碑:", lastAchievedMilestone.value);
  }
}

// 處理非正常流程登入
async function handleNonNormalLogin() {
  // 標記已經檢查過登入狀態
  localStorage.setItem("login_checked", "true");

  // 檢查是否通過正常流程登入
  const isNormalFlow = localStorage.getItem("fate2025_normal_flow") === "true";

  // 如果沒有通過正確流程但已經登入，顯示提示
  if (!isNormalFlow) {
    console.log("檢測到用戶不是從正常流程登入");

    showUniversalDialog({
      icon: "warning",
      title: "請使用正確的占卜流程",
      text: "請從活動首頁點擊「立即占卜」按鈕來完成占卜流程，\n直接使用登入網址將無法取得占卜結果。",
      confirmButtonText: "我知道了",
      showCancelButton: false,
    });
  }
}

// 處理登入後返回的流程
async function handlePostLoginProcess() {
  console.log("檢測到從登入頁面返回");

  // 檢查流程有效性
  const hasFlowToken = !!securityManager.flow.get();
  const isNormalFlow = localStorage.getItem("fate2025_normal_flow") === "true";

  console.log("流程檢查結果:", {
    hasFlowToken,
    isNormalFlow,
    flowToken: securityManager.flow.get()?.substring(0, 10) + "...",
  });

  // 處理非正常流程
  if (!isNormalFlow && !hasFlowToken) {
    handleNonNormalLogin();
    return;
  }

  // 正常流程處理
  try {
    // 檢查占卜狀態
    const alreadyPlayed = await hasPlayedToday();

    // 如果已經占卜過，顯示提示訊息
    if (alreadyPlayed) {
      showAlreadyPlayedMessage();
      return;
    }

    // 顯示驗證對話框
    showPostLoginVerificationDialog();
  } catch (error) {
    console.error("登入後流程錯誤:", error);
    showUniversalDialog({
      icon: "error",
      title: "系統錯誤",
      text: "啟動占卜流程時發生錯誤，請稍後再試",
    });
  }
}
</script>

<style lang="scss" scoped>
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
.play-count-info {
  margin-top: 15px;
  font-size: 16px;
  color: #666;

  .count-number {
    font-weight: bold;
    color: #fa541c;
    font-size: 18px;
  }
}

.play-count-info {
  margin-top: 15px;
  font-size: 16px;
  color: #666;

  .count-number {
    font-weight: bold;
    color: #fa541c;
    font-size: 18px;
  }

  .milestones-container {
    display: flex;
    justify-content: center;
    margin-top: 10px;
    gap: 20px;

    .milestone-item {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #999;
      transition: all 0.3s ease;

      &.achieved {
        background-color: #fa541c;
        color: white;
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(250, 84, 28, 0.5);
      }
    }
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
</style>
