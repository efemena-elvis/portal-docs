<template>
  <span
    class="inline-flex items-center font-medium"
    :class="[sizeClass, variantClass, roundedClass]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'
export type BadgeSize = 'sm' | 'md'
export type BadgeRounded = 'full' | 'md'

interface Props {
  variant?: BadgeVariant
  size?: BadgeSize
  rounded?: BadgeRounded
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  rounded: 'full',
})

const sizeClass = computed(() => {
  const map = { sm: 'text-[10px] px-2 py-0.5', md: 'text-xs px-2.5 py-1' }
  return map[props.size]
})

const roundedClass = computed(() => (props.rounded === 'full' ? 'rounded-full' : 'rounded-md'))

const variantClass = computed(() => {
  const map = {
    default: 'bg-surface-sage dark:bg-dark-border text-ink-secondary dark:text-dark-muted',
    success: 'bg-brand-green/10 dark:bg-brand-green/15 text-brand-green',
    warning: 'bg-amber-50 dark:bg-amber-900/20 text-yellow-700 dark:text-yellow-400',
    error: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    info: 'bg-brand-sky/10 dark:bg-brand-sky/15 text-brand-blue dark:text-brand-sky',
  }
  return map[props.variant]
})
</script>
