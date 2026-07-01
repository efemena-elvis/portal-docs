<template>
  <div class="rounded-xl border border-surface-sage dark:border-dark-border bg-white dark:bg-dark-sidebar overflow-hidden mb-8">
    <div class="px-4 py-2.5 bg-surface-off-white/80 dark:bg-dark-surface/60 border-b border-surface-sage dark:border-dark-border">
      <span class="text-[13px] font-semibold text-ink-secondary dark:text-dark-muted">Endpoint</span>
    </div>
    <div class="flex items-center gap-3 px-4 py-3 group">
      <DocsMethodBadge :method="method" />
      <span class="text-ink-muted dark:text-dark-subtle text-sm select-none">—</span>
      <code class="flex-1 font-mono text-[13px] truncate">
        <span class="text-ink-muted dark:text-dark-subtle">{{ BASE_URL_LABEL }}</span><span class="text-ink-primary dark:text-dark-text">{{ displayPath }}</span>
      </code>
      <UiCopyButton
        :text="fullUrl"
        label=""
        class="opacity-0 group-hover:opacity-100 transition-opacity flex-none"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  method: string
  urlPath: string
  baseUrl: string
}>()

const BASE_URL_LABEL = '{{base_url}}'

const displayPath = computed(() => props.urlPath.split('?')[0] ?? props.urlPath)

const fullUrl = computed(() => {
  const base = props.baseUrl.replace(/\/$/, '')
  return `${base}${props.urlPath}`
})
</script>
