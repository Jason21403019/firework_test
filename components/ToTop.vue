<template>
  <transition name="fade">
    <button v-if="isVisible" @click="scrollToTop" class="totop">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7 14L12 9L17 14"
          stroke="white"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// 狀態管理
const isVisible = ref(false);

// 監聽滾動事件
const handleScroll = () => {
  isVisible.value = window.scrollY > 300;
};

// 滾動到頂部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

// 生命週期
onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style lang="scss" scoped>
.totop {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: #8d46d6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(141, 70, 214, 0.3);
  z-index: 999;

  @media (max-width: 1180px) {
    bottom: 300px;
  }
  @media (max-width: 992px) {
    bottom: 230px;
  }
  @media (max-width: 768px) {
    bottom: 320px;
  }
  @media (max-width: 480px) {
    bottom: 230px;
  }
  @media (max-width: 410px) {
    right: 12px;
    bottom: 190px;
  }
  @media (max-width: 360px) {
    right: 12px;
    bottom: 170px;
  }
  &:hover {
    background: #a066e6;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(141, 70, 214, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 24px;
    height: 24px;
  }
}

// 淡入淡出動畫
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
