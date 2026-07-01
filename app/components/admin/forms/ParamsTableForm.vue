<template>
  <div class="space-y-3">
    <!-- Title -->
    <div>
      <label class="field-label">Section title <span class="font-normal text-ink-muted dark:text-dark-subtle">(optional)</span></label>
      <UiTextarea
        :model-value="block.props.title ?? ''"
        size="sm"
        placeholder="e.g. Request Body, Path Parameters…"
        @update:model-value="emit('update', { ...block, props: { ...block.props, title: $event || undefined } })"
      />
    </div>

    <!-- Show in "On this page" -->
    <UiCheckbox
      :model-value="block.props.showInToc === true"
      @update:model-value="emit('update', { ...block, props: { ...block.props, showInToc: $event } })"
    >Show title in "On this page"</UiCheckbox>

    <div class="flex items-center justify-between">
      <label class="field-label">Parameters</label>
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
            <label class="field-label">Name</label>
            <UiTextarea :model-value="row.name" size="sm" placeholder="param_name"
              @update:model-value="updateRow(ri, { name: $event })" />
          </div>
          <div>
            <label class="field-label">Type</label>
            <UiTextarea :model-value="row.type" size="sm" placeholder="string"
              @update:model-value="updateRow(ri, { type: $event })" />
          </div>
        </div>
        <div class="flex items-center gap-4">
          <UiCheckbox
            :model-value="row.required"
            @update:model-value="updateRow(ri, { required: $event })"
          >Required</UiCheckbox>
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
import type { ParamsTableBlock, ParamsTableRow } from '~/types/content'
interface Props { block: ParamsTableBlock }
const props = defineProps<Props>()
const emit = defineEmits<{ update: [block: ParamsTableBlock] }>()

function updateRow(ri: number, patch: Partial<ParamsTableRow>) {
  const rows = props.block.props.rows.map((r, i) => i === ri ? { ...r, ...patch } : r)
  emit('update', { ...props.block, props: { ...props.block.props, rows } })
}

function addRow() {
  const rows = [...props.block.props.rows, { name: '', type: 'string', required: false, description: '' }]
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
