<template>
  <nav aria-label="Breadcrumb" class="mb-6">
    <ol class="flex items-center gap-1.5 text-xs text-ink-muted dark:text-dark-subtle">
      <li>
        <NuxtLink to="/" class="hover:text-brand-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/30 rounded">Docs</NuxtLink>
      </li>
      <li aria-hidden="true">/</li>
      <li class="text-ink-secondary dark:text-dark-muted">{{ sectionTitle }}</li>
      <template v-if="subSectionTitle">
        <li aria-hidden="true">/</li>
        <li class="text-ink-secondary dark:text-dark-muted">{{ subSectionTitle }}</li>
      </template>
      <li aria-hidden="true">/</li>
      <li class="text-ink-primary dark:text-dark-text font-medium" aria-current="page">{{ cleanTitle(pageTitle) }}</li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
const { cleanTitle } = useMarkdown()

defineProps<{
  sectionTitle: string
  pageTitle: string
  subSectionTitle?: string
}>()
</script>
