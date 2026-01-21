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

        <!-- 第一次完成：title 在 content 裡面 -->
        <template v-if="resultType === 'first'">
          <div class="fortune-result__content fortune-result__content--first">
            <h2 class="fortune-result__title">
              <span class="fortune-result__title-coin">
                <img src="/public/imgs/title_coin.png" alt="title_coin" />
              </span>
              <span class="fortune-result__title-text">新春好運轉到你！</span>
              <span class="fortune-result__title-coin">
                <img src="/public/imgs/title_coin.png" alt="title_coin" />
              </span>
            </h2>
            <p class="fortune-result__description">
              獲得<span class="fortune-result__description-highlight"> LINE POINTS 5點 </span>抽獎資格<br>兌換序號將於活動後寄送。
            </p>
       
          </div>
          <div
              v-if="customMessage"
              v-html="customMessage"
              class="fortune-result__custom-message"
             ></div>
        </template>

        <!-- normal 和 final：只有 title，沒有 content -->
        <template v-else>
          <h2 
            class="fortune-result__title"
            :class="{
              'fortune-result__title--normal': resultType === 'normal',
              'fortune-result__title--final': resultType === 'final'
            }"
          >
            {{ fortuneData.title || "您的占卜結果" }}
          </h2>
          <p 
            v-if="fortuneData.description" 
            class="fortune-result__description"
          >
            {{ fortuneData.description }}
          </p>
          <div
            v-if="customMessage"
            v-html="customMessage"
            class="fortune-result__custom-message"
          ></div>
        </template>
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
  resultType: {
    type: String,
    default: "normal", // 'first' | 'normal' | 'final'
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
    background:#D83307;
    border-radius: 10px;
    width: 490px;
    height: 60vh;
    position: relative;
    animation: modalBounceIn 0.3s ease-out;
    padding: 30px;
    container-type: inline-size;

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
    width: 350px;
    margin: 0 auto;
    background-color: #D83307;
    font-size: 30px;
    font-weight: bold;
    color: #FAEBB5;
    text-align: center;
    margin-bottom: 5.45cqw; // 30px
    margin-top: -7%;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
    
    &-coin {
      width: 25px; 
      height: 25px;
      display: inline-block;
      &:first-child {
        margin-right: 15px;
        padding-left: 10px;
      }
      &:last-child {
        margin-left: 5px;
        padding-right: 10px;
      }
    }
    


    @media (max-width: 640px) {
      font-size: 24px;
    }
    @media (max-width: 410px) {
      font-size: 20px;
    }

    // normal 版本的 title 獨立樣式
    &--normal {
      margin-bottom: 2.73cqw; // 15px
    }

    // final 版本的 title 獨立樣式
    &--final {
      margin-bottom: 2.73cqw; // 15px
      font-size: clamp(26px, 5.82cqw, 32px);
      color: #ff69b4;
      text-shadow: 0 0 10px rgba(255, 105, 180, 0.8);

      @media (max-width: 640px) {
        font-size: 26px;
      }
      @media (max-width: 410px) {
        font-size: 22px;
      }
    }
  }

  &__image-container {
    width: 45.45cqw; // 250px
    height: 45.45cqw; // 250px
    margin: 0 auto;
    margin-top: 40px;
    margin-bottom: 40px;
    text-align: center;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
  }

  &__content {
    text-align: center;
    color: #fff;
    margin-bottom: 70px;

    // 第一次完成樣式（title 在 content 裡面）
    &--first {
      padding: 20px;
      border-radius: 40px;
      border: 2px dashed #ffd700;
      @media (max-width: 480px) {
        padding: 15px;
      }

      // first 版本的 title 在 content 內部
      .fortune-result__title {
        margin-bottom: 15px;
      }
    }
  }

  &__description {
    width: 89.09cqw;
    margin: 0 auto; 
    font-size: 20px;
    line-height: 1.6;
    white-space: pre-line;
    color: #fff;
    
    &-highlight {
      color: #FAEBB5;
      font-weight: bold;
    }
    
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
    width: 70cqw; 
    min-height: 10.18cqw;
    margin: 0 auto; 
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #fff;
    padding-bottom: 10px;
    :deep(.custom-result-message-coin) {
      width: 20px;
      height: 20px;
      margin-right: 10px;
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
