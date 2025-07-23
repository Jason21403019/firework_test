<template>
  <div class="banner">
    <!-- 煙火特效元素 -->
    <div class="fireworks">
      <div class="firework firework-1"></div>
      <div class="firework firework-2"></div>
      <div class="firework firework-3"></div>
      <div class="firework firework-4"></div>
    </div>

    <div class="banner__content">
      <!-- ref="contentRef" -->
      <a
        ref="triggerLink"
        class="banner__trigger-area"
        :href="loginUrl"
        target="_blank"
        rel="noopener noreferrer"
        data-action="submit"
        @click="handleDivination"
      ></a>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, defineProps } from "vue";

const emit = defineEmits(["startDivination"]);
const props = defineProps({
  loginUrl: {
    type: String,
    required: true,
  },
});

async function handleDivination(event) {
  await emit("startDivination");
}
</script>
<style lang="scss">
.banner {
  width: 100%;
  background-image: url("/imgs/banner.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center top;
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;

  .fireworks {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
  }

  .firework {
    position: absolute;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    opacity: 0;
    aspect-ratio: 16 / 9;
    width: 30%;
    filter: blur(0px);
  }

  .firework-1 {
    top: 10%;
    left: -12%;
    background-image: url("/imgs/fireworks1.png");
    animation: flashSoft 6s infinite 0.5s;
  }

  .firework-2 {
    top: -16%;
    left: 27%;
    background-image: url("/imgs/fireworks2.png");
    animation: flashSoft 7s infinite 1.5s;
  }

  .firework-3 {
    top: 10%;
    right: 40%;
    width: 15%;
    background-image: url("/imgs/fireworks3.png");
    animation: flashSoft 6.5s infinite 2s;
  }

  .firework-4 {
    top: 11%;
    right: -12%;
    background-image: url("/imgs/fireworks4.png");
    animation: flashSoft 5.5s infinite 1s;
  }

  @keyframes flashSoft {
    0% {
      opacity: 0;
      transform: scale(0.7);
      filter: blur(5px);
    }
    3% {
      opacity: 0.03;
      transform: scale(0.73);
      filter: blur(4.5px);
    }
    5% {
      opacity: 0.05;
      transform: scale(0.75);
      filter: blur(4px);
    }
    7% {
      opacity: 0.12;
      transform: scale(0.78);
      filter: blur(3.5px);
    }
    8% {
      opacity: 0.2;
      transform: scale(0.8);
      filter: blur(3px);
    }
    10% {
      opacity: 0.4;
      transform: scale(0.825);
      filter: blur(2.2px);
    }
    12% {
      opacity: 0.6;
      transform: scale(0.85);
      filter: blur(1.5px);
    }
    14% {
      opacity: 0.85;
      transform: scale(0.88);
      filter: blur(0.5px);
    }
    15% {
      opacity: 1;
      transform: scale(0.9);
      filter: blur(0px);
    }
    17% {
      opacity: 0.98;
      transform: scale(0.92);
      filter: blur(0px);
    }
    20% {
      opacity: 0.95;
      transform: scale(0.96);
      filter: blur(0px);
    }
    22% {
      opacity: 0.9;
      transform: scale(1.01);
      filter: blur(0px);
    }
    25% {
      opacity: 0.85;
      transform: scale(1.015);
      filter: blur(0.25px);
    }
    28% {
      opacity: 0.8;
      transform: scale(1.02);
      filter: blur(0.5px);
    }
    30% {
      opacity: 0.75;
      transform: scale(1.025);
      filter: blur(0.75px);
    }
    35% {
      opacity: 0.7;
      transform: scale(1.03);
      filter: blur(1px);
    }
    37% {
      opacity: 0.55;
      transform: scale(1.035);
      filter: blur(1.25px);
    }
    40% {
      opacity: 0.4;
      transform: scale(1.04);
      filter: blur(1.5px);
    }
    43% {
      opacity: 0.3;
      transform: scale(1.045);
      filter: blur(1.75px);
    }
    45% {
      opacity: 0.2;
      transform: scale(1.05);
      filter: blur(2px);
    }
    48% {
      opacity: 0.18;
      transform: scale(1.058);
      filter: blur(2.25px);
    }
    50% {
      opacity: 0.15;
      transform: scale(1.065);
      filter: blur(2.5px);
    }
    52% {
      opacity: 0.13;
      transform: scale(1.07);
      filter: blur(2.75px);
    }
    55% {
      opacity: 0.1;
      transform: scale(1.08);
      filter: blur(3px);
    }
    60% {
      opacity: 0.08;
      transform: scale(1.03);
      filter: blur(3.5px);
    }
    65% {
      opacity: 0.07;
      transform: scale(0.98);
      filter: blur(3.8px);
    }
    70% {
      opacity: 0.05;
      transform: scale(0.9);
      filter: blur(4px);
    }
    80% {
      opacity: 0.03;
      transform: scale(0.8);
      filter: blur(4.5px);
    }
    100% {
      opacity: 0;
      transform: scale(0.7);
      filter: blur(5px);
    }
  }

  &__content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }

  &__trigger-area {
    position: absolute;
    right: 18.4%;
    top: 37.8%;
    width: 30%;
    max-width: 250px;
    border-radius: 50%;
    aspect-ratio: 1 / 1;
    cursor: pointer;
    // border: 2px solid rgb(255, 255, 255);
    @media (max-width: 1535px) {
      right: 17.7%;
      top: 36%;
      width: 15%;
      min-width: 80px;
    }
    @media (max-width: 768px) {
      top: 56.6%;
      right: 35.4%;
      width: 28%;
      min-width: 60px;
    }
  }
}

@media (max-width: 768px) {
  .banner {
    background-image: url("/imgs/m_banner.png");
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center top;
    position: relative;
    aspect-ratio: 640 / 1076;
    .firework-1 {
      width: 400px;
      height: 300px;
      top: -8%;
      left: -17%;
      @media (max-width: 430px) {
        width: 300px;
        height: 200px;
        top: -10%;
        left: -20%;
      }
    }

    .firework-2 {
      width: 300px;
      height: 200px;
      top: -8%;
      right: -4%;
      left: unset;
      @media (max-width: 430px) {
        width: 200px;
        height: 100px;
        top: -8%;
        right: -4%;
        left: unset;
      }
    }

    .firework-3 {
      width: 200px;
      height: 300px;
      top: 30%;
      right: unset;
      left: -9%;
    }
    .firework-4 {
      width: 300px;
      height: 200px;
      top: 8%;
      right: -15%;
      left: unset;
      @media (max-width: 430px) {
        width: 300px;
        height: 100px;
        top: 8%;
        right: -15%;
        left: unset;
      }
    }
  }
}
// @media (max-width: 640px) {
//   .banner {
//     background-image: url("/imgs/m_banner.png");
//     background-size: cover;
//     background-repeat: no-repeat;
//     background-position: center top;
//     position: relative;
//     aspect-ratio: 640 / 1076;
//   }
// }
</style>
