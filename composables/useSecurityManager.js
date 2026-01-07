export const useSecurityManager = () => {
  const auth = useAuth();

  // 生成隨機 session ID
  const generateSessionId = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  };

  // 設置 cookie
  const setCookie = (name, value, minutes) => {
    const date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  };

  // 獲取 cookie
  const getCookie = (name) => {
    return auth.getCookieValue(name);
  };

  // 刪除 cookie
  const deleteCookie = (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  };

  const securityManager = {
    flow: {
      // 生成和儲存流程令牌（使用前端生成的 session ID）
      async generate() {
        try {
          console.log("生成流程 session ID...");

          const udnmember = auth.getCookieValue("udnmember") || "guest";
          const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
          const sessionId = generateSessionId();

          // 組合成 token：日期_會員ID_隨機ID
          const token = `${today}_${udnmember}_${sessionId}`;

          // 使用 cookie 存儲（跨分頁共享，10分鐘有效）
          setCookie("fate2025_flow_session", token, 10);

          // 同時存到 localStorage 作為備份
          localStorage.setItem("fate2025_flow_token", token);
          const expiryTime = Date.now() + 10 * 60 * 1000; // 10分鐘
          localStorage.setItem(
            "fate2025_flow_token_expiry",
            String(expiryTime),
          );

          console.log("流程 session ID 生成成功");
          return token;
        } catch (error) {
          console.error("生成流程令牌錯誤:", error);
          throw error;
        }
      },

      // 獲取已存儲的流程令牌
      get() {
        // 優先從 cookie 讀取（跨分頁共享）
        let token = getCookie("fate2025_flow_session");

        // 如果 cookie 沒有，從 localStorage 讀取
        if (!token) {
          token = localStorage.getItem("fate2025_flow_token");
        }

        if (!token) {
          return null;
        }

        // 檢查是否過期（從 localStorage 的時間戳檢查）
        const expiryTime = parseInt(
          localStorage.getItem("fate2025_flow_token_expiry") || "0",
        );

        if (expiryTime > 0 && Date.now() > expiryTime) {
          console.warn("流程令牌已過期");
          this.clear();
          return null;
        }

        // 檢查是否為今天的 token（基於 token 中的日期）
        const today = new Date().toISOString().split("T")[0];
        if (token.startsWith(today)) {
          return token;
        } else {
          console.warn("流程令牌日期不符，清除舊 token");
          this.clear();
          return null;
        }
      },

      // 清除流程令牌
      clear() {
        deleteCookie("fate2025_flow_session");
        localStorage.removeItem("fate2025_flow_token");
        localStorage.removeItem("fate2025_flow_token_expiry");
      },
    },

    clearAll() {
      this.flow.clear();
    },
  };

  return {
    securityManager,
  };
};
