import type { IconName } from '~/components/ui/Icon/icons'

// ─── Block Meta ──────────────────────────────────────────────────────────────

export interface BlockMeta {
  class?: string
  style?: string
  toc?: string
  hidden?: boolean
}

// ─── Base ────────────────────────────────────────────────────────────────────

export interface BaseBlock {
  id: string
  props: Record<string, unknown>
  content: string | null
  meta: BlockMeta
}

// ─── 1. Prose ────────────────────────────────────────────────────────────────

export interface ProseBlock extends BaseBlock {
  type: 'prose'
  props: {
    variant: 'heading' | 'body'
    level?: 'h1' | 'h2' | 'h3' | 'h4'
    size?: string
    weight?: string
    color?: string
    family?: string
    align?: 'left' | 'center' | 'right'
  }
  content: string
}

// ─── 2. Callout ──────────────────────────────────────────────────────────────

export interface CalloutBlock extends BaseBlock {
  type: 'callout'
  props: {
    variant: 'note' | 'warning' | 'tip' | 'nutshell' | 'before-you-begin'
  }
  content: string
}

// ─── 3. Code ─────────────────────────────────────────────────────────────────

export interface CodeBlock extends BaseBlock {
  type: 'code'
  props: {
    language: string
    title?: string
    hideHeader?: boolean
    hideCopy?: boolean
  }
  content: string
}

// ─── 4. Mermaid ──────────────────────────────────────────────────────────────

export interface MermaidBlock extends BaseBlock {
  type: 'mermaid'
  props: {
    title?: string
  }
  content: string
}

// ─── 5. Image ────────────────────────────────────────────────────────────────

export interface ImageBlock extends BaseBlock {
  type: 'image'
  props: {
    src: string
    alt: string
  }
  content: string | null
}

// ─── 6. Card ─────────────────────────────────────────────────────────────────

export interface CardBlock extends BaseBlock {
  type: 'card'
  props: {
    variant?: 'default' | 'bordered' | 'elevated'
    padding?: 'none' | 'sm' | 'md' | 'lg'
  }
  content: string
}

// ─── 7. Badge ────────────────────────────────────────────────────────────────

export interface BadgeBlock extends BaseBlock {
  type: 'badge'
  props: {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
    size?: 'sm' | 'md'
    rounded?: 'full' | 'md'
    text: string
  }
  content: null
}

// ─── 8. Button ───────────────────────────────────────────────────────────────

export interface ButtonBlock extends BaseBlock {
  type: 'button'
  props: {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
    size?: 'sm' | 'md' | 'lg'
    href?: string
    to?: string
    icon?: string
    iconPosition?: 'left' | 'right'
  }
  content: string
}

// ─── 9. Support CTA ──────────────────────────────────────────────────────────

export interface SupportBlock extends BaseBlock {
  type: 'support'
  props: {
    buttonText?: string
    href?: string
  }
  content: string
}

// ─── 10. Table ───────────────────────────────────────────────────────────────

export interface TableCellData {
  text: string
  meta?: { class?: string; style?: string }
}

export interface TableRowData {
  cells: TableCellData[]
  meta?: { class?: string; style?: string }
}

export interface TableBlock extends BaseBlock {
  type: 'table'
  props: {
    headers: TableCellData[]
    rows: TableRowData[]
  }
  content: null
}

// ─── 11. Params Table ────────────────────────────────────────────────────────

export interface ParamsTableRow {
  name: string
  type: string
  required: boolean
  description: string
  meta?: { class?: string; style?: string }
}

export interface ParamsTableBlock extends BaseBlock {
  type: 'params-table'
  props: {
    title?: string
    showInToc?: boolean
    rows: ParamsTableRow[]
  }
  content: null
}

// ─── 11b. Auth Note ──────────────────────────────────────────────────────────

export interface AuthNoteBlock extends BaseBlock {
  type: 'auth-note'
  props: Record<string, never>
  content: string
}

// ─── 11c. Method & Path ──────────────────────────────────────────────────────

export interface MethodPathBlock extends BaseBlock {
  type: 'method-path'
  props: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    path: string
    baseUrl?: string
    hideBaseUrl?: boolean
  }
  content: null
}

// ─── 12. Endpoint Reference ──────────────────────────────────────────────────

export interface EndpointRefBlock extends BaseBlock {
  type: 'endpoint-ref'
  props: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    path: string
    slug: string
  }
  content: null
}

// ─── 13. Step ────────────────────────────────────────────────────────────────

export interface StepBlock extends BaseBlock {
  type: 'step'
  props: {
    number: number
    title: string
    description?: string  // short subtitle displayed directly under the title (one line)
    last?: boolean        // auto-computed when inside steps wrapper; manual for standalone
  }
  content: string | null  // free-form body below the title/description (inline markdown)
}

// ─── 14. Steps Timeline ──────────────────────────────────────────────────────

export interface StepsBlock extends BaseBlock {
  type: 'steps'
  props: Record<string, never>
  content: null
  children: StepBlock[]
}

// ─── 15. Card Grid ───────────────────────────────────────────────────────────

export type CardGridIcon =
  | { kind: 'emoji'; value: string }
  | { kind: 'icon'; name: IconName }

export interface CardGridItem {
  icon?: CardGridIcon
  bg?: string
  title: string
  description: string
  href: string
  meta?: { class?: string; style?: string }
}

export interface CardGridBlock extends BaseBlock {
  type: 'card-grid'
  props: {
    columns?: 2 | 3
    items: CardGridItem[]
  }
  content: null
}

// ─── 16. List ────────────────────────────────────────────────────────────────

export interface ListItem {
  content: string
  meta?: { class?: string; style?: string }
  children?: ListItem[]
}

export interface ListBlock extends BaseBlock {
  type: 'list'
  props: {
    ordered: boolean
    items: ListItem[]
  }
  content: null
}

// ─── 17. Divider ─────────────────────────────────────────────────────────────

export interface DividerBlock extends BaseBlock {
  type: 'divider'
  props: {
    color?: string
    weight?: 'thin' | 'medium' | 'thick'
  }
  content: null
}

// ─── 18. Spacer ──────────────────────────────────────────────────────────────

export interface SpacerBlock extends BaseBlock {
  type: 'spacer'
  props: {
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  }
  content: null
}

// ─── API Request Code Block ──────────────────────────────────────────────────

export interface CodeRequestBlock extends BaseBlock {
  type: 'code-request'
  props: Record<string, never>
  content: null
}

// ─── Errors Table Block ──────────────────────────────────────────────────────

export interface ErrorsTableRow {
  code: string
  status: number
  description: string
}

export interface ErrorsTableBlock extends BaseBlock {
  type: 'errors-table'
  props: {
    title?: string
    showInToc?: boolean
    rows: ErrorsTableRow[]
  }
  content: null
}

// ─── API Response Code Block ─────────────────────────────────────────────────

export interface CodeResponseEntry {
  name?: string
  status: string
  code: number
  body: string
}

export interface CodeResponseBlock extends BaseBlock {
  type: 'code-response'
  props: {
    responses: CodeResponseEntry[]
  }
  content: null
}

// ─── Discriminated Union ─────────────────────────────────────────────────────

export type Block =
  | ProseBlock
  | CalloutBlock
  | CodeBlock
  | MermaidBlock
  | ImageBlock
  | CardBlock
  | BadgeBlock
  | ButtonBlock
  | SupportBlock
  | TableBlock
  | ParamsTableBlock
  | AuthNoteBlock
  | MethodPathBlock
  | EndpointRefBlock
  | StepBlock
  | StepsBlock
  | CardGridBlock
  | ListBlock
  | DividerBlock
  | SpacerBlock
  | ErrorsTableBlock
  | CodeRequestBlock
  | CodeResponseBlock

export type BlockType = Block['type']
