<template>
  <div
    v-if="isVisible"
    class="already-played__overlay"
    :class="{ 'already-played__overlay--closing': isClosing }"
    @click.self="closeModal"
  >
    <div
      class="already-played__popup"
      :class="{ 'already-played__popup--closing': isClosing }"
    >
      <div class="already-played__popup-inner">
        <button class="already-played__close-btn" @click="closeModal">
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

        <div class="already-played__title">
          <img
            src="/imgs/play_again.png"
            alt="您今天已經占卜過了"
            class="already-played__title-image"
          />
        </div>
        <div
          class="already-played__image-container"
          v-if="alreadyPlayedData.image_url"
        >
          <img
            :src="alreadyPlayedData.image_url"
            alt="今日已參加過囉!"
            class="already-played__image"
          />
        </div>

        <div class="already-played__content">
          <div
            v-if="alreadyPlayedData.message"
            class="already-played__points-message"
          >
            {{ alreadyPlayedData.message }}
          </div>

          <div
            v-if="alreadyPlayedData.reminder"
            class="already-played__reminder"
          >
            {{ alreadyPlayedData.reminder }}
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
  alreadyPlayedData: {
    type: Object,
    default: () => ({}),
  },
  totalPlayCount: {
    type: Number,
    default: 0,
  },
  isDevelopment: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "clear-record"]);

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
.already-played {
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
    padding: 20px;
    animation: modalBounceIn 0.3s ease-out;

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
      content: url("../imgs/right_circle.png");
      position: absolute;
      bottom: -20px;
      right: 40px;
      z-index: 10;
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
      right: -30px;
    }

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(254, 50, 217, 0.4);
    }
  }

  &__title {
    text-align: center;
    margin: 40px 0px;
  }

  &__title-image {
    max-width: 80%;
    height: auto;
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
        top: 190px;
      }
      @media (max-width: 380px) {
        right: -35px;
        top: 180px;
      }
    }
  }

  &__image {
    width: 100%;
    max-width: 400px;
    @media (max-width: 640px) {
      max-width: 300px;
    }
  }

  &__content {
    text-align: center;
    color: #fff;
  }

  &__points-message {
    font-size: 22px;
    line-height: 1.6;
    margin-bottom: 20px;
    color: #f8dfb2;
    font-weight: bold;
    white-space: pre-line;
    @media (max-width: 640px) {
      font-size: 18px;
    }
    @media (max-width: 480px) {
      font-size: 16px;
    }
    @media (max-width: 460px) {
      white-space: normal;
    }
  }

  &__reminder {
    font-size: 22px;
    line-height: 1.5;
    margin-bottom: 40px;
    color: #fff;
    white-space: pre-line;
    @media (max-width: 640px) {
      font-size: 18px;
    }
    @media (max-width: 480px) {
      font-size: 16px;
    }
    @media (max-width: 460px) {
      white-space: normal;
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
