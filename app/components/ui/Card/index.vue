<template>
  <div
    class="overflow-hidden transition-colors"
    :class="[variantClass, paddingClass, radiusClass]"
  >
    <div v-if="$slots.header" class="px-4 py-3 border-b border-surface-sage dark:border-dark-border">
      <slot name="header" />
    </div>
    <div :class="{ 'px-4 py-4': $slots.header || $slots.footer }">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-4 py-3 border-t border-surface-sage dark:border-dark-border">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  radius?: 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'bordered',
  padding: 'md',
  radius: 'xl',
})

const variantClass = computed(() => {
  const map = {
    default: 'bg-white dark:bg-dark-sidebar',
    bordered: 'bg-white dark:bg-dark-sidebar border border-surface-sage dark:border-dark-border',
    elevated: 'bg-white dark:bg-dark-sidebar shadow-lg',
  }
  return map[props.variant]
})

const paddingClass = computed(() => {
  const map = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' }
  return map[props.padding]
})

const radiusClass = computed(() => {
  const map = { md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl' }
  return map[props.radius]
})
</script>
