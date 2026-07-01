export interface SectionIndexItem {
  type: 'page' | 'category'
  slug: string
}

export interface SectionIndex {
  title: string
  emoji?: string
  collapsible?: boolean
  protected?: boolean
  hidden?: boolean
  order?: number
  items: SectionIndexItem[]
}
