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
      meta: [
        { name: 'description', content: 'Picross puzzle app with deterministic solving and bounded backtracking presets.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Picross' },
        { property: 'og:description', content: 'Play and solve nonogram puzzles with adjustable solver depth.' },
        { property: 'og:image', content: '/logo.svg' },
      ],
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
  devtools: { enabled: false },
  vite: {
    build: {
      minify: 'esbuild',
      cssMinify: 'esbuild',
    },
  },
})
