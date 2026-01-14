// 登入流程處理
export const useLoginFlow = () => {
  const userStore = useUserStore();
  const divinationStore = useDivinationStore();
  const popupStore = usePopupStore();
  const apiService = useApiService();

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

      // 3. 設置流程標記（加上分頁 ID 避免跨分頁干擾）
      // 每次點擊都生成新的 tab_id，避免舊標記干擾
      const tabId = Date.now() + "_" + Math.random();
      sessionStorage.setItem("fate2025_tab_id", tabId);

      // 同時存到 localStorage，這樣跨域跳轉後可以恢復
      localStorage.setItem("fate2025_tab_id", tabId);
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

  // 顯示非正常流程警告（移除重複的 isNormalFlow 檢查）
  const showNonNormalFlowWarning = (showUniversalDialogFn) => {
    // 標記已經檢查過登入狀態
    localStorage.setItem("login_checked", "true");

    showUniversalDialogFn({
      icon: "warning",
      title: "請使用正確的占卜流程",
      text: "請從活動首頁點擊「立即占卜」按鈕來完成占卜流程，\n直接使用登入網址將無法取得占卜結果。",
      confirmButtonText: "我知道了",
      showCancelButton: false,
    });
  };

  // 檢查並處理非正常流程登入
  const checkAndHandleNonNormalFlow = async (showUniversalDialogFn) => {
    const isNormalFlow =
      localStorage.getItem("fate2025_normal_flow") === "true";

    if (!isNormalFlow) {
      showNonNormalFlowWarning(showUniversalDialogFn);
      return false; // 返回 false 表示流程無效
    }

    return true; // 返回 true 表示流程有效
  };

  // 處理登入後返回的流程
  const handlePostLoginProcess = async (
    showAlreadyPlayedMessageFn,
    showPostLoginVerificationDialogFn,
    showUniversalDialogFn,
  ) => {
    const auth = useAuth();

    // 檢查是否為同一位會員（前端 Cookie 驗證）
    const isSameMember = auth.verifySameMember();

    // 如果不是同一位會員，顯示警告
    if (!isSameMember) {
      showUniversalDialogFn({
        icon: "warning",
        title: "會員驗證失敗",
        text: "系統檢測到您可能不是從本頁面進行登入，\n請從活動首頁點擊「立即占卜」按鈕來完成占卜流程。",
        confirmButtonText: "我知道了",
        showCancelButton: false,
      });
      return;
    }

    // 檢查並處理非正常流程（統一的流程檢查）
    const isValidFlow = await checkAndHandleNonNormalFlow(
      showUniversalDialogFn,
    );
    if (!isValidFlow) {
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
    checkAndHandleNonNormalFlow,
    showNonNormalFlowWarning,
    handlePostLoginProcess,
  };
};
