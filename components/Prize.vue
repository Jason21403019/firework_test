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
    image: "./imgs/tv.png",
    title: "星光劇院獎",
    subtitle: "小米 65 吋LED 電視 | 1名",
  },
  {
    id: 2,
    image: "./imgs/dyson.png",
    title: "閃耀風光獎",
    subtitle: "Dyson 二合一涼風空氣清淨機 | 2 名",
  },
  {
    id: 3,
    image: "./imgs/barista.png",
    title: "啡常幸運獎",
    subtitle: "Barista C2+ 全自動義式咖啡機 | 1 名",
  },
  {
    id: 4,
    image: "./imgs/wang1000.png",
    title: "煙火食光獎",
    subtitle: "王品集團 $1,000 即享券雙人 | 5 名",
  },
  {
    id: 5,
    image: "./imgs/linepoints5.png",
    title: "轉運流星獎",
    subtitle: "LINE POINTS 5點 | 1 萬組送完為止  ",
  },
  {
    id: 6,
    image: "./imgs/citycoffee.png",
    title: "Line 好運加碼禮",
    subtitle: "CITY CAFÉ 提貨券 | 50 名",
  },
]);
</script>

<style lang="scss" scoped>
.prize-container {
  padding: 0px 0px 120px 0px;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 1024px) {
    padding-bottom: 80px;
  }
  @media (max-width: 480px) {
    padding-bottom: 40px;
  }
}

.prize-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 25px;
  @media (max-width: 1180px) {
    gap: 20px;
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 360px) {
    gap: 12px;
  }
}

.prize-card {
  max-width: 100%;
  border: 3px solid #d8ceff;
  box-shadow: inset 0 0 50px 20px rgba(#8d46d6, 0.3);
  background-color: rgba(#8d46d6, 0.2);
  border-radius: 10px;
  padding: 10px 10px 20px 10px;
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
  max-width: 100%;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 10px;

  img {
    width: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
  }
}

.prize-content {
  .prize-title {
    font-size: 40px;
    font-weight: 400;
    color: #fbcf47;
    margin: 0 0 10px 0;
    line-height: 1.2;
    letter-spacing: 4px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    @media (max-width: 1180px) {
      font-size: 32px;
    }
    @media (max-width: 992px) {
      font-size: 28px;
    }
    @media (max-width: 870px) {
      font-size: 24px;
    }
    @media (max-width: 640px) {
      font-size: 20px;
    }
    @media (max-width: 480px) {
      font-size: 18px;
      letter-spacing: normal;
    }
    @media (max-width: 360px) {
      font-size: 16px;
    }
  }

  .prize-subtitle {
    font-size: 18px;
    color: #fff;
    margin: 0 auto;
    line-height: 1.5;
    display: inline-block;
    @media (max-width: 480px) {
      font-size: 14px;
    }
    @media (max-width: 360px) {
      font-size: 12px;
    }
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
.footer {
  width: 100%;
  background: url("./imgs/footer_bg.png") no-repeat center center;
  height: 772px;
}
</style>
