<template>
  <div class="relative inline-flex items-center">
    <select
      :value="modelValue"
      :disabled="disabled"
      class="appearance-none text-xs font-medium bg-white dark:bg-dark-surface border border-surface-sage-dark dark:border-dark-border text-ink-primary dark:text-dark-text rounded-lg pl-2.5 pr-8 py-1.5 transition-colors focus:outline-none hover:border-brand-green/50 dark:hover:border-brand-green/50 focus:border-brand-green dark:focus:border-brand-green disabled:opacity-60"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
    </select>
    <UiIcon name="chevronDown" size="xs" class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted dark:text-dark-subtle" />
  </div>
</template>

<script setup lang="ts">
interface SelectOption {
  id: string
  label: string
}

interface Props {
  modelValue?: string
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
})

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
