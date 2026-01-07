// 登入流程處理
export const useLoginFlow = () => {
  const userStore = useUserStore();
  const divinationStore = useDivinationStore();
  const popupStore = usePopupStore();
  const apiService = useApiService();
  const { securityManager } = useSecurityManager();

  // 1. 占卜流程啟動函數
  const startDivination = async (
    updatePlayedStatusFn,
    showAlreadyPlayedMessageFn,
  ) => {
    try {
      if (typeof window === "undefined") return;

      // 顯示處理中訊息
      popupStore.openLoadingPopup({
        message: "處理中...",
        subMessage: "正在準備占卜流程",
      });

      // 1. 先更新狀態
      await updatePlayedStatusFn();

      // 2. 不論是否已玩過，都繼續流程（不在活動頁顯示彈窗）
      // 已玩過的狀態會在結果頁顯示

      localStorage.removeItem("login_checked");

      // 3. 設置流程標記
      localStorage.setItem("fate2025_just_logged_in", "true");
      localStorage.setItem("fate2025_normal_flow", "true");

      popupStore.closeLoadingPopup();

      return true;
    } catch (error) {
      console.error("占卜流程錯誤:", error);
      popupStore.closeLoadingPopup();
      popupStore.openUniversalPopup({
        icon: "error",
        title: "系統錯誤",
        text: "啟動占卜流程時發生錯誤，請稍後再試",
      });
    }
  };

  // 處理非正常流程登入
  const handleNonNormalLogin = async (showUniversalDialogFn) => {
    // 標記已經檢查過登入狀態
    localStorage.setItem("login_checked", "true");

    // 檢查是否通過正常流程登入
    const isNormalFlow =
      localStorage.getItem("fate2025_normal_flow") === "true";

    // 如果沒有通過正確流程但已經登入，顯示提示
    if (!isNormalFlow) {
      console.log("檢測到用戶不是從正常流程登入");

      showUniversalDialogFn({
        icon: "warning",
        title: "請使用正確的占卜流程",
        text: "請從活動首頁點擊「立即占卜」按鈕來完成占卜流程，\n直接使用登入網址將無法取得占卜結果。",
        confirmButtonText: "我知道了",
        showCancelButton: false,
      });
    }
  };

  // 處理登入後返回的流程
  const handlePostLoginProcess = async (
    showAlreadyPlayedMessageFn,
    showPostLoginVerificationDialogFn,
    showUniversalDialogFn,
  ) => {
    console.log("檢測到從登入頁面返回");

    // 檢查流程有效性
    const isNormalFlow =
      localStorage.getItem("fate2025_normal_flow") === "true";

    console.log("流程檢查結果:", {
      isNormalFlow,
    });

    // 處理非正常流程
    if (!isNormalFlow) {
      await handleNonNormalLogin(showUniversalDialogFn);
      return;
    }

    // 正常流程處理
    try {
      // 檢查占卜狀態
      const alreadyPlayed = await apiService.hasPlayedToday(
        userStore.udnmember,
        userStore.um2,
      );

      // 如果已經占卜過，顯示提示訊息
      if (alreadyPlayed) {
        showAlreadyPlayedMessageFn();
        return;
      }

      // 顯示驗證對話框
      showPostLoginVerificationDialogFn();
    } catch (error) {
      console.error("登入後流程錯誤:", error);
      showUniversalDialogFn({
        icon: "error",
        title: "系統錯誤",
        text: "啟動占卜流程時發生錯誤，請稍後再試",
      });
    }
  };

  return {
    startDivination,
    handleNonNormalLogin,
    handlePostLoginProcess,
  };
};
