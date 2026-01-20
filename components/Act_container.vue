<template>
  <section class="act-container">
    <div class="act-container__border-top">
      <img src="/imgs/act_container_top.png" alt="活動邊框" />
    </div>
    <div class="act-content">
      <slot></slot>
    </div>
    <div class="act-container__border-bottom">
      <img src="/imgs/act_container_bottom.png" alt="活動邊框" />
    </div>
  </section>
</template>
<script setup>
defineProps({
  name: "ActContainer",
});
</script>
<style lang="scss" scoped>
.act-container {
  container-type: inline-size;
  border-right: 6px solid #faebb4;
  border-left: 6px solid #faebb4;
  background-color: #ee772b;
  max-width: 1280px;
  margin: 0 auto;
  margin-bottom: 180px;

  &__border-top {
    width: 100%;
    position: relative;
    img {
      position: relative;
      margin-top: -6.3cqw;
      margin-left: -0.6cqw;
      width: 101.35cqw;
      height: auto;
      display: block;
    }
  }

  &__border-bottom {
    width: 100%;
    position: relative;
    img {
      position: relative;
      margin-left: -0.4cqw;
      margin-bottom: -6.1cqw;
      width: 100.9cqw;
      height: auto;
      display: block;
    }
  }

  @media (max-width: 1024px) {
    margin-bottom: 120px;
    border-right: 5px solid #faebb4;
    border-left: 5px solid #faebb4;
  }
  @media (max-width: 850px) {
    border-right: 4px solid #faebb4;
    border-left: 4px solid #faebb4;
  }
  @media (max-width: 768px) {
    border-right: 3px solid #faebb4;
    border-left: 3px solid #faebb4;
  }
  @media (max-width: 480px) {
    margin-bottom: 100px;
    border-right: 2px solid #faebb4;
    border-left: 2px solid #faebb4;
  }
  @media (max-width: 375px) {
    border-right: 1.5px solid #faebb4;
    border-left: 1.5px solid #faebb4;
  }
}

.act-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 12px;
}
</style>
