import type { NavResponse } from '~/types/page'

// Module-level reactive ref — survives layout re-mounts between navigations
const _navData = ref<NavResponse | null>(null)
const _loading = ref(false)
const _fetched = ref(false)

export function useContentNav() {
  async function fetchNav() {
    if (_fetched.value) return
    if (_loading.value) return

    _loading.value = true
    try {
      const url = import.meta.dev ? `/api/content/nav?t=${Date.now()}` : '/api/content/nav'
      _navData.value = await $fetch<NavResponse>(url)
      _fetched.value = true
    } catch (e) {
      console.error('[useContentNav] Failed to fetch nav:', e)
    } finally {
      _loading.value = false
    }
  }

  function invalidate() {
    _fetched.value = false
    _navData.value = null
  }

  return {
    navData: _navData as Readonly<Ref<NavResponse | null>>,
    loading: _loading as Readonly<Ref<boolean>>,
    fetchNav,
    invalidate,
  }
}
