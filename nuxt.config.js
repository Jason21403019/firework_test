export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  app: {
    baseURL: process.env.NUXT_PUBLIC_BASE || "/",
    buildAssetsDir: "/_nuxt/",
    head: {
      title: "幸福煙火轉一夏｜聯合新聞網",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { charset: "utf-8" },
        { name: "description", content: "幸福煙火轉一夏｜聯合新聞網" },
        { name: "theme-color", content: "#ffffff" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      ],
    },
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
      domain: process.env.NUXT_PUBLIC_DOMAIN,
      base: process.env.NUXT_PUBLIC_BASE,
    },
  },
});
