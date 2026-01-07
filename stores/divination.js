import { defineStore } from "pinia";

export const useDivinationStore = defineStore("divination", {
  state: () => ({
    hasPlayed: false,
    totalPlayCount: 0,
    lastAchievedMilestone: 0,
    milestones: [1, 5, 10, 15, 20],
    fortuneResults: [
      {
        id: "fortune_1",
        title: "心型煙火 | 幸運指數:91%",
        description:
          "今日你愛情能量報表!特別適合告白、約會，\n你的魅力讓你閃閃發光。",
        image_url: "./imgs/heart.png",
        weight: 20,
      },
      {
        id: "fortune_2",
        title: "金浪煙火 | 幸運指數:88%",
        description:
          "財務上有不錯的直覺和機會，適合投資、\n做小額理財規劃。也有機會獲得意外之財或小獎喔!",
        image_url: "./imgs/goldwave.png",
        weight: 20,
      },
      {
        id: "fortune_3",
        title: "療癒煙火 | 幸運指數:75%",
        description:
          "今天適合慢下腳步，讓身心放鬆，\n多親近自然或早點休息，補充滿滿能量!",
        image_url: "./imgs/healing.png",
        weight: 40,
      },
      {
        id: "fortune_4",
        title: "金光煙火 | 幸運指數:80%",
        description:
          "你的工作運極佳，有重要會議或報告時表現亮眼，\n適合發展實力的好日子。",
        image_url: "./imgs/goldlight.png",
        weight: 20,
      },
    ],
  }),

  getters: {
    canPlay: (state) => !state.hasPlayed,
    playProgress: (state) => ({
      current: state.totalPlayCount,
      milestones: state.milestones,
      lastAchieved: state.lastAchievedMilestone,
    }),
  },

  actions: {
    setPlayedStatus(status) {
      this.hasPlayed = status;
    },

    setTotalPlayCount(count) {
      this.totalPlayCount = parseInt(count);
    },

    incrementPlayCount() {
      this.totalPlayCount++;
    },

    setLastAchievedMilestone(milestone) {
      this.lastAchievedMilestone = milestone;
    },

    recordPlayToday() {
      this.hasPlayed = true;
    },

    clearPlayRecord() {
      this.hasPlayed = false;
    },

    checkMilestoneAchievement(newCount, oldCount, isFirstTime) {
      const newAchieved = this.milestones.find(
        (m) => oldCount < m && newCount >= m,
      );

      if (newAchieved && newAchieved > this.lastAchievedMilestone) {
        if (isFirstTime) {
          this.lastAchievedMilestone = newAchieved;
        } else {
          this.lastAchievedMilestone = newAchieved;
        }
      }
    },

    initializeAchievedMilestone() {
      if (this.totalPlayCount > 0) {
        for (let i = this.milestones.length - 1; i >= 0; i--) {
          if (this.totalPlayCount >= this.milestones[i]) {
            this.lastAchievedMilestone = this.milestones[i];
            break;
          }
        }
      }
    },

    generateFortuneResult() {
      // 計算權重總和
      const totalWeight = this.fortuneResults.reduce(
        (sum, fortune) => sum + fortune.weight,
        0,
      );

      // 產生隨機數
      const randomBytes = new Uint32Array(1);
      crypto.getRandomValues(randomBytes);
      const randomValue = (randomBytes[0] % totalWeight) + 1;

      // 根據權重選擇結果
      let currentWeight = 0;
      for (const fortune of this.fortuneResults) {
        currentWeight += fortune.weight;
        if (randomValue <= currentWeight) {
          const result = { ...fortune };
          delete result.weight;
          return result;
        }
      }

      // 預設情況下返回第一個結果
      const defaultResult = { ...this.fortuneResults[0] };
      delete defaultResult.weight;
      return defaultResult;
    },
  },
});
