<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-x-4 gap-y-1.5">
      <UiCheckbox
        :model-value="(block.props as any).ordered ?? false"
        @update:model-value="patchProps({ ordered: $event })"
      >Ordered (1, 2, 3…)</UiCheckbox>
      <UiCheckbox
        :model-value="(block.props as any).hideMarker ?? false"
        @update:model-value="patchProps({ hideMarker: $event })"
      >Hide markers</UiCheckbox>
    </div>
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <label class="field-label">Items</label>
        <button type="button" class="add-btn" @click="addItem">+ Item</button>
      </div>
      <div class="space-y-1.5">
        <div v-for="(item, ii) in items" :key="ii" class="flex items-center gap-2">
          <UiTextarea :model-value="item.content" size="sm" placeholder="Item text" class="flex-1"
            @update:model-value="updateItem(ii as number, $event)" />
          <button type="button" class="text-ink-muted hover:text-red-500 shrink-0" @click="removeItem(ii as number)">
            <UiIcon name="trash" size="xs" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Block } from '~/types/content'
interface Props { block: Block }
const props = defineProps<Props>()
const emit = defineEmits<{ update: [block: Block] }>()
function patchProps(patch: Record<string, unknown>) { emit('update', { ...props.block, props: { ...props.block.props, ...patch } } as any) }
const items = computed(() => (props.block.props as any).items ?? [])
function updateItem(ii: number, content: string) {
  patchProps({ items: items.value.map((item: any, i: number) => i === ii ? { ...item, content } : item) })
}
function addItem() { patchProps({ items: [...items.value, { content: 'New item' }] }) }
function removeItem(ii: number) { patchProps({ items: items.value.filter((_: any, i: number) => i !== ii) }) }
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted; }
.add-btn { @apply text-[11px] text-brand-green hover:underline font-medium; }
</style>
