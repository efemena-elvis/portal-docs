<template>
  <Teleport to="body">
    <Transition
      enter-from-class="opacity-0"
      enter-active-class="transition-opacity duration-150"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="target"
        class="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/40"
        @click.self="$emit('cancel')"
      >
        <div class="bg-white dark:bg-dark-surface border border-surface-sage-dark dark:border-dark-border rounded-xl shadow-xl w-full max-w-sm">
          <div class="px-5 pt-5 pb-3 border-b border-surface-sage dark:border-dark-border">
            <h3 class="font-semibold text-ink-primary dark:text-dark-text text-sm">Move to…</h3>
            <p class="text-xs text-ink-muted dark:text-dark-muted mt-0.5">
              Moving <span class="font-medium text-ink-secondary dark:text-dark-text">{{ target?.label }}</span>
            </p>
          </div>

          <div class="max-h-72 overflow-y-auto py-2">
            <template v-for="(section, sIdx) in destinations" :key="sIdx">
              <!-- Section root -->
              <button
                type="button"
                class="w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-surface-off-white dark:hover:bg-dark-border"
                :class="isCurrentLocation(sIdx, null)
                  ? 'text-ink-muted dark:text-dark-subtle cursor-not-allowed'
                  : 'text-ink-secondary dark:text-dark-muted hover:text-ink-primary dark:hover:text-dark-text'"
                :disabled="isCurrentLocation(sIdx, null)"
                @click="select(sIdx, null)"
              >
                <UiIcon name="folderPlus" size="xs" class="text-ink-muted dark:text-dark-subtle flex-none" />
                <span class="font-medium uppercase tracking-wide text-xs">{{ section.name }}</span>
                <span v-if="isCurrentLocation(sIdx, null)" class="ml-auto text-xs text-ink-muted dark:text-dark-subtle">current</span>
              </button>

              <!-- Categories within section -->
              <template v-for="(cat, cIdx) in section.categories" :key="`${sIdx}-${cIdx}`">
                <button
                  type="button"
                  class="w-full flex items-center gap-2 pl-8 pr-4 py-1.5 text-left text-sm transition-colors hover:bg-surface-off-white dark:hover:bg-dark-border"
                  :class="isCurrentLocation(sIdx, cat.idx)
                    ? 'text-ink-muted dark:text-dark-subtle cursor-not-allowed'
                    : 'text-ink-secondary dark:text-dark-muted hover:text-ink-primary dark:hover:text-dark-text'"
                  :disabled="isCurrentLocation(sIdx, cat.idx)"
                  @click="select(sIdx, cat.idx)"
                >
                  <UiIcon name="chevronRight" size="xs" class="text-ink-muted dark:text-dark-subtle flex-none" />
                  {{ cat.name }}
                  <span v-if="isCurrentLocation(sIdx, cat.idx)" class="ml-auto text-xs text-ink-muted dark:text-dark-subtle">current</span>
                </button>
              </template>
            </template>
          </div>

          <div class="px-5 py-3 border-t border-surface-sage dark:border-dark-border">
            <UiButton variant="outline" size="sm" class="w-full" @click="$emit('cancel')">
              Cancel
            </UiButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { AdminItemPath } from '~/composables/useAdminCollection'

interface MoveTarget {
  kind: 'category' | 'page'
  label: string
  path: AdminItemPath
}

interface SectionDest {
  name: string
  categories: { name: string; idx: number }[]
}

interface Props {
  target: MoveTarget | null
  rawCollection: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  confirm: [toSectionIdx: number, toCategoryIdx: number | null]
  cancel: []
}>()

const destinations = computed<SectionDest[]>(() => {
  if (!props.rawCollection) return []
  return (props.rawCollection.item ?? []).map((section: any) => ({
    name: section.name ?? '',
    categories: (section.item ?? [])
      .map((item: any, idx: number) => ({ item, idx }))
      .filter(({ item }: any) => Array.isArray(item.item))
      .map(({ item, idx }: any) => ({ name: item.name ?? '', idx })),
  }))
})

function isCurrentLocation(sIdx: number, cIdx: number | null): boolean {
  const path = props.target?.path
  if (!path) return false
  if (sIdx !== path.sectionIdx) return false
  if (cIdx === null) return path.parentCategoryIdx === undefined
  return cIdx === path.parentCategoryIdx
}

function select(sIdx: number, cIdx: number | null) {
  if (isCurrentLocation(sIdx, cIdx)) return
  emit('confirm', sIdx, cIdx)
}
</script>
