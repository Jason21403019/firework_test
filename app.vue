<template>
  <!-- Google Tag Manager (noscript) -->
  <noscript
    ><iframe
      src="https://www.googletagmanager.com/ns.html?id=GTM-NMFFZ35"
      height="0"
      width="0"
      style="display: none; visibility: hidden"
    ></iframe
  ></noscript>
  <!-- End Google Tag Manager (noscript) --><noscript>
    <img src="http://b.scorecardresearch.com/p?c1=2&c2=7390954&cv=2.0&cj=1" />
  </noscript>

  <!-- 只在非 admin 頁面顯示導覽列 -->
  <!-- <Nav v-if="!isAdminPage" /> -->
  <NuxtPage />
</template>

<script setup>
// 檢查當前路由是否為 admin 頁面
const route = useRoute();
const isAdminPage = computed(() => route.name === "admin");
</script>

<style lang="scss">
@use "~/assets/css/reset.css";
@use "~/assets/css/sweetalert.scss";

html {
  scroll-behavior: smooth;
}
body {
  background: url("/imgs/bg.jpg") top center;
  background-repeat: no-repeat;
  font-family: "Noto Sans TC", sans-serif;
  @media (max-width: 768px) {
    background: url("/imgs/m_bg.jpg") top center;
  }
}
</style>
