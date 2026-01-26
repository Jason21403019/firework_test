<template>
  <div class="redirect" v-if="isVisible">
    <div class="redirect__overlay"></div>
    <div class="redirect__content">
      <div class="redirect__message">{{ message }}</div>
      <div class="redirect__countdown">{{ countdown }}</div>
      <div class="redirect__desc">秒後跳轉</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from "vue";

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: "準備進入新年活動",
  },
  initialCountdown: {
    type: Number,
    default: 4,
  },
});

const emit = defineEmits(["countdown-end"]);

const countdown = ref(props.initialCountdown);
let timer = null;

watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      countdown.value = props.initialCountdown;
      startCountdown();
    } else {
      stopCountdown();
    }
  },
);

function startCountdown() {
  stopCountdown();
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      stopCountdown();
      emit("countdown-end");
    }
  }, 1000);
}

function stopCountdown() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

onUnmounted(() => {
  stopCountdown();
});
</script>

<style lang="scss" scoped>
.redirect {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
  }

  &__content {
    position: relative;
    background: #D83307;
    border-radius: 25px;
    padding: 40px 60px;
    text-align: center;
    border: 10px solid #E05C39;
    animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    @media (max-width: 768px) {
      padding: 30px 40px;
      border-radius: 25px;
      margin: 0 20px;
    }
  }

  &__message {
    font-size: 28px;
    font-weight: bold;
    color: #FAEBB5;
    margin-bottom: 20px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    @media (max-width: 768px) {
      font-size: 22px;
      margin-bottom: 15px;
    }
  }

  &__countdown {
    font-size: 72px;
    font-weight: bold;
    color: #FAEBB5;
    line-height: 1;
    margin-bottom: 10px;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    animation: pulse 1s ease-in-out infinite;

    @media (max-width: 768px) {
      font-size: 56px;
    }
  }

  &__desc {
    font-size: 20px;
    color: #FAEBB5;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    @media (max-width: 768px) {
      font-size: 16px;
    }
  }
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}
</style>
