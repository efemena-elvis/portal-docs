<template>
  <div class="block-editor-list space-y-0.5">
    <!-- Insert at top -->
    <AdminBlockInsertButton @click="openPalette(0)" />

    <template v-for="(block, idx) in blocks" :key="block.id">
      <!-- data-block-id is used by AdminEditorPanel.scrollToBlock() -->
      <div :data-block-id="block.id">
        <AdminBlockEditorCard
          :block="block"
          :is-first="idx === 0"
          :is-last="idx === blocks.length - 1"
          @move-up="moveBlock(idx, -1)"
          @move-down="moveBlock(idx, 1)"
          @delete="deleteBlock(idx)"
          @toggle-hidden="toggleHidden(idx)"
        >
          <AdminBlockForm :block="block" @update="updateBlock(idx, $event)" />
        </AdminBlockEditorCard>
      </div>

      <!-- Insert after this block -->
      <AdminBlockInsertButton @click="openPalette(idx + 1)" />
    </template>

    <!-- Empty state -->
    <div
      v-if="blocks.length === 0"
      class="py-16 text-center border-2 border-dashed border-surface-sage dark:border-dark-border rounded-xl"
    >
      <p class="text-sm text-ink-muted dark:text-dark-subtle mb-3">No blocks yet</p>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-brand-green/30 text-brand-green hover:bg-brand-green/10 transition-colors"
        @click="openPalette(0)"
      >
        <UiIcon name="plus" size="sm" />
        Add first block
      </button>
    </div>
  </div>

  <!-- Block palette modal -->
  <AdminBlockPalette
    :open="paletteOpen"
    @close="paletteOpen = false"
    @select="onPaletteSelect"
  />
</template>

<script setup lang="ts">
import type { Block } from '~/types/content'
import { createDefaultBlock } from '~/utils/blockDefaults'

const { blocks, scheduleSave } = usePageEditor()

const paletteOpen = ref(false)
const paletteInsertIdx = ref(0)

function openPalette(atIdx: number) {
  paletteInsertIdx.value = atIdx
  paletteOpen.value = true
}

function onPaletteSelect(type: Block['type']) {
  paletteOpen.value = false
  const newBlock = createDefaultBlock(type)
  blocks.value.splice(paletteInsertIdx.value, 0, newBlock)
  scheduleSave()
}

function moveBlock(idx: number, dir: -1 | 1) {
  const target = idx + dir
  if (target < 0 || target >= blocks.value.length) return
  const arr: Block[] = [...blocks.value]
  const tmp = arr[idx]!
  arr[idx] = arr[target]!
  arr[target] = tmp
  blocks.value = arr
  scheduleSave()
}

function deleteBlock(idx: number) {
  blocks.value.splice(idx, 1)
  scheduleSave()
}

function toggleHidden(idx: number) {
  const b = blocks.value[idx]
  if (!b) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks.value[idx] = { ...b, meta: { ...b.meta, hidden: !b.meta.hidden } } as any
  scheduleSave()
}

function updateBlock(idx: number, updated: Block) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks.value[idx] = updated as any
  scheduleSave()
}

</script>
