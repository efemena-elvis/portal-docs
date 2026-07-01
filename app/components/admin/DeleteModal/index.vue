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
        <div class="bg-white dark:bg-dark-surface border border-surface-sage-dark dark:border-dark-border rounded-xl shadow-xl w-full max-w-sm p-6">
          <div class="flex items-start gap-3 mb-4">
            <div class="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-none">
              <UiIcon name="trash" size="sm" class="text-red-500" />
            </div>
            <div>
              <h3 class="font-semibold text-ink-primary dark:text-dark-text text-sm">
                Delete {{ target.kind }}
              </h3>
              <p class="text-xs text-ink-muted dark:text-dark-muted mt-0.5">
                <span class="font-medium text-ink-secondary dark:text-dark-text">{{ target.label }}</span>
              </p>
            </div>
          </div>

          <p class="text-sm text-ink-secondary dark:text-dark-muted mb-2">
            <template v-if="target.kind === 'section' && (target.childCount ?? 0) > 0">
              This section contains <strong>{{ target.childCount }} item{{ target.childCount === 1 ? '' : 's' }}</strong>. Deleting it will permanently remove everything inside.
            </template>
            <template v-else-if="target.kind === 'category' && (target.childCount ?? 0) > 0">
              This category contains <strong>{{ target.childCount }} page{{ target.childCount === 1 ? '' : 's' }}</strong>. They will all be deleted.
            </template>
            <template v-else>
              This action cannot be undone.
            </template>
          </p>

          <div class="flex gap-2 mt-5">
            <UiButton variant="outline" size="sm" class="flex-1" @click="$emit('cancel')">
              Cancel
            </UiButton>
            <UiButton
              size="sm"
              class="flex-1 !bg-red-500 hover:!bg-red-600 text-white"
              :loading="loading"
              @click="$emit('confirm')"
            >
              Delete
            </UiButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { AdminItemPath } from '~/composables/useAdminCollection'

interface DeleteTarget {
  kind: 'section' | 'category' | 'page'
  label: string
  childCount?: number
  path: AdminItemPath
}

interface Props {
  target: DeleteTarget | null
  loading?: boolean
}

defineProps<Props>()
defineEmits<{ confirm: []; cancel: [] }>()
</script>
