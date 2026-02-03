<template>
  <div class="play-count">
    <!-- 轉盤抽紅包好禮背景區塊 -->
    <div class="play-count__banner">
      <div class="play-count__banner-content">
        <div class="play-count__banner-left">
          <h1 class="play-count__banner-title">轉盤抽紅包好禮</h1>
        </div>
        <div class="play-count__banner-right">
          <p class="play-count__text">
            您已累計轉盤
            <span class="play-count__number">{{ count }}</span> 次
          </p>
        </div>
      </div>
    </div>
    <!-- 轉盤抽紅包好禮里程碑數字顯示 - 桌機版 -->
    <div class="play-count__milestones play-count__milestones--desktop">
      <div v-for="(milestone, index) in milestones" :key="milestone.count" class="play-count__milestone" :class="{
        'play-count__milestone--achieved': count >= milestone.count,
      }">
        <div class="play-count__milestone-number" :style="{
          backgroundImage:
            count >= milestone.count
              ? 'url(./imgs/open_envelope.png)'
              : 'url(./imgs/close_envelope.png)',
        }">
          <span class="play-count__milestone-count">{{ milestone.count }}</span>
          <div class="play-count__milestone-prize">{{ milestone.prize }}</div>
        </div>
      </div>
    </div>
    <!-- 轉盤抽紅包好禮里程碑數字顯示 - 手機版 -->
    <div class="play-count__milestones play-count__milestones--mobile">
      <div v-for="(milestone, index) in milestones" :key="milestone.count" class="play-count__milestone" :class="{
        'play-count__milestone--achieved': count >= milestone.count,
      }">
        <div class="play-count__milestone-number" :style="{
          backgroundImage:
            count >= milestone.count
              ? 'url(./imgs/open_envelope_m.png)'
              : 'url(./imgs/close_envelope_m.png)',
        }">
          <span class="play-count__milestone-count">{{ milestone.count }}</span>
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
      { count: 5, prize: "熟齡英文開聊\n線上課" },
      { count: 10, prize: "百歲料理課\n線上課" },
      { count: 15, prize: "生活收納課\n線上課" },
      { count: 20, prize: "全聯禮券\n500元" },
      { count: 25, prize: "iPhone 17 Pro\n" },
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
  padding: 0px 12px 0 12px;

  @media (max-width: 768px) {
    background-position: center -60px;
  }

  @media (max-width: 480px) {
    margin-bottom: 60px;
    background-position: center -100px;
  }

  &__banner {
    max-width: 1000px;

    width: 100%;
    height: 120px;
    margin: 0 auto;
    background: linear-gradient(to bottom, #faebb5, #e7c170);
    border-radius: 100px;
    margin-bottom: 45px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 1024px) {
      height: 100px;
      margin-bottom: 25px;
    }

    @media (max-width: 768px) {
      max-width: 600px;
      height: 200px;
      border-radius: 20px;
    }

    @media (max-width: 480px) {
      height: 150px;
    }

    &-content {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      @media (max-width: 768px) {
        flex-direction: column;
        gap: 10px;
      }
    }

    &-left {
      text-align: center;
    }

    &-right {
      text-align: center;
    }
  }

  &__banner-title {
    font-size: 50px;
    font-weight: 600;
    color: #80552b;

    @media (max-width: 1024px) {
      font-size: 40px;
    }

    @media (max-width: 768px) {
      font-size: 50px;
    }

    @media (max-width: 480px) {
      font-size: 30px;
    }
  }

  &__text {
    width: auto;
    max-width: 540px;
    background: #ba934e;
    color: #f5f5f5;
    font-size: 40px;
    font-weight: 500;
    margin-left: 40px;
    padding: 10px 60px;
    border-radius: 100px;
    box-sizing: border-box;

    @media (max-width: 1024px) {
      margin-left: 20px;
      font-size: 24px;
    }

    @media (max-width: 768px) {
      font-size: 36px;
      margin-left: 0;
    }

    @media (max-width: 480px) {
      font-size: 20px;
    }

    @media (max-width: 360px) {
      font-size: 18px;
    }
  }

  &__number {
    font-weight: bold;
    color: #f5f5f5;
    font-size: 40px;
    backdrop-filter: blur(4px);
    border-radius: 4px;

    @media (max-width: 1024px) {
      font-size: 24px;
    }

    @media (max-width: 768px) {
      font-size: 36px;
    }

    @media (max-width: 480px) {
      font-size: 20px;
    }
  }

  &__milestones {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    margin-top: 25px;
    gap: 50px;
    flex-wrap: wrap;

    &--desktop {
      @media (max-width: 768px) {
        display: none;
      }
    }

    &--mobile {
      display: none;

      @media (max-width: 768px) {
        display: flex;
        gap: 30px;
        flex-direction: column;
      }
    }
  }

  &__milestone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    transition: all 0.4s ease;

    .play-count__milestones--mobile & {
      @media (max-width: 768px) {
        flex-direction: row;
        align-items: center;
      }
    }

    &--achieved {
      .play-count__milestone-count {
        color: #faebb5;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      }

      .play-count__milestone-prize {
        color: #ffffff;
        font-weight: 500;
      }

      .play-count__milestones--mobile & {
        .play-count__milestone-count {
          @media (max-width: 768px) {
            color: #faebb5;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          }
        }

        .play-count__milestone-prize {
          @media (max-width: 768px) {
            color: #ffffff;
          }
        }
      }
    }

    &-number {
      width: 180px;
      height: 300px;
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      position: relative;

      @media (max-width: 1024px) {
        width: 130px;
        height: 217px;
      }

      .play-count__milestones--mobile & {
        @media (max-width: 768px) {
          width: 72px;
          height: 120px;
        }

        @media (max-width: 480px) {
          width: 60px;
          height: 100px;
        }

        @media (max-width: 360px) {
          width: 50px;
          height: 83px;
        }
      }
    }

    &-count {
      font-weight: bold;
      font-size: 70px;
      color: #9d1c05;
      margin-top: 100px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

      @media (max-width: 1024px) {
        font-size: 40px;
        margin-top: 70px;
      }

      .play-count__milestones--mobile & {
        @media (max-width: 768px) {
          margin-top: 0;
          position: absolute;
          top: 60%;
          left: 49%;
          transform: translate(-50%, -50%);
          font-size: 40px;
          color: #9d1c05;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 480px) {
          font-size: 30px;
        }
      }
    }

    &-prize {
      margin-top: 8px;
      font-size: 22px;
      line-height: 1.5;
      font-weight: 500;
      color: #9d1c05;
      text-align: center;
      transition: all 0.3s ease;
      white-space: pre-line;
      min-height: 66px;
      display: flex;
      align-items: center;
      justify-content: center;

      @media (max-width: 1024px) {
        font-size: 18px;
        min-height: 54px;
      }

      .play-count__milestones--mobile & {
        @media (max-width: 768px) {
          font-size: 40px;
          margin-top: 0;
          margin-left: 10px;
          text-align: left;
          white-space: nowrap;
          color: #ee772b;
        }

        @media (max-width: 480px) {
          font-size: 30px;
        }

        @media (max-width: 360px) {
          font-size: 20px;
        }
      }
    }
  }
}
</style>
