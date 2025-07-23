<template>
  <nav class="navbar">
    <Nav_container>
      <div
        class="navbar__content"
        :class="{ 'navbar__content--scrolled': isScrolled }"
      >
        <div class="navbar__logo">
          <NuxtLink to="https://udn.com/news/index" target="_blank">
            <img
              src="/imgs/logo.png"
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
              to="#activity"
              class="navbar__link"
              @click="isMobileMenuOpen = false"
              >活動辦法</NuxtLink
            >
            <NuxtLink
              to="#prizes"
              class="navbar__link"
              @click="isMobileMenuOpen = false"
              >獎品一覽</NuxtLink
            >
            <NuxtLink
              to="/"
              class="navbar__link navbar__link--button"
              @click="handleWinnerListClick"
              >中獎名單</NuxtLink
            >
          </div>

          <div class="navbar__social">
            <a
              :href="facebookShareUrl"
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
              :href="lineShareUrl"
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

          <div
            class="navbar__hamburger"
            :class="{ 'navbar__hamburger--active': isMobileMenuOpen }"
            @click="toggleMobileMenu"
          >
            <span class="navbar__hamburger-line"></span>
            <span class="navbar__hamburger-line"></span>
            <span class="navbar__hamburger-line"></span>
          </div>
        </div>
      </div>
    </Nav_container>

    <div
      v-if="isMobileMenuOpen"
      class="navbar__backdrop"
      @click="isMobileMenuOpen = false"
    ></div>

    <Universal_popup
      :is-visible="showWinnerListPopup"
      :popup-data="winnerListPopupData"
      @close="closeWinnerListPopup"
      @confirm="handleWinnerListConfirm"
    />
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import Nav_container from "./Nav_container.vue";
import Universal_popup from "./Universal_popup.vue";

const isMobileMenuOpen = ref(false);
const isScrolled = ref(false);
const showWinnerListPopup = ref(false);
const scrollThreshold = 40;

const winnerListConfig = {
  announceDate: "2025年8月15日",
  winnerListUrl: "https://udn.com/news/index",
  isAnnounced: false,
};
const winnerListPopupData = computed(() => {
  if (winnerListConfig.isAnnounced) {
    return {
      icon: "success",
      title: "中獎名單",
      text: "恭喜得獎者！點擊下方按鈕查看完整中獎名單。",
      confirmButtonText: "查看中獎名單",
      showCancelButton: true,
      cancelButtonText: "稍後查看",
    };
  } else {
    return {
      icon: "warning",
      title: "中獎名單尚未公布",
      text: `中獎名單將於 ${winnerListConfig.announceDate} 公布，\n敬請期待！`,
      confirmButtonText: "我知道了",
      showCancelButton: false,
    };
  }
});

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function handleScroll() {
  isScrolled.value = window.scrollY > scrollThreshold;
}
function handleWinnerListClick() {
  isMobileMenuOpen.value = false;

  showWinnerListPopup.value = true;
}

function closeWinnerListPopup() {
  showWinnerListPopup.value = false;
}

function handleWinnerListConfirm() {
  if (winnerListConfig.isAnnounced) {
    window.open(winnerListConfig.winnerListUrl, "_blank");
  }

  closeWinnerListPopup();
}

const getLastFortuneResult = () => {
  return localStorage.getItem("last_fortune_result") || "heart";
};

const baseShareUrl = computed(() => {
  const lastResult = getLastFortuneResult();
  const baseUrl = "https://lab-event.udn.com/bd_fate2025_test";
  return `${baseUrl}`;
});

const facebookShareUrl = computed(() => {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseShareUrl.value)}`;
});

const lineShareUrl = computed(() => {
  const shareText = "快來幸福花火轉一夏！看看你會抽到什麼煙火！";
  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(baseShareUrl.value)}&text=${encodeURIComponent(shareText)}`;
});

onMounted(() => {
  if (window.scrollY > scrollThreshold) {
    isScrolled.value = true;
  }

  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  background-color: transparent;
  box-shadow: none;
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
    border-radius: 8px;

    &--scrolled {
      background-color: rgba(109, 39, 234, 0.25);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow: 1px 1px 5px rgb(109, 39, 234);
    }
  }

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 160px;
    padding: 4px 8px;
    transition: all 0.3s ease;
    background-color: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    @media (max-width: 480px) {
      width: 130px;
    }
    &-image {
      display: block;
      width: 100%;
    }
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 4px 8px;
    transition: all 0.3s ease;
    background-color: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    @media (max-width: 480px) {
      gap: 0.5rem;
    }
  }

  &__links {
    display: flex;
    align-items: center;
  }

  &__link {
    color: #fff;
    text-decoration: none;
    font-size: 24px;
    font-weight: 300;
    transition: color 0.3s ease;
    position: relative;
    &:first-child {
      padding-right: 12px;
    }
    &:last-child {
      padding-left: 12px;
    }
    &:nth-child(2) {
      padding: 0 12px;
    }

    &:not(:last-child)::after {
      content: "|";
      position: absolute;
      right: -2px;
      top: 45%;
      transform: translateY(-50%);
      color: #fff;
    }
    &--button {
      font-family: inherit;

      &:hover {
        color: #f0f0f0;
      }

      &:focus {
        outline: 2px solid rgba(255, 255, 255, 0.5);
        outline-offset: 2px;
        border-radius: 4px;
      }
    }
  }

  &__social {
    display: flex;
    gap: 0.5rem;
    @media (max-width: 480px) {
      gap: 0rem;
    }

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
      @media (max-width: 480px) {
        width: 28px;
        height: 28px;
      }
    }
  }

  &__hamburger {
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 30px;
    cursor: pointer;
    z-index: 110;
    position: relative;
    @media (max-width: 480px) {
      width: 25px;
      height: 25px;
    }

    &-line {
      display: block;
      height: 3px;
      width: 25px;
      background-color: #fff;
      border-radius: 2px;
      margin: 3px 0;
      transition: all 0.4s cubic-bezier(0.68, -0.6, 0.32, 1.6);
      transform-origin: center;
    }

    &--active {
      .navbar__hamburger-line {
        &:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        &:nth-child(2) {
          opacity: 0;
          transform: scale(0);
        }

        &:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }
      }
    }
  }

  &__backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: linear-gradient(
      135deg,
      rgba(27, 3, 62, 0.6),
      rgba(109, 39, 234, 0.4)
    );
    backdrop-filter: blur(5px) saturate(150%);
    -webkit-backdrop-filter: blur(5px) saturate(150%);
    z-index: 98;
    opacity: 0;
    animation: backdropFadeIn 0.3s ease-out forwards;
  }
}

@keyframes backdropFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .navbar {
    &__content {
      position: relative;
      z-index: 102;
    }

    &__logo {
      position: relative;
      z-index: 1000;
    }

    &__right {
      gap: 1rem;
      position: relative;
      z-index: 102;
    }

    &__hamburger {
      display: flex;
      position: relative;
      z-index: 103;
    }

    &__links {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: auto;
      min-height: 40vh;
      background: linear-gradient(
        135deg,
        rgba(27, 3, 62, 0.85),
        rgba(109, 39, 234, 0.75)
      );
      backdrop-filter: blur(15px) saturate(100%);
      -webkit-backdrop-filter: blur(15px) saturate(100%);
      border-radius: 10px;
      padding: 60px 20px 40px;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      gap: 2rem;
      box-shadow: 0 8px 32px rgba(27, 3, 62, 0.4);
      z-index: 101;
      box-sizing: border-box;
      margin: 0;
      transform: translateY(-100%);
      opacity: 0;
      visibility: hidden;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

      &--active {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }
    }

    &__link {
      color: rgba(255, 255, 255, 0.95);
      font-size: 24px;
      font-weight: 400;
      padding: 16px 20px;
      text-align: center;
      width: auto;
      border: none;

      &:hover {
        color: #fff;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
      }

      &:not(:last-child)::after {
        display: none;
      }
    }
  }
}
</style>
