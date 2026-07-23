<template>
  <div class="space-y-3">
    <div>
      <label class="field-label">Size</label>
      <div class="flex gap-2">
        <button
          v-for="s in SIZES"
          :key="s.value"
          type="button"
          class="flex-1 py-1.5 rounded-md text-xs border transition-colors flex flex-col items-center gap-0.5"
          :class="(p.size ?? 'md') === s.value
            ? 'border-brand-green bg-brand-green/10 text-brand-green'
            : 'border-surface-sage-dark dark:border-dark-border text-ink-muted dark:text-dark-muted hover:border-brand-green/40'"
          @click="patchProps({ size: s.value })"
        >
          <span class="font-semibold">{{ s.label }}</span>
          <span class="text-[10px] opacity-70">{{ s.px }}</span>
        </button>
      </div>
    </div>
    <!-- Visual preview -->
    <div class="border border-dashed border-surface-sage-dark dark:border-dark-border rounded-lg overflow-hidden">
      <div
        class="bg-brand-green/10 transition-all"
        :style="{ height: previewHeight }"
      />
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
const SIZES = [
  { value: 'xs', label: 'XS', px: '8px' },
  { value: 'sm', label: 'SM', px: '16px' },
  { value: 'md', label: 'MD', px: '32px' },
  { value: 'lg', label: 'LG', px: '48px' },
  { value: 'xl', label: 'XL', px: '64px' },
]
const SIZE_PX: Record<string, string> = { xs: '8px', sm: '16px', md: '32px', lg: '48px', xl: '64px' }
const previewHeight = computed(() => SIZE_PX[p.value.size ?? 'md'] ?? '32px')
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-1; }
</style>
