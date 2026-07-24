<template>
  <aside
    ref="sidebarEl"
    id="docs-sidebar"
    role="dialog"
    aria-modal="true"
    aria-label="Main navigation"
    :class="[
      'fixed lg:sticky top-14 lg:top-20 left-0 z-30',
      'h-[calc(100dvh-3.5rem)] lg:h-[calc(100dvh-5rem)]',
      'w-[300px] lg:w-[350px] flex-none',
      'bg-white dark:bg-dark-bg border-r-0 border-surface-sage dark:border-dark-border',
      'overflow-y-auto overscroll-contain',
      'transition-transform duration-300 ease-in-out lg:transition-none',
      'lg:transform-none',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <div class="pl-8 lg:pl-20 pr-5 pt-6 pb-8 min-h-full flex flex-col">
      <!-- Skeleton while nav loads -->
      <div v-if="loading" class="flex-1 space-y-6 pr-2">
        <div v-for="s in 3" :key="s" class="space-y-2">
          <div class="h-3 w-24 rounded bg-surface-sage dark:bg-dark-border animate-pulse mb-3" />
          <div v-for="i in (s === 2 ? 4 : 3)" :key="i" class="flex items-center gap-2 px-2 py-1">
            <div class="h-2 rounded bg-surface-sage dark:bg-dark-border animate-pulse"
              :style="{ width: `${55 + (i * 13) % 35}%` }"
            />
          </div>
        </div>
      </div>

      <div v-else class="flex-1">
        <DocsSidebarSection
          v-for="(section, index) in sections"
          :key="section.title"
          :title="section.title"
          :slug="section.slug"
          :hidden="section.hidden"
          :collapsible="section.collapsible"
          :open="section.open"
          :admin-idx="section.adminIdx"
          :is-first="index === 0"
          :is-last="index === sections.length - 1"
          :protected="index === 0"
        >
          <DocsSidebarItem
            v-for="(item, itemIndex) in section.items"
            :key="`${section.title}-${itemIndex}`"
            :item="item"
            :is-first="itemIndex === 0"
            :is-last="itemIndex === section.items.length - 1"
            @navigate="$emit('close')"
          />
        </DocsSidebarSection>
      </div>

      <!-- Admin: Create section button -->
      <template v-if="isAdmin">
        <div class="border-t border-surface-sage dark:border-dark-border mt-4 pt-3">
          <button
            type="button"
            class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-ink-muted dark:text-dark-muted hover:text-brand-green hover:bg-brand-green/10 transition-colors w-full"
            @click="adminCollection.openCreateSectionDialog()"
          >
            <UiIcon name="folderPlus" size="sm" />
            Create section
          </button>
        </div>
      </template>
      <template v-else>
        <DocsSidebarFooter class="mt-8" />
      </template>
    </div>
  </aside>

  <!-- Mobile backdrop -->
  <Transition
    enter-from-class="opacity-0" enter-active-class="transition-opacity"
    enter-to-class="opacity-100" leave-from-class="opacity-100"
    leave-active-class="transition-opacity" leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-20 bg-black/20 lg:hidden"
      aria-hidden="true"
      @click="$emit('close')"
    />
  </Transition>

  <!-- ── Delete confirmation modal ────────────────────────────────────────── -->
  <AdminDeleteModal
    :target="adminCollection.deleteTarget.value"
    :loading="adminCollection.saving.value"
    @confirm="confirmDelete"
    @cancel="adminCollection.closeModals()"
  />

  <!-- ── Move to modal ────────────────────────────────────────────────────── -->
  <AdminMoveToModal
    :target="adminCollection.moveTarget.value"
    :raw-collection="adminCollection.rawCollection.value"
    @confirm="confirmMove"
    @cancel="adminCollection.closeModals()"
  />

</template>

<script lang="ts">
// Module-level — survives component remounts between navigations
let _savedSidebarScroll = 0
</script>

<script setup lang="ts">
import type { SidebarSection } from '~/types/docs'

interface Props {
  sections: SidebarSection[]
  open?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), { open: false, loading: false })
defineEmits<{ close: [] }>()

const { isAdmin } = useAdmin()
const adminCollection = useAdminCollection()

// ── Persist sidebar scroll across navigations (survives remounts) ─────────────
// Module-level so the value outlives any component remount cycle.
const sidebarEl = ref<HTMLElement | null>(null)

function saveSidebarScroll() {
  if (sidebarEl.value) _savedSidebarScroll = sidebarEl.value.scrollTop
}

function restoreSidebarScroll() {
  if (sidebarEl.value) sidebarEl.value.scrollTop = _savedSidebarScroll
}

onMounted(() => {
  // Restore on (re)mount — covers the case where the component remounts on navigation
  nextTick(restoreSidebarScroll)
  sidebarEl.value?.addEventListener('scroll', saveSidebarScroll, { passive: true })
})

onUnmounted(() => {
  sidebarEl.value?.removeEventListener('scroll', saveSidebarScroll)
})

async function confirmDelete() {
  const target = adminCollection.deleteTarget.value
  if (!target) return
  if (target.kind === 'section') {
    await adminCollection.deleteSection(target.path.sectionIdx)
  } else {
    await adminCollection.deleteItem(target.path)
  }
  adminCollection.closeModals()
}

async function confirmMove(toSectionIdx: number, toCategoryIdx: number | null) {
  const target = adminCollection.moveTarget.value
  if (!target) return
  await adminCollection.moveItem(target.path, toSectionIdx, toCategoryIdx)
  adminCollection.closeModals()
}
</script>
