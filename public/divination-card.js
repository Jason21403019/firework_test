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

; (function (window) {
  'use strict'

  // 占卜結果數據
  const FORTUNE_RESULTS = [
    {
      id: 'fortune_1',
      title: '',
      description: '今日你愛情能量報表!特別適合告白、約會，\n你的魅力讓你閃閃發光。',
      image_url: 'https://event.udn.com/bd_newyear2026/imgs/daji.png',
      weight: 40,
    },
    {
      id: 'fortune_2',
      title: '',
      description: '財務上有不錯的直覺和機會，適合投資、\n做小額理財規劃。也有機會獲得意外之財或小獎喔!',
      image_url: 'https://event.udn.com/bd_newyear2026/imgs/zhongji.png',
      weight: 30,
    },
    {
      id: 'fortune_3',
      title: '',
      description: '今天適合慢下腳步，讓身心放鬆，\n多親近自然或早點休息，補充滿滿能量!',
      image_url: 'https://event.udn.com/bd_newyear2026/imgs/xiaoji.png',
      weight: 20,
    },
    {
      id: 'fortune_4',
      title: '',
      description: '你的工作運極佳，有重要會議或報告時表現亮眼，\n適合發展實力的好日子。',
      image_url: 'https://event.udn.com/bd_newyear2026/imgs/ping.png',
      weight: 10,
    },
  ]

  // 從 URL 獲取參數
  function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(name)
  }

  // 生成隨機占卜結果（使用權重）
  function generateFortuneResult() {
    const totalWeight = FORTUNE_RESULTS.reduce((sum, fortune) => sum + fortune.weight, 0)

    const randomBytes = new Uint32Array(1)
    crypto.getRandomValues(randomBytes)
    const randomValue = (randomBytes[0] % totalWeight) + 1

    let currentWeight = 0
    for (const fortune of FORTUNE_RESULTS) {
      currentWeight += fortune.weight
      if (randomValue <= currentWeight) {
        const result = { ...fortune }
        delete result.weight
        return result
      }
    }

    // 預設返回第一個結果
    const defaultResult = { ...FORTUNE_RESULTS[0] }
    delete defaultResult.weight
    return defaultResult
  }

  // 顯示重複遊玩卡片
  function showAlreadyPlayedCard(container, playCount) {
    // 根據次數決定類型和訊息
    let repeatType = playCount === 1 ? 'first' : 'normal'
    let customMessage = ''

    if (playCount === 1) {
      customMessage = `
        <div class="custom-result-message-coin">
          <img src="https://event.udn.com/bd_newyear2026/imgs/li_coin.png" alt="coin" />
        </div>
        <div>小提醒：每天都能玩轉盤抽紅包<br>iPhone 17 Pro 大獎要送你！</div>
      `
    } else {
      // 非第一次的重複遊玩也顯示客製化訊息
      customMessage = `
        <div class="custom-result-message-coin">
          <img src="https://event.udn.com/bd_newyear2026/imgs/li_coin.png" alt="coin" />
        </div>
        <div>小提醒：每天都能玩轉盤抽紅包<br>iPhone 17 Pro 大獎要送你！</div>
    `
    }

    const card = document.createElement('div')
    card.className = 'already-played__overlay'

    // first 類型：title 在 content 裡面
    const firstTypeContent = `
      <div class="already-played__content already-played__content--first">
        <h2 class="already-played__title">
          <span class="already-played__title-coin">
            <img src="https://event.udn.com/bd_newyear2026/imgs/title_coin.png" alt="title_coin" />
          </span>
          <span class="already-played__title-text">今天已經轉過好運囉！</span>
          <span class="already-played__title-coin">
            <img src="https://event.udn.com/bd_newyear2026/imgs/title_coin.png" alt="title_coin" />
          </span>
        </h2>
        <p class="already-played__desc">
          獲得<span class="already-played__desc-highlight"> LINE POINTS 5點 </span>抽獎資格(送完為止)<br>兌換序號將於活動後寄送。
        </p>
      </div>
      ${customMessage ? `<div class="already-played__custom-msg">${customMessage}</div>` : ''}
    `

    // normal 類型：只有 title，沒有 content
    const normalTypeContent = `
      <div class="already-played__title-wrapper">
        <span class="already-played__title-coin">
          <img src="https://event.udn.com/bd_newyear2026/imgs/title_coin.png" alt="title_coin" />
        </span>
        <h2 class="already-played__title already-played__title--normal">
          今天已經轉過好運囉！
        </h2>
        <span class="already-played__title-coin">
          <img src="https://event.udn.com/bd_newyear2026/imgs/title_coin.png" alt="title_coin" />
        </span>
      </div>
      ${customMessage ? `<div class="already-played__custom-msg already-played__custom-msg--normal">${customMessage}</div>` : ''}
    `

    card.innerHTML = `
      <div class="already-played__popup">
        <!-- 紅包袋口裝飾 -->
        <div class="already-played__bag-mouth">
          <svg xmlns="http://www.w3.org/2000/svg" width="550" height="150" viewBox="0 0 550 150">
            <path id="袋口" d="M521.93,91.761l-145.15-71.9a276.343,276.343,0,0,0-203.96-.289L28.35,91.093a49.864,49.864,0,0,0-28.21,44.6L0,150.208H550V136.426a49.852,49.852,0,0,0-28.07-44.675Z" transform="translate(0 -0.208)" fill="#bf2900"/>
          </svg>
        </div>
        
        <button class="already-played__close-btn">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 20L4 4M4 20L20 4" stroke="currentColor" stroke-width="4"/>
          </svg>
        </button>
        
        <div class="already-played__img-container">
          <img src="https://event.udn.com/bd_newyear2026/imgs/repeatimg.png" alt="已玩過圖片" class="already-played__img" />
        </div>
        
        ${repeatType === 'first' ? firstTypeContent : normalTypeContent}
      </div>
    `

    container.innerHTML = ''
    container.appendChild(card)

    // 添加進入動畫

    card.classList.add('already-played__overlay--show')

    // 點擊 overlay 背景關閉卡片
    card.addEventListener('click', (e) => {
      if (e.target === card) {
        card.classList.add('already-played__overlay--closing')
        card.remove()
      }
    })

    // 關閉按鈕事件
    const closeBtn = card.querySelector('.already-played__close-btn')
    closeBtn.addEventListener('click', () => {
      card.classList.add('already-played__overlay--closing')
      card.remove()
    })
  }

  // 顯示占卜卡片
  function showFortuneCard(container, fortuneData, playCount) {
    // 根據次數決定類型和訊息
    let resultType = 'normal'
    let customMessage = ''

    if (playCount === 1) {
      resultType = 'first'
      customMessage = `
        <div class="custom-result-message-coin">
          <img src="https://event.udn.com/bd_newyear2026/imgs/li_coin.png" alt="coin" />
        </div>
        <div>小提醒：每天都能玩轉盤抽紅包<br>iPhone 17 Pro 大獎要送你！</div>
      `
    } else if (playCount >= 2 && playCount <= 24) {
      resultType = 'normal'
      customMessage = `
        <div class="custom-result-message-coin">
          <img src="https://event.udn.com/bd_newyear2026/imgs/li_coin.png" alt="coin" />
        </div>
        <div>小提醒：每天都能玩轉盤抽紅包<br>iPhone 17 Pro 大獎要送你！</div>
      `
    } else if (playCount >= 25) {
      resultType = 'final'
      customMessage = `
        <div class="custom-result-message-coin">
          <img src="https://event.udn.com/bd_newyear2026/imgs/li_coin.png" alt="coin" />
        </div>
        <div>小提醒：你已累積滿滿的紅包獎勵，同時獲得<br> iPhone 17 Pro 抽獎資格，敬請期待！</div>
      `
    }

    const card = document.createElement('div')
    card.className = 'fortune-result__overlay'

    // first 類型：title 在 content 裡面
    const firstTypeContent = `
      <div class="fortune-result__content fortune-result__content--first">
        <h2 class="fortune-result__title">
          <span class="fortune-result__title-coin">
            <img src="https://event.udn.com/bd_newyear2026/imgs/title_coin.png" alt="title_coin" />
          </span>
          <span class="fortune-result__title-text">新春好運轉到你！</span>
          <span class="fortune-result__title-coin">
            <img src="https://event.udn.com/bd_newyear2026/imgs/title_coin.png" alt="title_coin" />
          </span>
        </h2>
        <p class="fortune-result__description">
          獲得<span class="fortune-result__description-highlight"> LINE POINTS 5點 </span>抽獎資格<br>兌換序號將於活動後寄送。
        </p>
      </div>
      ${customMessage ? `<div class="fortune-result__custom-message">${customMessage}</div>` : ''}
    `

    // normal 和 final 類型：只有 title，沒有 content
    const secondaryTitle =
      resultType === 'final' ? '恭喜完成！<br >你已轉出一整年的好運！' : '今日轉運已完成！<br >明天再來小試身手！'

    const normalOrFinalContent = `
      <div class="fortune-result__title-wrapper fortune-result__title-wrapper--${resultType}">
        <span class="fortune-result__secondary_title-coin">
          <img src="https://event.udn.com/bd_newyear2026/imgs/title_coin.png" alt="title_coin" />
        </span>
        <h2 class="fortune-result__secondary_title fortune-result__secondary_title--${resultType}">
          ${secondaryTitle}
        </h2>
        <span class="fortune-result__secondary_title-coin">
          <img src="https://event.udn.com/bd_newyear2026/imgs/title_coin.png" alt="title_coin" />
        </span>
      </div>
      ${customMessage ? `<div class="fortune-result__custom-message fortune-result__custom-message--${resultType}">${customMessage}</div>` : ''}
    `

    card.innerHTML = `
      <div class="fortune-result__popup">
        <!-- 紅包袋口裝飾 -->
        <div class="fortune-result__bag-mouth">
          <svg xmlns="http://www.w3.org/2000/svg" width="550" height="150" viewBox="0 0 550 150">
            <g id="Group_249" data-name="Group 249" transform="translate(-685 -111)">
              <path id="袋口" d="M521.93,91.761l-145.15-71.9a276.343,276.343,0,0,0-203.96-.289L28.35,91.093a49.864,49.864,0,0,0-28.21,44.6L0,150.208H550V136.426a49.852,49.852,0,0,0-28.07-44.675Z" transform="translate(685 110.792)" fill="#bf2900"/>
              <g id="Group_175" data-name="Group 175" transform="translate(-5 -64.5)">
                <g id="Group_174" data-name="Group 174" transform="translate(84 -382)">
                  <text id="紅包運勢" transform="translate(798 673)" fill="#faebb5" font-size="40" font-family="SourceHanSansTC-Bold, Source Han Sans TC" font-weight="700" letter-spacing="0.05em"><tspan x="0" y="0">紅包運勢</tspan></text>
                </g>
                <g id="Group_170" data-name="Group 170" transform="translate(81 -385)">
                  <circle id="Ellipse_5" data-name="Ellipse 5" cx="3" cy="3" r="3" transform="translate(747 656)" fill="#faebb5"/>
                  <circle id="Ellipse_6" data-name="Ellipse 6" cx="3" cy="3" r="3" transform="translate(761 656)" fill="#faebb5"/>
                  <circle id="Ellipse_7" data-name="Ellipse 7" cx="3" cy="3" r="3" transform="translate(775 656)" fill="#faebb5"/>
                </g>
                <g id="Group_171" data-name="Group 171" transform="translate(349 -385)">
                  <circle id="Ellipse_5-2" data-name="Ellipse 5" cx="3" cy="3" r="3" transform="translate(747 656)" fill="#faebb5"/>
                  <circle id="Ellipse_8" data-name="Ellipse 8" cx="3" cy="3" r="3" transform="translate(733 656)" fill="#faebb5"/>
                  <circle id="Ellipse_9" data-name="Ellipse 9" cx="3" cy="3" r="3" transform="translate(719 656)" fill="#faebb5"/>
                </g>
              </g>
            </g>
          </svg>
        </div>
        
        <button class="fortune-result__close-btn">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 20L4 4M4 20L20 4" stroke="currentColor" stroke-width="4"/>
          </svg>
        </button>
        
        <div class="fortune-result__image-container">
          <img src="${fortuneData.image_url}" alt="${fortuneData.title}" class="fortune-result__image" />
        </div>
        
        ${resultType === 'first' ? firstTypeContent : normalOrFinalContent}
      </div>
    `

    container.innerHTML = ''
    container.appendChild(card)

    // 添加進入動畫
    card.classList.add('fortune-result__overlay--show')

    // 點擊 overlay 背景關閉卡片
    card.addEventListener('click', (e) => {
      if (e.target === card) {
        card.classList.add('fortune-result__overlay--closing')
        card.remove()
      }
    })

    // 關閉按鈕事件
    const closeBtn = card.querySelector('.fortune-result__close-btn')
    closeBtn.addEventListener('click', () => {
      card.classList.add('fortune-result__overlay--closing')
      card.remove()
    })
  }

  // 注入樣式
  function injectStyles() {
    if (document.getElementById('divination-card-styles')) return

    const styles = document.createElement('style')
    styles.id = 'divination-card-styles'
    styles.textContent = `
      /* ===== 占卜結果卡片樣式 ===== */
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
        animation: overlayFadeIn 0.3s ease-out;
      }

      .fortune-result__overlay--show {
        opacity: 1;
      }

      .fortune-result__overlay--closing {
        animation: overlayFadeOut 0.3s ease-out;
      }

      .fortune-result__popup {
        background: #D83307;
        border-bottom-left-radius: min(9.09cqw, 50px);
        border-bottom-right-radius: min(9.09cqw, 50px);
        width: 100%;
        max-width: 550px;
        max-height: 630px;
        position: relative;
        animation: modalBounceIn 0.3s ease-out;
        container-type: inline-size;
        padding-bottom: min(3.64cqw, 20px);
        aspect-ratio: 550 / 600;
        overflow: visible;
        margin-top: 15vh;
      }

      .fortune-result__popup::before {
        content: "";
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        height: min(2.73cqw, 15px);
        background-color: #E05C39;
      }

      .fortune-result__popup--closing {
        animation: modalBounceOut 0.25s ease-in;
      }

      .fortune-result__bag-mouth {
        position: absolute;
        left: 50%;
        bottom: 99.7%;
        transform: translateX(-50%);
        width: 100%;
        z-index: 1;
      }

      .fortune-result__bag-mouth svg {
        width: 100%;
        height: auto;
        display: block;
      }

      .fortune-result__close-btn {
        position: absolute;
        top: -75px;
        right: 0px;
        width: 50px;
        height: 50px;
        border: none;
        background: #E7C170;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #80552B;
        z-index: 10;
      }

      .fortune-result__title {
        width: 100%;
        max-width: min(63.64cqw, 350px);
        margin: 0 auto;
        background-color: #D83307;
        font-size: clamp(18px, 5.45cqw, 30px);
        font-weight: bold;
        color: #FAEBB5;
        text-align: center;
        margin-bottom: clamp(15px, 5.45cqw, 30px);
        // white-space: pre-line;
        text-shadow: min(0.18cqw, 1px) min(0.18cqw, 1px) min(0.73cqw, 4px) rgba(0, 0, 0, 0.5);
      }

      .fortune-result__title-coin {
        width: clamp(15px, 4.55cqw, 25px);
        height: clamp(15px, 4.55cqw, 25px);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .fortune-result__title-coin:first-child {
        margin-right: clamp(8px, 2.73cqw, 15px);
        padding-left: clamp(5px, 1.82cqw, 10px);
      }

      .fortune-result__title-coin:last-child {
        margin-left: clamp(3px, 0.91cqw, 5px);
        padding-right: clamp(5px, 1.82cqw, 10px);
      }

      .fortune-result__title-coin img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }

      .fortune-result__title-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: clamp(8px, 2.73cqw, 15px);
        width: 100%;
        margin: 0 auto;
        margin-bottom: min(12.73cqw, 70px);
      }

      .fortune-result__title-wrapper--normal {
        max-width: min(68.64cqw, 380px);
      }

      .fortune-result__title-wrapper--final {
        max-width: min(78.64cqw, 460px);
      }

      .fortune-result__secondary_title {
        flex: 1;
        background-color: #D83307;
        font-size: clamp(18px, 5.45cqw, 30px);
        font-weight: bold;
        color: #FAEBB5;
        text-align: center;
        // white-space: pre-line;
        line-height: 1.5;
        text-shadow: min(0.18cqw, 1px) min(0.18cqw, 1px) min(0.73cqw, 4px) rgba(0, 0, 0, 0.5);
        magin: 0;
      }

      .fortune-result__secondary_title-coin {
        width: clamp(20px, 5.45cqw, 30px);
        height: clamp(20px, 5.45cqw, 30px);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .fortune-result__secondary_title-coin img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .fortune-result__image-container {
        width: 100%;
        max-width: min(45.45cqw, 250px);
        margin: 0 auto;
        margin-top: min(7.27cqw, 40px);
        margin-bottom: min(7.27cqw, 40px);
        text-align: center;
      }

      .fortune-result__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .fortune-result__content {
        text-align: center;
        margin: 0 auto;
        color: #fff;
        margin-bottom: min(6.36cqw, 35px);
      }

      .fortune-result__content--first {
        width: 90%;
        max-width: min(88.36cqw, 486px);
        border-radius: min(7.27cqw, 40px);
        min-height: min(24cqw, 132px);
        border: 2px dashed #FAEBB5;
      }

      .fortune-result__content--first .fortune-result__title {
        margin-top: -5%;
        margin-bottom: clamp(15px, 4cqw, 30px);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .fortune-result__description {
        width: 100%;
        max-width: min(72.73cqw, 400px);
        margin: 0 auto;
        font-size: clamp(16px, 3.64cqw, 20px);
        line-height: 1.3;
        // white-space: pre-line;
        color: #fff;
        text-align: center;
      }

      .fortune-result__description-highlight {
        color: #FAEBB5;
        font-weight: bold;
      }

      .fortune-result__custom-message {
        width: 100%;
        margin: 0 auto;
        border-top: min(2.73cqw, 15px) solid #E05C39;
        padding-top: min(3.64cqw, 20px);
        position: relative;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        font-size: clamp(16px, 3.64cqw, 20px);
        color: #fff;
        line-height: 1.3;
      }

      .fortune-result__custom-message .custom-result-message-coin {
        width: clamp(16px, 3.64cqw, 20px);
        height: clamp(16px, 3.64cqw, 20px);
        margin-right: clamp(8px, 1.82cqw, 10px);
        padding-top: clamp(3px, 0.73cqw, 4px);
      }

      .fortune-result__custom-message .custom-result-message-coin img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      /* ===== 已重複遊玩卡片樣式 ===== */
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
        animation: overlayFadeIn 0.3s ease-out;
      }

      .already-played__overlay--show {
        opacity: 1;
      }

      .already-played__overlay--closing {
        animation: overlayFadeOut 0.3s ease-out;
      }

      .already-played__popup {
        background: #D83307;
        border-bottom-left-radius: min(9.09cqw, 50px);
        border-bottom-right-radius: min(9.09cqw, 50px);
        width: 100%;
        max-width: 550px;
        max-height: 630px;
        position: relative;
        animation: modalBounceIn 0.3s ease-out;
        container-type: inline-size;
        padding-bottom: min(3.64cqw, 20px);
        aspect-ratio: 550 / 600;
        overflow: visible;
        margin-top: 15vh;
      }

      .already-played__popup::before {
        content: "";
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        height: min(2.73cqw, 15px);
        background-color: #E05C39;
      }

      .already-played__popup--closing {
        animation: modalBounceOut 0.25s ease-in;
      }

      .already-played__bag-mouth {
        position: absolute;
        left: 50%;
        bottom: 99.7%;
        transform: translateX(-50%);
        width: 100%;
        z-index: 1;
      }

      .already-played__bag-mouth svg {
        width: 100%;
        height: auto;
        display: block;
      }

      .already-played__close-btn {
        position: absolute;
        top: -75px;
        right: 0px;
        width: 50px;
        height: 50px;
        border: none;
        background: #E7C170;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #80552B;
        z-index: 10;
      }

      .already-played__title {
        width: 100%;
        max-width: min(72.64cqw, 400px);
        margin: 0 auto;
        background-color: #D83307;
        font-size: clamp(18px, 5.45cqw, 30px);
        font-weight: bold;
        color: #FAEBB5;
        text-align: center;
        // white-space: pre-line;
        line-height: 1.5;
        text-shadow: min(0.18cqw, 1px) min(0.18cqw, 1px) min(0.73cqw, 4px) rgba(0, 0, 0, 0.5);
      }

      .already-played__title-coin {
        width: clamp(15px, 4.55cqw, 25px);
        height: clamp(15px, 4.55cqw, 25px);
        display: inline-block;
      }

      .already-played__title-coin:first-child {
        margin-right: clamp(8px, 2.73cqw, 15px);
        padding-left: clamp(5px, 1.82cqw, 10px);
      }

      .already-played__title-coin:last-child {
        margin-left: clamp(3px, 0.91cqw, 5px);
        padding-right: clamp(5px, 1.82cqw, 10px);
      }

      .already-played__title-coin img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .already-played__title--normal {
        flex: 1;
      }

      .already-played__title-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        max-width: min(75.45cqw, 410px);
        margin: 0 auto;
        margin-bottom: min(22cqw, 120px);
      }

      .already-played__img-container {
        width: 100%;
        max-width: min(69.09cqw, 380px);
        aspect-ratio: 380 / 247;
        margin: 0 auto;
        margin-top: min(7.27cqw, 40px);
        margin-bottom: min(7.27cqw, 40px);
        text-align: center;
      }

      .already-played__img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .already-played__content {
        text-align: center;
        margin: 0 auto;
        color: #fff;
        margin-bottom: min(6.36cqw, 35px);
      }

      .already-played__content--first {
        width: 90%;
        max-width: min(88.36cqw, 486px);
        border-radius: min(7.27cqw, 40px);
        min-height: min(24cqw, 132px);
        border: 2px dashed #FAEBB5;
      }

      .already-played__content--first .already-played__title {
        margin-top: -5%;
        margin-bottom: clamp(5px, 2.45cqw, 15px);
      }

      .already-played__desc {
        width: 100%;
        max-width: min(81.82cqw, 450px);
        margin: 0 auto;
        padding: 0 min(1.82cqw, 10px);
        font-size: clamp(12px, 3.64cqw, 20px);
        line-height: 1.3;
        // white-space: pre-line;
        color: #fff;
        text-align: center;
      }

      .already-played__desc-highlight {
        color: #FAEBB5;
        font-weight: bold;
      }

      .already-played__custom-msg {
        width: 100%;
        margin: 0 auto;
        border-top: min(2.73cqw, 15px) solid #E05C39;
        padding-top: min(3.64cqw, 20px);
        position: relative;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        font-size: clamp(16px, 3.64cqw, 20px);
        color: #fff;
        line-height: 1.3;
      }

      .already-played__custom-msg .custom-result-message-coin {
        width: clamp(16px, 3.64cqw, 20px);
        height: clamp(16px, 3.64cqw, 20px);
        margin-right: clamp(8px, 1.82cqw, 10px);
        padding-top: clamp(3px, 0.73cqw, 4px);
      }

      .already-played__custom-msg .custom-result-message-coin img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      /* ===== 動畫 ===== */
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

      /* ===== 響應式設計 ===== */
      @media (max-width: 480px) {
        .fortune-result__close-btn,
        .already-played__close-btn {
          top: -55px;
          width: 40px;
          height: 40px;
        }
        .fortune-result__title-coin:last-child,
        .already-played__title-coin:last-child {
          padding-right: 0;
        }
        .fortune-result__title-coin:first-child,
        .already-played__title-coin:first-child {
          padding-left: 0;
        }
        .fortune-result__title-coin:last-child,
        .already-played__title-coin:last-child {
          margin: 0;
        }
        .fortune-result__title-coin:first-child,
        .already-played__title-coin:first-child {
          margin: 0;
        }
      }

      @media (max-width: 380px) {
        .fortune-result__custom-message {
          font-size: 14px;
        }
        
        .already-played__custom-msg {
          font-size: 14px;
        }
      }

      @media (max-width: 360px) {
        .fortune-result__title,
        .fortune-result__secondary_title,
        .already-played__title {
          font-size: 16px;
        }

        .fortune-result__description {
          font-size: 14px;
        }

        .fortune-result__custom-message {
          font-size: 12px;
        }
        
        .already-played__custom-msg {
          font-size: 12px;
        }
      }
    `

    document.head.appendChild(styles)
  }

  // 主要初始化函數
  function init(options = {}) {
    const containerId = options.containerId || 'divination-container'
    const container = document.getElementById(containerId)

    if (!container) {
      console.error(`找不到容器元素: #${containerId}`)
      return
    }

    // 注入樣式
    injectStyles()

    // 從 URL 取得參數
    const playCount = parseInt(getUrlParam('count') || '0')
    const alreadyPlayed = getUrlParam('already_played') === '1'
    const fortuneId = getUrlParam('fortune_id')

    console.log('DivinationCard 初始化:', {
      playCount,
      alreadyPlayed,
      fortuneId,
    })

    // 檢查是否已經顯示過（同一個 session 內只顯示一次）
    if (sessionStorage.getItem('divination-card-shown')) {
      console.log('卡片已顯示過，不再重複顯示')
      return {
        playCount,
        alreadyPlayed,
        fortuneData: null,
      }
    }

    // 如果已經玩過，顯示重複遊玩卡片
    if (alreadyPlayed) {
      showAlreadyPlayedCard(container, playCount)
      sessionStorage.setItem('divination-card-shown', 'true')
      return {
        playCount,
        alreadyPlayed,
        fortuneData: null,
      }
    }

    // 生成並顯示占卜結果
    // 如果有 fortuneId，使用指定的結果；否則隨機生成
    let fortuneData
    if (fortuneId) {
      // 根據 ID 找到對應的結果
      fortuneData = FORTUNE_RESULTS.find((f) => f.id === fortuneId)
      if (!fortuneData) {
        console.warn(`找不到 fortuneId: ${fortuneId}，使用隨機結果`)
        fortuneData = generateFortuneResult()
      } else {
        // 移除 weight 屬性
        fortuneData = { ...fortuneData }
        delete fortuneData.weight
      }
    } else {
      fortuneData = generateFortuneResult()
    }

    showFortuneCard(container, fortuneData, playCount)
    sessionStorage.setItem('divination-card-shown', 'true')

    return {
      playCount,
      alreadyPlayed,
      fortuneData,
    }
  }

  // Line 分享功能
  function shareFortune() {
    const shareUrl = 'https://event.udn.com/bd_newyear2026'
    const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`
    window.open(lineShareUrl, '_blank', 'width=600,height=600')
  }

  // 暴露到全域
  window.DivinationCard = {
    init: init,
    generateFortuneResult: generateFortuneResult,
    showAlreadyPlayedCard: showAlreadyPlayedCard,
    showFortuneCard: showFortuneCard,
    getUrlParam: getUrlParam,
    FORTUNE_RESULTS: FORTUNE_RESULTS,
  }

  // 暴露分享功能
  window.shareFortune = shareFortune
})(window)
