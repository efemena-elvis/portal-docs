<template>
  <div class="space-y-3">
    <div>
      <label class="field-label">Columns</label>
      <div class="flex gap-2">
        <button v-for="n in [2, 3]" :key="n" type="button"
          class="flex-1 py-1.5 rounded-md text-xs border transition-colors"
          :class="(blockProps.columns ?? 2) === n
            ? 'border-brand-green bg-brand-green/10 text-brand-green'
            : 'border-surface-sage-dark dark:border-dark-border text-ink-muted dark:text-dark-muted hover:border-brand-green/40'"
          @click="patchProps({ columns: n })">
          {{ n }} columns
        </button>
      </div>
    </div>
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <label class="field-label">Items</label>
        <button type="button" class="add-btn" @click="addItem">+ Item</button>
      </div>
      <div class="space-y-2">
        <div v-for="(item, ii) in items" :key="ii"
          class="p-3 rounded-lg border border-surface-sage dark:border-dark-border space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-mono text-ink-muted">{{ (ii as number) + 1 }}</span>
            <UiTextarea :model-value="item.title" size="sm" placeholder="Title" class="flex-1"
              @update:model-value="updateItem(ii as number, { title: $event })" />
            <button type="button" class="text-ink-muted hover:text-red-500" @click="removeItem(ii as number)">
              <UiIcon name="trash" size="xs" />
            </button>
          </div>
          <UiTextarea :model-value="item.description" size="sm" placeholder="Description"
            @update:model-value="updateItem(ii as number, { description: $event })" />
          <UiTextarea :model-value="item.href" size="sm" placeholder="Link href"
            @update:model-value="updateItem(ii as number, { href: $event })" />
          <div class="flex items-center gap-2">
            <UiTextarea :model-value="emojiValue(item)" size="sm" placeholder="Emoji (e.g. ⚡)"
              class="w-20 font-mono"
              @update:model-value="updateItem(ii as number, { icon: $event ? { kind: 'emoji', value: $event } : undefined })" />
            <span class="text-[11px] text-ink-muted dark:text-dark-subtle">icon emoji</span>
          </div>
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

const blockProps = computed(() => props.block.props as any)
const items = computed<any[]>(() => blockProps.value.items ?? [])

function patchProps(patch: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit('update', { ...props.block, props: { ...props.block.props, ...patch } } as any)
}

function updateItem(ii: number, patch: Record<string, unknown>) {
  const updated = items.value.map((item: any, i: number) => i === ii ? { ...item, ...patch } : item)
  patchProps({ items: updated })
}

function addItem() {
  patchProps({ items: [...items.value, { title: 'Card title', description: 'Description', href: '#', icon: { kind: 'emoji', value: '⚡' } }] })
}

function removeItem(ii: number) {
  patchProps({ items: items.value.filter((_: any, i: number) => i !== ii) })
}

function emojiValue(item: any): string {
  return item.icon?.kind === 'emoji' ? item.icon.value : ''
}
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted; }
.add-btn { @apply text-[11px] text-brand-green hover:underline font-medium; }
</style>
