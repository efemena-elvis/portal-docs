<template>
  <div class="space-y-3">
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="field-label">Variant</label>
        <UiSelect :model-value="(block.props as any).variant ?? 'default'" size="sm"
          :options="[{id:'default',label:'Default'},{id:'bordered',label:'Bordered'},{id:'elevated',label:'Elevated'}]"
          @update:model-value="patchProps({ variant: $event })" />
      </div>
      <div>
        <label class="field-label">Padding</label>
        <UiSelect :model-value="(block.props as any).padding ?? 'md'" size="sm"
          :options="[{id:'none',label:'None'},{id:'sm',label:'Small'},{id:'md',label:'Medium'},{id:'lg',label:'Large'}]"
          @update:model-value="patchProps({ padding: $event })" />
      </div>
    </div>
    <div>
      <label class="field-label">Content</label>
      <UiTextarea
        :model-value="block.content ?? ''"
        @update:model-value="patchContent($event)"
      />
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
