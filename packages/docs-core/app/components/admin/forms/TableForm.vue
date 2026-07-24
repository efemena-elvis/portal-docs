<template>
  <div class="space-y-4">
    <!-- Header row -->
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <label class="field-label">Headers</label>
        <button type="button" class="add-btn" @click="addColumn">+ Column</button>
      </div>
      <div class="flex gap-2">
        <div
          v-for="(hdr, ci) in headers"
          :key="ci"
          class="flex-1 flex items-center gap-1"
        >
          <UiTextarea :model-value="hdr.text" size="sm" placeholder="Header"
            @update:model-value="updateHeader(ci, $event)" />
          <button type="button" class="shrink-0 text-ink-muted hover:text-red-500 transition-colors"
            @click="removeColumn(ci)">
            <UiIcon name="close" size="xs" />
          </button>
        </div>
      </div>
    </div>

    <!-- Rows -->
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <label class="field-label">Rows</label>
        <button type="button" class="add-btn" @click="addRow">+ Row</button>
      </div>
      <div class="space-y-2">
        <div v-for="(row, ri) in rows" :key="ri">
          <!-- Cell inputs row -->
          <div class="flex gap-1.5 items-center">
            <div class="flex-1 grid gap-1" :style="{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }">
              <UiTextarea
                v-for="(cell, ci) in row.cells"
                :key="ci"
                :model-value="cell.text"
                size="sm"
                :placeholder="`Row ${ri+1} col ${ci+1}`"
                @update:model-value="updateCell(ri, ci, $event)"
              />
            </div>
            <!-- Style toggle -->
            <button
              type="button"
              class="shrink-0 transition-colors"
              :class="expandedRows.has(ri) ? 'text-brand-green' : 'text-ink-muted hover:text-brand-green'"
              :title="expandedRows.has(ri) ? 'Hide style options' : 'Style this row'"
              @click="toggleRowStyle(ri)"
            >
              <UiIcon name="sliders" size="xs" />
            </button>
            <button type="button" class="shrink-0 text-ink-muted hover:text-red-500 transition-colors"
              @click="removeRow(ri)">
              <UiIcon name="trash" size="xs" />
            </button>
          </div>

          <!-- Expanded style panel -->
          <div
            v-if="expandedRows.has(ri)"
            class="mt-1.5 ml-0.5 pl-3 border-l-2 border-brand-green/30 space-y-2"
          >
            <!-- Per-cell styling -->
            <div class="grid gap-2" :style="{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }">
              <div v-for="(cell, ci) in row.cells" :key="ci" class="space-y-1">
                <p class="text-[9px] font-medium text-ink-muted dark:text-dark-subtle uppercase tracking-wide">
                  {{ headers[ci]?.text || `Col ${ci + 1}` }}
                </p>
                <UiTextarea
                  :model-value="cell.meta?.class ?? ''"
                  size="sm"
                  placeholder="Tailwind class"
                  @update:model-value="updateCellMeta(ri, ci, 'class', $event)"
                />
                <UiTextarea
                  :model-value="cell.meta?.style ?? ''"
                  size="sm"
                  placeholder="Inline style"
                  @update:model-value="updateCellMeta(ri, ci, 'style', $event)"
                />
              </div>
            </div>

            <!-- Row-level styling -->
            <div class="flex gap-2 pt-1 border-t border-surface-sage dark:border-dark-border">
              <div class="flex-1 space-y-1">
                <p class="text-[9px] font-medium text-ink-muted dark:text-dark-subtle uppercase tracking-wide">Row class</p>
                <UiTextarea
                  :model-value="row.meta?.class ?? ''"
                  size="sm"
                  placeholder="e.g. bg-surface-pale-blue"
                  @update:model-value="updateRowMeta(ri, 'class', $event)"
                />
              </div>
              <div class="flex-1 space-y-1">
                <p class="text-[9px] font-medium text-ink-muted dark:text-dark-subtle uppercase tracking-wide">Row style</p>
                <UiTextarea
                  :model-value="row.meta?.style ?? ''"
                  size="sm"
                  placeholder="e.g. background: #f5f9ff"
                  @update:model-value="updateRowMeta(ri, 'style', $event)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Inline formatting tip -->
    <p class="text-[10px] text-ink-muted dark:text-dark-subtle">
      Cell text supports markdown —
      <code class="font-mono text-brand-blue dark:text-brand-sky">**bold**</code>
      <code class="font-mono text-brand-blue dark:text-brand-sky ml-1">`code`</code>
      <code class="font-mono text-brand-blue dark:text-brand-sky ml-1">[link](url)</code>
      <code class="font-mono text-brand-blue dark:text-brand-sky ml-1">&lt;span style="color:#hex"&gt;word&lt;/span&gt;</code>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { TableBlock, TableCellData, TableRowData } from '~/types/content'

interface Props { block: TableBlock }
const props = defineProps<Props>()
const emit = defineEmits<{ update: [block: TableBlock] }>()

const headers = computed(() => props.block.props.headers)
const rows = computed(() => props.block.props.rows)

const expandedRows = ref(new Set<number>())
function toggleRowStyle(ri: number) {
  const next = new Set(expandedRows.value)
  next.has(ri) ? next.delete(ri) : next.add(ri)
  expandedRows.value = next
}

function emit2(h: TableCellData[], r: TableRowData[]) {
  emit('update', { ...props.block, props: { ...props.block.props, headers: h, rows: r } })
}

function updateHeader(ci: number, text: string) {
  emit2(headers.value.map((hdr, i) => i === ci ? { ...hdr, text } : hdr), rows.value)
}

function addColumn() {
  emit2(
    [...headers.value, { text: 'Column' }],
    rows.value.map(row => ({ ...row, cells: [...row.cells, { text: '' }] }))
  )
}

function removeColumn(ci: number) {
  emit2(
    headers.value.filter((_, i) => i !== ci),
    rows.value.map(row => ({ ...row, cells: row.cells.filter((_, i) => i !== ci) }))
  )
}

function updateCell(ri: number, ci: number, text: string) {
  emit2(headers.value, rows.value.map((row, i) => i !== ri ? row : {
    ...row,
    cells: row.cells.map((cell, j) => j === ci ? { ...cell, text } : cell),
  }))
}

function updateCellMeta(ri: number, ci: number, key: 'class' | 'style', value: string) {
  emit2(headers.value, rows.value.map((row, i) => i !== ri ? row : {
    ...row,
    cells: row.cells.map((cell, j) => j !== ci ? cell : {
      ...cell,
      meta: { ...cell.meta, [key]: value || undefined },
    }),
  }))
}

function updateRowMeta(ri: number, key: 'class' | 'style', value: string) {
  emit2(headers.value, rows.value.map((row, i) => i !== ri ? row : {
    ...row,
    meta: { ...row.meta, [key]: value || undefined },
  }))
}

function addRow() {
  emit2(headers.value, [...rows.value, { cells: headers.value.map(() => ({ text: '' })) }])
}

function removeRow(ri: number) {
  emit2(headers.value, rows.value.filter((_, i) => i !== ri))
}
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted; }
.add-btn { @apply text-[11px] text-brand-green hover:underline font-medium; }
</style>
