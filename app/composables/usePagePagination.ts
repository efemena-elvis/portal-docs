import type { PaginationNeighbor } from '~/types/docs'

export function usePagePagination(slug: Ref<string>) {
  const prevPage = ref<PaginationNeighbor | null>(null)
  const nextPage = ref<PaginationNeighbor | null>(null)
  const { navData } = useContentNav()

  function update() {
    const data = navData.value
    if (!data) return

    const slugs = data.orderedSlugs
    const idx = slugs.indexOf(slug.value)
    if (idx === -1) {
      prevPage.value = null
      nextPage.value = null
      return
    }

    function entryForSlug(s: string): PaginationNeighbor | null {
      const entry = data!.searchIndex.find(e => e.slug === s)
      if (!entry) return null
      return { slug: s, title: entry.title, sectionTitle: entry.sectionTitle }
    }

    prevPage.value = slugs[idx - 1] ? entryForSlug(slugs[idx - 1]!) : null
    nextPage.value = slugs[idx + 1] ? entryForSlug(slugs[idx + 1]!) : null
  }

  watch([slug, navData], update, { immediate: true })

  return { prevPage, nextPage }
}
