import { getStorage, type StorageDriver } from '../../utils/storage'
import type { NavResponse, NavSection, NavEntry, NavPageEntry, NavCategoryEntry, SearchResult } from '~/types/page'
import type { SectionIndex, SectionIndexItem } from '~/types/section'

// ── In-memory nav cache ───────────────────────────────────────────────────────

let _navCache: NavResponse | null = null

export function clearNavCache() {
  _navCache = null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function excerptFromPage(page: any): string {
  if (page.meta?.description) return page.meta.description
  const firstProse = page.blocks?.find((b: any) => b.type === 'prose' && b.props?.variant === 'body')
  if (firstProse?.content) {
    return String(firstProse.content).replace(/[*_`[\]]/g, '').slice(0, 160)
  }
  return ''
}

async function processIndexItems(
  storage: StorageDriver,
  items: SectionIndexItem[],
  prefix: string,
  sectionSlug: string,
  sectionTitle: string,
  searchIndex: SearchResult[],
  orderedSlugs: string[],
  categoryTitle?: string,
): Promise<NavEntry[]> {
  const entries: NavEntry[] = []

  for (const item of items) {
    if (item.type === 'page') {
      const slug = `${prefix}/${item.slug}`
      const raw = await storage.readFile(`${slug}.json`)
      if (!raw) continue
      const page = JSON.parse(raw)

      const entry: NavPageEntry = {
        type: 'page',
        title: page.title ?? item.slug,
        slug,
        pageType: page.type ?? 'guide',
        method: page.method,
        sectionTitle,
        sectionSlug,
        categoryTitle,
        excerpt: excerptFromPage(page),
        hidden: page.meta?.hidden ?? false,
      }
      entries.push(entry)
      orderedSlugs.push(slug)
      if (!entry.hidden) {
        searchIndex.push({ title: entry.title, slug, sectionTitle, method: entry.method, description: entry.excerpt })
      }
    } else if (item.type === 'category') {
      const catPrefix = `${prefix}/${item.slug}`
      const catRaw = await storage.readFile(`${catPrefix}/_index.json`)
      if (!catRaw) continue
      const catIndex = JSON.parse(catRaw) as SectionIndex

      const childEntries = await processIndexItems(
        storage, catIndex.items ?? [], catPrefix, sectionSlug, sectionTitle, searchIndex, orderedSlugs, catIndex.title,
      )
      const children = childEntries.filter((e): e is NavPageEntry => e.type === 'page')

      const catEntry: NavCategoryEntry = {
        type: 'category',
        title: catIndex.title,
        slug: catPrefix,
        sectionSlug,
        children,
        hidden: catIndex.hidden ?? false,
      }
      entries.push(catEntry)
    }
  }

  return entries
}

// ── Build nav ─────────────────────────────────────────────────────────────────

async function buildNav(): Promise<NavResponse> {
  const storage = getStorage()
  const allKeys = await storage.listKeys('')

  // Discover top-level sections: keys that are exactly "<slug>/_index.json"
  const sectionSlugs = [
    ...new Set(
      allKeys
        .filter(k => /^[^/]+\/_index\.json$/.test(k))
        .map(k => k.split('/')[0]!),
    ),
  ]

  // Read all section indexes in parallel
  const sectionData = await Promise.all(
    sectionSlugs.map(async (slug) => {
      const raw = await storage.readFile(`${slug}/_index.json`)
      if (!raw) return null
      return { slug, index: JSON.parse(raw) as SectionIndex }
    }),
  )

  const sorted = sectionData
    .filter((s): s is { slug: string; index: SectionIndex } => s !== null)
    .sort((a, b) => (a.index.order ?? 999) - (b.index.order ?? 999))

  const sections: NavSection[] = []
  const searchIndex: SearchResult[] = []
  const orderedSlugs: string[] = []

  for (const { slug, index } of sorted) {
    const entries = await processIndexItems(
      storage, index.items ?? [], slug, slug, index.title, searchIndex, orderedSlugs,
    )
    sections.push({
      title: index.title,
      slug,
      emoji: index.emoji,
      collapsible: index.collapsible,
      protected: index.protected,
      hidden: index.hidden ?? false,
      entries,
    })
  }

  return { sections, searchIndex, orderedSlugs }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export default defineEventHandler(async () => {
  if (_navCache) return _navCache
  _navCache = await buildNav()
  return _navCache
})
