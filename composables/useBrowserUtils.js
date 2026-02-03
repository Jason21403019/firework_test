// 瀏覽器工具和同步功能
export const useBrowserUtils = () => {
  const divinationStore = useDivinationStore();
  const auth = useAuth();

  // 設置頻繁操作 cookie（2分鐘）
  const setRateLimitCookie = () => {
    const now = Date.now();
    const expireTime = now + 2 * 60 * 1000; // 2分鐘後過期
    // const expireTime = now + 5 * 1000; // 1秒後過期
    document.cookie = `fate2025_rate_limit=${expireTime}; path=/; max-age=120`;
  };

  // 檢查是否在頻繁操作冷卻時間內
  const checkRateLimit = () => {
    const cookies = document.cookie.split(';');
    const rateLimitCookie = cookies.find(c => c.trim().startsWith('fate2025_rate_limit='));

    if (!rateLimitCookie) {
      return { limited: false };
    }

    const expireTime = parseInt(rateLimitCookie.split('=')[1]);
    const now = Date.now();

    if (now < expireTime) {
      const remainingSeconds = Math.ceil((expireTime - now) / 1000);
      return {
        limited: true,
        remainingSeconds
      };
    }

    return { limited: false };
  };

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

  // 監聽其他分頁的轉運完成
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

    const enterTime = sessionStorage.getItem("fate2025_page_enter_time");
    if (!enterTime) return;

    const reminderTime = localStorage.getItem("fate2025_refresh_reminder_time");
    if (!reminderTime) return;

    const now = Date.now();

    if (parseInt(reminderTime) < parseInt(enterTime)) {
      localStorage.removeItem("fate2025_refresh_reminder_time");
      return;
    }

    if (now >= parseInt(reminderTime)) {
      localStorage.removeItem("fate2025_refresh_reminder_time");

      showUniversalDialogFn({
        icon: "info",
        title: "頁面停留過久",
        text: "您已在此頁面停留超過 5 分鐘，\n建議重新整理頁面以獲得最新狀態",
        confirmButtonText: "立即重新整理",
        showCancelButton: true,
        cancelButtonText: "稍後再說",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        } else {
          const nextReminderTime = Date.now() + 5 * 60 * 1000;
          localStorage.setItem(
            "fate2025_refresh_reminder_time",
            String(nextReminderTime),
          );
        }
      });
    }
  };

  const initVisibilityListener = (showUniversalDialogFn) => {
    if (typeof document === "undefined") return;

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        // 當使用者切回分頁時，檢查是否需要顯示提醒
        checkRefreshReminder(showUniversalDialogFn);
      }
    });
  };

  return {
    checkAndRedirect,
    initSimpleSync,
    checkRefreshReminder,
    initVisibilityListener,
    setRateLimitCookie,
    checkRateLimit,
  };
};
