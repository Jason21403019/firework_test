export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@pinia/nuxt"],
  plugins: ["~/plugins/global-components.js"],
  css: ["~/assets/css/reset.css", "~/assets/css/sweetalert.scss"],

  app: {
    baseURL: process.env.NUXT_PUBLIC_BASE || "/",
    buildAssetsDir: "/_nuxt/",
    head: {
      title: "馬上有福・轉好運｜聯合新聞網",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { charset: "utf-8" },
        {
          name: "description",
          content:
            "馬上有福轉好運，天天來轉紅包禮，新春好禮LINE POINTS免費領，iPhone  豪禮奔向你！",
        },
        {
          name: "keywords",
          content:
            "馬年、輪盤、紅包禮、抽紅包、轉好運、免費領、加碼獎、LINE POINTS 、 iPhone 、濕拖機器人、CITY CAFF券、咖啡機、商品卡",
        },
        // Open Graph 標籤
        {
          property: "og:title",
          content: "馬上有福・轉好運｜聯合新聞網",
        },
        {
          property: "og:description",
          content:
            "馬上有福轉好運，天天來轉紅包禮，新春好禮LINE POINTS免費領，iPhone  豪禮奔向你！",
        },
        {
          property: "og:url",
          content: "https://event.udn.com/bd_newyear_2026",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:site_name",
          content: "聯合新聞網",
        },
        {
          property: "og:image",
          content: "https://event.udn.com/bd_newyear_2026/imgs/meta_img.png",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "canonical", href: "https://event.udn.com/bd_newyear_2026" },
      ],
      script: [
        // comScore 追蹤代碼
        {
          innerHTML: `
            var _comscore = _comscore || [];
            _comscore.push({ c1: "2", c2: "7390954" });
            (function() {
              var s = document.createElement("script"), 
                  el = document.getElementsByTagName("script")[0]; 
              s.async = true;
              s.src = (document.location.protocol == "https:" ? "https://sb" : "http://b") + ".scorecardresearch.com/beacon.js";
              el.parentNode.insertBefore(s, el);
            })();
          `,
          type: "text/javascript",
        },

        // Data Layer
        {
          innerHTML: `
            function getCookie(name) {
                var value = "; " + document.cookie;
                var parts = value.split("; " + name + "=");
                if (parts.length >= 2) return parts.pop().split(";").shift();
            }

            var _ga = getCookie('_ga') || '';
            var _gaA = _ga.split(".");
            var google_id = '';
            for (i=2;i<_gaA.length;i++) google_id = google_id+_gaA[i]+'.';
            google_id = google_id.substring(0,google_id.length-1);

            var user_id = getCookie("udnland");
            if (typeof user_id === 'undefined' || user_id == '') {
                user_id = undefined;
                var auth_type = '未登入';
            }
            else {
                var auth_type = '已登入_會員';
            }

            dataLayer = [{
                'user_id': user_id,
                'google_id': google_id,
                'cat': ['event', '', '', '', ''],
                'content_tag': '占卜',
                'auth_type': auth_type,
                'publication_date': '',
                'ffid': JSON.parse(localStorage.getItem('UDN_FID'))?.FFID,
                'dfid': JSON.parse(localStorage.getItem('UDN_FID'))?.DFID
            }];
          `,
          type: "text/javascript",
        },
        // UDN Fingerprint
        {
          src: "https://p.udn.com.tw/upf/static/common/udn-fingerprint.umd.js?12",
          async: true,
        },
        // Google Tag Manager
        {
          innerHTML: `
            (function(w, d, s, l, i) {
                w[l] = w[l] || [];
                w[l].push({
                    'gtm.start': new Date().getTime(),
                    event: 'gtm.js'
                });
                var f = d.getElementsByTagName(s)[0],
                    j = d.createElement(s),
                    dl = l != 'dataLayer' ? '&l=' + l : '';
                j.async = true;
                j.src =
                    'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
                f.parentNode.insertBefore(j, f);
            })(window, document, 'script', 'dataLayer', 'GTM-NMFFZ35');
          `,
          type: "text/javascript",
        },
      ],
      __dangerouslyDisableSanitizers: ["script"],
    },
  },
  nitro: {
    output: {
      dir: "./dist",
    },
  },

  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
      domain: process.env.NUXT_PUBLIC_DOMAIN,
      base: process.env.NUXT_PUBLIC_BASE,
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
      externalRedirectUrl:
        process.env.NUXT_PUBLIC_EXTERNAL_REDIRECT_URL ||
        "https://lab7-orange.udn.com/orange/issue/8887/2341",
    },
  },

  compatibilityDate: "2025-09-22",
});
