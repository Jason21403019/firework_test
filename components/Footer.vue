<template>
  <div class="footer">
    <div class="footer__deco">
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.footer {
  width: 100%;
  height: 340px;
  background: url("/imgs/footerbg.png") no-repeat center bottom;
  background-size: cover;
  @media (max-width: 640px) {
    background: url("/imgs/footerbg_m.png") no-repeat center bottom;
    background-size: cover;
    height: 232px;
  }
}
</style>