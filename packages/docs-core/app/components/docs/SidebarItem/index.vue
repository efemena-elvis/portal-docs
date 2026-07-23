<template>
  <div class="my-0.5">

    <!-- ── Page link ─────────────────────────────────────────────────────── -->
    <div
      v-if="isPage(item)"
      class="group/item relative rounded-md"
      :class="[active ? 'bg-brand-green/10' : '', item.hidden ? 'opacity-50' : '']"
    >
      <NuxtLink
        :to="item.path"
        class="flex items-center gap-2 px-3 py-1.5 text-[15px] transition-colors min-w-0 rounded-md w-full"
        :class="active
          ? 'text-brand-green font-medium'
          : 'text-ink-muted dark:text-dark-muted hover:bg-surface-off-white dark:hover:bg-dark-surface hover:text-ink-primary dark:hover:text-dark-text'"
        @mouseenter="item.slug && prefetchPage(item.slug)"
        @click="$emit('navigate')"
      >
        <UiIcon v-if="item.icon" :name="item.icon" size="sm" :class="active ? 'text-brand-green' : 'text-ink-muted dark:text-dark-subtle'" />
        <span class="truncate flex-1">{{ item.title }}</span>
        <UiIcon
          v-if="isAdmin && item.hidden"
          name="eyeOff"
          size="xs"
          class="shrink-0 text-ink-muted/50 dark:text-dark-subtle/50"
        />
      </NuxtLink>

      <div
        v-if="isAdmin && item.adminSectionIdx !== undefined"
        class="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity"
        @click.stop
      >
        <AdminContextMenu :items="pageMenuItems(item)" />
      </div>
    </div>

    <!-- ── External link ─────────────────────────────────────────────────── -->
    <a
      v-else-if="isExternal(item)"
      :href="item.href"
      target="_blank"
      rel="noopener"
      class="group flex items-center gap-2 px-3 py-1.5 rounded-md text-[15px] text-ink-muted dark:text-dark-muted hover:bg-surface-off-white dark:hover:bg-dark-surface hover:text-ink-primary dark:hover:text-dark-text transition-colors"
    >
      <UiIcon v-if="item.icon" :name="item.icon" size="sm" class="text-ink-muted dark:text-dark-subtle" />
      <span class="truncate">{{ item.title }}</span>
      <UiIcon name="externalLink" size="xs" class="ml-auto text-ink-muted dark:text-dark-subtle" />
    </a>

    <!-- ── Category (group) ───────────────────────────────────────────────── -->
    <div v-else-if="isGroup(item)" :class="item.hidden ? 'opacity-50' : ''">
      <div class="group/cat relative">
        <button
          type="button"
          class="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[15px] text-ink-muted dark:text-dark-muted hover:bg-surface-off-white dark:hover:bg-dark-surface hover:text-ink-primary dark:hover:text-dark-text transition-colors"
          @click="!isAdmin && (expanded = !expanded)"
        >
          <UiIcon v-if="item.icon" :name="item.icon" size="sm" class="text-ink-muted dark:text-dark-subtle" />
          <span class="truncate flex-1 text-left">{{ item.title }}</span>
          <UiIcon
            v-if="isAdmin && item.hidden"
            name="eyeOff"
            size="xs"
            class="shrink-0 text-ink-muted/50 dark:text-dark-subtle/50"
          />
          <UiIcon
            v-if="!isAdmin"
            name="chevronDown"
            size="xs"
            :class="['text-ink-muted dark:text-dark-subtle transition-transform duration-200', expanded ? 'rotate-180' : '']"
          />
        </button>

        <div
          v-if="isAdmin && item.adminSectionIdx !== undefined"
          class="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/cat:opacity-100 transition-opacity"
          @click.stop
        >
          <AdminContextMenu :items="categoryMenuItems(item)" />
        </div>
      </div>

      <!-- Children — always expanded in admin, collapsible otherwise -->
      <div
        v-show="isAdmin || expanded"
        class="ml-3 mt-0.5 border-l border-surface-sage dark:border-dark-border pl-2"
      >
        <DocsSidebarItem
          v-for="(child, index) in item.children"
          :key="`${item.title}-${index}`"
          :item="child"
          :is-first="index === 0"
          :is-last="index === item.children.length - 1"
          @navigate="$emit('navigate')"
        />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { SidebarItem, SidebarPage, SidebarExternal, SidebarGroup } from '~/types/docs'
import type { ContextMenuItem } from '~/components/admin/ContextMenu/index.vue'
import { prefetchPage } from '~/composables/useEndpointPage'

interface Props {
  item: SidebarItem
  isFirst?: boolean
  isLast?: boolean
}

const props = withDefaults(defineProps<Props>(), { isFirst: false, isLast: false })
const route = useRoute()
defineEmits<{ navigate: [] }>()

const { isAdmin } = useAdmin()
const adminCollection = useAdminCollection()

const active = computed(() => isPage(props.item) && route.path === props.item.path)
const expanded = ref(isGroup(props.item) && hasActiveDescendant(props.item))

function hasActiveDescendant(item: SidebarItem): boolean {
  if (isPage(item)) return route.path === item.path
  if (isGroup(item)) return item.children.some(hasActiveDescendant)
  return false
}

function isPage(item: SidebarItem): item is SidebarPage { return item.type === 'page' }
function isExternal(item: SidebarItem): item is SidebarExternal { return item.type === 'external' }
function isGroup(item: SidebarItem): item is SidebarGroup { return item.type === 'group' }

// ── Menu builders ─────────────────────────────────────────────────────────────

function pageMenuItems(item: SidebarPage): ContextMenuItem[] {
  const sIdx = item.adminSectionIdx!
  const iIdx = item.adminItemIdx!
  const pCatIdx = item.adminParentCategoryIdx
  const path = { sectionIdx: sIdx, itemIdx: iIdx, parentCategoryIdx: pCatIdx }

  const items: ContextMenuItem[] = []

  if (!props.isFirst) {
    items.push({ label: 'Move up', icon: 'chevronUp', action: () => adminCollection.reorderItem(path, 'up') })
  }
  if (!props.isLast) {
    items.push({ label: 'Move down', icon: 'chevronDown', action: () => adminCollection.reorderItem(path, 'down') })
  }
  items.push({ label: 'Move to…', icon: 'arrowRight', action: () => adminCollection.openMoveModal({ kind: 'page', label: item.title, path }) })
  items.push({ label: 'Rename', icon: 'pencil', action: () => adminCollection.openRenameModal({ kind: 'page', label: item.title, path }) })
  items.push({ label: 'Duplicate', icon: 'copy', action: () => adminCollection.duplicatePage(path) })

  if (item.slug) {
    items.push({
      label: item.hidden ? 'Show to integrators' : 'Hide from integrators',
      icon: item.hidden ? 'eye' : 'eyeOff',
      action: () => adminCollection.toggleVisibility('page', item.slug!, !item.hidden),
    })
  }

  items.push({
    label: 'Delete page', icon: 'trash', danger: true,
    action: () => adminCollection.openDeleteModal({ kind: 'page', label: item.title, path }),
  })
  return items
}

function categoryMenuItems(item: SidebarGroup): ContextMenuItem[] {
  const sIdx = item.adminSectionIdx!
  const iIdx = item.adminItemIdx!
  const path = { sectionIdx: sIdx, itemIdx: iIdx }

  const items: ContextMenuItem[] = []

  items.push({
    label: 'Category or Page', icon: 'plus', add: true,
    action: () => adminCollection.openAddItemDialog(sIdx, iIdx),
  })
  if (!props.isFirst) {
    items.push({ label: 'Move up', icon: 'chevronUp', action: () => adminCollection.reorderItem(path, 'up') })
  }
  if (!props.isLast) {
    items.push({ label: 'Move down', icon: 'chevronDown', action: () => adminCollection.reorderItem(path, 'down') })
  }
  items.push({ label: 'Move to…', icon: 'arrowRight', action: () => adminCollection.openMoveModal({ kind: 'category', label: item.title, path }) })
  items.push({ label: 'Rename', icon: 'pencil', action: () => adminCollection.openRenameModal({ kind: 'category', label: item.title, path }) })

  if (item.slug) {
    items.push({
      label: item.hidden ? 'Show to integrators' : 'Hide from integrators',
      icon: item.hidden ? 'eye' : 'eyeOff',
      action: () => adminCollection.toggleVisibility('category', item.slug!, !item.hidden),
    })
  }

  items.push({
    label: 'Delete category', icon: 'trash', danger: true,
    action: () => adminCollection.openDeleteModal({ kind: 'category', label: item.title, childCount: item.children.length, path }),
  })
  return items
}
</script>
