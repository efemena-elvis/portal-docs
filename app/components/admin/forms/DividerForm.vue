<template>
  <div class="space-y-3">
    <div>
      <label class="field-label">Weight</label>
      <div class="flex gap-2">
        <button v-for="w in WEIGHTS" :key="w.value" type="button"
          class="flex-1 py-1.5 rounded-md text-xs border transition-colors"
          :class="(p.weight ?? 'thin') === w.value
            ? 'border-brand-green bg-brand-green/10 text-brand-green'
            : 'border-surface-sage-dark dark:border-dark-border text-ink-muted dark:text-dark-muted hover:border-brand-green/40'"
          @click="patchProps({ weight: w.value })">
          {{ w.label }}
        </button>
      </div>
    </div>
    <div>
      <label class="field-label">Color</label>
      <AdminTokenPicker :model-value="p.color ?? ''"
        @update:model-value="patchProps({ color: $event || undefined })" />
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
const WEIGHTS = [{ value: 'thin', label: '1px' }, { value: 'medium', label: '2px' }, { value: 'thick', label: '4px' }]
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-1; }
</style>
