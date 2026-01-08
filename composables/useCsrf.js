import { ref } from "vue";
import axios from "axios";

export const useCsrf = () => {
  const csrfToken = ref(null);
  const csrfExpiry = ref(null);

  // 獲取 API URL
  const getApiUrl = (endpoint) => {
    const config = useRuntimeConfig();
    const baseUrl = (() => {
      if (config.public.domain?.includes("lab-event")) {
        return "https://lab-event.udn.com/bd_newyear2026/newyear2026php";
      } else if (config.public.domain?.includes("event.udn")) {
        return "https://event.udn.com/bd_newyear2026/newyear2026php";
      } else {
        return "https://lab-event.udn.com/bd_newyear2026/newyear2026php";
      }
    })();

    return `${baseUrl}/${endpoint}`;
  };

  // 檢查 token 是否過期
  const isTokenExpired = () => {
    if (!csrfToken.value || !csrfExpiry.value) {
      return true;
    }
    return Date.now() >= csrfExpiry.value;
  };

  // 獲取 CSRF Token
  const getCsrfToken = async (action = "divination") => {
    try {
      // 如果有有效的 token，直接返回
      if (csrfToken.value && !isTokenExpired()) {
        console.log("使用現有的 CSRF token");
        return csrfToken.value;
      }

      console.log("獲取新的 CSRF token...");
      const apiUrl = getApiUrl("getCsrfToken.php");

      const response = await axios.post(
        apiUrl,
        { action },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          withCredentials: true,
        },
      );

      if (response.data.status === "success") {
        csrfToken.value = response.data.csrf_token;
        // 設定過期時間（比伺服器早 30 秒過期，確保安全）
        csrfExpiry.value = Date.now() + (response.data.expires_in - 30) * 1000;
        console.log("✅ 安全驗證已準備");
        return csrfToken.value;
      } else {
        throw new Error("安全驗證準備失敗");
      }
    } catch (error) {
      console.error("安全驗證準備失敗:", error);
      throw error;
    }
  };

  // 清除 CSRF Token
  const clearCsrfToken = () => {
    csrfToken.value = null;
    csrfExpiry.value = null;
    console.log("已清除 CSRF token");
  };

  // 刷新 CSRF Token
  const refreshCsrfToken = async (action = "divination") => {
    clearCsrfToken();
    return await getCsrfToken(action);
  };

  return {
    csrfToken,
    getCsrfToken,
    clearCsrfToken,
    refreshCsrfToken,
    isTokenExpired,
  };
};

