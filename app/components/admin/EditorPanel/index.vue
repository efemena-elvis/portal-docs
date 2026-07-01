<template>
  <!-- Backdrop: visual only, doesn't block clicks so the live preview stays usable -->
  <Transition name="panel-backdrop">
    <div
      v-if="open"
      class="fixed inset-0 z-40 bg-ink-primary/20 dark:bg-black/40 pointer-events-none"
    />
  </Transition>

  <!-- Slide panel -->
  <Transition name="panel-slide">
    <div
      v-if="open"
      class="fixed top-0 right-0 h-screen w-full sm:max-w-[480px] z-50 flex flex-col bg-white dark:bg-dark-surface border-l border-surface-sage dark:border-dark-border shadow-2xl"
    >
      <!-- ── Fixed header ───────────────────────────────────────────── -->
      <div class="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-surface-sage dark:border-dark-border">
        <!-- Title -->
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <UiIcon name="pencil" size="xs" class="text-ink-muted dark:text-dark-muted shrink-0" />
          <span class="text-sm font-semibold text-ink-primary dark:text-dark-text truncate">
            {{ title }}
          </span>
        </div>

        <!-- Save status -->
        <Transition name="fade" mode="out-in">
          <span
            v-if="saveStatus === 'saving'"
            key="saving"
            class="shrink-0 flex items-center gap-1 text-xs text-ink-muted dark:text-dark-subtle"
          >
            <UiIcon name="loader" size="xs" class="animate-spin" />
            Saving…
          </span>
          <span
            v-else-if="saveStatus === 'saved'"
            key="saved"
            class="shrink-0 flex items-center gap-1 text-xs text-brand-green"
          >
            <UiIcon name="check" size="xs" />
            Draft saved
          </span>
          <span
            v-else-if="saveStatus === 'error'"
            key="error"
            class="shrink-0 text-xs text-red-400"
          >
            Save failed —
            <button type="button" class="underline hover:no-underline" @click="$emit('retry-save')">retry</button>
          </span>
        </Transition>

        <!-- Exit -->
        <button
          type="button"
          class="shrink-0 p-1.5 rounded-md text-ink-muted dark:text-dark-muted hover:text-ink-primary dark:hover:text-dark-text hover:bg-surface-sage dark:hover:bg-dark-border transition-colors"
          title="Close editor"
          @click="$emit('exit')"
        >
          <UiIcon name="close" size="sm" />
        </button>
      </div>

      <!-- ── Scrollable body (slotted so each page type provides its editors) ── -->
      <div ref="listEl" class="flex-1 overflow-y-auto p-4">
        <slot />
      </div>

      <!-- ── Fixed footer ──────────────────────────────────────────── -->
      <div class="shrink-0 flex items-center gap-2 px-4 py-3 border-t border-surface-sage dark:border-dark-border">
        <p class="flex-1 text-xs text-ink-muted dark:text-dark-subtle">
          <template v-if="isDirty">Unpublished changes</template>
          <template v-else>No unpublished changes</template>
        </p>

        <button
          v-if="isDirty"
          type="button"
          class="px-3 py-1.5 rounded-md text-xs font-medium text-ink-secondary dark:text-dark-muted hover:text-ink-primary dark:hover:text-dark-text hover:bg-surface-sage dark:hover:bg-dark-border transition-colors disabled:opacity-50"
          :disabled="isSaving"
          @click="$emit('discard')"
        >
          Discard
        </button>

        <button
          v-if="isDirty"
          type="button"
          class="px-3 py-1.5 rounded-md text-xs font-medium bg-brand-green text-white hover:bg-brand-green/90 disabled:opacity-60 transition-colors"
          :disabled="isSaving"
          @click="$emit('publish')"
        >
          Publish
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { SaveStatus } from '~/composables/usePageEditor'

interface Props {
  open: boolean
  title: string
  saveStatus: SaveStatus
  isDirty: boolean
  isSaving: boolean
}

defineProps<Props>()
defineEmits<{
  exit: []
  discard: []
  publish: []
  'retry-save': []
}>()

const listEl = ref<HTMLElement | null>(null)

function scrollToBlock(blockId: string) {
  // Wait for card expansion animation to begin before measuring scroll position
  setTimeout(() => {
    const el = listEl.value?.querySelector(`[data-block-id="${blockId}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 120)
}

defineExpose({ scrollToBlock })
</script>

<style scoped>
.panel-backdrop-enter-active,
.panel-backdrop-leave-active { transition: opacity 0.25s ease; }
.panel-backdrop-enter-from,
.panel-backdrop-leave-to { opacity: 0; }

.panel-slide-enter-active,
.panel-slide-leave-active { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.panel-slide-enter-from,
.panel-slide-leave-to { transform: translateX(100%); }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
