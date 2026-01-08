// 瀏覽器工具和同步功能
export const useBrowserUtils = () => {
  const divinationStore = useDivinationStore();
  const auth = useAuth();

  // 瀏覽器檢測和跳轉
  const checkAndRedirect = (showUniversalDialogFn) => {
    const ua = navigator.userAgent.toLowerCase();
    const isLineApp = /Line/i.test(ua);
    const isFbApp = /FBAV/i.test(ua) || /FBAN/i.test(ua);
    const isExAppUrl = /[?&]openExternalBrowser=1\b/.test(window.location.href);

    if (isLineApp && !isExAppUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set("openExternalBrowser", "1");
      window.location.replace(url.toString());
    }
    if (isFbApp) {
      showUniversalDialogFn({
        icon: "warning",
        title: "您正在使用 Facebook 內建瀏覽器",
        text: "建議使用外部瀏覽器開啟，以獲得最佳體驗",
        confirmButtonText: "確定",
        showCancelButton: false,
      });
    }
  };

  // 監聽其他分頁的占卜完成
  const initSimpleSync = (showAlreadyPlayedMessageFn) => {
    window.addEventListener("storage", (event) => {
      if (event.key === "fate2025_divination_sync") {
        const data = JSON.parse(event.newValue || "{}");

        // 簡單更新狀態
        divinationStore.setPlayedStatus(true);
        if (data.totalCount) {
          divinationStore.setTotalPlayCount(data.totalCount);
        }
      }
    });
  };

  // 檢查是否應該自動登出
  const checkAutoLogout = () => {
    if (typeof window === "undefined") return;

    const logoutTime = localStorage.getItem("fate2025_logout_time");
    if (!logoutTime) return;

    const now = Date.now();
    const shouldLogout = parseInt(logoutTime);

    if (now >= shouldLogout) {
      console.log("自動登出時間已到，清除登入狀態");
      localStorage.removeItem("fate2025_logout_time");
      auth.clearCookiesAfterDivination();
    }
  };

  return {
    checkAndRedirect,
    initSimpleSync,
    checkAutoLogout,
  };
};
