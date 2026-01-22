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
        <!-- 紅包袋口裝飾 -->
        <div class="fortune-result__bag-mouth">
          <svg xmlns="http://www.w3.org/2000/svg" width="550" height="150" viewBox="0 0 550 150">
            <g id="Group_249" data-name="Group 249" transform="translate(-685 -111)">
              <path id="袋口" d="M521.93,91.761l-145.15-71.9a276.343,276.343,0,0,0-203.96-.289L28.35,91.093a49.864,49.864,0,0,0-28.21,44.6L0,150.208H550V136.426a49.852,49.852,0,0,0-28.07-44.675Z" transform="translate(685 110.792)" fill="#bf2900"/>
              <g id="Group_175" data-name="Group 175" transform="translate(-5 -64.5)">
                <g id="Group_174" data-name="Group 174" transform="translate(84 -382)">
                  <text id="紅包運勢" transform="translate(798 673)" fill="#faebb5" font-size="40" font-family="SourceHanSansTC-Bold, Source Han Sans TC" font-weight="700" letter-spacing="0.05em"><tspan x="0" y="0">紅包運勢</tspan></text>
                </g>
                <g id="Group_170" data-name="Group 170" transform="translate(81 -385)">
                  <circle id="Ellipse_5" data-name="Ellipse 5" cx="3" cy="3" r="3" transform="translate(747 656)" fill="#faebb5"/>
                  <circle id="Ellipse_6" data-name="Ellipse 6" cx="3" cy="3" r="3" transform="translate(761 656)" fill="#faebb5"/>
                  <circle id="Ellipse_7" data-name="Ellipse 7" cx="3" cy="3" r="3" transform="translate(775 656)" fill="#faebb5"/>
                </g>
                <g id="Group_171" data-name="Group 171" transform="translate(349 -385)">
                  <circle id="Ellipse_5-2" data-name="Ellipse 5" cx="3" cy="3" r="3" transform="translate(747 656)" fill="#faebb5"/>
                  <circle id="Ellipse_8" data-name="Ellipse 8" cx="3" cy="3" r="3" transform="translate(733 656)" fill="#faebb5"/>
                  <circle id="Ellipse_9" data-name="Ellipse 9" cx="3" cy="3" r="3" transform="translate(719 656)" fill="#faebb5"/>
                </g>
              </g>
            </g>
          </svg>
        </div>

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
    container-type: inline-size;

    &--closing {
      animation: overlayFadeOut 0.3s ease-out;
    }
  }

  &__popup {
    background:#D83307;
    border-bottom-left-radius: 50px;
    border-bottom-right-radius: 50px;
    width: 550px;
    min-height: 630px;
    position: relative;
    animation: modalBounceIn 0.3s ease-out;
    container-type: inline-size;
    margin-top: 15vh;
    &::before {
      content: "";
      position: absolute;
      top: 0px;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      height: 15px;
      background-color: #E05C39;
    }

    &--closing {
      animation: modalBounceOut 0.25s ease-in;
    }
  }


  &__bag-mouth {
    position: absolute;
    // top: -150px;
    left: 50%;
    bottom: 99.7%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 550px;
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
    max-width: 350px;
    margin: 0 auto;
    background-color: #D83307;
    font-size: 30px;
    font-weight: bold;
    color: #FAEBB5;
    text-align: center;
    margin-bottom: 30px;
    
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

    // normal 版本的 title 獨立樣式
    // &--normal {
    // }

    // final 版本的 title 獨立樣式
    &--final {
      font-size: clamp(26px, 5.82cqw, 32px);
      color: #ff69b4;
      text-shadow: 0 0 10px rgba(255, 105, 180, 0.8);
    }
  }

  &__image-container {
    width: 100%;
    max-width: 250px;
    margin: 0 auto;
    margin-top: 40px;
    margin-bottom: 40px;
    text-align: center;
    @media (max-width: 480px) {
      max-width: 200px;
    }
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__content {
    text-align: center;
    margin: 0 auto;
    color: #fff;
    margin-bottom: 35px;
 
    // 第一次完成樣式（title 在 content 裡面）
    &--first {
      width: 90%;
      max-width: 486px;
      border-radius: 40px;
      min-height: 132px;
      border: 2px dashed #FAEBB5;
      // first 版本的 title 在 content 內部
      .fortune-result__title {
        margin-top: -3%;
        margin-bottom: 30px;
      }
    }
  }

  &__description {
    width: 100%;
    max-width: 400px;
    
    margin: 0 auto; 
    font-size: 20px;
    line-height: 1.3;
    white-space: pre-line;
    color: #fff;
    
    &-highlight {
      color: #FAEBB5;
      font-weight: bold;
    }
  }

  &__custom-message {
    width: 100%;
    margin: 0 auto; 
    border-top: 15px solid #E05C39;
    padding-top: 20px;
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    font-size: 20px;
    color: #fff;
    line-height: 1.3;

    :deep(.custom-result-message-coin) {
      width: 20px;
      height: 20px;
      margin-right: 10px;
      padding-top: 4px;
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
