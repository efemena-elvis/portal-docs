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
  css: ['~/assets/css/main.css'],
})
