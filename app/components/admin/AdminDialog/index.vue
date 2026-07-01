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
        v-if="show"
        class="fixed inset-0 z-[9990] flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.35)"
        @click.self="$emit('cancel')"
      >
        <Transition
          enter-from-class="opacity-0 scale-95"
          enter-active-class="transition-all duration-150"
          enter-to-class="opacity-100 scale-100"
          leave-from-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="show"
            class="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <!-- Header -->
            <div class="px-6 pt-6 pb-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h2 class="text-base font-semibold text-ink-primary dark:text-dark-text leading-snug">
                    {{ title }}
                  </h2>
                  <p v-if="description" class="text-sm text-ink-muted dark:text-dark-muted mt-0.5">
                    {{ description }}
                  </p>
                </div>
                <button
                  type="button"
                  class="w-7 h-7 flex items-center justify-center rounded-lg text-ink-muted dark:text-dark-subtle hover:bg-surface-off-white dark:hover:bg-dark-border hover:text-ink-primary dark:hover:text-dark-text transition-colors flex-none mt-0.5"
                  @click="$emit('cancel')"
                >
                  <UiIcon name="close" size="sm" />
                </button>
              </div>
            </div>

            <!-- Content slot -->
            <div class="px-6 pb-2">
              <slot />
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 flex gap-2.5 justify-end border-t border-surface-sage/50 dark:border-dark-border/50 mt-4">
              <UiButton variant="outline" size="md" @click="$emit('cancel')">
                Cancel
              </UiButton>
              <UiButton
                variant="primary"
                size="md"
                :loading="loading"
                :disabled="confirmDisabled || loading"
                @click="$emit('confirm')"
              >
                {{ confirmLabel }}
              </UiButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  title: string
  description?: string
  confirmLabel?: string
  confirmDisabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  confirmLabel: 'Create',
  confirmDisabled: false,
  loading: false,
})

defineEmits<{ confirm: []; cancel: [] }>()
</script>
