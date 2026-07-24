<template>
  <div class="space-y-3">
    <div>
      <label class="field-label">Variant</label>
      <UiSelect
        :model-value="block.props.variant"
        :options="VARIANTS"
        size="sm"
        @update:model-value="patch({ props: { variant: $event as CalloutBlock['props']['variant'] } })"
      />
    </div>
    <div>
      <label class="field-label">Content</label>
      <UiTextarea
        class="font-mono"
        :model-value="block.content ?? ''"
        @update:model-value="patch({ content: $event })"
      />
      <p class="mt-1 text-[10px] text-ink-muted dark:text-dark-subtle">
        Markdown supported — <code class="font-mono text-brand-blue dark:text-brand-sky">**bold**</code>
        <code class="font-mono text-brand-blue dark:text-brand-sky ml-1">*italic*</code>
        <code class="font-mono text-brand-blue dark:text-brand-sky ml-1">[text](url)</code>
        <code class="font-mono text-brand-blue dark:text-brand-sky ml-1">&lt;span style="color:#hex"&gt;word&lt;/span&gt;</code>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalloutBlock } from '~/types/content'
interface Props { block: CalloutBlock }
const props = defineProps<Props>()
const emit = defineEmits<{ update: [block: CalloutBlock] }>()
function patch(partial: Partial<CalloutBlock>) { emit('update', { ...props.block, ...partial } as CalloutBlock) }
const VARIANTS = [
  { id: 'note', label: 'Note' },
  { id: 'warning', label: 'Warning' },
  { id: 'tip', label: 'Tip' },
  { id: 'nutshell', label: 'Nutshell' },
  { id: 'before-you-begin', label: 'Before You Begin' },
]
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-1; }
</style>
