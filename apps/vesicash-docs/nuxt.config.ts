import docsConfig from './docs.config'

export default defineNuxtConfig({
  extends: ['../../packages/docs-core'],
  compatibilityDate: '2025-01-01',
  ssr: false,
  nitro: {
    preset: process.env.VERCEL ? 'vercel' : undefined,
  },
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
    postmanApiKey: process.env.POSTMAN_API_KEY ?? '',
    postmanCollectionUid: process.env.POSTMAN_COLLECTION_UID ?? '',
    adminAccessCode: process.env.ADMIN_ACCESS_CODE ?? '',
    adminJwtSecret: process.env.ADMIN_JWT_SECRET ?? 'dev-secret-change-in-production',
    sourcePriority: docsConfig.source.priority,
    sourceJsonPath: docsConfig.source.json.path ?? '',
    sourcePostmanCacheTtlMs: docsConfig.source.postman.cacheTtlMs,
    public: {
      site: docsConfig.site,
      design: docsConfig.design,
      layout: docsConfig.layout,
      nav: docsConfig.nav,
      api: docsConfig.api,
    }
  }
})
