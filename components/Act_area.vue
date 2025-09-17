<template>
  <section class="act-area">
    <div class="act-area__container">
      <div class="act-area__content">
        <Act_title type="rules" id="activity" />
        <div class="act-area__rules">
          <h3>活動時間：</h3>
          <h4>2025 / 09 / 22 ( 一 ) 10:00 ~ 2025 / 10 / 14 ( 二 ) 10:00為止</h4>
          <h3>中獎公布：</h3>
          <h4>2025 / 10 / 23 ( 四 )</h4>
          <p>活動說明：</p>
          <ul>
            <li>活動限會員身分參加，需登 ( 加 ) 入會員。</li>
            <li>
              點擊摩天輪上的
              「立即占卜」，即可開始預測；占卜預測完成，即可獲得抽獎資格。
            </li>
            <li>
              活動期間，每個會員不限占卜次數，每天皆可占卜（每日從00:00起算），累計完成占卜次數，則可抽取指定獎項。
            </li>
          </ul>
        </div>
        <Act_title type="info" />
        <div class="act-area__info">
          <ul class="act-area__info-list">
            <li class="act-area__info-list-items">
              LINE Points 5 點將於 2025/10/27 起兩周內，以隨機方式透過 e-mail
              或簡訊方式陸續派發兌換序號。請參加者於 2025/10/24
              前，至會員中心填妥您的 e-mail
              和手機號碼等領獎資料。若逾期未填或兩者缺一，聯合線上得取消其得獎資格。
            </li>
            <li class="act-area__info-list-items">
              各獎項（獎品圖示僅供參考）將於活動結束後，由主辦單位以系統隨機抽出，並以
              e-mail
              或簡訊方式通知領取，請務必確認填寫資訊的真實性與正確性皆無誤。
            </li>
            <li class="act-area__info-list-items">
              主辦單位保留隨時修正、暫停、終止或解釋本活動之最終權利。
            </li>
            <li class="act-area__info-list-items">
              若發現人為操作、使用網頁機器人程式或一次性信箱等參與活動，聯合線上得取消其參加或得獎資格。
            </li>
            <li class="act-area__info-list-items">
              本活動獲獎資格不得重複，每人僅限一次領獎機會（依個人資料為準），均不得重複領獎。
            </li>
            <li class="act-area__info-list-items">
              若經查核發現，得獎者於活動開獎日前一年內，參與聯合線上活動累計中獎獎項價值超過新台幣
              1,000 元（含）以上，將取消本活動之獲獎資格。
            </li>
            <li class="act-area__info-list-items">
              若使用 Gmail
              帳號參加活動，於帳號任意字元間加入小數點，均視為同一個信箱，僅有一次獲（抽）獎資格。例如，已有
              123@gmail.com 參加活動，將主動排除 1.23@gmail.com、12.3@gmail.com
              等變體信箱。
            </li>
            <li class="act-area__info-list-items">
              參與本次活動即代表您已充分了解並同意接受個資聲明與注意事項。
            </li>
          </ul>
        </div>
      </div>
    </div>
    <Act_title type="prize" id="prizes" />
    <Prize />
  </section>
</template>

<script setup>
import Act_title from "./Act_title.vue";
import Prize from "./Prize.vue";
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

  .act-area__container {
    border: 3px solid #d8ceff;
    border-radius: 50px;
    box-shadow: inset 0 0 50px 20px rgba(#8d46d6, 0.5);
    background-color: rgba($color: #8d46d6, $alpha: 0.3);
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 12px;
    margin-bottom: 140px;
    padding-top: 120px;
    @media (max-width: 1024px) {
      padding-top: 80px;
      margin-bottom: 80px;
    }
    @media (max-width: 480px) {
      padding-top: 40px;
      margin-bottom: 40px;
    }
  }
  .act-area__content {
    // border: 1px solid green;
    max-width: 800px;
    margin: 0 auto;
  }
  .act-area__rules {
    // border: 1px solid yellow;
    width: 100%;
    margin-bottom: 140px;
    @media (max-width: 1024px) {
      margin-bottom: 80px;
    }
    @media (max-width: 480px) {
      margin-bottom: 40px;
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
      @media (max-width: 480px) {
        padding-left: 20px;
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
    margin-bottom: 140px;
    @media (max-width: 1024px) {
      margin-bottom: 80px;
    }
    @media (max-width: 480px) {
      margin-bottom: 40px;
    }
    ul {
      list-style-type: number;
      padding-left: 20px;
      li {
        color: #fff;
        font-size: 18px;
        margin-bottom: 10px;
        line-height: 1.5;
        text-align: justify;
        @media (max-width: 480px) {
          font-size: 16px;
        }
      }
    }
  }
}
</style>
