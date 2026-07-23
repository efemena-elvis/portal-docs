<template>
  <div class="block-renderer">
    <template v-for="block in visibleBlocks" :key="block.id">
      <!-- Admin hover overlay wrapper: shows ring + "Edit" trigger on hover.
           Only rendered for authenticated admins — hidden for all public visitors. -->
      <div v-if="isAdmin" class="relative group/blk">
        <template v-if="INLINE_META_TYPES.has(block.type) || !(block.meta.class || block.meta.style)">
          <component :is="() => renderBlock(block)" />
        </template>
        <component v-else :is="() => renderBlockInMetaWrapper(block)" />

        <!-- Hover ring (pointer-events-none keeps block content fully selectable) -->
        <div class="absolute inset-0 rounded pointer-events-none ring-1 ring-transparent group-hover/blk:ring-brand-green/40 group-hover/blk:bg-brand-green/[0.03] transition-all duration-150" />

        <!-- Edit trigger -->
        <button
          type="button"
          class="absolute top-1.5 right-1.5 z-10 inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-brand-navy dark:bg-dark-sidebar text-white shadow-md opacity-0 group-hover/blk:opacity-100 transition-opacity duration-150 whitespace-nowrap"
          @click="$emit('edit-block', block.id)"
        >
          <UiIcon name="pencil" size="xs" />
          Edit
        </button>
      </div>

      <!-- Public view: no hover overlays -->
      <template v-else>
        <template v-if="INLINE_META_TYPES.has(block.type) || !(block.meta.class || block.meta.style)">
          <component :is="() => renderBlock(block)" />
        </template>
        <component v-else :is="() => renderBlockInMetaWrapper(block)" />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Block, ProseBlock, CalloutBlock, CodeBlock, MermaidBlock, StepsBlock, StepBlock, ParamsTableBlock, TableBlock, AuthNoteBlock, MethodPathBlock, CodeResponseBlock } from '~/types/content'
import { h, resolveComponent, type VNode } from 'vue'
import docsConfig from '../../../../docs.config'

interface Props {
  blocks: Block[]
}

const props = defineProps<Props>()
defineEmits<{ 'edit-block': [blockId: string] }>()
const { isAdmin } = useAdmin()
const { render: renderMd } = useMarkdown()

// Resolve all components at setup() time — resolveComponent must be called in
// component context (setup/render), not inside nested arrow functions which
// lose instance context in production builds.
const CDocsCallout = resolveComponent('DocsCallout')
const CDocsCodeBlock = resolveComponent('DocsCodeBlock')
const CDocsMermaid = resolveComponent('DocsMermaid')
const CUiCard = resolveComponent('UiCard')
const CUiBadge = resolveComponent('UiBadge')
const CUiButton = resolveComponent('UiButton')
const CDocsSupportCta = resolveComponent('DocsSupportCta')
const CUiTable = resolveComponent('UiTable')
const CUiTableBody = resolveComponent('UiTableBody')
const CUiTableRow = resolveComponent('UiTableRow')
const CUiTableCell = resolveComponent('UiTableCell')
const CUiTableHead = resolveComponent('UiTableHead')
const CDocsParamsTable = resolveComponent('DocsParamsTable')
const CDocsEndpointHeader = resolveComponent('DocsEndpointHeader')
const CNuxtLink = resolveComponent('NuxtLink')
const CDocsStepTimeline = resolveComponent('DocsStepTimeline')
const CDocsStep = resolveComponent('DocsStep')
const CDocsCapabilityCard = resolveComponent('DocsCapabilityCard')

// Block types that inject meta.class/style directly onto their root element.
// These must NOT get an extra wrapper div — the meta is already applied inside the render fn.
const INLINE_META_TYPES = new Set([
  'prose', 'image', 'card', 'badge', 'button', 'list', 'divider', 'spacer', 'card-grid',
  'auth-note', 'method-path',
])

// Tailwind spacing / sizing scale → CSS value
const TW_SCALE: Record<string, string> = {
  '0': '0px', 'px': '1px', '0.5': '0.125rem', '1': '0.25rem', '1.5': '0.375rem',
  '2': '0.5rem', '2.5': '0.625rem', '3': '0.75rem', '3.5': '0.875rem',
  '4': '1rem', '5': '1.25rem', '6': '1.5rem', '7': '1.75rem', '8': '2rem',
  '9': '2.25rem', '10': '2.5rem', '11': '2.75rem', '12': '3rem', '14': '3.5rem',
  '16': '4rem', '20': '5rem', '24': '6rem', '28': '7rem', '32': '8rem',
  '36': '9rem', '40': '10rem', '44': '11rem', '48': '12rem', '52': '13rem',
  '56': '14rem', '60': '15rem', '64': '16rem', '72': '18rem', '80': '20rem',
  '96': '24rem', 'auto': 'auto', 'full': '100%', 'screen': '100vw',
  'min': 'min-content', 'max': 'max-content', 'fit': 'fit-content',
}

/**
 * Resolves meta.class + meta.style into safe attrs that always win.
 *
 * Spacing/sizing utilities (m*, p*, w, h, gap) are converted to inline
 * styles so they override hardcoded Tailwind classes on the same element
 * without requiring the CSS bundle to include !important variants.
 *
 * All other utilities (text, bg, font, border, etc.) are kept as-is —
 * they are already covered by the Tailwind safelist.
 *
 * The user's explicit meta.style always takes final precedence.
 */
function resolveMetaAttrs(
  metaClass: string | undefined,
  metaStyle: string | undefined,
): { class: string; style: string | undefined } {
  const tokens = (metaClass ?? '').split(/\s+/).filter(Boolean)
  const remainingClasses: string[] = []
  const cssProps: Record<string, string> = {}

  // Brand colour hex values — used to convert bg/text/border-brand-x/opacity to inline style
  const BRAND_HEX: Record<string, string> = {
    'brand-navy': '1,26,39', 'brand-dark': '4,59,86', 'brand-blue': '11,97,143',
    'brand-sky': '36,172,238', 'brand-green': '58,183,93',
    'ink-primary': '23,25,24', 'ink-secondary': '82,88,87', 'ink-muted': '105,111,110',
    'surface-off-white': '241,247,246', 'surface-pale-blue': '238,249,253',
    'surface-sage': '229,237,235', 'surface-sage-dark': '209,217,215',
    'dark-bg': '22,27,34', 'dark-surface': '33,38,45', 'dark-border': '48,54,61',
    'dark-text': '230,237,243', 'dark-muted': '139,148,158', 'dark-subtle': '110,118,129',
  }

  for (const token of tokens) {
    const clean = token.startsWith('!') ? token.slice(1) : token

    // bg-{color}/{opacity} → inline background-color with rgba
    const bgOpacity = clean.match(/^bg-(.+)\/(\d+)$/)
    if (bgOpacity) {
      const hex = BRAND_HEX[bgOpacity[1]!]
      if (hex) {
        cssProps['background-color'] = `rgba(${hex}, ${Number(bgOpacity[2]) / 100})`
        continue
      }
    }

    // text-{color}/{opacity} → inline color with rgba
    const textOpacity = clean.match(/^text-(.+)\/(\d+)$/)
    if (textOpacity && !/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|left|center|right|justify)/.test(clean)) {
      const hex = BRAND_HEX[textOpacity[1]!]
      if (hex) {
        cssProps['color'] = `rgba(${hex}, ${Number(textOpacity[2]) / 100})`
        continue
      }
    }

    const m = clean.match(
      /^(m|mt|mr|mb|ml|mx|my|p|pt|pr|pb|pl|px|py|w|h|min-w|min-h|max-w|max-h|gap|gap-x|gap-y)-([\w.]+)$/
    )
    if (m) {
      const prop = m[1]!
      const val = m[2]!
      const v = TW_SCALE[val]
      if (v) {
        switch (prop) {
          case 'm':     cssProps['margin'] = v; break
          case 'mt':    cssProps['margin-top'] = v; break
          case 'mr':    cssProps['margin-right'] = v; break
          case 'mb':    cssProps['margin-bottom'] = v; break
          case 'ml':    cssProps['margin-left'] = v; break
          case 'mx':    cssProps['margin-left'] = v; cssProps['margin-right'] = v; break
          case 'my':    cssProps['margin-top'] = v; cssProps['margin-bottom'] = v; break
          case 'p':     cssProps['padding'] = v; break
          case 'pt':    cssProps['padding-top'] = v; break
          case 'pr':    cssProps['padding-right'] = v; break
          case 'pb':    cssProps['padding-bottom'] = v; break
          case 'pl':    cssProps['padding-left'] = v; break
          case 'px':    cssProps['padding-left'] = v; cssProps['padding-right'] = v; break
          case 'py':    cssProps['padding-top'] = v; cssProps['padding-bottom'] = v; break
          case 'w':     cssProps['width'] = v; break
          case 'h':     cssProps['height'] = v; break
          case 'min-w': cssProps['min-width'] = v; break
          case 'min-h': cssProps['min-height'] = v; break
          case 'max-w': cssProps['max-width'] = v; break
          case 'max-h': cssProps['max-height'] = v; break
          case 'gap':   cssProps['gap'] = v; break
          case 'gap-x': cssProps['column-gap'] = v; break
          case 'gap-y': cssProps['row-gap'] = v; break
        }
        continue
      }
    }
    // Visual utility (text, bg, font, border, opacity, etc.) — keep as-is
    remainingClasses.push(token)
  }

  const computedStyleStr = Object.entries(cssProps).map(([k, v]) => `${k}: ${v}`).join('; ')
  // User's explicit meta.style takes final precedence (appears last in the string)
  const combinedStyle = [computedStyleStr, metaStyle].filter(Boolean).join('; ')

  return {
    class: remainingClasses.join(' '),
    style: combinedStyle || undefined,
  }
}

// Only show hidden blocks in admin mode
const visibleBlocks = computed(() =>
  props.blocks.filter(b => !b.meta.hidden || isAdmin.value)
)
// Headings emit id + data-toc attributes — DOM scanner in usePageHeadings picks them up

// ─── Block renderers ──────────────────────────────────────────────────────────

function renderBlock(block: Block): VNode | null {
  switch (block.type) {
    case 'prose':       return renderProse(block as ProseBlock)
    case 'callout':     return renderCallout(block as CalloutBlock)
    case 'code':        return renderCode(block as CodeBlock)
    case 'mermaid':     return renderMermaid(block as MermaidBlock)
    case 'image':       return renderImage(block)
    case 'card':        return renderCard(block)
    case 'badge':       return renderBadge(block)
    case 'button':      return renderButton(block)
    case 'support':     return renderSupport(block)
    case 'table':       return renderTable(block as TableBlock)
    case 'params-table': return renderParamsTable(block as ParamsTableBlock)
    case 'auth-note':   return renderAuthNote(block as AuthNoteBlock)
    case 'method-path': return renderMethodPath(block as MethodPathBlock)
    case 'endpoint-ref': return renderEndpointRef(block)
    case 'steps':       return renderSteps(block as StepsBlock)
    case 'step':        return renderStep(block as StepBlock, true)
    case 'card-grid':   return renderCardGrid(block)
    case 'list':        return renderList(block)
    case 'divider':       return renderDivider(block)
    case 'spacer':        return renderSpacer(block)
    case 'code-request':  return renderCodeRequest()
    case 'code-response': return renderCodeResponse(block as CodeResponseBlock)
    default:              return null
  }
}

// Wraps opaque-component blocks (callout, code, mermaid, etc.) in a div
// that carries the user's meta overrides at the container level.
function renderBlockInMetaWrapper(block: Block): VNode | null {
  const inner = renderBlock(block)
  if (!inner) return null
  const { class: cls, style } = resolveMetaAttrs(block.meta.class, block.meta.style)
  return h('div', { class: cls || undefined, style }, [inner])
}

// ─── Prose ───────────────────────────────────────────────────────────────────

function renderProse(block: ProseBlock): VNode {
  const { variant, level, size, weight, color, family, align } = block.props
  const propsClasses = [size, weight, color, family, align ? `text-${align}` : ''].filter(Boolean).join(' ')
  const { class: metaClass, style: metaStyle } = resolveMetaAttrs(block.meta.class, block.meta.style)

  if (variant === 'heading') {
    const tag = level ?? 'h2'
    const defaultClass: Record<string, string> = {
      h1: 'text-3xl font-bold text-ink-primary dark:text-dark-text mt-10 mb-4',
      h2: 'text-2xl font-bold text-ink-primary dark:text-dark-text mt-10 mb-3',
      h3: 'text-lg font-semibold text-ink-primary dark:text-dark-text mt-8 mb-2',
      h4: 'text-base font-semibold text-ink-secondary dark:text-dark-muted mt-6 mb-2',
    }
    return h(tag, {
      class: [defaultClass[tag], propsClasses, metaClass].filter(Boolean).join(' ') || undefined,
      style: metaStyle,
      id: block.meta.toc ? block.id : undefined,
      innerHTML: renderMd(block.content).replace(/^<p>|<\/p>\n?$/g, ''),
    })
  }

  // body variant
  return h('div', {
    class: ['prose-body text-[15.5px] leading-relaxed text-ink-secondary dark:text-dark-muted mb-4 [&>p]:mb-4 [&>p:last-child]:mb-0', propsClasses, metaClass].filter(Boolean).join(' '),
    style: metaStyle,
    innerHTML: renderMd(block.content),
  })
}

// ─── Callout ─────────────────────────────────────────────────────────────────

function renderCallout(block: CalloutBlock): VNode {
  return h(CDocsCallout, { type: block.props.variant }, {
    default: () => h('span', { innerHTML: renderMd(block.content) })
  })
}

// ─── Code ────────────────────────────────────────────────────────────────────

function renderCode(block: CodeBlock): VNode {
  return h(CDocsCodeBlock, {
    code: block.content,
    language: block.props.language,
    title: block.props.title,
    hideHeader: block.props.hideHeader,
    hideCopy: block.props.hideCopy,
  })
}

// ─── API Request (auto-generated — no content to render as a free block) ─────

function renderCodeRequest(): VNode {
  return h('p', { class: 'text-[13px] text-ink-muted dark:text-dark-subtle italic' }, 'Request example — auto-generated from endpoint data.')
}

// ─── API Response ─────────────────────────────────────────────────────────────

function renderCodeResponse(block: CodeResponseBlock): VNode {
  const responses = (block.props.responses ?? []).map(r => ({
    label: `${r.code} — ${r.status}`,
    code: r.body,
    language: 'json',
  }))
  return h(CDocsCodeBlock, { variant: 'response', responses })
}

// ─── Mermaid ─────────────────────────────────────────────────────────────────

function renderMermaid(block: MermaidBlock): VNode {
  return h(CDocsMermaid, {
    diagram: block.content,
    title: block.props.title,
  })
}

// ─── Image ───────────────────────────────────────────────────────────────────

function renderImage(block: Block): VNode {
  const p = block.props as any
  const { class: mc, style: ms } = resolveMetaAttrs(block.meta.class, block.meta.style)
  return h('figure', {
    class: ['my-6', mc].filter(Boolean).join(' '),
    style: ms,
  }, [
    h('img', { src: p.src, alt: p.alt, class: 'rounded-lg w-full' }),
    block.content ? h('figcaption', {
      class: 'text-sm text-ink-muted dark:text-dark-subtle mt-2 text-center',
      innerHTML: renderMd(block.content),
    }) : null,
  ])
}

// ─── Card ────────────────────────────────────────────────────────────────────

function renderCard(block: Block): VNode {
  const p = block.props as any
  const pad: Record<string, string> = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-8' }
  const { class: mc, style: ms } = resolveMetaAttrs(block.meta.class, block.meta.style)
  return h(CUiCard, {
    class: ['my-6', pad[p.padding ?? 'md'], mc].filter(Boolean).join(' '),
    style: ms,
    variant: p.variant,
  }, {
    default: () => h('div', { innerHTML: renderMd(block.content as string) })
  })
}

// ─── Badge ───────────────────────────────────────────────────────────────────

function renderBadge(block: Block): VNode {
  const p = block.props as any
  const { class: mc, style: ms } = resolveMetaAttrs(block.meta.class, block.meta.style)
  return h(CUiBadge, {
    variant: p.variant,
    size: p.size,
    rounded: p.rounded,
    class: ['inline-flex', mc].filter(Boolean).join(' '),
    style: ms,
  }, { default: () => p.text })
}

// ─── Button ──────────────────────────────────────────────────────────────────

function renderButton(block: Block): VNode {
  const p = block.props as any
  const { class: mc, style: ms } = resolveMetaAttrs(block.meta.class, block.meta.style)
  return h('div', {
    class: ['my-4', mc].filter(Boolean).join(' '),
    style: ms,
  }, [
    h(CUiButton, {
      variant: p.variant ?? 'primary',
      size: p.size,
      href: p.href,
      to: p.to,
    }, { default: () => block.content as string })
  ])
}

// ─── Support CTA ─────────────────────────────────────────────────────────────

function renderSupport(block: Block): VNode {
  const p = block.props as any
  return h(CDocsSupportCta, {
    description: block.content as string,
    buttonText: p.buttonText ?? 'Contact Support',
    href: p.href,
  })
}

// ─── Table ───────────────────────────────────────────────────────────────────

function renderTable(block: TableBlock): VNode {
  return h('div', { class: 'my-6 overflow-x-auto' }, [
    h(CUiTable, null, {
      default: () => [
        block.props.headers.length
          ? h(CUiTableHead, null, {
              default: () => h(CUiTableRow, null, {
                default: () => block.props.headers.map(hdr => {
                  const hdrAttrs = resolveMetaAttrs(hdr.meta?.class, hdr.meta?.style)
                  return h('th', {
                    class: ['text-left text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-dark-subtle px-4 py-3', hdrAttrs.class].filter(Boolean).join(' '),
                    style: hdrAttrs.style,
                  }, hdr.text)
                })
              })
            })
          : null,
        h(CUiTableBody, null, {
          default: () => block.props.rows.map((row, ri) => {
            const rowAttrs = resolveMetaAttrs(row.meta?.class, row.meta?.style)
            return h(CUiTableRow, {
              key: ri,
              class: rowAttrs.class || undefined,
              style: rowAttrs.style,
            }, {
              default: () => row.cells.map((cell, ci) => {
                const cellAttrs = resolveMetaAttrs(cell.meta?.class, cell.meta?.style)
                return h(CUiTableCell, {
                  key: ci,
                  class: cellAttrs.class || undefined,
                  style: cellAttrs.style,
                }, { default: () => h('span', { innerHTML: renderMd(cell.text).replace(/^<p>|<\/p>\n?$/g, '') }) })
              })
            })
          })
        })
      ]
    })
  ])
}

// ─── Params Table ─────────────────────────────────────────────────────────────

function renderParamsTable(block: ParamsTableBlock): VNode {
  return h(CDocsParamsTable, {
    rows: block.props.rows,
    title: block.props.title ?? '',
    showInToc: block.props.showInToc,
  })
}

// ─── Auth Note ────────────────────────────────────────────────────────────────

function renderAuthNote(block: AuthNoteBlock): VNode {
  const content = block.content ?? ''
  const html = renderMd(content).trim()
  // Strip outer <p> tag so text flows inline inside the flex row
  const inner = html.replace(/^<p>([\s\S]*?)<\/p>$/, '$1')
  const { class: mc, style: ms } = resolveMetaAttrs(block.meta.class, block.meta.style)

  return h('div', {
    class: ['auth-note-block flex items-start gap-2.5 px-4 py-4 rounded-lg bg-surface-off-white dark:bg-dark-sidebar border border-surface-sage-dark dark:border-dark-border text-[14.5px] text-ink-secondary dark:text-dark-muted my-8', mc].filter(Boolean).join(' '),
    style: ms,
  }, [
    h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '14',
      height: '14',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: 'mt-0.5 shrink-0 text-ink-muted dark:text-dark-subtle',
      'aria-hidden': 'true',
    }, [
      h('rect', { x: '3', y: '11', width: '18', height: '11', rx: '2', ry: '2' }),
      h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' }),
    ]),
    h('span', { class: 'auth-note-text', innerHTML: inner }),
  ])
}

// ─── Method & Path ────────────────────────────────────────────────────────────

function renderMethodPath(block: MethodPathBlock): VNode {
  const { class: mc, style: ms } = resolveMetaAttrs(block.meta.class, block.meta.style)
  return h('div', { class: mc || undefined, style: ms }, [
    h(CDocsEndpointHeader, {
      method: block.props.method,
      urlPath: block.props.path,
      baseUrl: block.props.baseUrl || docsConfig.api.baseUrl,
    }),
  ])
}

// ─── Endpoint Reference ───────────────────────────────────────────────────────

function renderEndpointRef(block: Block): VNode {
  const p = block.props as any

  return h('div', { class: 'my-4' }, [
    h(CNuxtLink, { to: '/' + p.slug, class: 'block hover:opacity-80 transition-opacity' }, {
      default: () => h(CDocsEndpointHeader, {
        method: p.method,
        urlPath: p.path,
        baseUrl: docsConfig.api.baseUrl,
      })
    })
  ])
}

// ─── Steps ───────────────────────────────────────────────────────────────────

function renderSteps(block: StepsBlock): VNode {
  return h(CDocsStepTimeline, null, {
    default: () => block.children.map((child, idx) =>
      renderStep(child, idx === block.children.length - 1)
    )
  })
}

function renderStep(block: StepBlock, isLast: boolean): VNode {
  return h(CDocsStep, {
    key: block.id,
    number: block.props.number,
    title: block.props.title,
    description: block.props.description,
    last: isLast,
  }, {
    default: () => block.content
      ? h('div', { innerHTML: renderMd(block.content), class: 'text-sm text-ink-secondary dark:text-dark-muted' })
      : null
  })
}

// ─── Card Grid ────────────────────────────────────────────────────────────────

function renderCardGrid(block: Block): VNode {
  const p = block.props as any
  const cols = p.columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  const { class: mc, style: ms } = resolveMetaAttrs(block.meta.class, block.meta.style)
  return h('div', {
    class: [`grid ${cols} gap-4 my-6`, mc].filter(Boolean).join(' '),
    style: ms,
  },
    (p.items ?? []).map((item: any, idx: number) =>
      h(CDocsCapabilityCard, {
        key: idx,
        icon: typeof item.icon === 'object' ? item.icon?.value ?? '' : (item.icon ?? ''),
        bg: item.bg,
        title: item.title,
        description: item.description,
        href: item.href,
        class: item.meta?.class,
        style: item.meta?.style,
      })
    )
  )
}

// ─── List ─────────────────────────────────────────────────────────────────────

function renderListItems(items: any[], hideMarker?: boolean): VNode[] {
  return items.map((item, idx) =>
    h('li', {
      key: idx,
      class: [hideMarker ? 'leading-relaxed' : 'leading-relaxed', item.meta?.class].filter(Boolean).join(' '),
      style: item.meta?.style,
      innerHTML: !item.children?.length ? renderMd(item.content).replace(/^<p>|<\/p>\n?$/g, '') : undefined,
    }, item.children?.length ? [
      h('span', { innerHTML: renderMd(item.content).replace(/^<p>|<\/p>\n?$/g, '') }),
      h('ul', {
        class: hideMarker ? 'list-none pl-0 mt-2' : 'list-disc list-inside ml-4 mt-2',
      }, renderListItems(item.children, hideMarker))
    ] : undefined)
  )
}

function renderList(block: Block): VNode {
  const p = block.props as any
  const tag = p.ordered ? 'ol' : 'ul'
  const hideMarker = !!p.hideMarker

  const listClass = hideMarker
    ? 'list-none pl-0 space-y-5 my-4 text-[15px] text-ink-secondary dark:text-dark-muted'
    : p.ordered
      ? 'list-decimal list-inside space-y-2.5 my-4 text-[15px] text-ink-secondary dark:text-dark-muted pl-1'
      : 'list-disc list-inside space-y-2.5 my-4 text-[15px] text-ink-secondary dark:text-dark-muted pl-1'

  const { class: mc, style: ms } = resolveMetaAttrs(block.meta.class, block.meta.style)
  return h(tag, {
    class: [listClass, mc].filter(Boolean).join(' '),
    style: ms,
  }, renderListItems(p.items ?? [], hideMarker))
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function renderDivider(block: Block): VNode {
  const p = block.props as any
  const weight: Record<string, string> = { thin: '1px', medium: '2px', thick: '4px' }
  const { class: mc, style: ms } = resolveMetaAttrs(block.meta.class, block.meta.style)
  return h('hr', {
    class: ['my-8', p.color, mc].filter(Boolean).join(' '),
    style: { borderTopWidth: weight[p.weight ?? 'thin'], ...parseStyle(ms) },
  })
}

// ─── Spacer ──────────────────────────────────────────────────────────────────

function renderSpacer(block: Block): VNode {
  const sizeMap: Record<string, string> = { xs: 'h-2', sm: 'h-4', md: 'h-8', lg: 'h-12', xl: 'h-16' }
  const p = block.props as any
  const { class: mc, style: ms } = resolveMetaAttrs(block.meta.class, block.meta.style)
  return h('div', {
    class: [sizeMap[p.size ?? 'md'] ?? 'h-8', mc].filter(Boolean).join(' '),
    style: ms,
    'aria-hidden': 'true',
  })
}

// Parse an inline style string into a Vue style object (camelCase keys)
function parseStyle(style: string | undefined | null): Record<string, string> {
  if (!style) return {}
  return Object.fromEntries(
    style.split(';').map(s => s.trim()).filter(Boolean)
      .map(s => {
        const idx = s.indexOf(':')
        if (idx === -1) return null
        const key = s.slice(0, idx).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())
        return [key, s.slice(idx + 1).trim()]
      })
      .filter(Boolean) as [string, string][]
  )
}
</script>
