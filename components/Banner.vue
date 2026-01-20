<template>
  <div class="banner">
    <div class="banner__content">
      <!-- 標題 -->
      <div class="banner__title"></div>

      <!-- 左邊 ubaby -->
      <div class="banner__left-ubaby"></div>

      <!-- 右邊 ubaby -->
      <div class="banner__right-ubaby"></div>

      <!-- 轉盤組 -->
      <div class="banner__wheel-group">
        <!-- 外圈 -->
        <div class="banner__wheel-out"></div>

        <!-- 箭頭 -->
        <div class="banner__wheel-arrow"></div>

        <!-- 內圈 (會旋轉) -->
        <div
          class="banner__wheel-inner"
          :class="{ 'is-spinning': isSpinning }"
        ></div>

        <!-- 按鈕 (點擊區域) -->
        <a
          ref="triggerLink"
          class="banner__wheel-btn"
          :href="loginUrl"
          target="_blank"
          rel="noopener noreferrer"
          data-action="submit"
          @click="handleDivination"
        ></a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const emit = defineEmits(["startDivination", "wheelSpinEnd"]);
const props = defineProps({
  loginUrl: {
    type: String,
    required: true,
  },
});

const isSpinning = ref(false);

async function handleDivination(event) {
  await emit("startDivination");
}

// 開始轉盤動畫
function startWheelSpin() {
  isSpinning.value = true;

  // 3秒後結束動畫
  setTimeout(() => {
    isSpinning.value = false;
    emit("wheelSpinEnd");
  }, 3000);
}

// 監聽全域事件
function handleWheelEvent(event) {
  startWheelSpin();
}

onMounted(() => {
  window.addEventListener("startWheel", handleWheelEvent);
});

onBeforeUnmount(() => {
  window.removeEventListener("startWheel", handleWheelEvent);
});

// 暴露方法供父組件調用
defineExpose({
  startWheelSpin,
});
</script>
<style lang="scss">
.banner {
  width: 100%;
  background-image: url("/imgs/banner_bg.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center top;
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  container-type: inline-size;
  @media (max-width: 640px) {
    background-image: url("/imgs/banner_bg_m.png");
    aspect-ratio: 640 / 1080;
  }

  &__content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }

  &__title {
    position: absolute;
    top: 6cqw;
    left: 33.3%;
    transform: translateX(-50%);
    width: 32cqw;
    aspect-ratio: 630 / 460;
    background-image: url("/imgs/banner_title.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    @media (max-width: 640px) {
      aspect-ratio: 550 / 404;
      width: 85cqw;
      top: 11cqw;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  &__left-ubaby {
    position: absolute;
    bottom: 6cqw;
    left: 18cqw;
    width: 14cqw;
    aspect-ratio: 285 / 360;
    background-image: url("/imgs/left_ubaby.gif");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    z-index: 10;
    @media (max-width: 640px) {
      bottom: 5cqw;
      left: 5cqw;
      width: 32cqw;
      aspect-ratio: 570 / 720;
    }
  }

  &__right-ubaby {
    position: absolute;
    bottom: 5cqw;
    left: 33cqw;
    width: 14.5cqw;
    aspect-ratio: 295 / 390;
    background-image: url("/imgs/right_ubaby.gif");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    z-index: 10;
    @media (max-width: 640px) {
      bottom: 9cqw;
      left: 62cqw;
      width: 29cqw;
      aspect-ratio: 590 / 780;
    }
  }

  &__wheel-group {
    position: absolute;
    right: 18.2cqw;
    bottom: 17cqw;
    width: 31cqw;
    aspect-ratio: 1 / 1;
    @media (max-width: 640px) {
      right: 18cqw;
      bottom: 30cqw;
      width: 64cqw;
    }
  }

  &__wheel-out {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("/imgs/wheel_out.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    pointer-events: none;
  }

  &__wheel-arrow {
    position: absolute;
    top: 2.5cqw;
    left: 50%;
    transform: translateX(-50%);
    width: 8%;
    aspect-ratio: 1 / 1;
    background-image: url("/imgs/wheel_arrow.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    pointer-events: none;
    z-index: 10;
    @media (max-width: 640px) {
      width: 6cqw;
      top: 5cqw;
    }
  }

  &__wheel-inner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    height: 81.8%;
    background-image: url("/imgs/wheel_inner.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    pointer-events: none;
    transition: transform 0.1s ease-out;

    &.is-spinning {
      animation: spinWheel 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
    @media (max-width: 640px) {
      width: 90%;
      height: 82.6%;
    }
  }

  &__wheel-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 28%;
    aspect-ratio: 1 / 1;
    background-image: url("/imgs/wheel_btn.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
    border-radius: 50%;
  }

  @keyframes spinWheel {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(1080deg);
    }
  }
}
</style>
