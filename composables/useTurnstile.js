export const useTurnstile = (onVerificationSuccess) => {
  const config = useRuntimeConfig();
  const turnstileToken = ref(null);
  const turnstileWidgetId = ref(null);
  const isTurnstileVerified = ref(false);
  const TURNSTILE_SITE_KEY = config.public.turnstileSiteKey;

  // 載入 Turnstile 腳本
  const loadTurnstileScript = () => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("cf-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(renderTurnstile, 100);
      };
      document.head.appendChild(script);
    } else {
      setTimeout(renderTurnstile, 100);
    }
  };

  // 渲染 Turnstile 驗證
  const renderTurnstile = () => {
    if (typeof window === "undefined" || !window.turnstile) return;

    const container = document.getElementById("turnstile-container");
    if (!container) return;

    if (turnstileWidgetId.value) {
      try {
        window.turnstile.remove(turnstileWidgetId.value);
      } catch (e) {
        console.error("Turnstile 移除錯誤:", e);
      }
    }

    try {
      turnstileWidgetId.value = window.turnstile.render(
        "#turnstile-container",
        {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "dark",
          callback: function (token) {
            console.log(
              "Turnstile 驗證成功，取得 token:",
              token.substring(0, 10) + "...",
            );

            turnstileToken.value = token;
            isTurnstileVerified.value = true;
            window.temp_turnstile_token = token;
            localStorage.setItem("turnstile_token", token);

            // 調用成功回調
            if (onVerificationSuccess) {
              onVerificationSuccess(token);
            }
          },
          "expired-callback": function () {
            console.warn("Turnstile token 已過期");
            turnstileToken.value = null;
            isTurnstileVerified.value = false;
            window.temp_turnstile_token = null;
            localStorage.removeItem("turnstile_token");
          },
        },
      );
    } catch (error) {
      console.error("Turnstile 渲染錯誤:", error);
    }
  };

  // 清理 Turnstile
  const cleanupTurnstile = () => {
    if (
      typeof window !== "undefined" &&
      window.turnstile &&
      turnstileWidgetId.value
    ) {
      try {
        window.turnstile.remove(turnstileWidgetId.value);
        turnstileWidgetId.value = null;
      } catch (e) {
        console.error("清理 Turnstile 時發生錯誤:", e);
      }
    }
  };

  // 設置驗證成功狀態
  const setVerificationSuccess = () => {
    if (typeof window === "undefined") return;
    isTurnstileVerified.value = true;
  };

  return {
    turnstileToken,
    turnstileWidgetId,
    isTurnstileVerified,
    loadTurnstileScript,
    renderTurnstile,
    cleanupTurnstile,
    setVerificationSuccess,
  };
};
