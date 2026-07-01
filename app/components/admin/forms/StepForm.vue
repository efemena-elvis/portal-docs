<template>
  <div class="space-y-3">
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="field-label">Number</label>
        <UiInput
          :model-value="String(p.number)"
          type="number"
          size="sm"
          placeholder="1"
          @update:model-value="patchProps({ number: Number($event) })"
        />
      </div>
      <div>
        <label class="field-label">Title</label>
        <UiTextarea :model-value="p.title" size="sm" placeholder="Step title"
          @update:model-value="patchProps({ title: $event })" />
      </div>
    </div>
    <div>
      <label class="field-label">Description (subtitle)</label>
      <UiTextarea :model-value="p.description ?? ''" size="sm" placeholder="Optional one-line subtitle"
        @update:model-value="patchProps({ description: $event || undefined })" />
    </div>
    <div>
      <label class="field-label">Body</label>
      <UiTextarea
        :model-value="block.content ?? ''"
        placeholder="Body content (optional)"
        @update:model-value="$emit('update', { ...block, content: $event || null })"
      />
      <p class="mt-1 text-[10px] text-ink-muted dark:text-dark-subtle">Inline markdown. Leave blank to omit.</p>
    </div>
    <UiCheckbox
      :model-value="p.last ?? false"
      @update:model-value="patchProps({ last: $event })"
    >Last step (hides connector line; auto-set inside Steps Timeline)</UiCheckbox>
  </div>
</template>

<script setup lang="ts">
import type { StepBlock } from '~/types/content'
interface Props { block: StepBlock }
const props = defineProps<Props>()
const emit = defineEmits<{ update: [block: StepBlock] }>()
const p = computed(() => props.block.props)
function patchProps(patch: Partial<StepBlock['props']>) { emit('update', { ...props.block, props: { ...props.block.props, ...patch } }) }
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-1; }
</style>
