<template>
  <div class="space-y-3">
    <!-- Title -->
    <div>
      <label class="field-label">Section title <span class="font-normal text-ink-muted dark:text-dark-subtle">(optional)</span></label>
      <UiTextarea
        :model-value="block.props.title ?? ''"
        size="sm"
        placeholder="e.g. Error codes"
        @update:model-value="emit('update', { ...block, props: { ...block.props, title: $event || undefined } })"
      />
    </div>

    <!-- Show in "On this page" -->
    <UiCheckbox
      :model-value="block.props.showInToc === true"
      @update:model-value="emit('update', { ...block, props: { ...block.props, showInToc: $event } })"
    >Show title in "On this page"</UiCheckbox>

    <div class="flex items-center justify-between">
      <label class="field-label">Errors</label>
      <button type="button" class="add-btn" @click="addRow">+ Row</button>
    </div>

    <div class="space-y-2">
      <div
        v-for="(row, ri) in block.props.rows"
        :key="ri"
        class="p-3 rounded-lg border border-surface-sage dark:border-dark-border space-y-2"
      >
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="field-label">Error code</label>
            <UiTextarea :model-value="row.code" size="sm" placeholder="invalid_amount"
              @update:model-value="updateRow(ri, { code: $event })" />
          </div>
          <div>
            <label class="field-label">HTTP status</label>
            <UiInput
              :model-value="String(row.status || '')"
              size="sm"
              type="number"
              placeholder="400"
              @update:model-value="updateRow(ri, { status: Number($event) || 400 })"
            />
          </div>
        </div>
        <div class="flex justify-end">
          <button type="button" class="text-[11px] text-red-400 hover:text-red-500" @click="removeRow(ri)">
            Remove
          </button>
        </div>
        <div>
          <label class="field-label">Description</label>
          <UiTextarea
            class="text-xs"
            :model-value="row.description"
            @update:model-value="updateRow(ri, { description: $event })"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ErrorsTableBlock, ErrorsTableRow } from '~/types/content'

interface Props { block: ErrorsTableBlock }
const props = defineProps<Props>()
const emit = defineEmits<{ update: [block: ErrorsTableBlock] }>()

function updateRow(ri: number, patch: Partial<ErrorsTableRow>) {
  const rows = props.block.props.rows.map((r, i) => i === ri ? { ...r, ...patch } : r)
  emit('update', { ...props.block, props: { ...props.block.props, rows } })
}

function addRow() {
  const rows = [...props.block.props.rows, { code: '', status: 400, description: '' }]
  emit('update', { ...props.block, props: { ...props.block.props, rows } })
}

function removeRow(ri: number) {
  const rows = props.block.props.rows.filter((_, i) => i !== ri)
  emit('update', { ...props.block, props: { ...props.block.props, rows } })
}
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-0.5; }
.add-btn { @apply text-[11px] text-brand-green hover:underline font-medium; }
</style>
