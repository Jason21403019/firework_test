<template>
  <div class="container">
    <slot></slot>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.container {
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 16px;
  box-sizing: border-box;
  @media (max-width: 480px) {
    padding: 12px;
  }
  @media (max-width: 375px) {
    padding: 8px;
  }
}
</style>
