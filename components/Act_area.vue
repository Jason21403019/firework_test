<template>
  <section class="act-area">
    <div class="act-area__container">
      <div class="act-area__content">
        <Act_title type="rules" />
        <div class="act-area__rules">
          <h3>活動時間：</h3>
          <h4>2025 / 06 / 17 ( 二 ) 10:00 ~ 2025 / 07 / 11 ( 一 ) 10:00為止</h4>
          <h3>中獎公布：</h3>
          <h4>2025 / 07 / 18 ( 五 )</h4>
          <p>活動說明：</p>
          <ul>
            <li>活動限會員身分參加，需登 ( 加 ) 入會員。</li>
            <li>
              點擊摩天輪上的 「 立即占卜 」
              ，即可開始預測；占卜預測完成，即可獲得抽獎資格。
            </li>
            <li>
              活動期間，每個會員不限占卜次數，每天皆可占卜（每日從00:00起算），累計完成占卜次數，則可抽取指定獎項。
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import Act_title from "./Act_title.vue";
defineProps({
  name: "ActArea",
});
</script>

<style lang="scss" scoped>
.act-area {
  border: 1px solid #ccc;

  .act-area__container {
    border: 3px solid #d8ceff;
    border-radius: 50px;
    box-shadow: inset 0 0 50px 20px rgba(#8d46d6, 0.5);
    background-color: rgba($color: #8d46d6, $alpha: 0.3);
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 12px;
    position: relative;
    &::before {
      content: "";
      background-image: url("./imgs/blue_light.png");
      background-size: 100% 100%;
      position: absolute;
      display: block;
      top: -50%;
      left: -50%;
      width: 120%;
      height: 200%;
      z-index: -1;
    }
  }
  .act-area__content {
    border: 1px solid green;
    max-width: 800px;
    margin: 0 auto;
  }
  .act-area__rules {
    border: 1px solid yellow;
    width: 100%;
    margin-bottom: 140px;
    h3,
    h4,
    p {
      color: #fff;
    }
    h3 {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    h4 {
      font-size: 18px;
      font-weight: normal;
      margin-bottom: 30px;
    }
    p {
      font-size: 24px;
      margin-bottom: 20px;
    }
    ul {
      list-style-type: disc;
      padding-left: 50px;
      li {
        color: #fff;
        font-size: 18px;
        margin-bottom: 10px;
        line-height: 1.5;
      }
    }
  }
}
</style>
