import type { Page } from '~/types/page'

// ── Module-level page cache ────────────────────────────────────────────────────
// Persists across navigations for the lifetime of the session.
// Admin refetch bypasses it; invalidate() clears it on publish.

const _cache = new Map<string, Page>()

export function invalidatePageCache(slug?: string) {
  if (slug) _cache.delete(slug)
  else _cache.clear()
}

export async function prefetchPage(slug: string) {
  if (_cache.has(slug)) return
  try {
    const data = await $fetch<Page>(`/api/content/${slug}`)
    _cache.set(slug, data)
  } catch {}
}

// ── Composable ─────────────────────────────────────────────────────────────────

export function useEndpointPage(slug: Ref<string>) {
  const cached = _cache.get(slug.value) ?? null
  const page = ref<Page | null>(cached)
  const loading = ref(cached === null)
  const baseUrl = ref((useRuntimeConfig().public as { api: { baseUrl: string } }).api.baseUrl)
  const notFound = ref(false)

  async function load(opts: { bust?: boolean; scrollToTop?: boolean } = {}) {
    if (!slug.value) return
    notFound.value = false

    const hit = !opts.bust && _cache.get(slug.value)
    if (hit) {
      page.value = hit
      loading.value = false
      if (opts.scrollToTop !== false && import.meta.client) {
        window.scrollTo({ top: 0 })
      }
      return
    }

    if (opts.scrollToTop !== false) loading.value = true

    try {
      const data = await $fetch<Page>(`/api/content/${slug.value}`)
      _cache.set(slug.value, data)
      page.value = data
    } catch (e: any) {
      if (e?.statusCode === 404) notFound.value = true
    } finally {
      loading.value = false
    }

    if (opts.scrollToTop !== false && import.meta.client) {
      nextTick(() => window.scrollTo({ top: 0 }))
    }
  }

  watch(slug, () => load({ scrollToTop: true }), { immediate: !cached })

  return {
    page,
    loading,
    baseUrl,
    notFound,
    // refetch from server (used after admin publish)
    refetch: () => load({ bust: true, scrollToTop: false }),
  }
}
