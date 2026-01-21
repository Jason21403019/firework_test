import { defineStore } from "pinia";

export const usePopupStore = defineStore("popup", {
  state: () => ({
    // 占卜結果彈窗
    showFortuneResultPopup: false,
    fortuneResultData: {},
    fortuneCustomMessage: "",
    fortuneResultType: "normal", // 'first' | 'normal' | 'final'

    // 已占卜過彈窗
    showAlreadyPlayedPopup: false,
    alreadyPlayedData: {},

    // Loading 彈窗
    showLoadingPopup: false,
    loadingData: {},

    // 驗證彈窗
    showVerificationPopup: false,

    // 通用彈窗
    showUniversalPopup: false,
    universalPopupData: {},

    // 待跳轉彈窗
    showRedirectPopup: false,
    redirectPopupData: {},
  }),

  actions: {
    // 占卜結果彈窗
    openFortuneResultPopup(fortuneData, customMessage = "", resultType = "normal") {
      this.fortuneResultData = fortuneData;
      this.fortuneCustomMessage =
        customMessage || "<div class='glowing-message'>占卜已完成！</div>";
      this.fortuneResultType = resultType;
      this.showFortuneResultPopup = true;
    },

    closeFortuneResultPopup() {
      this.showFortuneResultPopup = false;
    },

    // 已占卜過彈窗
    openAlreadyPlayedPopup(data) {
      this.alreadyPlayedData = data;
      this.showAlreadyPlayedPopup = true;
    },

    closeAlreadyPlayedPopup() {
      this.showAlreadyPlayedPopup = false;
    },

    // Loading 彈窗
    openLoadingPopup(data) {
      this.loadingData = data;
      this.showLoadingPopup = true;
    },

    closeLoadingPopup() {
      this.showLoadingPopup = false;
    },

    // 驗證彈窗
    openVerificationPopup() {
      this.showVerificationPopup = true;
    },

    closeVerificationPopup() {
      this.showVerificationPopup = false;
    },

    // 通用彈窗
    openUniversalPopup(data) {
      this.universalPopupData = {
        icon: data.icon || null,
        title: data.title || "",
        text: data.text || "",
        html: data.html || "",
        showConfirmButton: data.showConfirmButton !== false,
        showCancelButton: data.showCancelButton || false,
        confirmButtonText: data.confirmButtonText || "確定",
        cancelButtonText: data.cancelButtonText || "取消",
        allowOutsideClick: data.allowOutsideClick !== false,
        showCloseButton: data.showCloseButton !== false,
      };
      this.showUniversalPopup = true;

      return new Promise((resolve) => {
        window._universalPopupResolve = (result) => {
          this.showUniversalPopup = false;
          resolve(result);
        };
      });
    },

    closeUniversalPopup() {
      this.showUniversalPopup = false;
    },

    // 待跳轉彈窗
    openRedirectPopup(data) {
      this.redirectPopupData = {
        message: data.message || "準備進入新年活動",
        countdown: data.countdown || 4,
      };
      this.showRedirectPopup = true;
    },

    closeRedirectPopup() {
      this.showRedirectPopup = false;
    },
  },
});
