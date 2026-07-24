<template>
  <div ref="rootRef">
    <button
      type="button"
      class="w-5 h-5 flex items-center justify-center rounded text-ink-muted dark:text-dark-subtle hover:text-brand-green hover:bg-brand-green/10 transition-colors"
      @click.stop="toggle"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <circle cx="6" cy="2" r="1.2" />
        <circle cx="6" cy="6" r="1.2" />
        <circle cx="6" cy="10" r="1.2" />
      </svg>
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        :style="menuStyle"
        class="fixed z-[9999] min-w-[168px] bg-white dark:bg-dark-surface border border-surface-sage/60 dark:border-dark-border/60 rounded-xl shadow-sm shadow-black/5 py-1.5 text-sm"
      >
        <button
          v-for="item in items"
          :key="item.label"
          type="button"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors"
          :class="item.add
            ? 'text-brand-green hover:bg-brand-green/8 font-medium'
            : item.danger
              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'text-ink-secondary dark:text-dark-muted hover:bg-surface-off-white dark:hover:bg-dark-border hover:text-ink-primary dark:hover:text-dark-text'"
          @click.stop="select(item)"
        >
          <UiIcon v-if="item.icon" :name="item.icon" size="xs" :class="item.add ? 'text-brand-green' : ''" />
          {{ item.label }}
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { IconName } from '~/components/ui/Icon/icons'

export interface ContextMenuItem {
  label: string
  icon?: IconName
  danger?: boolean
  add?: boolean       // renders in brand-green
  action: () => void
}

interface Props {
  items: ContextMenuItem[]
}

defineProps<Props>()

// ── Singleton: only one menu open at a time ───────────────────────────────────
const _openMenuId = ref<string | null>(null)
const menuId = Math.random().toString(36).slice(2)

const isOpen = computed({
  get: () => _openMenuId.value === menuId,
  set: (v: boolean) => { _openMenuId.value = v ? menuId : null },
})

const rootRef = ref<HTMLElement | null>(null)
const menuStyle = ref<Record<string, string>>({})

function toggle() {
  if (!isOpen.value) {
    const rect = rootRef.value?.getBoundingClientRect()
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom
      const menuHeight = 220
      menuStyle.value = spaceBelow < menuHeight
        ? { bottom: `${window.innerHeight - rect.top + 4}px`, left: `${rect.right - 168}px` }
        : { top: `${rect.bottom + 4}px`, left: `${rect.right - 168}px` }
    }
    isOpen.value = true
  } else {
    isOpen.value = false
  }
}

function select(item: ContextMenuItem) {
  isOpen.value = false
  item.action()
}

function onClickOutside(e: MouseEvent) {
  if (isOpen.value && rootRef.value && !rootRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside, true))
onUnmounted(() => document.removeEventListener('click', onClickOutside, true))
</script>
