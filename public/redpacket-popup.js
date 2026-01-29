/**
 * 紅包轉盤推廣彈窗獨立模組
 * 可以被其他網站引入使用
 *
 * 使用方式：
 * <script src="https://your-domain.com/redpacket-popup.js"></script>
 * <script>
 *   RedpacketPopup.init({
 *     targetUrl: 'https://event.udn.com/your-activity-page'
 *   });
 * </script>
 */

; (function (window) {
  'use strict'

  // 檢查是否應該顯示彈窗（一週顯示一次）
  function shouldShowPopup() {
    return true
    // try {
    //   const lastShownTime = localStorage.getItem('redpacket_popup_last_shown')
    //   const now = new Date().getTime()
    //   const oneWeek = 7 * 24 * 60 * 60 * 1000

    //   if (!lastShownTime || now - parseInt(lastShownTime) > oneWeek) {
    //     return true
    //   }
    //   return false
    // } catch (e) {
    //   console.error('localStorage 不可用:', e)
    //   return true
    // }
  }

  // 檢查活動是否進行中
  function isEventActive(startDate, endDate) {
    if (!startDate || !endDate) return true

    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    return now >= start && now <= end
  }

  // 顯示彈窗
  function showPopup() {
    // 確保樣式已注入
    injectStyles()

    const targetUrl = 'https://orange.udn.com/orange/issue/8887/2341'
    const imageUrl = 'https://event.udn.com/bd_newyear_2026/imgs/repeatimg.png'
    const title = '天天轉盤抽紅包，<span style="color: #FAEBB5;">LINE POINTS </span>免費<br class="mobile-br">領、<span style="color: #FAEBB5;">iPhone17 Pro </span>大禮要送你！'
    const buttonText = '立即轉運'

    const overlay = document.createElement('div')
    overlay.className = 'redpacket-popup__overlay'

    overlay.innerHTML = `
      <div class="redpacket-popup__popup">
        <button class="redpacket-popup__close-btn">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 20L4 4M4 20L20 4" stroke="currentColor" stroke-width="4"/>
          </svg>
        </button>

        <div class="redpacket-popup__content">
          <div class="redpacket-popup__img-container">
            <img src="${imageUrl}" alt="紅包活動" class="redpacket-popup__img" />
          </div>

          <div class="redpacket-popup__text">
            ${title}
          </div>

          <button class="redpacket-popup__btn">${buttonText}</button>
        </div>
      </div>
    `

    document.body.appendChild(overlay)

    // 添加進入動畫
    requestAnimationFrame(() => {
      overlay.classList.add('redpacket-popup__overlay--show')
    })

    // 關閉按鈕事件
    const closeBtn = overlay.querySelector('.redpacket-popup__close-btn')
    closeBtn.addEventListener('click', () => {
      closePopup(overlay)
    })

    // 點擊 overlay 背景關閉
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closePopup(overlay)
      }
    })

    // 點擊按鈕事件
    const actionBtn = overlay.querySelector('.redpacket-popup__btn')
    actionBtn.addEventListener('click', () => {
      try {
        localStorage.setItem('redpacket_popup_last_shown', new Date().getTime().toString())
      } catch (e) {
        console.warn('無法儲存 localStorage:', e)
      }
      window.open(targetUrl, '_blank')
      closePopup(overlay)
    })
  }

  // 關閉彈窗
  function closePopup(overlay) {
    overlay.classList.add('redpacket-popup__overlay--closing')
    setTimeout(() => {
      overlay.remove()
    }, 300)
  }

  // 注入樣式
  function injectStyles() {
    if (document.getElementById('redpacket-popup-styles')) return

    const styles = document.createElement('style')
    styles.id = 'redpacket-popup-styles'
    styles.textContent = `
      /* ===== 紅包彈窗樣式 ===== */
      .redpacket-popup__overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(10px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        padding: 20px;
        opacity: 0;
        transition: opacity 0.3s ease-out;
      }

      .redpacket-popup__overlay--show {
        opacity: 1;
      }

      .redpacket-popup__overlay--closing {
        opacity: 0;
      }

      .redpacket-popup__popup {
        background: #D83307;
        border-radius: 25px;
        max-width: 550px;
        width: 100%;
        position: relative;
        border: 10px solid #E05C39;
        animation: modalBounceIn 0.3s ease-out;
      }

      .redpacket-popup__popup--closing {
        animation: modalBounceOut 0.25s ease-in;
      }

      .redpacket-popup__close-btn {
        position: absolute;
        top: -22px;
        right: -22px;
        width: 50px;
        height: 50px;
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

      .redpacket-popup__close-btn:hover {
        transform: scale(1.1);
        background: #F5D98A;
      }

      .redpacket-popup__content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
        padding: 0 20px;
      }

      .redpacket-popup__img-container {
        width: 100%;
        max-width: 380px;
        aspect-ratio: 380 / 247;
        margin-top: 100px;
      }

      .redpacket-popup__img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .redpacket-popup__text {
        color: #fff;
        font-size: clamp(20px, 4vw, 24px);
        font-weight: bold;
        text-align: center;
        line-height: 1.6;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      }

      .redpacket-popup__btn {
        padding: 15px 60px;
        border-radius: 50px;
        background: linear-gradient(to bottom, #FAEBB5, #E7C170);
        color: #80552B;
        font-size: clamp(22px, 4vw, 32px);
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        margin-bottom: 100px;
      }

      .redpacket-popup__btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        background: linear-gradient(to bottom, #FCF3D0, #EAC980);
      }

      .redpacket-popup__btn:active {
        transform: translateY(0);
      }

      /* ===== 動畫 ===== */
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
      @media (max-width: 768px) {
        .redpacket-popup__popup {
        }
      }

      @media (max-width: 480px) {
        .redpacket-popup__close-btn{
        width: 40px;
        height: 40px;
        }
        .redpacket-popup__img-container{
          margin-top: 60px;
        }
        .redpacket-popup__btn {
          margin-bottom: 60px;
        }
        .redpacket-popup__text {
          font-size: 18px;
        }
        .mobile-br {
          display: none;
        }
        .redpacket-popup__btn {
          padding: 12px 40px;
          font-size: 20px;
        }
      }
    `

    document.head.appendChild(styles)
  }

  // 從 URL 取得參數
  function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(name)
  }

  // 主要初始化函數
  function init(options = {}) {
    // 檢查是否從活動頁過來（如果有 from_event 參數，就不顯示彈窗）
    const fromEvent = getUrlParam('from_event')
    if (fromEvent === '1') {
      console.log('從活動頁過來，不顯示紅包彈窗')
      return
    }

    // 設定預設值
    const config = {
      targetUrl: 'https://orange.udn.com/orange/issue/8887/2341',
      imageUrl: 'https://event.udn.com/bd_newyear_2026/imgs/repeatimg.png',
      title: '天天轉盤抽紅包，<span style="color: #FAEBB5;">LINE POINTS </span>免費<br class="mobile-br">領、<span style="color: #FAEBB5;">iPhone17 Pro </span>大禮要送你！',
      buttonText: '立即轉運',
      startDate: null,
      endDate: null,
      delay: 1000, // 延遲顯示時間（毫秒）
    }

    // 檢查活動時間
    if (!isEventActive(config.startDate, config.endDate)) {
      console.log('活動未進行中，不顯示彈窗')
      return
    }

    // 檢查是否應該顯示
    if (!shouldShowPopup()) {
      console.log('不符合顯示條件，不顯示彈窗')
      return
    }

    // 注入樣式
    injectStyles()

    // 延遲顯示彈窗
    setTimeout(() => {
      showPopup()
      // 記錄顯示時間
      try {
        localStorage.setItem('redpacket_popup_last_shown', new Date().getTime().toString())
      } catch (e) {
        console.warn('無法儲存 localStorage:', e)
      }
    }, config.delay)
  }

  // 暴露到全域
  window.RedpacketPopup = {
    init: init,
    showPopup: showPopup,
    injectStyles: injectStyles,
    shouldShowPopup: shouldShowPopup,
    isEventActive: isEventActive,
  }
})(window)
