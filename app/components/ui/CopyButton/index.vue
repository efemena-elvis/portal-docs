<template>
  <button
    type="button"
    class="inline-flex items-center gap-1 text-xs transition-colors"
    :class="variantClass"
    @click="copy(text)"
  >
    <UiIcon :name="copied ? 'check' : 'copy'" size="sm" />
    <span>{{ copied ? 'Copied!' : label }}</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  text: string
  label?: string
  variant?: 'default' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Copy',
  variant: 'default',
})

const { copied, copy } = useClipboard()

const variantClass = computed(() => {
  return props.variant === 'dark'
    ? 'text-white/60 hover:text-white/90'
    : 'text-ink-muted dark:text-dark-subtle hover:text-brand-blue dark:hover:text-brand-sky'
})
</script>
