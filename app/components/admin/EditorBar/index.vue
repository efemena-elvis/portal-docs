<template>
  <div
    class="sticky top-14 lg:top-20 z-30 px-4 py-2 mb-6 flex items-center gap-3 rounded-xl bg-brand-navy/95 dark:bg-dark-sidebar/95 backdrop-blur border border-white/10 text-white"
  >
    <!-- Mode label -->
    <span class="inline-flex items-center gap-1.5 text-xs font-medium text-white/70">
      <UiIcon name="pencil" size="xs" />
      Editing
    </span>

    <div class="flex-1" />

    <!-- Save status -->
    <Transition name="fade-status" mode="out-in">
      <span
        v-if="saveStatus === 'saving'"
        key="saving"
        class="text-xs text-white/60 flex items-center gap-1"
      >
        <UiIcon name="loader" size="xs" class="animate-spin" />
        Saving…
      </span>
      <span
        v-else-if="saveStatus === 'saved'"
        key="saved"
        class="text-xs text-brand-green flex items-center gap-1"
      >
        <UiIcon name="check" size="xs" />
        Draft saved
      </span>
      <span
        v-else-if="saveStatus === 'clean'"
        key="clean"
        class="text-xs text-white/50"
      >
        No unpublished changes
      </span>
      <span
        v-else-if="saveStatus === 'error'"
        key="error"
        class="text-xs text-red-400 flex items-center gap-1.5"
      >
        Save failed
        <button
          type="button"
          class="underline hover:no-underline"
          @click="$emit('retry-save')"
        >retry</button>
      </span>
    </Transition>

    <!-- Actions -->
    <div class="flex items-center gap-2 pl-3 border-l border-white/10">
      <!-- Discard -->
      <button
        v-if="isDirty"
        type="button"
        class="px-3 py-1.5 rounded-md text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        :disabled="isSaving"
        @click="$emit('discard')"
      >
        Discard
      </button>

      <!-- Publish this page -->
      <button
        v-if="isDirty"
        type="button"
        class="px-3 py-1.5 rounded-md text-xs font-medium bg-brand-green text-white hover:bg-brand-green/90 disabled:opacity-60 transition-colors"
        :disabled="isSaving"
        @click="$emit('publish')"
      >
        Publish
      </button>

      <!-- Exit edit mode -->
      <button
        type="button"
        class="px-3 py-1.5 rounded-md text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        @click="$emit('exit')"
      >
        Exit editor
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SaveStatus } from '~/composables/usePageEditor'

interface Props {
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
</script>

<style scoped>
.fade-status-enter-active,
.fade-status-leave-active {
  transition: opacity 0.15s ease;
}
.fade-status-enter-from,
.fade-status-leave-to {
  opacity: 0;
}
</style>
