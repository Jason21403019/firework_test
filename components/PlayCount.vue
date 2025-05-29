<template>
  <div class="play-count">
    <!-- 旗幟背景區塊 -->
    <div class="play-count__banner">
      <!-- :style="{ backgroundImage: 'url(/imgs/flag.png)' }" -->
      <div class="play-count__banner-content">
        <div class="play-count__banner-left">
          <img
            src="/imgs/fatetogifts.png"
            alt="占卜次數"
            class="play-count__title-img"
          />
        </div>
        <div class="play-count__banner-right">
          <p class="play-count__text">
            您已累計占卜
            <span class="play-count__number">{{ count }}</span> 次
          </p>
        </div>
      </div>
    </div>

    <!-- 旗幟下方說明文字 -->
    <p class="play-count__description">會員粉絲來占卜， 集滿好運抽大獎！</p>

    <!-- 里程碑數字顯示 -->
    <div class="play-count__milestones">
      <div
        v-for="(milestone, index) in milestones"
        :key="milestone.count"
        class="play-count__milestone"
        :class="{
          'play-count__milestone--achieved': count >= milestone.count,
        }"
      >
        <div
          class="play-count__milestone-number"
          :style="{ backgroundImage: 'url(./imgs/fire.png)' }"
        >
          <span>{{ milestone.count }}</span>
        </div>
        <div class="play-count__milestone-prize">{{ milestone.prize }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, watch } from "vue";

// 定義組件接收的屬性
const props = defineProps({
  count: {
    type: Number,
    default: 0,
  },
  milestones: {
    type: Array,
    default: () => [
      { count: 1, prize: "LINE POINTS\n5 點" },
      { count: 2, prize: "王品\n雙人即享券" },
      { count: 3, prize: "Barista\n義式咖啡機" },
      { count: 4, prize: "Dyson\n涼風空氣清淨機" },
      { count: 5, prize: "65 吋\nLED 電視" },
    ],
  },
});

// 定義組件向外發出的事件
const emit = defineEmits(["milestone-achieved"]);

// 監聽計數變化，達到里程碑時觸發事件
watch(
  () => props.count,
  (newCount, oldCount) => {
    // 找出新達成的里程碑
    const newAchieved = props.milestones.find(
      (m) => oldCount < m.count && newCount >= m.count,
    );

    // 如果達到新里程碑，觸發事件
    if (newAchieved) {
      emit("milestone-achieved", newAchieved);
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.play-count {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 120px;
  background: url("/imgs/count_bg.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  padding-top: 150px;
  margin-top: -8%;

  // 旗幟容器
  &__banner {
    position: relative;
    background-image: url("/imgs/flag.png");
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    max-width: 950px;
    width: 100%;
    height: 162px;
    margin: 0 auto;
    margin-bottom: 45px;
    display: flex;
    align-items: center;
    justify-content: center;

    &-content {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &-left {
      text-align: center;
    }

    &-right {
      text-align: center;
    }
  }

  &__title-img {
    display: block;
    width: 100%;
    max-width: 290px;
    height: auto;
  }

  &__text {
    width: auto;
    max-width: 540px;
    background: rgba(255, 255, 255, 0.6);
    color: #c20b46;
    font-size: 40px;
    font-weight: 500;
    margin-left: 40px;
    padding: 10px 60px;
    border-radius: 100px;
    box-sizing: border-box;
  }

  // 計數數字樣式
  &__number {
    font-weight: bold;
    color: #c20b46;
    font-size: 40px;
    backdrop-filter: blur(4px);
    border-radius: 4px;
  }

  // 說明文字
  &__description {
    font-size: 36px;
    font-weight: 500;
    color: #f5f5f5;
    margin: 0 auto;
    text-align: center;
    max-width: 100%;
    line-height: 1.5;
    margin-bottom: 50px;
    text-shadow: 0 3px 5px rgba(0, 0, 0, 0.5);
  }

  // 里程碑容器
  &__milestones {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    margin-top: 25px;
    gap: 50px;
    flex-wrap: wrap;
  }

  // 單個里程碑項目
  &__milestone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    transition: all 0.4s ease;

    &--achieved {
      .play-count__milestone-number {
        filter: brightness(1.2) drop-shadow(0 0 10px rgba(109, 39, 234, 0.7));
      }

      .play-count__milestone-prize {
        color: #ffffff;
        font-weight: 500;
      }
    }
    &-number {
      width: 134px;
      height: 170px;
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 60px;
      color: #fff;
      transition: all 0.3s ease;
      position: relative;

      // 調整數字在背景圖中的位置
      & > span {
        position: absolute;
        top: 60%;
        left: 53%;
        transform: translate(-50%, -50%);
      }
    }

    &-prize {
      margin-top: 8px;
      font-size: 22px;
      line-height: 1.5;
      font-weight: 500;
      color: rgba(204, 204, 204, 0.5);
      text-align: center;
      transition: all 0.3s ease;
      white-space: pre-line;
    }
  }
}

// 響應式調整
@media (max-width: 768px) {
  .play-count {
    &__banner {
      padding: 15px 5px;

      &-content {
        padding: 0 10px;
      }
    }

    &__title-img {
      max-width: 140px;
    }

    &__text {
      font-size: 16px;
    }

    &__number {
      font-size: 18px;
    }

    &__description {
      font-size: 14px;
    }

    &__milestones {
      gap: 10px;
    }

    &__milestone {
      width: 70px;

      &-number {
        width: 50px;
        height: 50px;
        font-size: 18px;
      }

      &-prize {
        font-size: 12px;
      }
    }
  }
}
</style>
