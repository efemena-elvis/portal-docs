import docsConfig from './docs.config'

export default defineNuxtConfig({
  extends: ['../../packages/docs-core'],
  compatibilityDate: '2025-01-01',
  ssr: false,
  nitro: {
    preset: process.env.VERCEL ? 'vercel' : undefined,
  },
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
    adminAccessCode: process.env.ADMIN_ACCESS_CODE ?? '',
    adminJwtSecret: process.env.ADMIN_JWT_SECRET ?? 'dev-secret-change-in-production',
    public: {
      site: docsConfig.site,
      design: docsConfig.design,
      layout: docsConfig.layout,
      nav: docsConfig.nav,
      topbar: docsConfig.topbar,
      api: docsConfig.api,
    }
  }
})
