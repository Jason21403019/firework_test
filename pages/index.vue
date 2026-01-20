<template>
  <Banner
    ref="bannerRef"
    @startDivination="startDivination"
    :loginUrl="loginUrl"
  />
  <div class="divination-container">
    <PlayCount
      :count="divinationStore.totalPlayCount"
      @milestone-achieved="handleMilestoneAchieved"
    />
    <Act_area />
    <Notice_popup />
    <!-- <ToTop /> -->

    <!-- 占卜結果彈窗 -->
    <Fortune_result_popup
      :is-visible="popupStore.showFortuneResultPopup"
      :fortune-data="popupStore.fortuneResultData"
      :custom-message="popupStore.fortuneCustomMessage"
      @close="closeFortune"
    />
    <!-- 已經占卜過的彈窗 -->
    <Already_played_popup
      :is-visible="popupStore.showAlreadyPlayedPopup"
      :already-played-data="popupStore.alreadyPlayedData"
      :total-play-count="divinationStore.totalPlayCount"
      :is-development="isDevelopment"
      @close="popupStore.closeAlreadyPlayedPopup"
      @clear-record="debugTools.clearPlayRecord"
    />
    <!-- 加載中彈窗 -->
    <Loading_popup
      :is-visible="popupStore.showLoadingPopup"
      :loading-data="popupStore.loadingData"
      @close="popupStore.closeLoadingPopup"
    />
    <!-- 驗證彈窗 -->
    <Verification_popup
      :is-visible="popupStore.showVerificationPopup"
      @close="closeVerificationPopup"
      @opened="onVerificationPopupOpened"
    />
    <!-- 通用彈窗 -->
    <Universal_popup
      :is-visible="popupStore.showUniversalPopup"
      :popup-data="popupStore.universalPopupData"
      @close="popupStore.closeUniversalPopup"
      @confirm="handleUniversalConfirm"
      @cancel="handleUniversalCancel"
    />
    <!-- 待跳轉彈窗 -->
    <Redirect_popup
      :is-visible="popupStore.showRedirectPopup"
      :message="popupStore.redirectPopupData.message"
      :initial-countdown="popupStore.redirectPopupData.countdown"
      @countdown-end="handleRedirectCountdownEnd"
    />

    <!-- 開發工具區域 - 按 Shift+D 顯示 -->
    <div v-if="showDebugTools" class="debug-tools">
      <h3>開發測試工具</h3>

      <!-- 彈窗測試區 -->
      <div class="debug-section">
        <h4>🎨 彈窗測試</h4>
        <div class="debug-actions">
          <button @click="testFortunePopup" class="debug-btn">
            測試占卜結果彈窗
          </button>
          <button @click="testAlreadyPlayedPopup" class="debug-btn">
            測試重複遊玩彈窗
          </button>
        </div>
      </div>

      <!-- 資料操作區 -->
      <div class="debug-section">
        <h4>🗄️ 資料操作</h4>
        <div class="debug-actions">
          <button @click="debugTools.clearPlayRecord" class="debug-btn">
            清除占卜記錄
          </button>
          <button @click="debugTools.resetDatabase" class="debug-btn danger">
            重置資料庫
          </button>
          <button @click="auth.logout" class="debug-btn logout">登出</button>
        </div>
      </div>

      <!-- 狀態資訊區 -->
      <div class="debug-section">
        <h4>📊 狀態資訊</h4>
        <div class="debug-info">
          <p>登入狀態: {{ userStore.isLoggedIn ? "已登入" : "未登入" }}</p>
          <p>
            會員ID:
            {{
              userStore.isLoggedIn
                ? auth.getCookieValue("udnmember") || "無"
                : "無"
            }}
          </p>
          <p>今日已占卜: {{ divinationStore.hasPlayed ? "是" : "否" }}</p>
          <p>總占卜次數: {{ divinationStore.totalPlayCount }}</p>
          <p>
            驗證狀態:
            {{ turnstile?.isTurnstileVerified?.value ? "已驗證" : "未驗證" }}
          </p>
          <p>
            本地儲存鍵:
            {{
              `fate2025_last_played_${auth.getCookieValue("udnmember") || ""}`
            }}
          </p>
          <button @click="debugTools.debugCheckDatabase" class="debug-btn">
            檢查資料庫狀態
          </button>
        </div>
      </div>

      <div class="shortcut-info">
        <p>按下 Shift+D 可隱藏此工具</p>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
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
import Redirect_popup from "../components/Redirect_popup.vue";
import Footer from "../components/Footer.vue";
// ==================== 引入 Stores 和 Composables ====================
import { useUserStore } from "~/stores/user";
import { useDivinationStore } from "~/stores/divination";
import { usePopupStore } from "~/stores/popup";

const userStore = useUserStore();
const divinationStore = useDivinationStore();
const popupStore = usePopupStore();
// const config = useRuntimeConfig();
const auth = useAuth();
const apiService = useApiService();
const divinationFlow = useDivinationFlow();
const loginFlow = useLoginFlow();
const browserUtils = useBrowserUtils();
const debugTools = useDebugTools();
const redirectFlow = useRedirectFlow();
const csrf = useCsrf();

// ==================== 基本狀態管理 ====================
const showDebugTools = ref(false);
const bannerRef = ref(null);
const loginUrl = computed(() => apiService.getLoginUrl());
const lastLoggedInUser = ref(null); // 追蹤上一個登入的會員ID
const verificationTriggered = ref(false); // 標記是否已觸發驗證流程

// 判斷是否為開發環境
const isDevelopment = computed(() => {
  return import.meta.env?.DEV || false;
});

// 先聲明 turnstile，稍後初始化
let turnstile = null;

// 創建統一的彈窗顯示函數
function showUniversalDialog(options) {
  return popupStore.openUniversalPopup(options);
}

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

const handleRedirectCountdownEnd = () => {
  console.log("倒數結束，準備跳轉");
  popupStore.closeRedirectPopup();
};

// ==================== 監聽登入狀態變化 ====================
// 監聽登入狀態和會員變化，處理會員切換的情況
watch(
  () => [userStore.isLoggedIn, userStore.udnmember],
  async ([isLoggedIn, currentUser]) => {
    // 只處理從未登入變為已登入，或者換了不同的會員
    if (!isLoggedIn) {
      lastLoggedInUser.value = null;
      return;
    }

    // 檢測到新的登入（不同的會員或從未登入變為已登入）
    const isNewLogin =
      isLoggedIn && currentUser && currentUser !== lastLoggedInUser.value;

    if (isNewLogin) {
      console.log("👤 會員登入:", currentUser);

      // 檢查是否是從登入頁面返回（使用消費型標記）
      const storedTabId = localStorage.getItem("fate2025_tab_id");
      const justLoggedInFlag = localStorage.getItem("fate2025_just_logged_in");

      // 檢查是否有登入標記
      const hasLoginFlag = justLoggedInFlag === "true" && storedTabId;

      // 檢查這是否為舊分頁（已經有 tab_id 的分頁）
      const isOldTab = sessionStorage.getItem("fate2025_tab_id") !== null;

      // 如果是舊分頁，不處理登入標記（給新分頁機會）
      if (isOldTab && hasLoginFlag) {
        console.log("📄 舊分頁，略過");
        return;
      }

      // 新分頁且有登入標記，立即消費掉
      let justLoggedIn = false;
      if (!isOldTab && hasLoginFlag) {
        console.log("✨ 新分頁登入，開始流程");

        // 立即清除標記
        localStorage.removeItem("fate2025_just_logged_in");
        localStorage.removeItem("fate2025_tab_id");

        // 將 tab_id 存到 sessionStorage（本分頁專屬）
        sessionStorage.setItem("fate2025_tab_id", storedTabId);

        justLoggedIn = true;
      } else if (!isOldTab && !hasLoginFlag) {
        // 普通新分頁（不是登入返回的），初始化新的 tab_id
        const newTabId = Date.now() + "_" + Math.random();
        sessionStorage.setItem("fate2025_tab_id", newTabId);
      }

      // 如果沒有登入標記，直接返回
      if (!justLoggedIn) {
        return;
      }

      lastLoggedInUser.value = currentUser;

      if (justLoggedIn && !verificationTriggered.value) {
        verificationTriggered.value = true;

        // 清除舊的檢查標記，確保流程可以執行
        localStorage.removeItem("login_checked");
        localStorage.setItem("login_checked", "true");

        // 更新占卜狀態
        await divinationFlow.updatePlayedStatus();

        // 獲取最新的占卜次數
        await divinationFlow.fetchUserPlayData();

        // 顯示驗證對話框
        showPostLoginVerificationDialog();
      }
    }
  },
  { immediate: false },
);

// ==================== UI 處理函數 ====================
// 處理里程碑達成
function handleMilestoneAchieved(milestone) {
  console.log(`達成里程碑: ${milestone.count} - ${milestone.prize}`);
  if (milestone.count > divinationStore.lastAchievedMilestone) {
    divinationStore.setLastAchievedMilestone(milestone.count);
  }
}

// 顯示「今天已經玩過」的提示
function showAlreadyPlayedMessage() {
  let imgUrl = "./imgs/one_four.png";
  let message = "";
  let reminder = "小提醒: 每天來占卜，累積好運抽 Dyson 清淨機大獎喔！";

  if (divinationStore.totalPlayCount === 1) {
    message = "已完成第 1 次占卜\n明天再來繼續累積好運！";
  } else if (
    divinationStore.totalPlayCount >= 2 &&
    divinationStore.totalPlayCount < 5
  ) {
    message = `已累積 ${divinationStore.totalPlayCount} 次占卜\n繼續加油，朝下個目標前進！`;
  } else if (divinationStore.totalPlayCount === 5) {
    message = "已完成 5 次占卜\n繼續累積，邁向更高目標！";
  } else if (
    divinationStore.totalPlayCount >= 6 &&
    divinationStore.totalPlayCount < 10
  ) {
    message = `已累積 ${divinationStore.totalPlayCount} 次占卜\n持續加油，離目標越來越近！`;
  } else if (divinationStore.totalPlayCount === 10) {
    message = "已完成 10 次占卜\n繼續累積，邁向更高目標！";
  } else if (
    divinationStore.totalPlayCount >= 11 &&
    divinationStore.totalPlayCount < 15
  ) {
    message = `已累積 ${divinationStore.totalPlayCount} 次占卜\n持續加油，快達成了！`;
  } else if (divinationStore.totalPlayCount === 15) {
    message = "已完成 15 次占卜\n再 5 次就能獲得 Dyson 大獎資格！";
  } else if (
    divinationStore.totalPlayCount >= 16 &&
    divinationStore.totalPlayCount < 20
  ) {
    message = `已累積 ${divinationStore.totalPlayCount} 次占卜\n距離 Dyson 大獎只差 ${20 - divinationStore.totalPlayCount} 次了！`;
  } else if (divinationStore.totalPlayCount >= 20) {
    message = "恭喜！已完成 20 次占卜\n已獲得 Dyson 大獎抽獎資格";
    reminder = "";
  }

  popupStore.openAlreadyPlayedPopup({
    image_url: imgUrl,
    message: message,
    reminder: reminder,
  });
}

// 顯示占卜結果
function showFortuneResult(fortuneData, customResultMessage) {
  popupStore.openFortuneResultPopup(fortuneData, customResultMessage);
}

// 關閉占卜結果彈窗
const closeFortune = () => {
  popupStore.closeFortuneResultPopup();

  // 記錄應該登出的時間點
  const logoutTime = Date.now() + 4 * 60 * 1000;
  localStorage.setItem("fate2025_logout_time", String(logoutTime));

  // 設置 setTimeout 作為備用
  setTimeout(
    () => {
      auth.clearCookiesAfterDivination();
    },
    4 * 60 * 1000,
  );
};

// 登入後的驗證對話框
function showPostLoginVerificationDialog() {
  popupStore.openVerificationPopup();
}

// 關閉驗證彈窗
const closeVerificationPopup = () => {
  popupStore.closeVerificationPopup();
  if (turnstile) {
    turnstile.cleanupTurnstile();
  }
};

// 驗證彈窗開啟時的處理
const onVerificationPopupOpened = () => {
  if (turnstile) {
    turnstile.loadTurnstileScript();
  }
};

// 切換開發工具顯示
function toggleDebugTools() {
  showDebugTools.value = !showDebugTools.value;
}

// ==================== 測試彈窗函數 ====================
// 測試占卜結果彈窗（使用正式內容）
function testFortunePopup() {
  // 生成隨機占卜結果
  const fortuneData = divinationStore.generateFortuneResult();

  // 生成訊息（與正式流程一致）
  const playCount = divinationStore.totalPlayCount;
  let customResultMessage = "";

  if (playCount === 1) {
    customResultMessage =
      "<div class='glowing-message'><span class='glowing-message-title'>恭喜完成!</span><br>恭喜完成第 1 次占卜，獲得 5 points！</div>";
  } else if (playCount === 20) {
    customResultMessage =
      "<div class='glowing-message'><span class='glowing-message-title'>恭喜達成!</span><br>已完成 20 次占卜，獲得 Dyson 大獎抽獎資格！</div>";
  } else {
    customResultMessage =
      "<div class='glowing-message'><span class='glowing-message-title'>占卜完成!</span><br>明天繼續來占卜，累積好運！</div>";
  }

  showFortuneResult(fortuneData, customResultMessage);
  console.log("🎨 測試占卜結果彈窗");
}

// 測試重複遊玩彈窗（使用正式內容）
function testAlreadyPlayedPopup() {
  showAlreadyPlayedMessage();
  console.log("🎨 測試重複遊玩彈窗");
}

// ==================== 占卜流程主函數 ====================
// 1. 占卜流程啟動函數
async function startDivination() {
  return await loginFlow.startDivination(
    divinationFlow.updatePlayedStatus,
    showAlreadyPlayedMessage,
  );
}

// 2. 驗證成功後執行占卜流程（已棄用 - 改用新年活動流程）
// 此函數已不再使用，所有流程都改用 proceedToNewYearFlow
// eslint-disable-next-line no-unused-vars
async function proceedToPerformDivination() {
  try {
    console.log("=== 開始執行占卜流程 ===");

    // 清除登入標記
    localStorage.removeItem("fate2025_just_logged_in");

    // 步驟1: 檢查 Turnstile token（非開發環境）
    console.log("檢查 Turnstile token...");
    if (!turnstile?.turnstileToken?.value && !isDevelopment.value) {
      console.error("Turnstile token 不存在，需要重新驗證");
      showPostLoginVerificationDialog();
      return;
    }

    // 步驟3: 顯示占卜進行中的提示
    console.log("開始占卜處理...");
    popupStore.openLoadingPopup({
      message: "占卜中...",
    });

    // 步驟4: 調用 API 保存用戶數據
    console.log("正在發送占卜資料...");
    const turnstileTokenValue =
      turnstile?.turnstileToken?.value ||
      localStorage.getItem("temp_turnstile_token") ||
      null;

    const result = await divinationFlow.saveUserData(turnstileTokenValue);

    popupStore.closeLoadingPopup();

    console.log("API 回應結果:", result);

    // 步驟5: 處理 API 回應
    if (result.status === "error") {
      const errorType = await divinationFlow.handleApiError(result);
      await handleApiErrorUI(errorType);
      return;
    }

    // 步驟6: 處理成功的占卜結果
    if (result.status === "success") {
      const { fortuneData, resultMessage } =
        await divinationFlow.handleSuccessfulDivination(result);
      showFortuneResult(fortuneData, resultMessage);
    }
  } catch (error) {
    console.error("占卜流程執行錯誤:", error);
    popupStore.closeLoadingPopup();
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

// 執行新年活動流程（驗證後）
async function proceedToNewYearFlow() {
  try {
    console.log("🎯 開始活動流程");

    // 清除舊的 CSRF token，確保獲取新的（跨域返回後 session 可能改變）
    csrf.clearCsrfToken();

    // 獲取安全驗證（在返回後獲取，確保 session 正確）
    let csrfToken = null;
    try {
      // 等待一下確保 session 穩定
      await new Promise((resolve) => setTimeout(resolve, 500));

      csrfToken = await csrf.getCsrfToken("divination");

      // 再等待一小段時間確保驗證完全生效
      if (csrfToken) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (csrfError) {
      console.error("❌ 安全驗證失敗:", csrfError);
      throw new Error("安全驗證失敗，請重新操作");
    }

    const startWheelSpin = () => {
      if (bannerRef.value && bannerRef.value.startWheelSpin) {
        bannerRef.value.startWheelSpin();
      }
    };

    await redirectFlow.handleNewYearFlow(
      turnstile?.turnstileToken?.value ||
        localStorage.getItem("temp_turnstile_token"),
      startWheelSpin,
      csrfToken,
    );
  } catch (error) {
    console.error("❌ 活動流程錯誤:", error);
    showUniversalDialog({
      icon: "error",
      title: "系統錯誤",
      text: error.message || "處理活動流程時發生錯誤，請稍後再試",
    });
  }
}

// 初始化 Turnstile（在所有相關函數定義之後）
turnstile = useTurnstile((token) => {
  closeVerificationPopup();
  proceedToNewYearFlow();
});

// 處理 API 錯誤的 UI 響應
async function handleApiErrorUI(errorType) {
  // 所有彈窗都在結果頁顯示
  if (errorType.type === "already_played") {
    // 什麼都不做，讓流程繼續跳轉到結果頁
    return;
  }

  if (errorType.type === "robot_verification_failed") {
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

  if (errorType.type === "automation_detected") {
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

  showUniversalDialog({
    icon: "error",
    title: "占卜失敗",
    text: errorType.message || "伺服器錯誤，請稍後再試",
    confirmButtonText: "確定",
    showCancelButton: true,
    cancelButtonText: "重新嘗試",
  }).then((modalResult) => {
    if (modalResult.isDismissed || modalResult.dismiss === "cancel") {
      showPostLoginVerificationDialog();
    }
  });
}

// ==================== 生命週期 ====================
onMounted(async () => {
  // 設定會員 session token（用於驗證是否為同一位會員）
  auth.setMemberSessionToken();

  // 瀏覽器檢測和跳轉
  browserUtils.checkAndRedirect(showUniversalDialog);

  sessionStorage.setItem("fate2025_page_enter_time", String(Date.now()));

  // 檢查是否應該顯示重新整理提醒（取代原本的自動登出檢查）
  browserUtils.checkRefreshReminder(showUniversalDialog);

  // 初始化跨分頁同步
  browserUtils.initSimpleSync(showAlreadyPlayedMessage);

  // 監聽頁面可見性變化 - 當頁面重新可見時立即檢查登入狀態
  browserUtils.initVisibilityListener(showUniversalDialog);

  // 基本初始化設置
  const handleKeyDown = (event) => {
    if (event.shiftKey && event.key === "D") {
      toggleDebugTools();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // 設置定期檢查登入狀態的計時器
  const loginCheckInterval = setInterval(() => auth.updateLoginStatus(), 5000);

  // 監聽頁面可見性變化 - 當頁面重新可見時立即檢查登入狀態
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      auth.updateLoginStatus();
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // 監聽視窗獲得焦點 - 當用戶切換回這個頁籤時立即檢查
  const handleFocus = () => {
    auth.updateLoginStatus();
  };
  window.addEventListener("focus", handleFocus);

  // 組件卸載時清理資源
  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("focus", handleFocus);
    clearInterval(loginCheckInterval);
  });

  // 更新登入狀態
  auth.updateLoginStatus();

  // 獲取占卜次數與用戶資料
  if (userStore.isLoggedIn) {
    await divinationFlow.fetchUserPlayData();
  } else {
    console.log("用戶未登入，無法獲取累計次數");
  }

  // 從登入頁返回的處理（使用消費型標記）
  const storedTabId = localStorage.getItem("fate2025_tab_id");
  const justLoggedInFlag = localStorage.getItem("fate2025_just_logged_in");

  // 檢查是否有登入標記
  const hasLoginFlag = justLoggedInFlag === "true" && storedTabId;

  // 檢查這是否為舊分頁（之前已經初始化過 tab_id）
  const existingTabId = sessionStorage.getItem("fate2025_tab_id");
  const isOldTab = existingTabId !== null;

  // 處理登入標記
  let justLoggedIn = false;
  if (isOldTab && hasLoginFlag) {
    // 舊分頁檢測到登入標記，等待 2 秒後清除（給新分頁足夠時間消費）
    setTimeout(() => {
      // 如果 2 秒後標記還在，清除它
      if (localStorage.getItem("fate2025_just_logged_in") === "true") {
        localStorage.removeItem("fate2025_just_logged_in");
        localStorage.removeItem("fate2025_tab_id");
      }
    }, 2000);
  } else if (!isOldTab && hasLoginFlag) {
    // 新分頁且有登入標記，立即消費掉
    console.log("✨ 新分頁，開始流程");

    // 立即清除標記，避免其他分頁也觸發
    localStorage.removeItem("fate2025_just_logged_in");
    localStorage.removeItem("fate2025_tab_id");

    // 將 tab_id 存到 sessionStorage（本分頁專屬）
    sessionStorage.setItem("fate2025_tab_id", storedTabId);

    justLoggedIn = true;
  } else if (!isOldTab) {
    // 普通新分頁（不是登入返回的），初始化新的 tab_id
    const newTabId = Date.now() + "_" + Math.random();
    sessionStorage.setItem("fate2025_tab_id", newTabId);
  }

  // 檢查占卜狀態
  try {
    await divinationFlow.updatePlayedStatus();
  } catch (err) {
    console.error("更新占卜狀態錯誤:", err);
  }

  // 登入流程檢查
  const isFirstTimeCheck = !localStorage.getItem("login_checked");

  if (justLoggedIn && userStore.isLoggedIn && !verificationTriggered.value) {
    // 新年活動流程：先驗證 -> 轉盤動畫 -> 待跳轉彈窗 -> 跳轉到外部網頁
    verificationTriggered.value = true;

    // 清除檢查標記，避免顯示非正常流程警告
    localStorage.setItem("login_checked", "true");

    // 不論是否已占卜過，都會走完整流程並跳轉到外部網頁
    showPostLoginVerificationDialog();
  } else if (userStore.isLoggedIn && isFirstTimeCheck) {
    // 處理非正常流程登入的情況（直接訪問頁面但已登入）
    await loginFlow.checkAndHandleNonNormalFlow(showUniversalDialog);
  }

  // 開發環境測試函數
  if (process.dev) {
    window.showFortuneResult = showFortuneResult;
    window.showAlreadyPlayedMessage = showAlreadyPlayedMessage;
    window.generateFortuneResult = () =>
      divinationStore.generateFortuneResult();
    window.showLoadingPopup = popupStore.showLoadingPopup;
    window.closeLoadingPopup = popupStore.closeLoadingPopup;
    window.showUniversalPopup = popupStore.showUniversalPopup;
    window.closeUniversalPopup = popupStore.closeUniversalPopup;
    window.showUniversalDialog = showUniversalDialog;

    // 測試函數
    window.testApiError = () => {
      showUniversalDialog({
        icon: "error",
        title: "占卜失敗",
        text: "測試：伺服器錯誤，請稍後再試",
        confirmButtonText: "確定",
        showCancelButton: true,
        cancelButtonText: "重新嘗試",
      });
    };

    window.testRobotFail = () => {
      showUniversalDialog({
        icon: "warning",
        title: "機器人驗證失敗",
        text: "請重新進行驗證",
        confirmButtonText: "重新驗證",
        showCancelButton: false,
      });
    };

    window.testAutomationDetection = () => {
      showUniversalDialog({
        icon: "error",
        title: "安全警告",
        text: "系統檢測到自動化行為，請勿使用機器人或腳本，請使用正常瀏覽器操作。",
        confirmButtonText: "重新驗證",
        showCancelButton: false,
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

    window.showVerificationPopup = popupStore.showVerificationPopup;
    window.testVerificationPopup = () => {
      popupStore.openVerificationPopup();
    };
  }
});
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
  padding: 20px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #f5f5f5;
  text-align: left;

  h3 {
    margin-top: 0;
    color: #333;
    font-size: 20px;
    margin-bottom: 20px;
  }

  h4 {
    margin: 15px 0 10px 0;
    color: #666;
    font-size: 16px;
    font-weight: 600;
  }

  .debug-section {
    margin-bottom: 20px;
    padding: 15px;
    background-color: white;
    border-radius: 6px;
    border: 1px solid #e8e8e8;
  }

  .danger {
    background-color: #d33 !important;
    color: white !important;
  }

  .danger:hover {
    background-color: #c22 !important;
  }

  .debug-actions {
    margin: 10px 0;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .debug-btn {
    padding: 8px 16px;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;

    &.logout {
      background-color: #ff4d4f;
    }

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }
  }

  .debug-info {
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;

    p {
      margin: 5px 0;
      line-height: 1.6;
    }
  }

  .shortcut-info {
    font-size: 12px;
    color: #999;
    font-style: italic;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px dashed #d9d9d9;
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
