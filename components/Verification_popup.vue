<template>
  <div
    v-if="isVisible"
    class="verification__overlay"
    :class="{ 'verification__overlay--closing': isClosing }"
  >
    <div
      class="verification__popup"
      :class="{ 'verification__popup--closing': isClosing }"
    >
      <div class="verification__popup-inner">
        <!-- 關閉按鈕 -->
        <button class="verification__close-btn" @click="closeModal">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <!-- 內容區 -->
        <div class="verification__content">
          <!-- 標題 -->
          <div class="verification__title">安全驗證</div>

          <!-- 說明文字 -->
          <div class="verification__description">
            請先完成下方安全驗證以繼續占卜
          </div>

          <!-- Turnstile 容器 -->
          <div
            id="turnstile-container"
            class="verification__turnstile-wrapper"
          ></div>

          <!-- 提示文字 -->
          <div class="verification__hint">驗證完成後將自動進行占卜</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from "vue";

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "opened"]);

const isClosing = ref(false);

const closeModal = () => {
  isClosing.value = true;
  setTimeout(() => {
    isClosing.value = false;
    emit("close");
  }, 300);
};

watch(
  () => props.isVisible,
  (newValue) => {
    if (newValue) {
      setTimeout(() => {
        emit("opened");
      }, 100);
    }
  },
);

onUnmounted(() => {
  if (
    typeof window !== "undefined" &&
    window.turnstile &&
    window.turnstileWidgetId
  ) {
    try {
      window.turnstile.remove(window.turnstileWidgetId);
    } catch (e) {
      console.log("清理 Turnstile 時發生錯誤:", e);
    }
  }
});
</script>

<style lang="scss" scoped>
.verification {
  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(15px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 12px;
    animation: overlayFadeIn 0.3s ease-out;
    @media (max-width: 640px) {
      padding: 32px;
    }
    @media (max-width: 380px) {
      padding: 22px;
    }

    &--closing {
      animation: overlayFadeOut 0.3s ease-out;
    }
  }

  &__popup {
    background: linear-gradient(to bottom, #05026a, #4a46fc);
    border-radius: 10px;
    max-width: 600px;
    max-height: 80vh;
    position: relative;
    animation: modalBounceIn 0.3s ease-out;
    padding: 20px;
    z-index: 1001;

    &--closing {
      animation: modalBounceOut 0.25s ease-in;
    }

    @media (max-width: 480px) {
      border: none;
      max-width: 95vw;
    }
    @media (max-width: 360px) {
      padding: 10px;
    }

    &::before {
      content: "";
      position: absolute;
      width: 80%;
      height: 100%;
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
      top: 0;
      left: 0;
      background: rgba(255, 255, 255, 0.05);
    }
    &::after {
      content: url("../imgs/right_ribbons.png");
      position: absolute;
      top: 100px;
      right: -30px;
      @media (max-width: 460px) {
        top: 120px;
        right: -10px;
        z-index: 1004;
      }
    }
  }

  &__popup-inner {
    position: relative;
    padding: 10px 10px;
    border-radius: 10px;
    z-index: 1;
    border: 2px solid #577bff52;
    z-index: 1002;

    &::before {
      content: url("../imgs/left_circle.png");
      position: absolute;
      top: 200px;
      left: -40px;
      @media (max-width: 460px) {
        top: 240px;
        left: -30px;
      }
      @media (max-width: 360px) {
        left: -20px;
      }
    }

    @media (max-width: 768px) {
      padding: 30px 20px;
    }
    @media (max-width: 480px) {
      padding: 25px 15px;
    }
    @media (max-width: 360px) {
      padding: 20px 10px;
    }
  }

  &__close-btn {
    position: absolute;
    top: -26px;
    right: -32px;
    width: 40px;
    height: 40px;
    border: none;
    background: linear-gradient(to bottom, #fe88f6, #fe32d9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: white;
    z-index: 10;

    @media (max-width: 480px) {
      top: -20px;
      right: -20px;
    }
    @media (max-width: 410px) {
      width: 36px;
      height: 36px;
      top: -25px;
      right: -23px;
    }

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(254, 50, 217, 0.4);
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: #fff;
    padding: 20px 0;

    &::before {
      content: url("../imgs/left_ribbons.png");
      position: absolute;
      top: 40px;
      left: -35px;
      @media (max-width: 460px) {
        left: -30px;
      }
      @media (max-width: 360px) {
        left: -20px;
      }
    }
  }

  &__title {
    font-size: 28px;
    line-height: 1.6;
    margin-bottom: 20px;
    color: #f8dfb2;
    font-weight: bold;

    @media (max-width: 480px) {
      font-size: 24px;
    }
  }

  &__description {
    font-size: 18px;
    line-height: 1.5;
    margin-bottom: 20px;
    color: #fff;

    @media (max-width: 480px) {
      font-size: 16px;
    }
  }

  &__turnstile-wrapper {
    margin: 20px auto;
    min-height: 65px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    max-width: 250px;
    transform: scale(0.9);
    z-index: 1003;
    @media (max-width: 480px) {
      width: 100%;
      transform: scale(0.8);
      transform-origin: center;
    }
  }

  &__hint {
    font-size: 16px;
    line-height: 1.5;
    margin-top: 15px;
    color: #c4c4c4;
    font-style: italic;

    @media (max-width: 480px) {
      font-size: 14px;
    }
  }
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes overlayFadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes modalBounceIn {
  0% {
    opacity: 0;
    transform: translateY(-50px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes modalBounceOut {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
}
</style>
