<template>
  <nav class="navbar">
    <div class="navbar-logo">
      <NuxtLink to="/">
        <span class="logo-text">FATE 2025</span>
      </NuxtLink>
    </div>
    <div class="navbar-links">
      <NuxtLink to="/" class="nav-link">首頁</NuxtLink>
    </div>
  </nav>
</template>

<script setup>
// 如果需要導覽列互動功能，可在此添加
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .navbar-logo {
    .logo-text {
      font-size: 1.5rem;
      font-weight: bold;
      color: #4169e1;
    }
  }

  .navbar-links {
    display: flex;
    gap: 1.5rem;

    .nav-link {
      color: #333;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;

      &:hover {
        color: #4169e1;
      }

      &.router-link-active {
        color: #4169e1;
        font-weight: 600;
      }
    }
  }
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    padding: 0.8rem;

    .navbar-logo {
      margin-bottom: 1rem;
    }

    .navbar-links {
      width: 100%;
      justify-content: space-around;
      padding: 0.5rem 0;

      .nav-link {
        font-size: 0.9rem;
      }
    }
  }
}
</style>
