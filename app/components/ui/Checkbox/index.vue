<template>
  <label class="inline-flex items-center gap-2 cursor-pointer select-none group">
    <span class="relative flex-shrink-0">
      <input
        type="checkbox"
        class="sr-only peer"
        :checked="modelValue"
        :disabled="disabled"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <!-- Custom box -->
      <span
        class="flex items-center justify-center w-4 h-4 rounded border transition-all duration-150
          border-surface-sage-dark dark:border-dark-border
          bg-white dark:bg-dark-sidebar
          peer-checked:bg-brand-green peer-checked:border-brand-green
          peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
          group-hover:border-brand-green/60 dark:group-hover:border-brand-green/60
          peer-focus-visible:ring-2 peer-focus-visible:ring-brand-green/30"
      >
        <svg
          v-if="modelValue"
          viewBox="0 0 10 8"
          fill="none"
          class="w-2.5 h-2 text-white"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M1 4l2.5 2.5L9 1" />
        </svg>
      </span>
    </span>
    <span
      v-if="$slots.default"
      class="text-xs text-ink-secondary dark:text-dark-muted leading-none"
      :class="disabled ? 'opacity-50' : ''"
    >
      <slot />
    </span>
  </label>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), { modelValue: false, disabled: false })
defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>
