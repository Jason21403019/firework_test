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

  // 檢查是否應該顯示重新整理提醒
  const checkRefreshReminder = (showUniversalDialogFn) => {
    if (typeof window === "undefined") return;

    const reminderTime = localStorage.getItem("fate2025_refresh_reminder_time");
    if (!reminderTime) return;

    const now = Date.now();
    const shouldRemind = parseInt(reminderTime);

    if (now >= shouldRemind) {
      console.log("停留時間過長，顯示重新整理提醒");
      localStorage.removeItem("fate2025_refresh_reminder_time");

      // 顯示提醒彈窗
      showUniversalDialogFn({
        icon: "info",
        title: "頁面停留過久",
        text: "您已在此頁面停留超過 4 分鐘，建議重新整理頁面以獲得最新狀態",
        confirmButtonText: "立即重新整理",
        showCancelButton: true,
        cancelButtonText: "稍後再說",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    }
  };

  return {
    checkAndRedirect,
    initSimpleSync,
    checkRefreshReminder,
  };
};
