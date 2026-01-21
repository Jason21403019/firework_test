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
        <button class="fortune-result__close-btn" @click="closeModal">
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 20L4 4M4 20L20 4"
                stroke="currentColor"
                stroke-width="4"
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
  });
};

const generateShareUrl = () => {
  return "https://lab-event.udn.com/bd_newyear2026";
};

const shareToLine = () => {
  const shareUrl = generateShareUrl();

  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;

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
