import type { NavSection, NavEntry, NavPageEntry, NavCategoryEntry } from '~/types/page'
import type { SidebarSection, SidebarItem, SidebarPage, SidebarGroup } from '~/types/docs'

// ─── NavEntry → SidebarItem adapters ─────────────────────────────────────────

function navPageToSidebarItem(
  entry: NavPageEntry,
  adminSectionIdx?: number,
  adminItemIdx?: number,
  adminParentCategoryIdx?: number,
): SidebarPage {
  return {
    type: 'page',
    title: entry.title,
    path: '/' + entry.slug,
    slug: entry.slug,
    hidden: entry.hidden,
    adminSectionIdx,
    adminItemIdx,
    adminParentCategoryIdx,
  }
}

function navCategoryToSidebarItem(
  entry: NavCategoryEntry,
  adminSectionIdx?: number,
  adminItemIdx?: number,
): SidebarGroup {
  return {
    type: 'group',
    title: entry.title,
    slug: entry.slug,
    hidden: entry.hidden,
    adminSectionIdx,
    adminItemIdx,
    children: entry.children.map((child, childIdx) =>
      navPageToSidebarItem(child, adminSectionIdx, childIdx, adminItemIdx)
    ),
  }
}

function navEntryToSidebarItem(entry: NavEntry, sectionIdx: number, itemIdx: number): SidebarItem {
  if (entry.type === 'page') {
    return navPageToSidebarItem(entry, sectionIdx, itemIdx)
  }
  return navCategoryToSidebarItem(entry, sectionIdx, itemIdx)
}

// ─── Module-level sidebar sections ref ───────────────────────────────────────

const _sections = ref<SidebarSection[]>([])

export function useDocsNav() {
  const { navData, loading, fetchNav } = useContentNav()
  const { isAdmin } = useAdmin()

  function buildSections(data: typeof navData.value) {
    if (!data) return
    const admin = isAdmin.value
    _sections.value = data.sections
      .filter(section => admin || !section.hidden)
      .map((section, sectionIdx) => ({
        title: section.title,
        slug: section.slug,
        hidden: section.hidden,
        collapsible: section.collapsible ?? true,
        open: true,
        adminIdx: sectionIdx,
        items: section.entries
          .filter(entry => admin || !entry.hidden)
          .map((entry, itemIdx) => navEntryToSidebarItem(entry, sectionIdx, itemIdx)),
      }))
  }

  watch(navData, buildSections, { immediate: true })
  watch(isAdmin, () => buildSections(navData.value))

  return { nav: _sections, navLoading: loading, fetchNav }
}
