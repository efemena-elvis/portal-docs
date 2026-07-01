<template>
  <div class="space-y-3">
    <div>
      <label class="field-label">Title</label>
      <UiTextarea :model-value="block.props.title ?? ''" placeholder="Optional label" size="sm"
        @update:model-value="$emit('update', { ...block, props: { ...block.props, title: $event || undefined } })" />
    </div>
    <div>
      <label class="field-label">Diagram</label>
      <UiTextarea
        class="font-mono text-xs"
        :model-value="block.content ?? ''"
        @update:model-value="$emit('update', { ...block, content: $event })"
      />
      <p class="mt-1 text-[10px] text-ink-muted dark:text-dark-subtle">Mermaid diagram syntax</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MermaidBlock } from '~/types/content'
interface Props { block: MermaidBlock }
defineProps<Props>()
defineEmits<{ update: [block: MermaidBlock] }>()
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-1; }
</style>
