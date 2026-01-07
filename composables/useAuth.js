import { useUserStore } from "~/stores/user";

export const useAuth = () => {
  const userStore = useUserStore();

  // 獲取 Cookie 值
  const getCookieValue = (name) => {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      let parts = cookie.trim().split("=");
      if (parts[0].trim() === name) {
        return parts.slice(1).join("=");
      }
    }
    return null;
  };

  // 更新登入狀態
  const updateLoginStatus = () => {
    const udnmember = getCookieValue("udnmember");
    const um2 = getCookieValue("um2");
    const isLoggedIn = !!(udnmember && um2);

    userStore.setLoginStatus(isLoggedIn);
    if (isLoggedIn) {
      userStore.setUserData({
        udnmember,
        um2,
        email: udnmember || `user_${Date.now()}@example.com`,
      });
    }

    return isLoggedIn;
  };

  // 登出功能
  const logout = () => {
    if (typeof window === "undefined") return;

    try {
      const domains = [
        "",
        window.location.hostname,
        `.${window.location.hostname}`,
        "udn.com",
        ".udn.com",
        "event.udn.com",
        "lab-event.udn.com",
      ];

      const paths = ["/", "/bd_newyear2026", "/bd_newyear2026"];
      const cookieNames = ["udnmember", "um2", "nickname", "fg_mail"];

      domains.forEach((domain) => {
        paths.forEach((path) => {
          cookieNames.forEach((name) => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}${domain ? "; domain=" + domain : ""}`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}${domain ? "; domain=" + domain : ""}; secure`;
          });
        });
      });

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes("fate2025")) {
          localStorage.removeItem(key);
        }
      }

      localStorage.removeItem("login_checked");
      localStorage.clear();

      userStore.clearUserData();
      console.log("已清除所有登入相關狀態");
    } catch (e) {
      console.error("清除 Cookie 過程中發生錯誤:", e);
    }
  };

  // 清除占卜後的 Cookies
  const clearCookiesAfterDivination = () => {
    if (typeof window === "undefined") return;

    try {
      const cookieNames = ["udnmember", "um2", "nickname", "fg_mail"];

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

      const paths = ["/", "/bd_newyear2026/"];

      domains.forEach((domain) => {
        paths.forEach((path) => {
          cookieNames.forEach((name) => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; secure`;
          });
        });
      });

      localStorage.clear();
      sessionStorage.clear();

      userStore.clearUserData();
      console.log("已清除占卜後的 cookie 和認證資料");
    } catch (e) {
      console.error("清除 Cookie 過程中發生錯誤:", e);
    }
  };

  // URL 安全驗證
  const isUrlSafe = (url) => {
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
        "/bd_newyear2026/",
        "/bd_newyear2026/",
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
  };

  // XSS 防護
  const sanitizeInput = (input) => {
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
  };

  return {
    getCookieValue,
    updateLoginStatus,
    logout,
    clearCookiesAfterDivination,
    isUrlSafe,
    sanitizeInput,
  };
};
