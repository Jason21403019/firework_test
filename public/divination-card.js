/**
 * 占卜卡片獨立模組
 * 這個檔案可以被其他網站引入使用
 *
 * 使用方式：
 * <script src="https://your-domain.com/divination-card.js"></script>
 * <script>
 *   DivinationCard.init({
 *     containerId: 'divination-container',
 *     showFirstTimePopup: true
 *   });
 * </script>
 */

(function (window) {
  "use strict";

  // 占卜結果數據
  const FORTUNE_RESULTS = [
    {
      id: "fortune_1",
      title: "心型煙火 | 幸運指數:91%",
      description:
        "今日你愛情能量報表!特別適合告白、約會，\n你的魅力讓你閃閃發光。",
      image_url: "https://event.udn.com/bd_newyear2026/imgs/heart.png",
      weight: 20,
    },
    {
      id: "fortune_2",
      title: "金浪煙火 | 幸運指數:88%",
      description:
        "財務上有不錯的直覺和機會，適合投資、\n做小額理財規劃。也有機會獲得意外之財或小獎喔!",
      image_url: "https://event.udn.com/bd_newyear2026/imgs/goldwave.png",
      weight: 20,
    },
    {
      id: "fortune_3",
      title: "療癒煙火 | 幸運指數:75%",
      description:
        "今天適合慢下腳步，讓身心放鬆，\n多親近自然或早點休息，補充滿滿能量!",
      image_url: "https://event.udn.com/bd_newyear2026/imgs/healing.png",
      weight: 40,
    },
    {
      id: "fortune_4",
      title: "金光煙火 | 幸運指數:80%",
      description:
        "你的工作運極佳，有重要會議或報告時表現亮眼，\n適合發展實力的好日子。",
      image_url: "https://event.udn.com/bd_newyear2026/imgs/goldlight.png",
      weight: 20,
    },
  ];

  // 從 URL 獲取參數
  function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  // 生成隨機占卜結果（使用權重）
  function generateFortuneResult() {
    const totalWeight = FORTUNE_RESULTS.reduce(
      (sum, fortune) => sum + fortune.weight,
      0,
    );

    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    const randomValue = (randomBytes[0] % totalWeight) + 1;

    let currentWeight = 0;
    for (const fortune of FORTUNE_RESULTS) {
      currentWeight += fortune.weight;
      if (randomValue <= currentWeight) {
        const result = { ...fortune };
        delete result.weight;
        return result;
      }
    }

    // 預設返回第一個結果
    const defaultResult = { ...FORTUNE_RESULTS[0] };
    delete defaultResult.weight;
    return defaultResult;
  }

  // 顯示重複遊玩卡片
  function showAlreadyPlayedCard(container, playCount) {
    // 根據次數決定訊息內容
    let message = "";
    let reminder = "";

    if (playCount === 1) {
      message =
        "獲得 LINEPOINTS 5點 抽獎資格(送完為止)兌換序號將於活動後寄送。";
      reminder = "小提醒 每天都能玩轉盤抽紅包 iPhone 17 大獎要送你！";
    } else if (playCount >= 2) {
      message = "今日轉運已完成！明天再來小試身手!";
    }

    const card = document.createElement("div");
    card.className = "already-played__overlay";
    card.innerHTML = `
      <div class="already-played__popup">
        <div class="already-played__popup-inner">
          <div class="already-played__title">
            <img src="https://event.udn.com/bd_newyear2026/imgs/play_again.png" alt="您今天已經占卜過了" class="already-played__title-image" />
          </div>
          <div class="already-played__content">
            ${message ? `<div class="already-played__points-message">${message}</div>` : ""}
            ${reminder ? `<div class="already-played__reminder">${reminder}</div>` : ""}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = "";
    container.appendChild(card);

    // 添加進入動畫
    setTimeout(() => {
      card.classList.add("already-played__overlay--show");
    }, 100);

    // 點擊 overlay 背景關閉卡片
    card.addEventListener("click", (e) => {
      if (e.target === card) {
        card.remove();
      }
    });
  }

  // 顯示占卜卡片
  function showFortuneCard(container, fortuneData, playCount) {
    // 根據次數決定訊息內容
    let message = "";
    let reminder = "";

    if (playCount === 1) {
      message =
        "獲得 LINEPOINTS 5點 抽獎資格(送完為止)兌換序號將於活動後寄送。";
      reminder = "小提醒 每天都能玩轉盤抽紅包 iPhone 17 大獎要送你！";
    } else if (playCount >= 2 && playCount <= 24) {
      message = "今日轉運已完成！明天再來小試身手!";
      reminder = "小提醒 每天都能玩轉盤抽紅包 iPhone 17 大獎要送你！";
    } else if (playCount >= 25) {
      message = "恭喜達成終極里程碑！你已集滿所有好運！";
      reminder =
        "你已完成全部挑戰，獲得最高級 iPhone 17 抽獎資格，將於 3/17 公告中獎，敬請期待！";
    }

    const card = document.createElement("div");
    card.className = "fortune-result__overlay";
    card.innerHTML = `
      <div class="fortune-result__popup">
        <div class="fortune-result__popup-inner">
          <div class="fortune-result__image-container">
            <img src="${fortuneData.image_url}" alt="${fortuneData.title}" class="fortune-result__image" />
          </div>
          <h2 class="fortune-result__title">${fortuneData.title}</h2>
          <div class="fortune-result__content">
            <p class="fortune-result__description">${fortuneData.description.replace(/\n/g, "<br>")}</p>
            ${message ? `<p class="fortune-result__description">${message}</p>` : ""}
            ${reminder ? `<p class="fortune-result__description">${reminder}</p>` : ""}
            <div class="fortune-result__share-buttons">
              <button class="fortune-result__line-button" onclick="window.shareFortune()">
                Line 分享占卜結果
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = "";
    container.appendChild(card);

    // 添加進入動畫
    setTimeout(() => {
      card.classList.add("fortune-result__overlay--show");
    }, 100);

    // 點擊 overlay 背景關閉卡片
    card.addEventListener("click", (e) => {
      if (e.target === card) {
        card.remove();
      }
    });
  }

  // 注入樣式
  function injectStyles() {
    if (document.getElementById("divination-card-styles")) return;

    const styles = document.createElement("style");
    styles.id = "divination-card-styles";
    styles.textContent = `
      /* 占卜結果卡片樣式 */
      .fortune-result__overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(15px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 12px;
        opacity: 0;
        animation: overlayFadeIn 0.3s ease-out forwards;
      }

      .fortune-result__overlay--show {
        opacity: 1;
      }

      .fortune-result__popup {
        background: linear-gradient(to bottom, #05026a, #4a46fc);
        border-radius: 10px;
        max-width: 600px;
        max-height: 90vh;
        position: relative;
        animation: modalBounceIn 0.3s ease-out;
        padding: 20px;
      }

      .fortune-result__popup::before {
        content: "";
        position: absolute;
        width: 80%;
        height: 100%;
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
        top: 0;
        left: 0;
        background: rgba(255, 255, 255, 0.05);
      }

      .fortune-result__popup-inner {
        position: relative;
        padding: 10px 10px;
        border-radius: 10px;
        z-index: 1;
        border: 2px solid rgba(87, 123, 255, 0.32);
      }

      .fortune-result__popup-inner::before {
        content: url("https://event.udn.com/bd_newyear2026/imgs/left_circle.png");
        position: absolute;
        top: 370px;
        left: -40px;
      }

      .fortune-result__title {
        font-size: 28px;
        font-weight: bold;
        color: #f8dfb2;
        text-align: center;
        margin-bottom: 20px;
        text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
      }

      .fortune-result__image-container {
        text-align: center;
        margin-bottom: 20px;
        position: relative;
      }

      .fortune-result__image-container::before {
        content: url("https://event.udn.com/bd_newyear2026/imgs/left_ribbons.png");
        position: absolute;
        top: 160px;
        left: -35px;
      }

      .fortune-result__image-container::after {
        content: url("https://event.udn.com/bd_newyear2026/imgs/right_ribbons.png");
        position: absolute;
        top: 240px;
        right: -50px;
      }

      .fortune-result__image {
        width: 100%;
        border-radius: 10px;
      }

      .fortune-result__content {
        text-align: center;
        color: #fff;
      }

      .fortune-result__description {
        font-size: 20px;
        line-height: 1.6;
        margin-bottom: 20px;
        white-space: pre-line;
      }

      .fortune-result__share-buttons {
        margin-top: 25px;
        display: flex;
        justify-content: center;
        margin-bottom: -60px;
      }

      .fortune-result__line-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: linear-gradient(to right, #f7c439, #f69c2e);
        color: white;
        border: none;
        border-radius: 50px;
        font-weight: 600;
        max-width: 480px;
        padding: 16px 60px;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
        box-sizing: border-box;
      }

      .fortune-result__line-button:hover {
        background: linear-gradient(to right, #f69c2e, #f7c439);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(247, 196, 57, 0.4);
      }

      @keyframes popupIn {
        0% {
          opacity: 0;
          transform: scale(0.5);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* 已重複遊玩卡片樣式 */
      .already-played__overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(15px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 12px;
        opacity: 0;
        animation: overlayFadeIn 0.3s ease-out forwards;
      }

      .already-played__overlay--show {
        opacity: 1;
      }

      .already-played__popup {
        background: linear-gradient(to bottom, #05026a, #4a46fc);
        border-radius: 10px;
        max-width: 400px;
        max-height: 80vh;
        position: relative;
        padding: 20px;
        animation: modalBounceIn 0.3s ease-out;
      }

      .already-played__popup::before {
        content: "";
        position: absolute;
        width: 80%;
        height: 100%;
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
        top: 0;
        left: 0;
        background: rgba(255, 255, 255, 0.05);
      }

      .already-played__popup::after {
        content: url("https://event.udn.com/bd_newyear2026/imgs/right_circle.png");
        position: absolute;
        bottom: -20px;
        right: 40px;
        z-index: 10;
      }

      .already-played__popup-inner {
        position: relative;
        padding: 10px 10px;
        border-radius: 10px;
        z-index: 1;
        border: 2px solid rgba(87, 123, 255, 0.32);
      }

      .already-played__popup-inner::before {
        content: url("https://event.udn.com/bd_newyear2026/imgs/left_circle.png");
        position: absolute;
        top: 370px;
        left: -40px;
      }

      .already-played__title {
        text-align: center;
        margin: 40px 0px;
        position: relative;
      }

      .already-played__title::after {
        content: url("https://event.udn.com/bd_newyear2026/imgs/title_right_leaf.png");
        position: absolute;
        right: -20px;
        top: 150px;
        width: 100px;
        height: 100px;
        z-index: 10;
      }

      .already-played__title::before {
        content: url("https://event.udn.com/bd_newyear2026/imgs/title_left_top_leaf.png");
        position: absolute;
        left: -30px;
        top: -30px;
        width: 100px;
        height: 100px;
        z-index: 10;
      }

      .already-played__title-image {
        max-width: 80%;
        height: auto;
      }

      .already-played__content {
        text-align: center;
        color: #fff;
      }

      .already-played__points-message {
        font-size: 22px;
        line-height: 1.6;
        margin-bottom: 20px;
        color: #f8dfb2;
        font-weight: bold;
        white-space: pre-line;
      }

      .already-played__reminder {
        font-size: 22px;
        line-height: 1.5;
        margin-bottom: 40px;
        color: #fff;
        white-space: pre-line;
      }

      /* 動畫 */
      @keyframes overlayFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
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

      /* 響應式設計 */
      @media (max-width: 768px) {
        .fortune-result__popup-inner {
          padding: 30px 20px;
        }

        .already-played__popup-inner {
          padding: 30px 20px;
        }

        .already-played__points-message {
          font-size: 18px;
        }

        .already-played__reminder {
          font-size: 18px;
        }
      }

      @media (max-width: 640px) {
        .fortune-result__overlay {
          padding: 32px;
        }

        .fortune-result__popup {
          max-width: 95vw;
        }

        .fortune-result__title {
          font-size: 24px;
        }

        .fortune-result__description {
          font-size: 18px;
        }

        .fortune-result__line-button {
          padding: 12px 24px;
          font-size: 18px;
        }

        .already-played__overlay {
          padding: 32px;
        }

        .already-played__popup {
          max-width: 95vw;
        }
      }

      @media (max-width: 480px) {
        .fortune-result__popup-inner {
          padding: 25px 15px;
        }

        .fortune-result__description {
          font-size: 14px;
        }

        .fortune-result__line-button {
          padding: 10px 16px;
        }
      }

      @media (max-width: 410px) {
        .fortune-result__popup {
          max-width: 90vw;
          padding: 10px;
        }

        .fortune-result__popup-inner {
          padding: 20px 10px;
        }

        .fortune-result__popup-inner::before {
          left: -30px;
        }

        .fortune-result__image-container::before {
          left: -30px;
        }

        .fortune-result__image-container::after {
          right: -30px;
          top: 190px;
        }

        .fortune-result__title {
          font-size: 20px;
        }

        .already-played__popup {
          max-width: 90vw;
          padding: 10px;
        }

        .already-played__popup-inner {
          padding: 20px 10px;
        }

        .already-played__popup-inner::before {
          left: -30px;
        }
      }

      @media (max-width: 380px) {
        .fortune-result__overlay {
          padding: 22px;
        }

        .fortune-result__popup-inner::before {
          top: 300px;
        }

        .fortune-result__image-container::after {
          right: -35px;
          top: 180px;
        }

        .fortune-result__description {
          font-size: 12px;
        }

        .already-played__overlay {
          padding: 22px;
        }

        .already-played__popup-inner::before {
          top: 300px;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  // 主要初始化函數
  function init(options = {}) {
    const containerId = options.containerId || "divination-container";
    const container = document.getElementById(containerId);

    if (!container) {
      console.error(`找不到容器元素: #${containerId}`);
      return;
    }

    // 注入樣式
    injectStyles();

    // 從 URL 取得參數
    const playCount = parseInt(getUrlParam("count") || "0");
    const alreadyPlayed = getUrlParam("already_played") === "1";
    const fortuneId = getUrlParam("fortune_id");

    console.log("DivinationCard 初始化:", {
      playCount,
      alreadyPlayed,
      fortuneId,
    });

    // 檢查是否已經顯示過（同一個 session 內只顯示一次）
    if (sessionStorage.getItem("divination-card-shown")) {
      console.log("卡片已顯示過，不再重複顯示");
      return {
        playCount,
        alreadyPlayed,
        fortuneData: null,
      };
    }

    // 如果已經玩過，顯示重複遊玩卡片
    if (alreadyPlayed) {
      showAlreadyPlayedCard(container, playCount);
      sessionStorage.setItem("divination-card-shown", "true");
      return {
        playCount,
        alreadyPlayed,
        fortuneData: null,
      };
    }

    // 生成並顯示占卜結果
    // 如果有 fortuneId，使用指定的結果；否則隨機生成
    let fortuneData;
    if (fortuneId) {
      // 根據 ID 找到對應的結果
      fortuneData = FORTUNE_RESULTS.find((f) => f.id === fortuneId);
      if (!fortuneData) {
        console.warn(`找不到 fortuneId: ${fortuneId}，使用隨機結果`);
        fortuneData = generateFortuneResult();
      } else {
        // 移除 weight 屬性
        fortuneData = { ...fortuneData };
        delete fortuneData.weight;
      }
    } else {
      fortuneData = generateFortuneResult();
    }

    showFortuneCard(container, fortuneData, playCount);
    sessionStorage.setItem("divination-card-shown", "true");

    return {
      playCount,
      alreadyPlayed,
      fortuneData,
    };
  }

  // Line 分享功能
  function shareFortune() {
    const shareUrl = "https://event.udn.com/bd_newyear2026";
    const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(lineShareUrl, "_blank", "width=600,height=600");
  }

  // 暴露到全域
  window.DivinationCard = {
    init: init,
    generateFortuneResult: generateFortuneResult,
    showAlreadyPlayedCard: showAlreadyPlayedCard,
    getUrlParam: getUrlParam,
    FORTUNE_RESULTS: FORTUNE_RESULTS,
  };

  // 暴露分享功能
  window.shareFortune = shareFortune;
})(window);
