import docsConfig from './docs.config'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  ssr: false,
  nitro: {
    preset: process.env.VERCEL ? 'vercel' : undefined,
  },
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  vite: {
    optimizeDeps: {
      include: [
        'shiki',
        'markdown-it',
        '@lucide/vue',
        '@codemirror/view',
        '@codemirror/state',
        '@codemirror/lang-json',
        '@codemirror/commands',
        '@codemirror/language',
        'fuse.js',
      ],
    },
    server: {
      watch: {
        // Prevent Vite HMR from reloading when draft JSON files are written to disk
        ignored: ['**/content/**'],
      },
    },
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: `${docsConfig.site.name} — ${docsConfig.site.tagline}`,
      meta: [
        { name: 'description', content: docsConfig.site.tagline }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: `https://fonts.googleapis.com/css2?family=${docsConfig.design.fontFamily.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`
        }
      ]
    }
  },
  runtimeConfig: {
    // Server-only (never sent to browser)
    postmanApiKey: process.env.POSTMAN_API_KEY ?? '',
    postmanCollectionUid: process.env.POSTMAN_COLLECTION_UID ?? '',
    adminAccessCode: process.env.ADMIN_ACCESS_CODE ?? '',
    adminJwtSecret: process.env.ADMIN_JWT_SECRET ?? 'dev-secret-change-in-production',

    // Public (available on client + server)
    public: {
      site: docsConfig.site,
      design: docsConfig.design,
      layout: docsConfig.layout,
      nav: docsConfig.nav,
    }
  }
})
