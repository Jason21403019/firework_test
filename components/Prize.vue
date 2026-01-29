<template>
  <div class="prize-grid">
    <component v-for="(prize, index) in prizes" :key="index" :is="prize.link ? 'a' : 'div'" :href="prize.link"
      :target="prize.link ? '_blank' : undefined" :rel="prize.link ? 'noopener noreferrer' : undefined"
      class="prize-card">
      <div class="prize-image">
        <img :src="prize.image" :alt="prize.title" :style="{ '--img-width': getImageWidth(prize.id) }" />
      </div>
      <div class="prize-content">
        <h3 class="prize-title">{{ prize.title }}</h3>
        <p class="prize-subtitle">{{ prize.subtitle }}</p>
      </div>
    </component>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 獎品數據
const prizes = ref([
  {
    id: 1,
    image: "./imgs/iphone.png",
    title: "馬到成功旗艦獎",
    subtitle: "iPhone 17 Pro | 1 名",
  },
  {
    id: 2,
    image: "./imgs/course.png",
    title: "行遍天下好運獎",
    subtitle: "熟齡英文開聊線上課 | 5 名",
    link: "https://learning.udn.com/orange/courses/laienglish",
  },
  {
    id: 3,
    image: "./imgs/cooking.png",
    title: "新春料理美味獎",
    subtitle: "百歲料理課線上課 | 5 名",
    link: "https://learning.udn.com/orange/courses/achingandwanpin",
  },
  {
    id: 4,
    image: "./imgs/clean.png",
    title: "除舊佈新納福獎",
    subtitle: "生活收納課線上課 | 5 名",
    link: "https://learning.udn.com/orange/courses/tidyman2022",
  },
  {
    id: 5,
    image: "./imgs/pix.png",
    title: "開春好禮補給獎",
    subtitle: "全聯禮券 500元 | 35 名",
  },
  {
    id: 6,
    image: "./imgs/points.png",
    title: "馬上好運加點獎",
    subtitle: "LINE POINTS 5 點\n8,000組 (送完為止)",
  },
]);

// 根據獎品ID設定圖片寬度
const getImageWidth = (prizeId) => {
  const widthMap = {
    1: '75%',  // iPhone (150*190)
    2: '80%', // 課程 (225*150)
    3: '80%', // 料理 (225*150)
    4: '80%', // 收納 (225*150)
    5: '80%',  // pix (225*150)
    6: '85%'   // Points (180*93)
  };
  return widthMap[prizeId] || '100%';
};
</script>

<style lang="scss" scoped>
.prize-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 25px;

  @media (max-width: 1180px) {
    gap: 20px;
  }

  @media (max-width: 360px) {
    gap: 12px;
  }
}

.prize-card {
  flex: 0 1 300px;
  max-width: 300px;
  min-width: 280px;
  border-radius: 10px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  text-decoration: none;
  color: inherit;

  @media (max-width: 768px) {
    flex: 0 1 calc(50% - 10px);
  }

  @media (max-width: 480px) {
    flex: 0 1 100%;
  }

  // 為 a 標籤添加 hover 效果
  &:hover {
    transform: translateY(-5px);

    .prize-image img {
      transform: scale(1.05);
    }
  }

  // 確保 a 標籤樣式一致
  &[href] {
    cursor: pointer;
  }
}

.prize-image {
  width: 288px;
  height: 288px;
  margin: 0 auto 10px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background-color: #fff;
  border: 6px solid #EED48C;

  @media (max-width: 768px) {
    width: 245px;
    height: 245px;
  }

  img {
    max-width: var(--img-width, 100%);
    max-height: 80%;
    object-fit: contain;
    transition: transform 0.3s ease;
  }
}

.prize-content {
  .prize-title {
    font-size: clamp(20px, 4cqw, 36px);
    font-weight: 600;
    color: #fff;
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
      font-size: 24px;
      letter-spacing: 2px;
    }

    @media (max-width: 360px) {
      font-size: 20px;
    }
  }

  .prize-subtitle {
    font-size: 18px;
    color: #FAEBB5;
    margin: 0 auto;
    line-height: 1.5;
    display: inline-block;
    white-space: pre-line;

    @media (max-width: 480px) {
      font-size: 16px;
    }

    @media (max-width: 360px) {
      font-size: 14px;
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
