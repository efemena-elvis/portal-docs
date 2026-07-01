<template>
  <footer class="mt-16 pt-8 border-t border-surface-sage dark:border-dark-border">
    <!-- Prev / Next -->
    <div v-if="prev || next" class="flex items-stretch gap-3 mb-10">
      <NuxtLink
        v-if="prev"
        :to="prev.href"
        class="flex-1 group flex flex-col gap-1 p-4 rounded-lg border border-surface-sage dark:border-dark-border hover:border-brand-green/50 dark:hover:border-brand-green/50 bg-white dark:bg-dark-sidebar hover:bg-surface-off-white dark:hover:bg-dark-border transition-all"
      >
        <div class="flex items-center gap-1.5 text-xs text-ink-muted dark:text-dark-subtle group-hover:text-brand-green transition-colors">
          <UiIcon name="arrowLeft" size="xs" />
          Previous
        </div>
        <UiText variant="subheading" class="group-hover:text-brand-green transition-colors truncate">
          {{ prev.label }}
        </UiText>
      </NuxtLink>
      <div v-else class="flex-1" />

      <NuxtLink
        v-if="next"
        :to="next.href"
        class="flex-1 group flex flex-col gap-1 p-4 rounded-lg border border-surface-sage dark:border-dark-border hover:border-brand-green/50 dark:hover:border-brand-green/50 bg-white dark:bg-dark-sidebar hover:bg-surface-off-white dark:hover:bg-dark-border transition-all text-right"
      >
        <div class="flex items-center justify-end gap-1.5 text-xs text-ink-muted dark:text-dark-subtle group-hover:text-brand-green transition-colors">
          Next
          <UiIcon name="arrowRight" size="xs" />
        </div>
        <UiText variant="subheading" class="group-hover:text-brand-green transition-colors truncate">
          {{ next.label }}
        </UiText>
      </NuxtLink>
      <div v-else class="flex-1" />
    </div>

    <!-- Support / edit / last updated -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-ink-muted dark:text-dark-subtle">
      <div class="flex items-center gap-4">
        <a
          href="mailto:developers@vesicash.com"
          class="hover:text-brand-blue dark:hover:text-brand-sky transition-colors"
        >
          Contact support
        </a>
        <a
          href="https://vesicash.com"
          target="_blank"
          rel="noopener"
          class="hover:text-brand-blue dark:hover:text-brand-sky transition-colors"
        >
          vesicash.com ↗
        </a>
      </div>
      <div>
        Last updated: <span class="font-medium text-ink-secondary dark:text-dark-muted">{{ today }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
interface NavLink {
  label: string
  href: string
}

interface Props {
  prev?: NavLink | null
  next?: NavLink | null
}

withDefaults(defineProps<Props>(), {
  prev: null,
  next: null,
})

const today = new Date().toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
</script>
