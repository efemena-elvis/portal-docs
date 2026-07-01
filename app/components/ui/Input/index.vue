<template>
  <div class="relative flex items-center w-full">
    <span v-if="$slots.prefix || icon" class="absolute left-3 text-ink-muted dark:text-dark-subtle">
      <slot name="prefix">
        <UiIcon v-if="icon" :name="icon" size="sm" />
      </slot>
    </span>
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      class="w-full text-sm bg-white dark:bg-dark-sidebar text-ink-primary dark:text-dark-text placeholder:text-ink-muted dark:placeholder:text-dark-subtle border rounded-lg transition-colors focus:outline-none disabled:opacity-60"
      :class="[sizeClass, paddingClass, errorClass]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="clearable && modelValue"
      type="button"
      class="absolute right-3 text-ink-muted dark:text-dark-subtle hover:text-ink-primary dark:hover:text-dark-text"
      @click="$emit('update:modelValue', '')"
    >
      <UiIcon name="close" size="xs" />
    </button>
    <span v-else-if="$slots.suffix" class="absolute right-3 text-ink-muted dark:text-dark-subtle">
      <slot name="suffix" />
    </span>
  </div>
</template>

<script setup lang="ts">
import type { IconName } from '~/components/ui/Icon/icons'

interface Props {
  modelValue?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  error?: boolean | string
  size?: 'sm' | 'md' | 'lg'
  icon?: IconName
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  size: 'md',
})

defineEmits<{ 'update:modelValue': [value: string] }>()

const slots = useSlots()

const sizeClass = computed(() => {
  const map = { sm: 'h-8', md: 'h-10', lg: 'h-12' }
  return map[props.size]
})

const hasLeft = computed(() => !!slots.prefix || !!props.icon)
const hasRight = computed(() => props.clearable || !!slots.suffix)

const paddingClass = computed(() => {
  const left = hasLeft.value ? 'pl-9' : 'pl-3'
  const right = hasRight.value ? 'pr-9' : 'pr-3'
  return `${left} ${right}`
})

const errorClass = computed(() =>
  props.error
    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30'
    : 'border-surface-sage-dark dark:border-dark-border hover:border-brand-green/50 dark:hover:border-brand-green/50 focus:border-brand-green dark:focus:border-brand-green'
)
</script>
