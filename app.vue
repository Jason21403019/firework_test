<template>
  <Nav />
  <NuxtPage />
</template>

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
