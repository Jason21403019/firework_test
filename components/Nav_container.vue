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
  padding: 0 12px;
  box-sizing: border-box;
}
</style>
