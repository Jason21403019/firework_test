<template>
  <div class="prize-container">
    <div class="prize-grid">
      <div v-for="(prize, index) in prizes" :key="index" class="prize-card">
        <div class="prize-image">
          <img :src="prize.image" :alt="prize.title" />
        </div>
        <div class="prize-content">
          <h3 class="prize-title">{{ prize.title }}</h3>
          <p class="prize-subtitle">{{ prize.subtitle }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 獎品數據
const prizes = ref([
  {
    id: 1,
    image: "/imgs/prizes/tv.png",
    title: "65吋LED電視",
    subtitle: "1名",
  },
  {
    id: 2,
    image: "/imgs/prizes/dyson.png",
    title: "Dyson吸塵器",
    subtitle: "2名",
  },
  {
    id: 3,
    image: "/imgs/prizes/coffee.png",
    title: "咖啡機",
    subtitle: "3名",
  },
  {
    id: 4,
    image: "/imgs/prizes/airpods.png",
    title: "AirPods",
    subtitle: "5名",
  },
  {
    id: 5,
    image: "/imgs/prizes/voucher.png",
    title: "購物金",
    subtitle: "10名",
  },
  {
    id: 6,
    image: "/imgs/prizes/gift.png",
    title: "精美禮品",
    subtitle: "20名",
  },
]);
</script>

<style lang="scss" scoped>
.prize-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.prize-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 25px;
  padding: 20px 0;
}

.prize-card {
  border: 3px solid #d8ceff;
  box-shadow: inset 0 0 50px 20px rgba(#8d46d6, 0.3);
  background-color: rgba(#8d46d6, 0.2);
  border-radius: 10px;
  padding: 25px 20px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow:
      inset 0 0 50px 20px rgba(#8d46d6, 0.4),
      0 10px 25px rgba(#8d46d6, 0.2);
    border-color: #c4b3ff;

    .prize-image img {
      transform: scale(1.05);
    }
  }

  // 添加微妙的光澤效果
  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transform: rotate(45deg);
    transition: all 0.6s;
    opacity: 0;
  }

  &:hover::before {
    opacity: 1;
    animation: shimmer 1.2s ease-in-out;
  }
}

.prize-image {
  margin-bottom: 20px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }
}

.prize-content {
  .prize-title {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 10px 0;
    line-height: 1.3;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .prize-subtitle {
    font-size: 14px;
    color: #f0f0f0;
    margin: 0;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    display: inline-block;
    font-weight: 600;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  }
}

// 閃爍動畫
@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

// 響應式設計
@media (max-width: 992px) {
  .prize-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 20px;
  }

  .prize-card {
    padding: 20px 15px;
  }

  .prize-image {
    height: 100px;
  }
}

@media (max-width: 576px) {
  .prize-container {
    padding: 15px;
  }

  .prize-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, 1fr);
    gap: 15px;
  }

  .prize-card {
    padding: 18px 12px;
  }

  .prize-image {
    height: 80px;
  }

  .prize-content .prize-title {
    font-size: 16px;
  }

  .prize-content .prize-subtitle {
    font-size: 13px;
    padding: 6px 12px;
  }
}

// 平板橫向模式
@media (max-width: 768px) and (orientation: landscape) {
  .prize-grid {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }
}
</style>
