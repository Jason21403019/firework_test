<template>
  <div class="title-image-container" :class="{ 'center-align': centered }">
    <img
      :src="getImagePath(type)"
      :alt="getAltText(type)"
      class="title-image"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "rules",
    validator: (value) => ["rules", "prizes", "info"].includes(value),
  },
  centered: {
    type: Boolean,
    default: true,
  },
});

// 根據類型獲取圖片路徑
const getImagePath = (type) => {
  const basePath = "/imgs/";

  switch (type) {
    case "rules":
      return basePath + "act_rules.png";
    case "prize":
      return basePath + "act_prize.png";
    case "info":
      return basePath + "act_remind.png";
    default:
      return basePath + "act_rules.png";
  }
};

// 獲取圖片替代文字
const getAltText = (type) => {
  switch (type) {
    case "rules":
      return "活動辦法";
    case "prizes":
      return "活動獎項";
    case "info":
      return "活動提醒";
    default:
      return "活動資訊";
  }
};
</script>

<style scoped>
.title-image-container {
  /* border: 1px solid red; */
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  margin-bottom: 40px;
}

.center-align {
  text-align: center;
}

.title-image {
  max-width: 100%;
  height: auto;
  display: inline-block;
}

@media (max-width: 768px) {
  .title-image-container {
    margin: 20px 0;
  }

  .title-image {
    max-width: 90%;
  }
}
</style>
