import type { Block } from './content'

// ─── Page Meta ───────────────────────────────────────────────────────────────

export interface PageMeta {
  description?: string
  hidden?: boolean
}

// ─── Guide Page ──────────────────────────────────────────────────────────────

export interface GuidePage {
  type: 'guide'
  title: string
  meta: PageMeta
  blocks: Block[]
}

// ─── Endpoint Page ───────────────────────────────────────────────────────────

export interface CollectionHeader {
  key: string
  value: string
  description?: string
  disabled?: boolean
}

export interface SavedResponse {
  name: string
  status: string
  code: number
  body: string
  headers?: CollectionHeader[]
}

export interface EndpointError {
  code: string
  status: number
  description: string
}

export interface EndpointPage {
  type: 'endpoint'
  title: string
  meta: PageMeta
  status?: 'stable' | 'beta' | 'deprecated'
  description?: string
  auth?: string
  method: string
  path: string
  headers: CollectionHeader[]
  body: string
  params: import('./content').ParamsTableRow[]
  responseSchema?: import('./content').ParamsTableRow[]
  responses: SavedResponse[]
  errors?: EndpointError[]
  blocks: Block[]
}

// ─── Union ───────────────────────────────────────────────────────────────────

export type Page = GuidePage | EndpointPage

// ─── Nav / Search types (returned by the nav API) ────────────────────────────

export interface NavPageEntry {
  type: 'page'
  title: string
  slug: string
  pageType: 'guide' | 'endpoint'
  method?: string
  sectionTitle: string
  sectionSlug: string
  categoryTitle?: string
  excerpt: string
  hidden?: boolean
}

export interface NavCategoryEntry {
  type: 'category'
  title: string
  slug: string
  sectionSlug: string
  children: NavPageEntry[]
  hidden?: boolean
}

export type NavEntry = NavPageEntry | NavCategoryEntry

export interface NavSection {
  title: string
  slug: string
  emoji?: string
  collapsible?: boolean
  protected?: boolean
  entries: NavEntry[]
  hidden?: boolean
}

export interface NavResponse {
  sections: NavSection[]
  searchIndex: SearchResult[]
  orderedSlugs: string[]
}

export interface SearchResult {
  title: string
  slug: string
  sectionTitle: string
  method?: string
  description: string
}
