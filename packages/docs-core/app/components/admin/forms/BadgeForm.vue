<template>
  <div class="space-y-3">
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="field-label">Text</label>
        <UiTextarea :model-value="p.text" placeholder="Badge label" size="sm"
          @update:model-value="patchProps({ text: $event })" />
      </div>
      <div>
        <label class="field-label">Variant</label>
        <UiSelect :model-value="p.variant ?? 'default'" size="sm"
          :options="[{id:'default',label:'Default'},{id:'success',label:'Success'},{id:'warning',label:'Warning'},{id:'error',label:'Error'},{id:'info',label:'Info'}]"
          @update:model-value="patchProps({ variant: $event })" />
      </div>
      <div>
        <label class="field-label">Size</label>
        <UiSelect :model-value="p.size ?? 'md'" size="sm"
          :options="[{id:'sm',label:'Small'},{id:'md',label:'Medium'}]"
          @update:model-value="patchProps({ size: $event })" />
      </div>
      <div>
        <label class="field-label">Rounded</label>
        <UiSelect :model-value="p.rounded ?? 'md'" size="sm"
          :options="[{id:'md',label:'Rounded'},{id:'full',label:'Pill'}]"
          @update:model-value="patchProps({ rounded: $event })" />
      </div>
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
