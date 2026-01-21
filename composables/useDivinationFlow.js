// 占卜流程管理
export const useDivinationFlow = () => {
  const userStore = useUserStore();
  const divinationStore = useDivinationStore();
  const popupStore = usePopupStore();
  const apiService = useApiService();
  const auth = useAuth();

  // 判斷是否為開發環境
  const isDevelopment = computed(() => {
    return import.meta.env?.DEV || false;
  });

  // 更新已玩過狀態
  const updatePlayedStatus = async () => {
    if (!userStore.isLoggedIn) {
      divinationStore.setPlayedStatus(false);
      return;
    }
    const played = await apiService.hasPlayedToday(
      userStore.udnmember,
      userStore.um2,
    );
    divinationStore.setPlayedStatus(played);
  };

  // 生成結果訊息
  const generateResultMessage = (playCount) => {
    if (playCount === 1) {
      // 第一次：特別文案，獲得 5 points
      return "小提醒：每天都能玩轉盤抽紅包<br>iPhone 17 Pro 大獎要送你！</div>";
    } else if (playCount === 20) {
      // 第二十次：恭喜達成
      return "<div class='glowing-message'><span class='glowing-message-title'>恭喜達成!</span><br>已完成 20 次占卜，獲得 Dyson 大獎抽獎資格！</div>";
    } else {
      // 第 2-19 次和第 21 次之後：一般文案
      return "<div class='glowing-message'><span class='glowing-message-title'>占卜完成!</span><br>明天繼續來占卜，累積好運！</div>";
    }
  };

  // 通知其他分頁占卜完成
  const notifyOtherTabs = () => {
    localStorage.setItem(
      "fate2025_divination_sync",
      JSON.stringify({
        completed: true,
        totalCount: divinationStore.totalPlayCount,
        timestamp: Date.now(),
      }),
    );
  };

  // 處理成功占卜的輔助函數
  const handleSuccessfulDivination = async (result) => {
    console.log("🎉 處理占卜結果");

    localStorage.removeItem("temp_turnstile_token");

    // 更新占卜次數
    const oldCount = divinationStore.totalPlayCount;
    if (result.db_info && result.db_info.play_times_total !== undefined) {
      divinationStore.setTotalPlayCount(result.db_info.play_times_total);
    } else {
      divinationStore.incrementPlayCount();
    }

    const isFirstTime =
      result.message && result.message.includes("首次占卜成功");

    divinationStore.checkMilestoneAchievement(
      divinationStore.totalPlayCount,
      oldCount,
      isFirstTime,
    );

    divinationStore.recordPlayToday();

    const fortuneData = divinationStore.generateFortuneResult();
    console.log("🔮 占卜結果:", fortuneData.title);

    // 根據占卜次數生成對應訊息
    let resultMessage = generateResultMessage(divinationStore.totalPlayCount);

    notifyOtherTabs();

    // 更新狀態
    await updatePlayedStatus();

    return { fortuneData, resultMessage };
  };

  // 保存用戶數據到資料庫
  const saveUserData = async (turnstileTokenValue, csrfToken = null) => {
    try {
      if (!turnstileTokenValue && !isDevelopment.value) {
        throw new Error("機器人驗證資料不完整，請重新驗證");
      }

      const userData = {
        udnmember: auth.sanitizeInput(userStore.udnmember),
        um2: auth.sanitizeInput(userStore.um2),
        email: auth.sanitizeInput(userStore.email),
        turnstile_token: turnstileTokenValue || null,
      };

      return await apiService.saveUserData(userData, csrfToken);
    } catch (error) {
      console.error("❌ 保存數據失敗:", error);
      return {
        status: "error",
        error: error.message,
        message: error.message,
      };
    }
  };

  // 處理 API 錯誤的輔助函數
  const handleApiError = (result) => {
    console.log("處理 API 錯誤:", result);

    return new Promise((resolve) => {
      // 只有在明確收到 already_played = true 時才設置為已占卜
      if (result.already_played === true) {
        console.log("用戶今天已經占卜過了");

        // 清理令牌
        localStorage.removeItem("temp_turnstile_token");

        // 更新占卜次數
        if (result.db_info && result.db_info.play_times_total !== undefined) {
          divinationStore.setTotalPlayCount(result.db_info.play_times_total);
          console.log("更新累計占卜次數為:", divinationStore.totalPlayCount);
        }

        // 只有在確認已占卜時才更新狀態
        divinationStore.setPlayedStatus(true);

        resolve({ type: "already_played" });
        return;
      }

      // 機器人驗證失敗
      if (result.message && result.message.includes("機器人驗證失敗")) {
        console.log("機器人驗證失敗，要求重新驗證");
        resolve({ type: "robot_verification_failed" });
        return;
      }

      // 自動化行為檢測
      if (result.message && result.message.includes("系統檢測到自動化行為")) {
        console.log("檢測到自動化行為");
        resolve({ type: "automation_detected" });
        return;
      }

      console.log("其他 API 錯誤，不更新占卜狀態:", result.message);
      resolve({ type: "other_error", message: result.message });
    });
  };

  // 獲取用戶占卜數據
  const fetchUserPlayData = async () => {
    try {
      const response = await apiService.fetchUserPlayData(
        userStore.udnmember,
        userStore.um2,
      );

      // 處理累計次數資訊
      if (response.status === "success") {
        if (response.play_times_total !== undefined) {
          divinationStore.setTotalPlayCount(response.play_times_total);
          console.log("📊 占卜次數:", divinationStore.totalPlayCount);
        }
      }

      // 處理新用戶檢測
      if (response.status === "success" && response.db_info) {
        checkNewUserStatus(response.db_info);
      }

      // 初始化已完成的最高里程碑
      divinationStore.initializeAchievedMilestone();
    } catch (error) {
      console.error("❌ 獲取占卜數據錯誤:", error);
    }
  };

  // 檢查是否為新用戶
  const checkNewUserStatus = (dbInfo) => {
    if (!dbInfo || !dbInfo.created_at) return;

    const createdAt = new Date(dbInfo.created_at);
    const today = new Date();

    const isCreatedToday =
      createdAt.getDate() === today.getDate() &&
      createdAt.getMonth() === today.getMonth() &&
      createdAt.getFullYear() === today.getFullYear();

    if (isCreatedToday) {
      const udnmember = auth.getCookieValue("udnmember") || "";
      if (udnmember) {
        localStorage.setItem(`fate2025_new_user_${udnmember}`, "true");
        console.log("已標記為新用戶 (首次註冊當天)");
      }
    }
  };

  return {
    updatePlayedStatus,
    generateResultMessage,
    notifyOtherTabs,
    handleSuccessfulDivination,
    saveUserData,
    handleApiError,
    fetchUserPlayData,
    checkNewUserStatus,
  };
};
