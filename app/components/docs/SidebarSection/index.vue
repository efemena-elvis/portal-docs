<template>
  <div :class="isFirst ? 'mb-2' : 'mb-2 mt-5'">
    <!-- Section header -->
    <div class="flex items-center group/section" :class="hidden ? 'opacity-50' : ''">
      <div class="flex-1 flex items-center gap-1.5 px-3 py-1.5 select-none">
        <span class="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-dark-subtle">
          {{ title }}
        </span>
        <UiIcon
          v-if="isAdmin && hidden"
          name="eyeOff"
          size="xs"
          class="text-ink-muted/60 dark:text-dark-subtle/60 shrink-0"
          title="Hidden from integrators"
        />
      </div>

      <!-- Admin ⋮ — only visible on hover -->
      <div
        v-if="isAdmin && adminIdx !== undefined"
        class="pr-1 opacity-0 group-hover/section:opacity-100 transition-opacity"
        @click.stop
      >
        <AdminContextMenu :items="sectionMenuItems" />
      </div>
    </div>

    <div class="mt-0.5">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContextMenuItem } from '~/components/admin/ContextMenu/index.vue'

interface Props {
  title: string
  slug?: string
  collapsible?: boolean
  open?: boolean
  hidden?: boolean
  adminIdx?: number
  isFirst?: boolean
  isLast?: boolean
  protected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsible: true,
  open: true,
  hidden: false,
  isFirst: false,
  isLast: false,
  protected: false,
})

const { isAdmin } = useAdmin()
const adminCollection = useAdminCollection()

const sectionMenuItems = computed<ContextMenuItem[]>(() => {
  if (props.adminIdx === undefined) return []
  const idx = props.adminIdx
  const items: ContextMenuItem[] = []

  items.push({
    label: 'Category or Page', icon: 'plus', add: true,
    action: () => adminCollection.openAddItemDialog(idx, null),
  })

  if (!props.protected) {
    if (!props.isFirst) {
      items.push({ label: 'Move up', icon: 'chevronUp', action: () => adminCollection.reorderSection(idx, 'up') })
    }
    if (!props.isLast) {
      items.push({ label: 'Move down', icon: 'chevronDown', action: () => adminCollection.reorderSection(idx, 'down') })
    }
  }

  items.push({
    label: 'Rename', icon: 'pencil',
    action: () => adminCollection.openRenameModal({ kind: 'section', label: props.title, path: { sectionIdx: idx } }),
  })

  if (props.slug) {
    items.push({
      label: props.hidden ? 'Show to integrators' : 'Hide from integrators',
      icon: props.hidden ? 'eye' : 'eyeOff',
      action: () => adminCollection.toggleVisibility('section', props.slug!, !props.hidden),
    })
  }

  if (!props.protected) {
    items.push({
      label: 'Delete section', icon: 'trash', danger: true,
      action: () => {
        const raw = adminCollection.rawCollection.value
        const section = raw?.item?.[idx]
        const childCount = (section?.item ?? []).length
        adminCollection.openDeleteModal({ kind: 'section', label: props.title, childCount, path: { sectionIdx: idx } })
      },
    })
  }

  return items
})
</script>
