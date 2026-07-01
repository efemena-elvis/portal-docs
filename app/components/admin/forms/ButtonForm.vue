<template>
  <div class="space-y-3">
    <div>
      <label class="field-label">Label</label>
      <UiTextarea :model-value="block.content ?? ''" placeholder="Button text" size="sm"
        @update:model-value="patchContent($event)" />
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="field-label">Variant</label>
        <UiSelect :model-value="p.variant ?? 'primary'" size="sm"
          :options="[{id:'primary',label:'Primary'},{id:'secondary',label:'Secondary'},{id:'outline',label:'Outline'},{id:'ghost',label:'Ghost'},{id:'link',label:'Link'}]"
          @update:model-value="patchProps({ variant: $event })" />
      </div>
      <div>
        <label class="field-label">Size</label>
        <UiSelect :model-value="p.size ?? 'md'" size="sm"
          :options="[{id:'sm',label:'Small'},{id:'md',label:'Medium'},{id:'lg',label:'Large'}]"
          @update:model-value="patchProps({ size: $event })" />
      </div>
    </div>
    <div>
      <label class="field-label">Link (href or internal path)</label>
      <UiTextarea :model-value="p.href ?? p.to ?? ''" placeholder="https://… or /docs/…" size="sm"
        @update:model-value="patchProps({ href: $event.startsWith('/') ? undefined : $event, to: $event.startsWith('/') ? $event : undefined })" />
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
function patchContent(content: string) { emit('update', { ...props.block, content } as any) }
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-1; }
</style>
