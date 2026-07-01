<template>
  <div class="space-y-3">
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="field-label">Language</label>
        <UiTextarea :model-value="block.props.language" placeholder="bash" size="sm"
          @update:model-value="patchProps({ language: $event })" />
      </div>
      <div>
        <label class="field-label">Title</label>
        <UiTextarea :model-value="block.props.title ?? ''" placeholder="Optional label" size="sm"
          @update:model-value="patchProps({ title: $event || undefined })" />
      </div>
    </div>
    <div class="flex gap-4">
      <UiCheckbox
        :model-value="block.props.hideHeader ?? false"
        @update:model-value="patchProps({ hideHeader: $event || undefined })"
      >Hide header</UiCheckbox>
      <UiCheckbox
        :model-value="block.props.hideCopy ?? false"
        @update:model-value="patchProps({ hideCopy: $event || undefined })"
      >Hide copy button</UiCheckbox>
    </div>
    <div>
      <label class="field-label">Code</label>
      <UiTextarea
        class="font-mono text-xs"
        :model-value="block.content ?? ''"
        @update:model-value="$emit('update', { ...block, content: $event })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CodeBlock } from '~/types/content'
interface Props { block: CodeBlock }
const props = defineProps<Props>()
const emit = defineEmits<{ update: [block: CodeBlock] }>()
function patchProps(p: Partial<CodeBlock['props']>) { emit('update', { ...props.block, props: { ...props.block.props, ...p } }) }
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-1; }
</style>
