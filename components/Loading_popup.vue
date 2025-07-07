<template>
  <div
    v-if="isVisible"
    class="loading__overlay"
    :class="{ 'loading__overlay--closing': isClosing }"
  >
    <div
      class="loading__popup"
      :class="{ 'loading__popup--closing': isClosing }"
    >
      <div class="loading__popup-inner">
        <button class="loading__close-btn" @click="closeModal">
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
        <div class="loading__content">
          <div class="loading__message">
            {{ loadingData.message || "處理中..." }}
          </div>
          <div class="loading__spinner">
            <div class="spinner"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  loadingData: {
    type: Object,
    default: () => ({
      message: "處理中...",
    }),
  },
});

const emit = defineEmits(["close"]);

const isClosing = ref(false);

const closeModal = () => {
  isClosing.value = true;
  setTimeout(() => {
    isClosing.value = false;
    emit("close");
  }, 300);
};
</script>

<style lang="scss" scoped>
.loading {
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

    &--closing {
      animation: modalBounceOut 0.25s ease-in;
    }

    @media (max-width: 480px) {
      border: none;
      max-width: 95vw;
    }
    @media (max-width: 410px) {
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
      @media (max-width: 410px) {
        top: 80px;
      }
    }
  }

  &__popup-inner {
    position: relative;
    padding: 10px 100px;
    border-radius: 10px;
    z-index: 1;
    border: 2px solid #577bff52;

    &::before {
      content: url("../imgs/left_circle.png");
      position: absolute;
      top: 140px;
      left: -40px;
      @media (max-width: 410px) {
        top: 110px;
        left: -30px;
      }
    }

    @media (max-width: 410px) {
      padding: 10px 80px;
    }
    @media (max-width: 360px) {
      // padding: 20px 10px;
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
      right: -30px;
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
      top: 10px;
      left: -35px;
      @media (max-width: 410px) {
        left: -30px;
      }
    }
  }

  &__message {
    font-size: 28px;
    line-height: 1.6;
    margin-bottom: 0px;
    color: #f8dfb2;
    font-weight: bold;
    white-space: pre-line;

    @media (max-width: 480px) {
      font-size: 20px;
    }
  }

  &__spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0 0 0;
  }
}

/* Loading 動畫 */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #f69f2f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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
