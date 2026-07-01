<template>
  <component
    :is="header ? 'th' : 'td'"
    class="text-left align-top"
    :class="[paddingClass, 'text-ink-secondary dark:text-dark-muted', header ? 'text-xs font-medium' : 'text-sm']"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
interface Props {
  header?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), { header: false, compact: false })

const paddingClass = computed(() => props.compact ? 'py-2.5 px-4' : 'py-3.5 px-4')
</script>
