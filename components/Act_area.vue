<template>
  <section class="act-area">
    <h1 class="act-area__title">
      <img src="/imgs/activity_title.png" alt="活動標題" />
    </h1>
    <Act_container>
      <div class="act-area__rules">
        <h3>活動時間：</h3>
        <h4>即日起至 2026 / 03 / 10 ( 二 ) 10:00為止。</h4>
        <h3>中獎公布：</h3>
        <h4>2026 / 03 / 17 ( 二 )。</h4>
        <p>活動說明：</p>
        <ul>
          <li>活動限會員身分參加，皆需登 ( 加 ) 入會員。</li>
          <li>
            活動期間，每一會員帳號每日皆可玩一次轉盤（每日 00:00
            起算），累計完成占卜次數，則可抽取指定獎項。
          </li>
          <li>
            參加會員需填 e-mail 和手機號碼等個人資料，以便後續領取 LINE Points
            點數好禮（限量 8,000 組，送完為止）。
          </li>
        </ul>
        <div class="act-area__rules-flow">
          <img src="/imgs/act_container_flowimg.png" alt="活動規則" />
        </div>
      </div>
    </Act_container>
    <h1 class="act-area__title">
      <img src="/imgs/info_title.png" alt="活動標題" />
    </h1>
    <Act_container>
      <div class="act-area__info">
        <ul class="act-area__info-list">
          <li class="act-area__info-list-items">
            請參加者於 2026/3/10（二）活動截止前，至會員中心完整填寫 e-mail
            和手機號碼等個人資料，作為聯繫及領獎依據；若逾期未填寫，或填寫不完整，聯合線上得取消其獲（抽）獎資格。
          </li>
          <li class="act-area__info-list-items">
            各獎項（獎品圖示僅供參考）將於活動結束後，由系統隨機抽出，並以
            e-mail
            或簡訊方式通知中獎者。請務必確認填寫資訊的真實性與正確性皆無誤，以免影響領獎權益。
          </li>
          <li class="act-area__info-list-items">
            「LINE Points 5 點兌換序號」將於 2026/3/30 起兩周內，隨機以 e-mail
            或簡訊方式陸續派發。請再次登入會員帳號進行領取 (派發前封鎖 udn LINE
            官方帳號則取消獲獎資格)，並請妥善保管兌換序號，領取期限至
            2025/04/17，逾期未領，聯合線上不再重新發送序號。
          </li>
          <li class="act-area__info-list-items">
            每位參加者只要完成活動指定任務，即可獲得該獎項抽獎資格乙次；本活動獲獎資格不得重複，每人僅限一次領獎機會（依個人資料為準），均不得重複領獎。
          </li>
          <li class="act-area__info-list-items">
            若使用 Gmail
            帳號參加活動，於帳號任意字元間加入小數點，均視為同一個信箱，僅有一次獲（抽）獎資格。例如，已有
            123@gmail.com 參加活動，將主動排除 1.23@gmail.com、12.3@gmail.com
            等變體信箱。
          </li>
          <li class="act-area__info-list-items">
            若經查核發現，得獎者於活動開獎日前一年內，參與聯合線上活動累計中獎獎項價值超過新台幣
            1,000 元（含）以上，將取消本活動之獲獎資格。
          </li>
          <li class="act-area__info-list-items">
            若發現人為操作、利用外掛程式、網頁機器人、一次性信箱或其他不正當方式參與活動，聯合線上有權取消其獲（抽）獎資格。
          </li>
          <li class="act-area__info-list-items">
            主辦單位保留隨時修正、暫停、終止或解釋本活動之最終權利（包括但不限於更換活動、提前終止或延長活動時間之最終決定權等事項），並以本活動網站公告為準。
          </li>
          <li class="act-area__info-list-items">
            參與本次活動即代表您已充分了解並同意接受個資聲明與注意事項。
          </li>
        </ul>
      </div>
    </Act_container>
    <h1 class="act-area__title">
      <img src="/imgs/prize_title.png" alt="活動標題" />
    </h1>
    <Act_container>
      <Prize />
    </Act_container>
  </section>
</template>

<script setup>
import Prize from "./Prize.vue";
import Act_container from "./Act_container.vue";
defineProps({
  name: "ActArea",
});
onMounted(() => {
  const handleAnchorClick = (e) => {
    const href = e.target.getAttribute("href");
    if (href && href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const navbarHeight = 80;
        const targetPosition = targetElement.offsetTop - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    }
  };
  document.addEventListener("click", handleAnchorClick);
});
</script>

<style lang="scss" scoped>
.act-area {
  // border: 1px solid #ccc;
  padding: 0 12px;
  .act-area__title {
    max-width: 650px;
    max-height: 75px;
    margin: 0 auto 40px auto;
    display: flex;
    justify-content: center;
    margin-bottom: 120px;
    @media (max-width: 768px) {
      max-width: 520px;
      max-height: 60px;
      margin-bottom: 60px;
    }
    img {
      width: 100%;
      max-height: 75px;
      @media (max-width: 768px) {
        max-height: 60px;
      }
    }
  }
  .act-area__rules {
    // border: 1px solid yellow;
    width: 100%;
    &-flow {
      max-width: 910px;
      margin: 0 auto;
      @media (max-width: 480px) {
        max-width: 520px;
      }
      img {
        width: 100%;
        @media (max-width: 480px) {
          content: url("./imgs/act_container_flowimg_m.png");
        }
      }
    }
    h3,
    h4,
    p {
      color: #fff;
    }
    h3 {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
      @media (max-width: 480px) {
        font-size: 20px;
      }
    }
    h4 {
      font-size: 18px;
      font-weight: normal;
      margin-bottom: 30px;
      text-align: justify;
      line-height: 1.5;
      @media (max-width: 480px) {
        font-size: 16px;
      }
    }
    p {
      font-size: 24px;
      margin-bottom: 20px;
      @media (max-width: 480px) {
        font-size: 20px;
      }
    }
    ul {
      list-style-type: disc;
      padding-left: 50px;
      margin-bottom: 40px;
      @media (max-width: 480px) {
        padding-left: 20px;
        margin-bottom: 20px;
      }
      li {
        color: #fff;
        font-size: 18px;
        margin-bottom: 10px;
        text-align: justify;
        line-height: 1.5;
        @media (max-width: 480px) {
          font-size: 16px;
        }
      }
    }
  }
  .act-area__info {
    // border: 1px solid blue;
    width: 100%;
    ul {
      list-style: none;
      padding-left: 20px;
      li {
        position: relative;
        padding-left: 35px;
        color: #fff;
        font-size: 18px;
        margin-bottom: 10px;
        line-height: 1.5;
        text-align: justify;
        @media (max-width: 480px) {
          font-size: 16px;
          padding-left: 30px;
        }

        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 4px;
          width: 18px;
          height: 18px;
          background-image: url("/imgs/li_coin.png");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
      }
    }
  }
}
</style>
