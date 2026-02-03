<template>
  <div v-if="isVisible" class="verification__overlay" :class="{ 'verification__overlay--closing': isClosing }">
    <div class="verification__popup" :class="{ 'verification__popup--closing': isClosing }">
      <div class="verification__popup-inner">
        <!-- 關閉按鈕 -->
        <button class="verification__close-btn" @click="closeModal">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 20L4 4M4 20L20 4" stroke="currentColor" stroke-width="4" />
          </svg>
        </button>

        <!-- 內容區 -->
        <div class="verification__content">
          <!-- 標題 -->
          <div class="verification__title">安全驗證</div>

          <!-- 說明文字 -->
          <div class="verification__description">
            請先完成下方安全驗證以繼續轉運
          </div>

          <!-- Turnstile 容器 -->
          <div id="turnstile-container" class="verification__turnstile-wrapper"></div>

          <!-- 提示文字 -->
          <div class="verification__hint">驗證完成後將自動進行轉運</div>
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
  });
};

watch(
  () => props.isVisible,
  (newValue) => {
    if (newValue) {
      setTimeout(() => {
        emit("opened");
      });
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
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 12px;
    animation: overlayFadeIn 0.3s ease-out;

    &--closing {
      animation: overlayFadeOut 0.3s ease-out;
    }
  }

  &__popup {
    background: #D83307;
    border-radius: 25px;
    max-width: 1060px;
    max-height: 700px;
    position: relative;
    animation: modalBounceIn 0.3s ease-out;
    border: 10px solid #E05C39;

    &--closing {
      animation: modalBounceOut 0.25s ease-in;
    }
  }

  &__popup-inner {
    position: relative;
    padding: 60px 40px;

    @media (max-width: 480px) {
      padding: 30px 30px;
    }
  }

  &__close-btn {
    position: absolute;
    top: -22px;
    right: -22px;
    width: 40px;
    height: 40px;
    border: none;
    background: #E7C170;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #80552B;
    z-index: 10;
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: #fff;
    gap: 30px;
  }

  &__title {
    font-size: 30px;
    line-height: 1.6;
    color: #FAEBB5;
    font-weight: bold;

    @media (max-width: 480px) {
      font-size: 24px;
    }
  }

  &__description {
    font-size: 18px;
    line-height: 1.5;
    color: #fff;

    @media (max-width: 480px) {
      font-size: 16px;
    }
  }

  &__turnstile-wrapper {
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
