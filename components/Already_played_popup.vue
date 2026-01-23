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
        <!-- 紅包袋口裝飾 -->
        <div class="already-played__bag-mouth">
          <svg xmlns="http://www.w3.org/2000/svg" width="550" height="150" viewBox="0 0 550 150">
            <path id="袋口" d="M521.93,91.761l-145.15-71.9a276.343,276.343,0,0,0-203.96-.289L28.35,91.093a49.864,49.864,0,0,0-28.21,44.6L0,150.208H550V136.426a49.852,49.852,0,0,0-28.07-44.675Z" transform="translate(0 -0.208)" fill="#bf2900"/>
          </svg>
        </div>

        <button class="already-played__close-btn" @click="closeModal">
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
        <div class="already-played__img-container">
          <img
            src="/imgs/repeatimg.png"
            alt="已玩過圖片"
            class="already-played__img"
          />
        </div>

        <!-- 第一次重複：title 在 content 裡面 -->
        <template v-if="repeatType === 'first'">
          <div class="already-played__content already-played__content--first">
            <h2 class="already-played__title">
              <span class="already-played__title-coin">
                <img src="/public/imgs/title_coin.png" alt="title_coin" />
              </span>
              <span class="already-played__title-text">{{ '今天已經轉過好運囉！' }}</span>
              <span class="already-played__title-coin">
                <img src="/public/imgs/title_coin.png" alt="title_coin" />
              </span>
            </h2>
            <p class="already-played__desc">
              {{ '獲得 LINE POINTS 5點 抽獎資格(送完為止)\n兌換序號將於活動後寄送。' }}
            </p>
          </div>
          <div
            v-if="customMessage"
            v-html="customMessage"
            class="already-played__custom-msg"
            ></div>
        </template>

        <!-- normal：只有 title，沒有 content -->
        <template v-else>
          <div class="already-played__title-wrapper">
            <span class="already-played__title-coin">
              <img src="/public/imgs/title_coin.png" alt="title_coin" />
            </span>
            <h2 class="already-played__title already-played__title--normal">
              {{ '今天已經轉過好運囉！' }}
            </h2>
            <span class="already-played__title-coin">
              <img src="/public/imgs/title_coin.png" alt="title_coin" />
            </span>
          </div>
      
          <div
            v-if="customMessage"
            v-html="customMessage"
            class="already-played__custom-msg already-played__custom-msg--normal"
          ></div>
        </template>
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
  customMessage: {
    type: String,
    default: "",
  },
  repeatType: {
    type: String,
    default: "normal", // 'first' | 'normal'
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

    &--closing {
      animation: overlayFadeOut 0.3s ease-out;
    }
  }

  &__popup {
    background:#D83307;
    border-bottom-left-radius: min(9.09cqw, 50px);
    border-bottom-right-radius: min(9.09cqw, 50px);
    width: 100%;
    max-width: 550px;
    max-height: 630px;
    position: relative;
    animation: modalBounceIn 0.3s ease-out;
    container-type: inline-size;
    padding-bottom: min(3.64cqw, 20px);
    aspect-ratio: 550 / 600;
    overflow: visible;
    margin-top: 15vh;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      height: min(2.73cqw, 15px);
      background-color: #E05C39;
    }

    &--closing {
      animation: modalBounceOut 0.25s ease-in;
    }
  }

  &__bag-mouth {
    position: absolute;
    left: 50%;
    bottom: 99.7%;
    transform: translateX(-50%);
    width: 100%;
    z-index: 1;
    
    svg {
      width: 100%;
      height: auto;
    }
  }

  &__close-btn {
    position: absolute;
    top: -75px;
    right: 0px;
    width: 50px;
    height: 50px;
    border: none;
    background: #E7C170;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #80552B;
    z-index: 10;
    @media (max-width: 480px) {
      top: -55px;
      width: 40px;
      height: 40px;
    }
  }

  &__title {
    width: 100%;
    max-width: min(72.64cqw, 400px);
    margin: 0 auto;
    background-color: #D83307;
    font-size: clamp(18px, 5.45cqw, 30px);
    font-weight: bold;
    color: #FAEBB5;
    text-align: center;
    margin-bottom: clamp(15px, 5.45cqw, 30px);
    white-space: pre-line;
    line-height: 1.5;
    text-shadow: min(0.18cqw, 1px) min(0.18cqw, 1px) min(0.73cqw, 4px) rgba(0, 0, 0, 0.5);
    
    @media (max-width: 360px) {
      font-size: 16px;
    }
    
  &-coin {
      width: clamp(15px, 4.55cqw, 25px);
      height: clamp(15px, 4.55cqw, 25px);
      display: inline-block;
      &:first-child {
        margin-right: clamp(8px, 2.73cqw, 15px);
        padding-left: clamp(5px, 1.82cqw, 10px);
      }
      &:last-child {
        margin-left: clamp(3px, 0.91cqw, 5px);
        padding-right: clamp(5px, 1.82cqw, 10px);
      }
      
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    &-text {
      flex: 1;
    }

    &--normal {
      flex: 1;
    }
  }

  &__title-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(8px, 2.73cqw, 15px);
    width: 100%;
    max-width: min(78.64cqw, 460px);
    margin: 0 auto min(12.73cqw, 70px);
  }

  &__img-container {
    width: 100%;
    max-width: min(69.09cqw, 380px);
    aspect-ratio: 380 / 247;
    margin: 0 auto;
    margin-top: min(7.27cqw, 40px);
    margin-bottom: min(7.27cqw, 40px);
    text-align: center;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__content {
    text-align: center;
    margin: 0 auto;
    color: #fff;
    margin-bottom: min(6.36cqw, 35px);
 
    // 第一次重複樣式（title 在 content 裡面）
    &--first {
      width: 90%;
      max-width: min(88.36cqw, 486px);
      border-radius: min(7.27cqw, 40px);
      min-height: min(24cqw, 132px);
      border: 2px dashed #FAEBB5;
      // first 版本的 title 在 content 內部
      .already-played__title {
        margin-top: -3%;
        margin-bottom: clamp(15px, 5.45cqw, 30px);
      }
    }
  }

  &__desc {
    width: 100%;
    max-width: min(72.73cqw, 400px);
    margin: 0 auto; 
    font-size: clamp(16px, 3.64cqw, 20px);
    line-height: 1.3;
    white-space: pre-line;
    color: #fff;
    
    @media (max-width: 360px) {
      font-size: 14px;
    }
  }

  &__custom-msg {
    width: 100%;
    margin: 0 auto; 
    border-top: min(2.73cqw, 15px) solid #E05C39;
    padding-top: min(3.64cqw, 20px);
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    font-size: clamp(16px, 3.64cqw, 20px);
    color: #fff;
    line-height: 1.3;

    @media (max-width: 380px) {
      font-size: 14px;
    }
    @media (max-width: 360px) {
      font-size: 12px;
    }

    :deep(.custom-result-message-coin) {
      width: clamp(16px, 3.64cqw, 20px);
      height: clamp(16px, 3.64cqw, 20px);
      margin-right: clamp(8px, 1.82cqw, 10px);
      padding-top: clamp(3px, 0.73cqw, 4px);
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
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
