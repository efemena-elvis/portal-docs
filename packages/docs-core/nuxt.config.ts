import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  devtools: { enabled: false },
  vite: {
    server: {
      watch: {
        ignored: ['**/content/**'],
      },
    },
  },
  css: [fileURLToPath(new URL('./app/assets/css/main.css', import.meta.url))],
})
