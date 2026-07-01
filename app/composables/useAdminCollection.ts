import { useAdminEvents } from './useAdminEvents'
import { useAdmin } from './useAdmin'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateItemType = 'guide' | 'endpoint' | 'category'

export interface AdminItemPath {
  sectionIdx: number
  itemIdx?: number
  parentCategoryIdx?: number
}

interface DeleteTarget {
  kind: 'section' | 'category' | 'page'
  label: string
  childCount?: number
  path: AdminItemPath
}

interface MoveTarget {
  kind: 'category' | 'page'
  label: string
  path: AdminItemPath
}

interface RenameTarget {
  kind: 'section' | 'category' | 'page'
  label: string
  path: AdminItemPath
}

export interface AddItemContext {
  sectionIdx: number
  categoryIdx: number | null
  parentLabel: string
}

// ─── Module-level state ───────────────────────────────────────────────────────

const deleteTarget = ref<DeleteTarget | null>(null)
const moveTarget = ref<MoveTarget | null>(null)
const renameTarget = ref<RenameTarget | null>(null)
const addItemContext = ref<AddItemContext | null>(null)
const createSectionOpen = ref(false)
const saving = ref(false)

// ─── Composable ──────────────────────────────────────────────────────────────

export function useAdminCollection() {
  const { triggerRefresh } = useAdminEvents()
  const { authHeaders } = useAdmin()
  const { navData, invalidate } = useContentNav()

  // Adapt navData to the Postman-shaped rawCollection expected by legacy components
  const rawCollection = computed(() => {
    if (!navData.value) return null
    return {
      item: navData.value.sections.map(section => ({
        name: section.title,
        item: section.entries.map(entry => {
          if (entry.type === 'category') {
            return {
              name: entry.title,
              item: entry.children.map(child => ({ name: child.title })),
            }
          }
          return { name: entry.title }
        }),
      })),
    }
  })

  // ── Slug resolvers ──────────────────────────────────────────────────────────

  function getSectionSlug(sectionIdx: number): string {
    return navData.value?.sections[sectionIdx]?.slug ?? ''
  }

  function resolveSlugs(path: AdminItemPath): {
    sectionSlug: string
    categorySlug?: string
    itemFullSlug: string
    parentSlugPath: string[]
  } | null {
    const section = navData.value?.sections[path.sectionIdx]
    if (!section) return null

    const sectionSlug = section.slug

    if (path.parentCategoryIdx !== undefined) {
      const catEntry = section.entries[path.parentCategoryIdx]
      if (!catEntry || catEntry.type !== 'category') return null
      const categorySlug = catEntry.slug.split('/').pop()!
      const child = path.itemIdx !== undefined ? catEntry.children[path.itemIdx] : null
      const itemFullSlug = child?.slug ?? ''
      return { sectionSlug, categorySlug, itemFullSlug, parentSlugPath: [sectionSlug, categorySlug] }
    }

    const entry = path.itemIdx !== undefined ? section.entries[path.itemIdx] : null
    const itemFullSlug = entry?.slug ?? ''
    return { sectionSlug, itemFullSlug, parentSlugPath: [sectionSlug] }
  }

  // ── Mutation helper ─────────────────────────────────────────────────────────

  async function mutate<T>(fn: () => Promise<T>): Promise<T> {
    saving.value = true
    try {
      const result = await fn()
      invalidate()
      triggerRefresh()
      return result
    } finally {
      saving.value = false
    }
  }

  // ── Section operations ──────────────────────────────────────────────────────

  function addSection(name: string) {
    return mutate(() => $fetch<any>('/api/admin/content/section', {
      method: 'POST',
      headers: authHeaders(),
      body: { name },
    }))
  }

  function renameSection(sectionIdx: number, newName: string) {
    const slug = getSectionSlug(sectionIdx)
    if (!slug) return
    return mutate(() => $fetch<any>(`/api/admin/content/section/${slug}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { name: newName },
    }))
  }

  function deleteSection(sectionIdx: number) {
    const slug = getSectionSlug(sectionIdx)
    if (!slug) return
    return mutate(() => $fetch<any>(`/api/admin/content/section/${slug}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }))
  }

  async function reorderSection(sectionIdx: number, direction: 'up' | 'down') {
    const sections = navData.value?.sections
    if (!sections) return
    const targetIdx = direction === 'up' ? sectionIdx - 1 : sectionIdx + 1
    if (targetIdx < 0 || targetIdx >= sections.length) return

    const slugA = sections[sectionIdx]?.slug
    const slugB = sections[targetIdx]?.slug
    if (!slugA || !slugB) return

    // Swap order values between the two sections
    const orderA = sectionIdx
    const orderB = targetIdx

    await mutate(() => Promise.all([
      $fetch<any>(`/api/admin/content/section/${slugA}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: { order: orderB },
      }),
      $fetch<any>(`/api/admin/content/section/${slugB}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: { order: orderA },
      }),
    ]))
  }

  // ── Item operations ─────────────────────────────────────────────────────────

  function addItem(sectionIdx: number, parentCategoryIdx: number | null, type: CreateItemType, name: string) {
    const sectionSlug = getSectionSlug(sectionIdx)
    if (!sectionSlug) return

    let categorySlug: string | undefined
    if (parentCategoryIdx !== null) {
      const catEntry = navData.value?.sections[sectionIdx]?.entries[parentCategoryIdx]
      if (catEntry?.type === 'category') categorySlug = catEntry.slug.split('/').pop()
    }

    return mutate(() => $fetch<any>('/api/admin/content/item', {
      method: 'POST',
      headers: authHeaders(),
      body: { sectionSlug, categorySlug, type, name },
    }))
  }

  function renameItem(path: AdminItemPath, newName: string) {
    const r = resolveSlugs(path)
    if (!r?.itemFullSlug) return
    return mutate(() => $fetch<any>(`/api/admin/content/item/${r.itemFullSlug}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { name: newName },
    }))
  }

  function deleteItem(path: AdminItemPath) {
    const r = resolveSlugs(path)
    if (!r?.itemFullSlug) return
    return mutate(() => $fetch<any>(`/api/admin/content/item/${r.itemFullSlug}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }))
  }

  function reorderItem(path: AdminItemPath, direction: 'up' | 'down') {
    const section = navData.value?.sections[path.sectionIdx]
    if (!section) return

    let entries: any[]
    let parentSlugPath: string[]

    if (path.parentCategoryIdx !== undefined) {
      const catEntry = section.entries[path.parentCategoryIdx]
      if (!catEntry || catEntry.type !== 'category') return
      entries = catEntry.children
      parentSlugPath = [section.slug, catEntry.slug.split('/').pop()!]
    } else {
      entries = section.entries
      parentSlugPath = [section.slug]
    }

    const idx = path.itemIdx ?? 0
    const items = entries.map((e: any) => ({
      type: e.type,
      slug: e.slug.split('/').pop()!,
    }))

    const target = direction === 'up' ? idx - 1 : idx + 1
    if (target < 0 || target >= items.length) return
    ;[items[idx], items[target]] = [items[target]!, items[idx]!]

    const isSection = parentSlugPath.length === 1
    const url = isSection
      ? `/api/admin/content/section/${parentSlugPath[0]}`
      : `/api/admin/content/item/${parentSlugPath.join('/')}`
    const body = isSection ? { items } : { parentItems: items }

    return mutate(() => $fetch<any>(url, {
      method: 'PATCH',
      headers: authHeaders(),
      body,
    }))
  }

  function moveItem(from: AdminItemPath, toSectionIdx: number, toCategoryIdx: number | null) {
    const r = resolveSlugs(from)
    if (!r?.itemFullSlug) return

    const toSection = navData.value?.sections[toSectionIdx]
    if (!toSection) return

    const toPath = [toSection.slug]
    if (toCategoryIdx !== null) {
      const catEntry = toSection.entries[toCategoryIdx]
      if (catEntry?.type === 'category') toPath.push(catEntry.slug.split('/').pop()!)
    }

    return mutate(() => $fetch<any>(`/api/admin/content/item/${r.itemFullSlug}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { toPath },
    }))
  }

  function toggleVisibility(kind: 'section' | 'category' | 'page', slug: string, hidden: boolean) {
    return mutate(() => $fetch('/api/admin/content/visibility', {
      method: 'PATCH',
      headers: authHeaders(),
      body: { kind, slug, hidden },
    }))
  }

  function duplicatePage(path: AdminItemPath) {
    const r = resolveSlugs(path)
    if (!r?.itemFullSlug) return
    return mutate(() => $fetch<{ slug: string }>('/api/admin/content/duplicate', {
      method: 'POST',
      headers: authHeaders(),
      body: { sourceSlug: r.itemFullSlug },
    }))
  }

  // ── Dialog helpers ──────────────────────────────────────────────────────────

  function load() { /* no-op — nav comes from useContentNav */ }

  function openDeleteModal(target: DeleteTarget) { deleteTarget.value = target }
  function openMoveModal(target: MoveTarget) { moveTarget.value = target }
  function openRenameModal(target: RenameTarget) { renameTarget.value = target }

  function openAddItemDialog(sectionIdx: number, categoryIdx: number | null) {
    const section = navData.value?.sections[sectionIdx]
    let parentLabel = section?.title ?? 'Section'
    if (categoryIdx !== null) {
      const catEntry = section?.entries[categoryIdx]
      if (catEntry?.type === 'category') parentLabel = catEntry.title
    }
    addItemContext.value = { sectionIdx, categoryIdx, parentLabel }
  }

  function openCreateSectionDialog() { createSectionOpen.value = true }

  function closeModals() {
    deleteTarget.value = null
    moveTarget.value = null
    renameTarget.value = null
    addItemContext.value = null
    createSectionOpen.value = false
  }

  return {
    rawCollection: readonly(rawCollection),
    saving: readonly(saving),
    deleteTarget: readonly(deleteTarget),
    moveTarget: readonly(moveTarget),
    renameTarget: readonly(renameTarget),
    addItemContext: readonly(addItemContext),
    createSectionOpen: readonly(createSectionOpen),
    load,
    addSection,
    renameSection,
    deleteSection,
    reorderSection,
    addItem,
    renameItem,
    deleteItem,
    reorderItem,
    moveItem,
    toggleVisibility,
    duplicatePage,
    openDeleteModal,
    openMoveModal,
    openRenameModal,
    openAddItemDialog,
    openCreateSectionDialog,
    closeModals,
  }
}
