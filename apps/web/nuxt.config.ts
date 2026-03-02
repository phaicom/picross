// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-03-02',
  modules: [
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxt/image',
  ],
  app: {
    head: {
      titleTemplate: 'Picross',
      htmlAttrs: {
        lang: 'en-US',
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
  typescript: {
    typeCheck: true,
  },
  devtools: { enabled: true },
  vite: {
    build: {
      minify: 'esbuild',
      cssMinify: 'lightningcss',
    },
  },
})
