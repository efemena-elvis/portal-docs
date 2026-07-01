<template>
  <div
    class="group relative rounded-xl border transition-all duration-150 overflow-hidden"
    :class="[
      block.meta.hidden
        ? 'border-dashed border-surface-sage-dark dark:border-dark-border opacity-60'
        : typeConfig.cardBorder,
      isExpanded ? 'bg-white dark:bg-dark-surface shadow-sm' : typeConfig.cardBg,
    ]"
  >
    <!-- Card header -->
    <div
      class="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none transition-colors duration-150"
      :class="isExpanded ? 'bg-surface-sage/40 dark:bg-dark-sidebar/60' : ''"
      @click="!noExpand && (isExpanded = !isExpanded)"
    >
      <!-- Up/down move controls -->
      <div class="flex flex-col shrink-0" @click.stop>
        <button
          type="button"
          :disabled="isFirst"
          class="flex items-center justify-center w-4 h-4 rounded transition-colors"
          :class="isFirst
            ? 'text-ink-muted/20 dark:text-dark-subtle/20 cursor-not-allowed'
            : 'text-ink-muted/60 dark:text-dark-subtle/60 hover:text-ink-primary dark:hover:text-dark-text hover:bg-surface-sage dark:hover:bg-dark-sidebar'"
          title="Move up"
          @click="$emit('move-up')"
        >
          <ChevronUp :size="12" />
        </button>
        <button
          type="button"
          :disabled="isLast"
          class="flex items-center justify-center w-4 h-4 rounded transition-colors"
          :class="isLast
            ? 'text-ink-muted/20 dark:text-dark-subtle/20 cursor-not-allowed'
            : 'text-ink-muted/60 dark:text-dark-subtle/60 hover:text-ink-primary dark:hover:text-dark-text hover:bg-surface-sage dark:hover:bg-dark-sidebar'"
          title="Move down"
          @click="$emit('move-down')"
        >
          <ChevronDown :size="12" />
        </button>
      </div>

      <!-- Block type badge with icon -->
      <span
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0"
        :class="typeConfig.badge"
      >
        <component :is="typeConfig.icon" :size="11" class="shrink-0" />
        {{ typeConfig.label }}
      </span>

      <!-- Hidden badge -->
      <span
        v-if="block.meta.hidden"
        class="inline-flex items-center gap-1 text-[10px] text-amber-500 font-medium shrink-0"
      >
        <UiIcon name="eyeOff" size="xs" />
        Hidden
      </span>

      <!-- Rich preview (collapsed) -->
      <span
        v-if="!isExpanded && richPreview"
        class="flex-1 min-w-0 text-xs text-ink-muted dark:text-dark-subtle truncate"
      >
        {{ richPreview }}
      </span>

      <!-- Actions: hide toggle + delete only -->
      <div class="flex items-center gap-0.5 shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
        <button
          type="button"
          class="w-6 h-6 flex items-center justify-center rounded text-ink-muted dark:text-dark-muted hover:text-ink-primary dark:hover:text-dark-text hover:bg-surface-sage dark:hover:bg-dark-sidebar transition-colors"
          :title="block.meta.hidden ? 'Show block' : 'Hide block'"
          @click="$emit('toggle-hidden')"
        >
          <UiIcon :name="block.meta.hidden ? 'eye' : 'eyeOff'" size="xs" />
        </button>

        <button
          type="button"
          class="w-6 h-6 flex items-center justify-center rounded text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Delete block"
          @click="$emit('delete')"
        >
          <UiIcon name="trash" size="xs" />
        </button>
      </div>
    </div>

    <!-- Expanded edit form -->
    <Transition name="expand">
      <div v-if="isExpanded" class="border-t border-surface-sage dark:border-dark-border bg-white dark:bg-dark-surface">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { Block } from '~/types/content'
import {
  Type, Code2, MessageSquare, GitBranch,
  Image as ImageLucide, Layers, LayoutGrid,
  Tag, MousePointer, LifeBuoy, Table2, ClipboardList,
  Link2, CheckSquare, ListOrdered, List as ListIcon,
  Minus, ChevronsUpDown, Zap, Lock, ArrowRightLeft,
  Terminal, FileCode, AlertTriangle,
  ChevronUp, ChevronDown,
} from '@lucide/vue'

interface Props {
  block: Block
  isFirst: boolean
  isLast: boolean
  noExpand?: boolean
}

const props = withDefaults(defineProps<Props>(), { noExpand: false })

const emit = defineEmits<{
  'move-up': []
  'move-down': []
  'delete': []
  'toggle-hidden': []
}>()

interface BlockTypeConfig {
  icon: Component
  label: string
  badge: string
  cardBorder: string
  cardBg: string
}

const BLOCK_CONFIG: Record<string, BlockTypeConfig> = {
  prose:         { icon: Type,          label: 'Prose',     badge: 'bg-green-500 text-white',   cardBorder: 'border-green-200 dark:border-green-800/50',     cardBg: 'bg-green-50/70 dark:bg-green-950/20'     },
  code:          { icon: Code2,         label: 'Code',      badge: 'bg-violet-500 text-white',  cardBorder: 'border-violet-200 dark:border-violet-800/50',   cardBg: 'bg-violet-50/70 dark:bg-violet-950/20'   },
  callout:       { icon: MessageSquare, label: 'Callout',   badge: 'bg-amber-500 text-white',   cardBorder: 'border-amber-200 dark:border-amber-800/50',     cardBg: 'bg-amber-50/70 dark:bg-amber-950/20'     },
  mermaid:       { icon: GitBranch,     label: 'Diagram',   badge: 'bg-cyan-500 text-white',    cardBorder: 'border-cyan-200 dark:border-cyan-800/50',       cardBg: 'bg-cyan-50/70 dark:bg-cyan-950/20'       },
  image:         { icon: ImageLucide,   label: 'Image',     badge: 'bg-rose-500 text-white',    cardBorder: 'border-rose-200 dark:border-rose-800/50',       cardBg: 'bg-rose-50/70 dark:bg-rose-950/20'       },
  card:          { icon: Layers,        label: 'Card',      badge: 'bg-orange-500 text-white',  cardBorder: 'border-orange-200 dark:border-orange-800/50',   cardBg: 'bg-orange-50/70 dark:bg-orange-950/20'   },
  'card-grid':   { icon: LayoutGrid,    label: 'Card Grid', badge: 'bg-orange-500 text-white',  cardBorder: 'border-orange-200 dark:border-orange-800/50',   cardBg: 'bg-orange-50/70 dark:bg-orange-950/20'   },
  badge:         { icon: Tag,           label: 'Badge',     badge: 'bg-pink-500 text-white',    cardBorder: 'border-pink-200 dark:border-pink-800/50',       cardBg: 'bg-pink-50/70 dark:bg-pink-950/20'       },
  button:        { icon: MousePointer,  label: 'Button',    badge: 'bg-blue-500 text-white',    cardBorder: 'border-blue-200 dark:border-blue-800/50',       cardBg: 'bg-blue-50/70 dark:bg-blue-950/20'       },
  support:       { icon: LifeBuoy,      label: 'Support',   badge: 'bg-purple-500 text-white',  cardBorder: 'border-purple-200 dark:border-purple-800/50',   cardBg: 'bg-purple-50/70 dark:bg-purple-950/20'   },
  table:         { icon: Table2,        label: 'Table',     badge: 'bg-indigo-500 text-white',  cardBorder: 'border-indigo-200 dark:border-indigo-800/50',   cardBg: 'bg-indigo-50/70 dark:bg-indigo-950/20'   },
  'params-table':{ icon: ClipboardList, label: 'Params',    badge: 'bg-indigo-500 text-white',  cardBorder: 'border-indigo-200 dark:border-indigo-800/50',   cardBg: 'bg-indigo-50/70 dark:bg-indigo-950/20'   },
  'auth-note':     { icon: Lock,           label: 'Auth Note',    badge: 'bg-amber-500 text-white',  cardBorder: 'border-amber-200 dark:border-amber-800/50',   cardBg: 'bg-amber-50/70 dark:bg-amber-950/20'   },
  'method-path':   { icon: ArrowRightLeft, label: 'Method & Path',badge: 'bg-blue-500 text-white',  cardBorder: 'border-blue-200 dark:border-blue-800/50',     cardBg: 'bg-blue-50/70 dark:bg-blue-950/20'     },
  'errors-table':  { icon: AlertTriangle,   label: 'Errors',       badge: 'bg-red-500 text-white',    cardBorder: 'border-red-200 dark:border-red-800/50',     cardBg: 'bg-red-50/70 dark:bg-red-950/20'         },
  'code-request':  { icon: Terminal,       label: 'API Request',  badge: 'bg-violet-600 text-white', cardBorder: 'border-violet-200 dark:border-violet-800/50', cardBg: 'bg-violet-50/70 dark:bg-violet-950/20' },
  'code-response': { icon: FileCode,       label: 'API Response', badge: 'bg-teal-500 text-white',   cardBorder: 'border-teal-200 dark:border-teal-800/50',     cardBg: 'bg-teal-50/70 dark:bg-teal-950/20'     },
  'endpoint-ref':{ icon: Link2,         label: 'Endpoint',  badge: 'bg-teal-500 text-white',    cardBorder: 'border-teal-200 dark:border-teal-800/50',       cardBg: 'bg-teal-50/70 dark:bg-teal-950/20'       },
  step:          { icon: CheckSquare,   label: 'Step',      badge: 'bg-emerald-500 text-white', cardBorder: 'border-emerald-200 dark:border-emerald-800/50', cardBg: 'bg-emerald-50/70 dark:bg-emerald-950/20' },
  steps:         { icon: ListOrdered,   label: 'Steps',     badge: 'bg-emerald-500 text-white', cardBorder: 'border-emerald-200 dark:border-emerald-800/50', cardBg: 'bg-emerald-50/70 dark:bg-emerald-950/20' },
  list:          { icon: ListIcon,      label: 'List',      badge: 'bg-sky-500 text-white',     cardBorder: 'border-sky-200 dark:border-sky-800/50',         cardBg: 'bg-sky-50/70 dark:bg-sky-950/20'         },
  divider:       { icon: Minus,         label: 'Divider',   badge: 'bg-zinc-400 text-white',    cardBorder: 'border-zinc-200 dark:border-zinc-700/50',       cardBg: 'bg-zinc-50/70 dark:bg-zinc-900/20'       },
  spacer:        { icon: ChevronsUpDown,label: 'Spacer',    badge: 'bg-zinc-400 text-white',    cardBorder: 'border-zinc-200 dark:border-zinc-700/50',       cardBg: 'bg-zinc-50/70 dark:bg-zinc-900/20'       },
}

const DEFAULT_CONFIG: BlockTypeConfig = {
  icon: Zap, label: 'Block',
  badge: 'bg-slate-400 text-white',
  cardBorder: 'border-slate-200 dark:border-slate-700/50',
  cardBg: 'bg-slate-50/70 dark:bg-slate-900/20',
}

const typeConfig = computed(() => BLOCK_CONFIG[props.block.type] ?? DEFAULT_CONFIG)

const isExpanded = ref(false)

const { focusedBlockId } = usePageEditor()
watch(focusedBlockId, (id) => {
  if (id === props.block.id) isExpanded.value = true
}, { immediate: true })

const richPreview = computed(() => {
  const b = props.block
  const p = (b as any).props ?? {}

  switch (b.type) {
    case 'prose': {
      const prefix = p.variant === 'heading' ? `H${p.level || 2}` : 'Body'
      const text = (b as any).content?.replace(/<[^>]*>/g, '').slice(0, 200) ?? ''
      return text ? `${prefix} · ${text}` : prefix
    }
    case 'code': {
      const lang = p.language || 'code'
      const first = (b as any).content?.split('\n')[0]?.trim().slice(0, 200) ?? ''
      return first ? `${lang} · ${first}` : lang
    }
    case 'callout': {
      const text = (b as any).content?.replace(/<[^>]*>/g, '').slice(0, 200) ?? ''
      return text ? `${p.variant || 'note'} · ${text}` : (p.variant || 'note')
    }
    case 'list': {
      const n = p.items?.length ?? 0
      return `${n} item${n !== 1 ? 's' : ''} · ${p.ordered ? 'ordered' : 'bullets'}`
    }
    case 'step':
      return `Step ${p.number ?? ''}${p.title ? ` · ${p.title}` : ''}`
    case 'steps': {
      const n = (b as any).children?.length ?? 0
      return `${n} step${n !== 1 ? 's' : ''}`
    }
    case 'table': {
      const rows = p.rows?.length ?? 0
      const cols = p.headers?.length ?? 0
      return `${rows} row${rows !== 1 ? 's' : ''} · ${cols} col${cols !== 1 ? 's' : ''}`
    }
    case 'params-table': {
      const n = p.rows?.length ?? 0
      return `${n} param${n !== 1 ? 's' : ''}`
    }
    case 'card-grid': {
      const n = p.items?.length ?? 0
      return `${n} card${n !== 1 ? 's' : ''} · ${p.columns ?? 2}-col`
    }
    case 'image':
      return p.alt || p.src || 'No source set'
    case 'card':
      return (b as any).content?.replace(/<[^>]*>/g, '').slice(0, 200) || p.variant || 'Card'
    case 'badge':
      return p.text || 'Badge'
    case 'button': {
      const label = (b as any).content?.replace(/<[^>]*>/g, '') ?? ''
      return label ? `${label} · ${p.variant || 'primary'}` : (p.variant || 'primary')
    }
    case 'support':
      return (b as any).content?.replace(/<[^>]*>/g, '').slice(0, 200) || 'Support CTA'
    case 'mermaid':
      return p.title || 'Diagram'
    case 'auth-note': {
      const text = (b as any).content?.replace(/`[^`]*`/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').slice(0, 120) ?? ''
      return text || 'Auth note'
    }
    case 'method-path':
      return p.path ? `${p.method || 'GET'} ${p.path}` : (p.method || 'GET')
    case 'errors-table': {
      const n = p.rows?.length ?? 0
      return `${n} error${n !== 1 ? 's' : ''}`
    }
    case 'code-request':
      return 'Auto-generated from method, path & headers'
    case 'code-response': {
      const n = p.responses?.length ?? 0
      return `${n} response${n !== 1 ? 's' : ''}`
    }
    case 'endpoint-ref':
      return p.path ? `${p.method || 'GET'} ${p.path}` : (p.method || 'GET')
    case 'divider':
      return `${p.weight || 'thin'} rule`
    case 'spacer':
      return `${p.size || 'md'} spacer`
    default:
      return ''
  }
})
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.15s ease;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
}
</style>
