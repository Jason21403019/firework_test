<template>
  <div
    v-if="isVisible"
    class="universal__overlay"
    :class="{ 'universal__overlay--closing': isClosing }"
    @click.self="handleOverlayClick"
  >
    <div
      class="universal__popup"
      :class="{ 'universal__popup--closing': isClosing }"
    >
      <div class="universal__popup-inner">
        <!-- 關閉按鈕 (僅在允許關閉時顯示) -->
        <button
          v-if="showCloseButton"
          class="universal__close-btn"
          @click="closeModal"
        >
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

        <div class="universal__content">
          <!-- 圖示區域 -->
          <div v-if="popupData.icon" class="universal__icon">
            <div :class="`universal__icon--${popupData.icon}`">
              <!-- Success 圖示 -->
              <svg
                v-if="popupData.icon === 'success'"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#52c41a"
                  stroke-width="2"
                />
                <path
                  d="m9 12 2 2 4-4"
                  stroke="#52c41a"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <!-- Error 圖示 -->
              <svg
                v-else-if="popupData.icon === 'error'"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#ff4d4f"
                  stroke-width="2"
                />
                <path
                  d="m15 9-6 6m0-6 6 6"
                  stroke="#ff4d4f"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <!-- Warning 圖示 -->
              <svg
                v-else-if="popupData.icon === 'warning'"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
                  stroke="#faad14"
                  stroke-width="2"
                />
                <path
                  d="M12 9v4m0 4h.01"
                  stroke="#faad14"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <!-- Loading 圖示 -->
              <div
                v-else-if="popupData.icon === 'loading'"
                class="universal__spinner"
              >
                <div class="spinner"></div>
              </div>
            </div>
          </div>

          <!-- 標題 -->
          <div v-if="popupData.title" class="universal__title">
            {{ popupData.title }}
          </div>

          <!-- 內容文字 -->
          <div v-if="popupData.text" class="universal__text">
            {{ popupData.text }}
          </div>

          <!-- HTML 內容 -->
          <div
            v-if="popupData.html"
            class="universal__html"
            v-html="popupData.html"
          ></div>

          <!-- 按鈕區域 -->
          <div v-if="showButtons" class="universal__buttons">
            <!-- 取消按鈕 -->
            <button
              v-if="popupData.showCancelButton"
              class="universal__btn universal__btn--cancel"
              @click="handleCancel"
            >
              {{ popupData.cancelButtonText || "取消" }}
            </button>

            <!-- 確認按鈕 -->
            <button
              v-if="popupData.showConfirmButton !== false"
              class="universal__btn universal__btn--confirm"
              @click="handleConfirm"
            >
              {{ popupData.confirmButtonText || "確定" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  popupData: {
    type: Object,
    default: () => ({
      icon: null, // 'success', 'error', 'warning', 'loading'
      title: "",
      text: "",
      html: "",
      showConfirmButton: true,
      showCancelButton: false,
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      allowOutsideClick: true,
      showCloseButton: true,
    }),
  },
});

const emit = defineEmits(["close", "confirm", "cancel"]);

const isClosing = ref(false);

// 計算屬性
const showCloseButton = computed(
  () => props.popupData.showCloseButton !== false,
);
const showButtons = computed(
  () =>
    props.popupData.showConfirmButton !== false ||
    props.popupData.showCancelButton,
);

// 方法
const closeModal = () => {
  isClosing.value = true;
  setTimeout(() => {
    isClosing.value = false;
    emit("close");
  }, 300);
};

const handleOverlayClick = () => {
  if (props.popupData.allowOutsideClick !== false) {
    closeModal();
  }
};

const handleConfirm = () => {
  emit("confirm");
  closeModal();
};

const handleCancel = () => {
  emit("cancel");
  closeModal();
};
</script>

<style lang="scss" scoped>
.universal {
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
      top: 170px;
      right: -30px;
      @media (max-width: 460px) {
        top: 140px;
        right: -20px;
        z-index: 1004;
      }
    }
  }

  &__popup-inner {
    position: relative;
    padding: 10px 40px;
    border-radius: 10px;
    z-index: 1;
    border: 2px solid #577bff52;

    &::before {
      content: url("../imgs/left_circle.png");
      position: absolute;
      top: 220px;
      left: -40px;
      @media (max-width: 460px) {
        top: 180px;
        left: -30px;
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
      top: 80px;
      left: -35px;
      @media (max-width: 460px) {
        left: -30px;
      }
      @media (max-width: 360px) {
        top: 60px;
      }
    }
  }

  &__icon {
    margin-bottom: 20px;

    &--success svg {
      filter: drop-shadow(0 0 10px rgba(82, 196, 26, 0.3));
    }

    &--error svg {
      filter: drop-shadow(0 0 10px rgba(255, 77, 79, 0.3));
    }

    &--warning svg {
      filter: drop-shadow(0 0 10px rgba(250, 173, 20, 0.3));
    }
  }

  &__title {
    font-size: 28px;
    line-height: 1.6;
    margin-bottom: 15px;
    color: #f8dfb2;
    font-weight: bold;

    @media (max-width: 480px) {
      font-size: 24px;
    }
    @media (max-width: 360px) {
      font-size: 22px;
    }
  }

  &__text {
    font-size: 18px;
    line-height: 1.5;
    margin-bottom: 20px;
    color: #fff;
    white-space: pre-line;

    @media (max-width: 480px) {
      font-size: 16px;
    }
  }

  &__html {
    font-size: 18px;
    line-height: 1.5;
    margin-bottom: 20px;
    color: #fff;

    @media (max-width: 480px) {
      font-size: 16px;
    }
  }

  &__buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 20px;
  }

  &__btn {
    padding: 12px 24px;
    border: none;
    border-radius: 50px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 100px;

    &--confirm {
      background: linear-gradient(to right, #1890ff, #40a9ff);
      color: white;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
      }
    }

    &--cancel {
      background: linear-gradient(to right, #8c8c8c, #bfbfbf);
      color: white;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(140, 140, 140, 0.4);
      }
    }

    @media (max-width: 480px) {
      padding: 10px 20px;
      font-size: 14px;
      min-width: 80px;
    }
  }

  &__spinner {
    display: flex;
    justify-content: center;
    align-items: center;
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
