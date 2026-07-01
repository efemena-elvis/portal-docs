import Fuse, { type IFuseOptions } from 'fuse.js'
import type { SearchResult } from '~/types/page'

const fuseOptions: IFuseOptions<SearchResult> = {
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'sectionTitle', weight: 0.2 },
    { name: 'description', weight: 0.3 },
  ],
  threshold: 0.35,
  includeScore: true,
  ignoreLocation: true,
}

export function useSearch() {
  const { navData } = useContentNav()

  // Reactively derived — rebuilds whenever nav data changes (e.g. after publish)
  const fuse = computed(() => {
    const index = navData.value?.searchIndex ?? []
    if (!index.length) return null
    return new Fuse(index, fuseOptions)
  })

  return { fuse }
}

export function searchDocs(fuse: Fuse<SearchResult>, query: string): SearchResult[] {
  if (!query.trim()) return []
  return fuse.search(query).slice(0, 12).map(r => r.item)
}

export function useSearchResults(query: Ref<string> | (() => string)) {
  const results = ref<SearchResult[]>([])
  const { fuse } = useSearch()

  const normalizedQuery = computed(() => (isRef(query) ? query.value : query()))

  watch([normalizedQuery, fuse], ([q, f]) => {
    if (!f || !q.trim()) {
      results.value = []
      return
    }
    results.value = searchDocs(f, q)
  }, { immediate: true })

  return { results }
}
