import type { IconName } from '~/components/ui/Icon/icons'

export interface TableRow {
  name: string
  type?: string
  required: boolean
  description: string
}

export interface NavLink {
  label: string
  href: string
}

export interface PageHeading {
  id: string
  text: string
  level: number
}

export interface CodeExample {
  id: string
  label: string
  language: string
  languageLabel?: string
  code: string
}

/** One entry in the request-block language switcher dropdown */
export interface LanguageOption {
  /** Display label, e.g. "cURL", "Node.js" */
  label: string
  /** Shiki language key, e.g. "bash", "javascript" */
  language: string
  code: string
}

/** One entry in the response-block status-code switcher dropdown */
export interface ResponseOption {
  /** Display label, e.g. "200 — Credentials Valid" */
  label: string
  code: string
  /** Shiki language key — defaults to "json" */
  language?: string
}

export interface CodeLanguageOption {
  id: string
  label: string
}

export interface CodeResponseOption {
  id: string
  label: string
  code: number
  status: string
  body: string
}

export interface SidebarPage {
  type: 'page'
  title: string
  path: string
  slug?: string
  icon?: IconName
  hidden?: boolean
  // Admin addressing
  adminSectionIdx?: number
  adminItemIdx?: number
  adminParentCategoryIdx?: number
}

export interface SidebarExternal {
  type: 'external'
  title: string
  href: string
  icon?: IconName
}

export interface SidebarGroup {
  type: 'group'
  title: string
  slug?: string
  icon?: IconName
  collapsed?: boolean
  hidden?: boolean
  children: SidebarItem[]
  // Admin addressing
  adminSectionIdx?: number
  adminItemIdx?: number
}

export type SidebarItem = SidebarPage | SidebarExternal | SidebarGroup

export interface SidebarSection {
  title: string
  slug?: string
  items: SidebarItem[]
  collapsible?: boolean
  open?: boolean
  hidden?: boolean
  // Admin addressing
  adminIdx?: number
}

export interface ParsedDescription {
  intro: string
  nutshell: string
  beforeYouBegin: string
  params: TableRow[]
  monitorFields: TableRow[]
  warning: string
  nextStep: string
}

export interface CodeGenOptions {
  method: string
  urlPath: string
  headers: { key: string; value: string; disabled?: boolean }[]
  body: string | null
  baseUrl: string
}

export interface PaginationNeighbor {
  slug: string
  title: string
  sectionTitle: string
}
