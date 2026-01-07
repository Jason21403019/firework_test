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
  const handleNewYearFlow = async (turnstileToken, startWheelSpinFn) => {
    try {
      console.log("=== 開始新年活動流程 ===");

      // 清除登入標記
      localStorage.removeItem("fate2025_just_logged_in");

      // 步驟 1: 觸發轉盤動畫
      console.log("觸發轉盤動畫...");
      if (startWheelSpinFn) {
        startWheelSpinFn();
      }

      // 步驟 2: 等待轉盤動畫 (3秒)
      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log("轉盤動畫結束");

      // 步驟 3: 獲取會員資料
      console.log("獲取會員資料...");

      const turnstileTokenValue = turnstileToken || null;
      const result = await divinationFlow.saveUserData(turnstileTokenValue);

      console.log("API 回應結果:", result);

      // 檢查 API 錯誤
      if (result.status === "error") {
        // 如果是已經占卜過，仍然要跳轉
        if (result.already_played === true) {
          console.log("用戶今天已占卜過，繼續跳轉流程");
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

      console.log("會員資料:", {
        isFirstTime,
        playCount,
        isAlreadyPlayed,
        udnmember: userStore.udnmember,
      });

      // 更新占卜次數並儲存占卜結果 ID
      let fortuneId = null;
      if (result.status === "success" && !isAlreadyPlayed) {
        // 第一次占卜成功
        const { fortuneData, resultMessage } =
          await divinationFlow.handleSuccessfulDivination(result);
        console.log("占卜結果已生成:", fortuneData);
        fortuneId = fortuneData.id; // 儲存占卜結果 ID
      } else if (isAlreadyPlayed) {
        // 已經占卜過，更新狀態
        console.log("用戶已占卜過，更新狀態並準備跳轉");
        divinationStore.setPlayedStatus(true);
        if (result.db_info && result.db_info.play_times_total !== undefined) {
          divinationStore.setTotalPlayCount(result.db_info.play_times_total);
        }
      }

      // 步驟 5: 顯示待跳轉彈窗
      console.log("顯示待跳轉彈窗...");
      popupStore.openRedirectPopup({
        message: "準備進入新年活動",
        countdown: 4,
      });

      // 步驟 6: 等待彈窗倒數 (4秒)
      await new Promise((resolve) => setTimeout(resolve, 4000));

      // 步驟 7: 跳轉到外部網頁
      const externalUrl = buildRedirectUrl(
        isFirstTime,
        playCount,
        isAlreadyPlayed,
        fortuneId,
      );
      console.log("準備跳轉到:", externalUrl, {
        isFirstTime,
        playCount,
        isAlreadyPlayed,
        fortuneId,
      });

      window.location.href = externalUrl;
    } catch (error) {
      console.error("新年活動流程錯誤:", error);
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
