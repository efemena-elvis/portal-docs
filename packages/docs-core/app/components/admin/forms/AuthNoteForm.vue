<template>
  <div class="space-y-3">
    <div>
      <label class="field-label">Note content</label>
      <p class="text-[11px] text-ink-muted dark:text-dark-subtle mb-1.5 leading-relaxed">
        Supports markdown — links, <code class="text-[10px] bg-surface-sage dark:bg-dark-border px-1 rounded">code</code>, <strong>bold</strong>. Renders inside a lock-icon callout.
      </p>
      <UiTextarea
        :model-value="block.content ?? ''"
        placeholder="Requires a valid API key passed in the x-api-key header…"
        size="sm"
        style="min-height: 80px"
        @update:model-value="emit('update', { ...block, content: $event })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AuthNoteBlock } from '~/types/content'

interface Props { block: AuthNoteBlock }
const props = defineProps<Props>()
const emit = defineEmits<{ update: [block: AuthNoteBlock] }>()
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-0.5; }
</style>
