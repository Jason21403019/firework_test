<template>
  <div class="notice">
    <div class="notice__buttons">
      <button @click="showNoticePopup" class="notice__btn notice__btn--notice">
        注意事項
      </button>
      <button
        @click="showPrivacyPopup"
        class="notice__btn notice__btn--privacy"
      >
        個資聲明
      </button>
    </div>

    <div
      v-if="isPopupVisible"
      class="notice__overlay"
      :class="{ 'notice__overlay--closing': isClosing }"
      @click.self="closeModal"
    >
      <div
        class="notice__popup"
        :class="{ 'notice__popup--closing': isClosing }"
      >
          <button class="notice__close-btn" @click="closeModal">
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 20L4 4M4 20L20 4"
                stroke="currentColor"
                stroke-width="4"
              />
            </svg>
          </button>

          <div class="notice__header">
            <h2 class="notice__title">{{ currentContent.title }}</h2>
          </div>

          <div class="notice__content">
            <p>{{ currentContent.description }}</p>
            <p>{{ currentContent.extraInfo }}</p>
            <ul class="notice__list">
              <li
                v-for="(item, index) in currentContent.items"
                :key="index"
                class="notice__item"
              >
                {{ item }}
              </li>
            </ul>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const isPopupVisible = ref(false);
const activeTab = ref("notice");
const isClosing = ref(false);

const contentData = {
  notice: {
    title: "注意事項",
    items: [
      "本網站受 Turnstile 保護，適用 Cloudflare 隱私政策和服務條款。",
      "所有活動相關辦法，皆以本網頁公佈為主，獎品項目則依實物為主。",
      "網友填寫資料之目的係作為確認身分，以便進行活動。網友同意聯合線上得利用資料作為將來產品行銷暨公關活動之用。聯合線上保證登入資料不洩漏予第三人，亦不進行前述目的範圍以外之利用。未依規定詳填資料（姓名、E-Mail、電話、個人影片），致網友有任何損失者，聯合線上恕不負責。",
      "本活動得獎資料如有不符合資格或取消者皆不遞補。所有獎項皆不重複得獎，如有發現偽造資格或不法得獎者，聯合線上皆有權取消得獎資格。",
      "參加者於參加本活動同時，即同意接受本活動之活動辦法與注意事項規範，並須遵守聯合線上的服務條款、使用規範及其他交易有關之規定，若發現有使用網頁機器人參與活動違反之規定，聯合線上得取消其參加或得獎資格，並就因此所生之損害，得向參加者請求損害賠償。",
      "參加者應保證所有填寫或提出之資料均為真實且正確，且未冒用或盜用任何第三人之資料。如有不實或不正確之情事，聯合線上得取消參加或得獎資格。如因此致聯合線上無法通知其得獎訊息時，聯合線上不負任何法律責任，且如有致損害於聯合線上或其他任何第三人，參加者應負一切相關責任。",
      "得獎者應於聯合線上通知之期限內回覆確認同意領取獎品，並提供聯合線上所要求之完整領獎文件，逾期視為棄權。",
      "如有任何因電腦、網路、電話、技術或不可歸責於聯合線上之事由，而使參加者所寄出或登錄之資料有遲延、遺失、錯誤、無法辨識或毀損之情況致使參加者無法參加活動時，聯合線上不負任何法律責任，參加者亦不得因此異議。",
      "如本活動因不可抗力或其他特殊原因致無法舉行時，聯合線上有權決定取消、終止、修改或暫停本活動。",
      "活動獎項以公佈於本網站上的資料為準，如遇不可抗拒或非可歸責於聯合線上之因素，致無法提供原訂獎項時，聯合線上保留更換其他等值獎項之權利。",
      "活動獎項價值超過新台幣 20,000 元者，得獎者應自行負擔 10% 之機會中獎所得稅。活動獎項如為現金，聯合線上有權自應給付獎金中逕予扣除相關所得稅，現金以外之獎項，得獎者應先繳納中獎所得稅後，始得領取活動獎品。",
      "參加者如因參加本活動或因活動獎項而遭受任何損失，聯合線上及相關之母公司、子公司、關係企業、員工、及代理商不負任何責任。一旦得獎者領取獎品後，若有遺失或被竊，聯合線上或贊助廠商等不發給任何證明或補償。",
      "得獎者應自行負擔活動獎項寄送之郵資。獎項寄送地區僅限台、澎、金、馬，聯合線上不處理郵寄獎品至海外地區之事宜。本活動之獎品不得轉換、轉讓或折換現金。",
      "活動參加者同意聯合線上得將其部分姓名與 E-Mail，公佈於本活動網站或相關行銷活動網站或宣傳物中並同意聯合線上蒐集其姓名及聯絡方式（電話、地址或 E-Mail）作為贈獎聯繫使用。",
      "客戶服務信箱 vaservice@udn.com，服務時間週一 ~ 週五，9:30~12:00、13:30~17:30，例假日及國定假日暫不提供服務。",
    ],
  },
  privacy: {
    title: "個資聲明",
    description: "個人資料保護法告知事項：",
    extraInfo:
      "聯合線上股份有限公司（以下簡稱本公司）茲依據個人資料保護法（以下簡稱個資法）之相關規定，告知以下個資宣告事項，敬請詳閱：",
    items: [
      "蒐集個人資料公司：聯合線上股份有限公司（以下簡稱本公司）。",
      "蒐集之目的：行銷。",
      "個人資料之類別：姓名、地址、電子郵件及電話於參加活動時所提供之個人資料。",
      "個人資料利用之期間：自台端參加本公司任何活動日起地兩年內之間。",
      "個人資料利用之地區：本公司營運範圍，僅限於台灣、金門、澎湖、馬祖等地區利用，且不會移轉至其他境外地區利用。",
      "個人資料利用之對象及方式：由本公司該業務承辦人員於辦理該活動之特定目的必要範圍內，依通常作業所必要之方式利用此個人資料。本活動網站公開之資料，公眾將可透過網際網路瀏覽參與活動所公開之資料或中獎資訊。本公司對於中獎資訊之公布，將採取隱匿部分個人資訊之方式處理，以確保個人資料之安全。",
      "依個人資料保護法第三條規定得行使之權利及方式：台端得向本公司承辦該項業務單位「聯合線上股份有限公司」提出申請，以查詢、閱覽、製給複製本；或補充／更正、請求停止蒐集、處理、利用或刪除個人資料內容之一部或全部。（註：參加人申請查詢、閱覽、製給複製本時，將酌收必要成本費用。）",
      "台端填寫個人資料後，以任何方式遞送至本公司收執時，均視為台端已同意其所填寫之個人資料，供本公司於辦理『馬上有福轉好運』活動之特定目的必要範圍內處理及利用；此外，台端可自行決定是否填寫相關之個人資料欄位，若台端選擇不願填寫，將無法參加本次活動所提供之相關服務或遭取消中獎資格。",
      "個人資料安全措施：本公司將依據相關法令之規定建構完善措施，保障台端個人資料之安全。",
    ],
  },
};

const currentContent = computed(() => {
  return contentData[activeTab.value];
});

const showNoticePopup = () => {
  activeTab.value = "notice";
  isPopupVisible.value = true;
  isClosing.value = false;
};

const showPrivacyPopup = () => {
  activeTab.value = "privacy";
  isPopupVisible.value = true;
  isClosing.value = false;
};

const closeModal = () => {
  isClosing.value = true;
  setTimeout(() => {
    isClosing.value = false;
    isPopupVisible.value = false;
  });
};
</script>

<style lang="scss" scoped>
.notice {
  padding: 40px 20px 600px 20px;
  max-width: 100%;
  margin: 0 auto;
  background: url("/imgs/footer_bg.png") no-repeat center 40px;
  position: relative;
  @media (max-width: 768px) {
    background: url("/imgs/m_footer_bg.png") no-repeat center / cover;
    padding: 40px 20px 670px 20px;
  }
  @media (max-width: 640px) {
    background-size: auto;
    padding: 40px 0px 580px 0px;
  }
  @media (max-width: 550px) {
    background-size: contain;
    padding: 40px 12px 530px 12px;
  }
  @media (max-width: 480px) {
    background-size: cover;
    padding: 40px 12px 400px 12px;
  }
  @media (max-width: 410px) {
    background-size: cover;
    padding: 40px 12px 300px 12px;
  }
  @media (max-width: 360px) {
    background-size: cover;
    padding: 40px 12px 300px 12px;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    right: 120px;
    width: 670px;
    height: 475px;
    background-image: url("/imgs/u_baby.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center bottom;
    z-index: 1;
    @media (max-width: 1480px) {
      right: 60px;
      width: 500px;
      height: 350px;
    }
    @media (max-width: 1180px) {
      right: 30px;
      width: 400px;
      height: 300px;
    }
    @media (max-width: 992px) {
      right: 20px;
      width: 300px;
      height: 250px;
    }
    @media (max-width: 768px) {
      background-image: none;
    }
  }
  &__buttons {
    display: flex;
    gap: 40px;
    justify-content: center;
    @media (max-width: 360px) {
      gap: 20px;
    }
    @media (max-width: 330px) {
      gap: 10px;
    }
  }

  &__btn {
    max-width: 250px;
    padding: 8px 40px;
    border-radius: 50px;
    background: linear-gradient(to bottom, #faebb5, #e7c170);
    color: #80552B;
    font-size: clamp(20px, 4cqw, 40px);
    font-weight: 600;
    cursor: pointer;
    border: none;
    position: relative;
    @media (max-width: 450px) {
      max-width: 280px;
      padding: 8px 30px;
    }
  }

  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 12px;
    animation: overlayFadeIn 0.3s ease-out;

    &--closing {
      animation: overlayFadeOut 0.3s ease-out;
    }
  }

  &__popup {
    background: #D83307;
    border-radius: 25px;
    max-width: 1060px;
    max-height: 700px;
    position: relative;
    animation: modalBounceIn 0.3s ease-out;
    padding: 60px;
    border: 10px solid #E05C39;

    &--closing {
      animation: modalBounceOut 0.25s ease-in;
    }
    @media (max-width: 768px) {
      padding: 40px;
    }
    @media (max-width: 480px) {
      padding: 30px;
      border: none;
    }

  }

  &__close-btn {
    position: absolute;
    top: -22px;
    right: -22px;
    width: 40px;
    height: 40px;
    border: none;
    background: #E7C170;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #80552B;
    z-index: 10;
  }

  &__title {
    margin-bottom: 20px;
    font-size: 30px;
    font-weight: bold;
    color: #FAEBB5;
    text-align: left;
    @media (max-width: 480px) {
      font-size: 24px;
    }
  }

  &__content {
    padding: 2px 50px 2px 2px;
    height: 500px;
    color: #fff;
    font-size: 18px;
    overflow-y: scroll;
    @media (max-width: 768px) {
      padding: 2px 30px 2px 2px;
    }
    @media (max-width: 480px) {
      padding: 2px 20px 2px 2px;
      font-size: 16px;
    }
    @media (max-width: 360px) {
      padding: 2px 10px 2px 2px;
    }

    p {
      margin-bottom: 10px;
      line-height: 1.6;
    }

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #E05C39;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #fff;
      border-radius: 4px;
    }
  }

  &__list {
    list-style: disc;
    padding-left: 25px;
  }

  &__item {
    padding: 10px 0;
    color: #fff;
    font-size: 18px;
    line-height: 1.6;
    position: relative;
    counter-increment: list-counter;
    &:first-child {
      padding-top: 0;
    }
    @media (max-width: 480px) {
      font-size: 16px;
    }
  }
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes overlayFadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes modalBounceIn {
  0% {
    opacity: 0;
    transform: translateY(-50px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes modalBounceOut {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
}
</style>
