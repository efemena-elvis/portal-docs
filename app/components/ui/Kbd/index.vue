<template>
  <kbd
    class="inline-flex items-center font-mono border rounded"
    :class="sizeClass"
  >
    <slot />
  </kbd>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), { size: 'sm' })

const sizeClass = computed(() => {
  const map = {
    sm: 'text-[10px] px-1.5 py-0.5 bg-surface-off-white dark:bg-dark-surface border-surface-sage dark:border-dark-border text-ink-muted dark:text-dark-subtle',
    md: 'text-xs px-2 py-1 bg-white dark:bg-dark-surface border-surface-sage dark:border-dark-border text-ink-muted dark:text-dark-subtle',
  }
  return map[props.size]
})
</script>
