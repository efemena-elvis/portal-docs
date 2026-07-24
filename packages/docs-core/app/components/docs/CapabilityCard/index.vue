<template>
  <NuxtLink
    :to="href"
    class="group p-5 rounded-lg border border-surface-sage dark:border-dark-border bg-white dark:bg-dark-sidebar hover:border-brand-green/40 dark:hover:border-brand-green/40 hover:bg-surface-off-white dark:hover:bg-dark-border transition-all"
  >
    <div
      class="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3"
      :class="bg"
    >
      {{ icon }}
    </div>
    <h3
      class="text-sm font-semibold text-ink-primary dark:text-dark-text group-hover:text-brand-green transition-colors mb-1"
    >
      {{ title }}
    </h3>
    <p class="text-sm text-ink-muted dark:text-dark-subtle leading-relaxed">
      {{ description }}
    </p>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  icon: string;
  title: string;
  description: string;
  href: string;
  bg?: string;
}

defineProps<Props>();
</script>
