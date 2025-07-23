<template>
  <div
    v-if="isVisible"
    class="fortune-result__overlay"
    :class="{ 'fortune-result__overlay--closing': isClosing }"
    @click.self="closeModal"
  >
    <div
      class="fortune-result__popup"
      :class="{ 'fortune-result__popup--closing': isClosing }"
    >
      <div class="fortune-result__popup-inner">
        <button class="fortune-result__close-btn" @click="closeModal">
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
        <div
          class="fortune-result__image-container"
          v-if="fortuneData.image_url"
        >
          <img
            :src="fortuneData.image_url"
            :alt="fortuneData.title"
            class="fortune-result__image"
          />
        </div>

        <h2 class="fortune-result__title">
          {{ fortuneData.title || "您的占卜結果" }}
        </h2>

        <div class="fortune-result__content">
          <p class="fortune-result__description">
            {{ fortuneData.description || "您的運勢將會非常好！" }}
          </p>
          <div
            v-if="customMessage"
            v-html="customMessage"
            class="fortune-result__custom-message"
          ></div>
          <div class="fortune-result__share-buttons">
            <button @click="shareToLine" class="fortune-result__line-button">
              Line 分享占卜結果
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  fortuneData: {
    type: Object,
    default: () => ({}),
  },
  customMessage: {
    type: String,
    default: "",
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

const generateShareUrl = () => {
  const resultMap = {
    fortune_1: "heart",
    fortune_2: "goldwave",
    fortune_3: "healing",
    fortune_4: "goldlight",
  };

  return "https://lab-event.udn.com/bd_fate2025_test";
};

const getResultName = () => {
  const resultMap = {
    fortune_1: "心型煙火",
    fortune_2: "金浪煙火",
    fortune_3: "療癒煙火",
    fortune_4: "金光煙火",
  };

  return resultMap[props.fortuneData.id] || "神秘結果";
};

const shareToLine = () => {
  const shareUrl = generateShareUrl();
  const resultName = getResultName();
  const shareText = `我在「幸福煙火轉一夏」中得到了「${resultName}」！你的運勢如何？快來測試看看吧！`;

  const resultMap = {
    fortune_1: "heart",
    fortune_2: "goldwave",
    fortune_3: "healing",
    fortune_4: "goldlight",
  };
  const shareResultType = resultMap[props.fortuneData.id] || "heart";
  localStorage.setItem("last_fortune_result", shareResultType);

  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  window.open(lineShareUrl, "_blank", "width=600,height=600");
};
</script>

<style lang="scss" scoped>
.fortune-result {
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
    max-height: 90vh;
    position: relative;
    animation: modalBounceIn 0.3s ease-out;
    padding: 20px;

    &--closing {
      animation: modalBounceOut 0.25s ease-in;
    }

    @media (max-width: 640px) {
      border: none;
      max-width: 95vw;
    }
    @media (max-width: 410px) {
      max-width: 90vw;
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
  }

  &__popup-inner {
    position: relative;
    padding: 10px 10px;
    border-radius: 10px;
    z-index: 1;
    border: 2px solid #577bff52;
    &::before {
      content: url("../imgs/left_circle.png");
      position: absolute;
      top: 370px;
      left: -40px;
      @media (max-width: 410px) {
        left: -30px;
      }
      @media (max-width: 380px) {
        top: 300px;
      }
    }

    @media (max-width: 768px) {
      padding: 30px 20px;
    }
    @media (max-width: 480px) {
      padding: 25px 15px;
    }
    @media (max-width: 410px) {
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
      right: -30px;
    }

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(254, 50, 217, 0.4);
    }
  }

  &__title {
    font-size: 28px;
    font-weight: bold;
    color: #f8dfb2;
    text-align: center;
    margin-bottom: 20px;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);

    @media (max-width: 640px) {
      font-size: 24px;
    }
    @media (max-width: 410px) {
      font-size: 20px;
    }
  }

  &__image-container {
    text-align: center;
    margin-bottom: 20px;
    &::before {
      content: url("../imgs/left_ribbons.png");
      position: absolute;
      top: 160px;
      left: -35px;
      @media (max-width: 410px) {
        left: -30px;
      }
    }
    &::after {
      content: url("../imgs/right_ribbons.png");
      position: absolute;
      top: 240px;
      right: -50px;
      @media (max-width: 410px) {
        right: -30px;
      }
      @media (max-width: 380px) {
        right: -35px;
        top: 180px;
      }
    }
  }

  &__image {
    width: 100%;
    border-radius: 10px;
  }

  &__content {
    text-align: center;
    color: #fff;
  }

  &__description {
    font-size: 20px;
    line-height: 1.6;
    margin-bottom: 20px;
    white-space: pre-line;

    @media (max-width: 640px) {
      font-size: 18px;
    }

    @media (max-width: 480px) {
      font-size: 14px;
    }
    @media (max-width: 380px) {
      font-size: 12px;
    }
  }

  &__custom-message {
    margin: 20px 0;

    :deep(.glowing-message) {
      padding: 15px;
      margin: 20px auto;
      border-radius: 10px;
      border: 2px solid #f69f2f;
      background: transparent;
      color: #fff;
      font-weight: bold;
      box-shadow:
        0 0 10px #f69f2f,
        inset 0 0 10px #f69f2f;
      max-width: 90%;
      text-align: center;
      font-size: 18px;
      display: block;
      line-height: 1.5;
      .glowing-message-title {
        font-size: 24px;
        font-weight: bold;
        color: #f8dfb2;
        text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
        @media (max-width: 410px) {
          font-size: 20px;
        }
      }

      &::after {
        content: url("../imgs/right_circle.png");
        position: absolute;
        bottom: 0px;
        right: -10px;
        @media (max-width: 380px) {
          bottom: -10px;
        }
      }
      @media (max-width: 640px) {
        font-size: 16px;
      }

      @media (max-width: 480px) {
        font-size: 14px;
        padding: 8px;
      }
      @media (max-width: 380px) {
        font-size: 12px;
      }
    }
  }

  &__share-buttons {
    margin-top: 25px;
    display: flex;
    justify-content: center;
    margin-bottom: -60px;
  }

  &__line-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(to right, #f7c439, #f69c2e); // 您指定的漸層色
    color: white;
    border: none;
    border-radius: 50px;
    font-weight: 600;
    max-width: 480px;
    padding: 16px 60px;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap; // 防止文字換行
    box-sizing: border-box;

    &:hover {
      background: linear-gradient(
        to right,
        #f69c2e,
        #f7c439
      ); // hover 時反轉漸層
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(247, 196, 57, 0.4);
    }

    img {
      margin-right: 4px;
      flex-shrink: 0; // 防止圖片被壓縮
    }
    @media (max-width: 640px) {
      padding: 12px 24px;
      font-size: 18px;
    }

    @media (max-width: 480px) {
      padding: 10px 16px;
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
