import axios from "axios";

export const useApiService = () => {
  const config = useRuntimeConfig();

  // 根據環境生成 API URL
  const getApiUrl = (endpoint) => {
    const baseUrl = (() => {
      if (config.public.domain?.includes("lab-event")) {
        return "https://lab-event.udn.com/bd_newyear_2026/newyear2026php";
      } else if (config.public.domain?.includes("event.udn")) {
        return "https://event.udn.com/bd_newyear_2026/newyear2026php";
      } else {
        return "https://lab-event.udn.com/bd_newyear_2026/newyear2026php";
      }
    })();

    return `${baseUrl}/${endpoint}`;
  };

  // 生成登入 URL
  const getLoginUrl = () => {
    let redirectUrl;

    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;

      if (hostname === "lab-event.udn.com") {
        redirectUrl = "https://lab-event.udn.com/bd_newyear_2026/";
      } else if (hostname === "event.udn.com") {
        redirectUrl = "https://event.udn.com/bd_newyear_2026/";
      } else {
        redirectUrl = "https://lab-event.udn.com/bd_newyear_2026/";
      }
    } else {
      const domain = config.public.domain;

      if (domain?.includes("lab-event")) {
        redirectUrl = "https://lab-event.udn.com/bd_newyear_2026/";
      } else if (domain?.includes("event.udn")) {
        redirectUrl = "https://event.udn.com/bd_newyear_2026/";
      } else {
        redirectUrl = "https://lab-event.udn.com/bd_newyear_2026/";
      }
    }

    return `https://member.udn.com/member/login.jsp?site=bd_newyear_2026&again=y&redirect=${redirectUrl}`;
  };

  // 檢查用戶今天是否已經占卜過
  const hasPlayedToday = async (udnmember, um2) => {
    if (typeof window === "undefined") return false;

    if (!udnmember || !um2) {
      return false;
    }

    try {
      const apiUrl = getApiUrl("checkPlayStatus.php");
      const requestData = { udnmember, um2 };

      const response = await axios.post(apiUrl, requestData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (
        response.data.status === "success" &&
        response.data.played_today === true
      ) {
        console.log("✅ 已占卜");
        return true;
      }

      console.log("📝 尚未占卜");
      return false;
    } catch (error) {
      console.error("❌ 檢查占卜狀態錯誤:", error);
      return false;
    }
  };

  // 獲取用戶占卜數據
  const fetchUserPlayData = async (udnmember, um2) => {
    try {
      const apiUrl = getApiUrl("checkPlayStatus.php");

      const response = await axios.post(
        apiUrl,
        { udnmember, um2 },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );

      return response.data;
    } catch (error) {
      console.error("❌ 獲取占卜數據錯誤:", error);
      throw error;
    }
  };

  // 保存用戶數據（支援 CSRF Token）
  const saveUserData = async (userData, csrfToken = null) => {
    try {
      const apiUrl = getApiUrl("saveUserData.php");

      // 準備請求標頭
      const headers = {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      };

      // 如果有 CSRF token，加入標頭
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }

      const response = await axios.post(apiUrl, userData, {
        headers,
        withCredentials: true,
        timeout: 30000,
      });

      // 如果回應中包含 debug 資訊，顯示出來
      if (response.data.debug) {
        console.warn("🔍 後端調試:", response.data.debug);
      }

      // 如果是錯誤且有 E003，顯示更多資訊
      if (
        response.data.status === "error" &&
        response.data.message &&
        response.data.message.includes("E003")
      ) {
        console.error("❌ CSRF 驗證失敗:", response.data.message);
      }

      return response.data;
    } catch (error) {
      console.error("保存用戶數據失敗:", error);
      let errorMessage = "保存用戶數據失敗";

      if (error.response) {
        console.error(
          "服務器回應錯誤:",
          error.response.status,
          error.response.data,
        );
        errorMessage = `伺服器錯誤: ${error.response.status}, ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        console.error("請求無回應:", error.request);
        errorMessage = "無法連接到伺服器，請檢查網路連接或API是否可用";
      } else {
        console.error("請求錯誤:", error.message);
        errorMessage = `請求錯誤: ${error.message}`;
      }

      if (error.response && error.response.data) {
        const responseData = error.response.data;
        if (
          responseData.message &&
          responseData.message.includes("系統檢測到自動化行為")
        ) {
          errorMessage =
            "安全警告：系統檢測到自動化行為，請使用正常的瀏覽器操作";
        } else if (
          responseData.message &&
          responseData.message.includes("驗證已過期")
        ) {
          errorMessage = "驗證已過期，請重新驗證";
        }
      }

      return { status: "error", error: errorMessage, message: errorMessage };
    }
  };

  // 重置資料庫
  const resetDatabase = async () => {
    try {
      const apiUrl = getApiUrl("resetDatabase.php");

      const response = await axios.post(
        apiUrl,
        { security_key: "reset2025fate" },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      return response.data;
    } catch (error) {
      console.error("重置資料庫時發生錯誤:", error);
      throw error;
    }
  };

  return {
    getApiUrl,
    getLoginUrl,
    hasPlayedToday,
    fetchUserPlayData,
    saveUserData,
    resetDatabase,
  };
};
