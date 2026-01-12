// 新年活動跳轉流程處理
export const useRedirectFlow = () => {
  const userStore = useUserStore();
  const divinationStore = useDivinationStore();
  const popupStore = usePopupStore();
  const { securityManager } = useSecurityManager();
  const divinationFlow = useDivinationFlow();
  const config = useRuntimeConfig();

  // 判斷是否為開發環境
  const isDevelopment = computed(() => {
    return import.meta.env?.DEV || false;
  });

  // 處理登入後的新年活動流程
  const handleNewYearFlow = async (
    turnstileToken,
    startWheelSpinFn,
    csrfToken = null,
  ) => {
    try {
      console.log("🎊 開始新年活動流程");

      // 步驟 1: 觸發轉盤動畫
      if (startWheelSpinFn) {
        startWheelSpinFn();
      }

      // 步驟 2: 等待轉盤動畫 (3秒)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 步驟 3: 獲取會員資料
      const turnstileTokenValue = turnstileToken || null;
      const result = await divinationFlow.saveUserData(
        turnstileTokenValue,
        csrfToken,
      );

      // 檢查 API 錯誤
      if (result.status === "error") {
        // 如果是已經占卜過，仍然要跳轉
        if (result.already_played === true) {
          console.log("已占卜，繼續跳轉");
        } else {
          throw new Error(result.message || "API 錯誤");
        }
      }

      // 步驟 4: 判斷是否第一次完成和占卜狀態
      const isAlreadyPlayed =
        result.already_played === true ||
        (result.status === "error" && result.already_played === true);
      const isFirstTime =
        result.message && result.message.includes("首次占卜成功");
      const playCount =
        result.db_info?.play_times_total || divinationStore.totalPlayCount;

      // 更新占卜次數並儲存占卜結果 ID
      let fortuneId = null;
      if (result.status === "success" && !isAlreadyPlayed) {
        // 第一次占卜成功
        const { fortuneData, resultMessage } =
          await divinationFlow.handleSuccessfulDivination(result);
        fortuneId = fortuneData.id; // 儲存占卜結果 ID
      } else if (isAlreadyPlayed) {
        // 已經占卜過，更新狀態
        divinationStore.setPlayedStatus(true);
        if (result.db_info && result.db_info.play_times_total !== undefined) {
          divinationStore.setTotalPlayCount(result.db_info.play_times_total);
        }
      }

      // 步驟 5: 顯示待跳轉彈窗
      popupStore.openRedirectPopup({
        message: "準備進入新年活動",
        countdown: 4,
      });

      // 步驟 6: 等待彈窗倒數 (4秒)
      await new Promise((resolve) => setTimeout(resolve, 4000));

      // 在跳轉前啟動重新整理提醒計時器
      const reminderTime = Date.now() + 4 * 60 * 1000;
      localStorage.setItem(
        "fate2025_refresh_reminder_time",
        String(reminderTime),
      );

      // 步驟 7: 跳轉到外部網頁
      const externalUrl = buildRedirectUrl(
        isFirstTime,
        playCount,
        isAlreadyPlayed,
        fortuneId,
      );
      console.log("🚀 跳轉:", externalUrl);

      window.location.href = externalUrl;
    } catch (error) {
      console.error("❌ 活動流程錯誤:", error);
      popupStore.closeRedirectPopup();

      // 顯示錯誤訊息
      throw error;
    }
  };

  // 建立跳轉網址（帶參數）
  const buildRedirectUrl = (
    isFirstTime,
    playCount,
    alreadyPlayed = false,
    fortuneId = null,
  ) => {
    // TODO: 替換成實際的外部網頁網址
    const baseUrl =
      config.public.externalRedirectUrl || "https://udn.com/news/cate/2/6638";

    const params = new URLSearchParams({
      first: isFirstTime ? "1" : "0",
      count: playCount.toString(),
      already_played: alreadyPlayed ? "1" : "0",
      udnmember: userStore.udnmember || "",
      timestamp: Date.now().toString(),
    });

    // 如果有占卜結果 ID，加入參數
    if (fortuneId) {
      params.set("fortune_id", fortuneId);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  return {
    handleNewYearFlow,
    buildRedirectUrl,
  };
};
