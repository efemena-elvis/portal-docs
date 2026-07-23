<template>
  <div class="space-y-3">
    <div class="grid grid-cols-3 gap-2">
      <div>
        <label class="field-label">Method</label>
        <UiSelect :model-value="p.method" size="sm"
          :options="['GET','POST','PUT','PATCH','DELETE'].map(m => ({ id: m, label: m }))"
          @update:model-value="patchProps({ method: $event })" />
      </div>
      <div class="col-span-2">
        <label class="field-label">Path</label>
        <UiTextarea :model-value="p.path" placeholder="/api/v1/…" size="sm"
          @update:model-value="patchProps({ path: $event })" />
      </div>
    </div>
    <div>
      <label class="field-label">Slug (links to endpoint page)</label>
      <UiTextarea :model-value="p.slug" placeholder="section/page-slug" size="sm"
        @update:model-value="patchProps({ slug: $event })" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Block } from '~/types/content'
interface Props { block: Block }
const props = defineProps<Props>()
const emit = defineEmits<{ update: [block: Block] }>()
const p = computed(() => props.block.props as any)
function patchProps(patch: Record<string, unknown>) { emit('update', { ...props.block, props: { ...props.block.props, ...patch } } as any) }
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-1; }
</style>
