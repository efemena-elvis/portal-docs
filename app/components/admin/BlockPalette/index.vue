<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="$emit('close')"
      >
        <div class="bg-white dark:bg-dark-surface rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="px-5 py-4 border-b border-surface-sage dark:border-dark-border flex items-center gap-3">
            <h2 class="text-sm font-semibold text-ink-primary dark:text-dark-text flex-1">Add block</h2>
            <button
              type="button"
              class="w-7 h-7 flex items-center justify-center rounded-md text-ink-muted dark:text-dark-muted hover:bg-surface-sage dark:hover:bg-dark-sidebar transition-colors"
              @click="$emit('close')"
            >
              <UiIcon name="close" size="sm" />
            </button>
          </div>

          <!-- Block groups -->
          <div class="overflow-y-auto p-4 space-y-4">
            <div v-for="group in BLOCK_GROUPS" :key="group.label">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-dark-subtle mb-2 px-1">
                {{ group.label }}
              </p>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                <button
                  v-for="item in group.items"
                  :key="item.type"
                  type="button"
                  class="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-surface-sage dark:border-dark-border text-left hover:border-brand-green/40 hover:bg-brand-green/5 dark:hover:bg-brand-green/10 transition-colors group"
                  @click="select(item.type)"
                >
                  <span class="text-base flex-none">{{ item.emoji }}</span>
                  <span class="text-xs font-medium text-ink-secondary dark:text-dark-muted group-hover:text-ink-primary dark:group-hover:text-dark-text leading-tight">
                    {{ item.label }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Block } from '~/types/content'

interface Props {
  open: boolean
}

defineProps<Props>()
const emit = defineEmits<{ close: []; select: [type: Block['type']] }>()

function select(type: Block['type']) {
  emit('select', type)
  emit('close')
}

const BLOCK_GROUPS: { label: string; items: { type: Block['type']; label: string; emoji: string }[] }[] = [
  {
    label: 'Text',
    items: [
      { type: 'prose', label: 'Prose / Heading', emoji: '¶' },
      { type: 'list', label: 'List', emoji: '•' },
      { type: 'table', label: 'Table', emoji: '⊞' },
      { type: 'params-table', label: 'Params Table', emoji: '⊟' },
    ],
  },
  {
    label: 'Highlight',
    items: [
      { type: 'callout', label: 'Callout', emoji: '💡' },
      { type: 'badge', label: 'Badge', emoji: '🏷' },
      { type: 'button', label: 'Button', emoji: '🔲' },
    ],
  },
  {
    label: 'Media',
    items: [
      { type: 'code', label: 'Code Block', emoji: '</>' },
      { type: 'mermaid', label: 'Mermaid', emoji: '⊙' },
      { type: 'image', label: 'Image', emoji: '🖼' },
    ],
  },
  {
    label: 'Layout',
    items: [
      { type: 'card', label: 'Card', emoji: '▭' },
      { type: 'card-grid', label: 'Card Grid', emoji: '⊞' },
      { type: 'support', label: 'Support CTA', emoji: '🤝' },
      { type: 'divider', label: 'Divider', emoji: '─' },
      { type: 'spacer', label: 'Spacer', emoji: '↕' },
    ],
  },
  {
    label: 'Steps',
    items: [
      { type: 'step', label: 'Step', emoji: '① ' },
      { type: 'steps', label: 'Steps Timeline', emoji: '📋' },
    ],
  },
  {
    label: 'API',
    items: [
      { type: 'auth-note', label: 'Auth Note', emoji: '🔒' },
      { type: 'method-path', label: 'Method & Path', emoji: '⇄' },
      { type: 'endpoint-ref', label: 'Endpoint Ref', emoji: '⬡' },
    ],
  },
]
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
