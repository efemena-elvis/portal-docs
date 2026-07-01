<template>
  <div class="space-y-3">
    <div>
      <label class="field-label">Description</label>
      <UiTextarea
        :model-value="block.content ?? ''"
        @update:model-value="patchContent($event)"
      />
    </div>
    <div>
      <label class="field-label">Button text</label>
      <UiTextarea :model-value="(block.props as any).buttonText ?? 'Contact Support'" size="sm"
        @update:model-value="patchProps({ buttonText: $event })" />
    </div>
    <div>
      <label class="field-label">Button href</label>
      <UiTextarea :model-value="(block.props as any).href ?? ''" placeholder="mailto:…" size="sm"
        @update:model-value="patchProps({ href: $event || undefined })" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Block } from '~/types/content'
interface Props { block: Block }
const props = defineProps<Props>()
const emit = defineEmits<{ update: [block: Block] }>()
function patchProps(p: Record<string, unknown>) { emit('update', { ...props.block, props: { ...props.block.props, ...p } } as any) }
function patchContent(content: string) { emit('update', { ...props.block, content } as any) }
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-1; }
</style>
