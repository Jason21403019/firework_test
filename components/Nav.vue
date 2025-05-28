<template>
  <nav class="navbar">
    <Nav_container>
      <div class="navbar__content">
        <div class="navbar__logo">
          <NuxtLink to="/">
            <img
              src="/imgs/logo_udn.svg"
              alt="logo_udn_Logo"
              class="navbar__logo-image"
            />
          </NuxtLink>
        </div>

        <div class="navbar__right">
          <div
            class="navbar__links"
            :class="{ 'navbar__links--active': isMobileMenuOpen }"
          >
            <NuxtLink
              to="/"
              class="navbar__link"
              @click="isMobileMenuOpen = false"
              >活動辦法</NuxtLink
            >
            <NuxtLink
              to="/"
              class="navbar__link"
              @click="isMobileMenuOpen = false"
              >獎品一覽</NuxtLink
            >
            <NuxtLink
              to="/"
              class="navbar__link"
              @click="isMobileMenuOpen = false"
              >中獎名單</NuxtLink
            >
          </div>

          <div class="navbar__social">
            <a
              href="https://www.facebook.com/share"
              target="_blank"
              class="navbar__social-link navbar__social-link--facebook"
              aria-label="分享到臉書"
            >
              <img
                src="/imgs/share_fb.svg"
                alt="Facebook"
                class="navbar__social-icon"
              />
            </a>
            <a
              href="https://line.me/R/msg/text/"
              target="_blank"
              class="navbar__social-link navbar__social-link--line"
              aria-label="分享到LINE"
            >
              <img
                src="/imgs/share_line.svg"
                alt="LINE"
                class="navbar__social-icon"
              />
            </a>
          </div>

          <div class="navbar__hamburger" @click="toggleMobileMenu">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </Nav_container>
  </nav>
</template>

<script setup>
import { ref } from "vue";
import Nav_container from "./Nav_container.vue";

const isMobileMenuOpen = ref(false);

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  background-color: transparent;
  box-shadow: none;
  padding: 1rem 0;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;

  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 160px;

    &-image {
      margin-bottom: 11px;
      display: block;
      width: 100%;
    }
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  &__links {
    display: flex;
    align-items: center;
  }

  &__link {
    color: #fff;
    text-decoration: none;
    font-size: 28px;
    font-weight: 300;
    transition: color 0.3s ease;
    padding: 0.5rem 0;
    position: relative;
    padding: 0.5rem 0.8rem;

    &:not(:last-child)::after {
      content: "|";
      position: absolute;
      right: -2px;
      top: 45%;
      transform: translateY(-50%);
      color: #fff;
    }
  }

  &__social {
    display: flex;
    gap: 0.5rem;

    &-link {
      display: flex;
      justify-content: center;
      align-items: center;

      width: 40px;
      height: 40px;
      border-radius: 50%;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    &-icon {
      width: 36px;
      height: 36px;
    }
  }

  &__hamburger {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 25px;
    height: 20px;
    cursor: pointer;
    z-index: 110;

    span {
      display: block;
      height: 3px;
      width: 100%;
      background-color: #fa541c;
      border-radius: 3px;
      transition: all 0.3s ease;
    }
  }
}

@media (max-width: 768px) {
  .navbar {
    &__content {
      padding: 0.8rem 0;
    }

    &__right {
      gap: 1rem;
    }

    &__hamburger {
      display: flex;
    }

    &__links {
      position: fixed;
      top: 0;
      right: -100%;
      width: 70%;
      height: 100vh;
      background-color: white;
      padding: 80px 20px 20px;
      flex-direction: column;
      align-items: flex-start;
      box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
      transition: right 0.3s ease;
      z-index: 100;
      margin-right: 0;

      &--active {
        right: 0;
      }
    }

    &__link {
      width: 100%;
      padding: 12px 0;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
      }
    }
  }

  .navbar__links--active ~ .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 90;
  }
}
</style>
