<template>
  <div class="relative flex gap-6">
    <div class="flex flex-col items-center">
      <div class="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center text-white text-sm font-bold flex-none">
        {{ number }}
      </div>
      <div v-if="!last" class="w-px flex-1 bg-surface-sage dark:bg-dark-border" />
    </div>
    <div class="flex-1" :class="last ? 'pb-2' : 'pb-8'">
      <h2 data-no-toc class="text-lg font-bold text-ink-primary dark:text-dark-text mb-1">{{ title }}</h2>
      <div v-if="description" class="text-sm text-ink-secondary dark:text-dark-muted mb-4 docs-prose" v-html="renderMd(description)" />
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const { render: renderMd } = useMarkdown()

interface Props {
  number: number
  title: string
  description?: string
  last?: boolean
}

withDefaults(defineProps<Props>(), {
  last: false,
})
</script>
