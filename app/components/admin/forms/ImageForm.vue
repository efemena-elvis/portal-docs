<template>
  <div class="space-y-3">
    <div>
      <label class="field-label">Image URL</label>
      <UiTextarea :model-value="(block.props as any).src" placeholder="https://…" size="sm"
        @update:model-value="patchProps({ src: $event })" />
    </div>
    <div>
      <label class="field-label">Alt text</label>
      <UiTextarea :model-value="(block.props as any).alt" placeholder="Describe the image" size="sm"
        @update:model-value="patchProps({ alt: $event })" />
    </div>
    <div>
      <label class="field-label">Caption</label>
      <UiTextarea :model-value="block.content ?? ''" placeholder="Optional caption" size="sm"
        @update:model-value="patchContent($event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Block } from '~/types/content'
interface Props { block: Block }
const props = defineProps<Props>()
const emit = defineEmits<{ update: [block: Block] }>()
function patchProps(p: Record<string, unknown>) { emit('update', { ...props.block, props: { ...props.block.props, ...p } } as any) }
function patchContent(content: string) { emit('update', { ...props.block, content: content || null } as any) }
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-1; }
</style>
