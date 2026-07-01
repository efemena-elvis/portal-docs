<template>
  <div v-if="errors.length" class="rounded-xl border border-surface-sage dark:border-dark-border overflow-hidden">
    <!-- Header row -->
    <div class="grid grid-cols-[160px_72px_1fr] gap-4 px-4 py-2.5 bg-surface-off-white dark:bg-dark-sidebar border-b border-surface-sage dark:border-dark-border">
      <span class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted dark:text-dark-subtle">Error code</span>
      <span class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted dark:text-dark-subtle">Status</span>
      <span class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted dark:text-dark-subtle">Description</span>
    </div>

    <!-- Error rows -->
    <div
      v-for="(err, i) in errors"
      :key="i"
      class="grid grid-cols-[160px_72px_1fr] gap-4 px-4 py-3.5 items-start"
      :class="i % 2 === 1 ? 'bg-surface-off-white/55 dark:bg-dark-surface/40' : ''"
    >
      <code class="text-[12.5px] font-semibold text-ink-primary dark:text-dark-text break-all leading-relaxed">
        {{ err.code }}
      </code>
      <span
        class="inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-semibold font-mono w-fit"
        :class="statusColor(err.status)"
      >
        {{ err.status }}
      </span>
      <p class="text-[13.5px] text-ink-secondary dark:text-dark-muted leading-relaxed">{{ err.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EndpointError } from '~/types/page'

defineProps<{ errors: EndpointError[] }>()

function statusColor(code: number) {
  if (code >= 500) return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
  if (code >= 400) return 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30'
  if (code >= 200 && code < 300) return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
  return 'text-ink-muted bg-surface-sage dark:bg-dark-border dark:text-dark-subtle'
}
</script>
