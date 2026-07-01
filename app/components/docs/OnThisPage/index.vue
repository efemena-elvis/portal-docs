<template>
  <aside
    class="hidden xl:block w-[340px] flex-none shrink-0 border-l-0 border-surface-sage dark:border-dark-border pl-8 pr-8 lg:pr-20"
  >
    <div class="sticky top-20 pt-11 max-h-[calc(100dvh-6rem)] overflow-y-auto">
      <div
        class="flex items-center gap-2 text-xs font-bold text-ink-muted dark:text-dark-subtle uppercase tracking-wider mb-4 px-2"
      >
        <UiIcon name="list" size="sm" />
        On this page
      </div>

      <nav v-if="headings.length" aria-label="On this page" class="space-y-1">
        <a
          v-for="heading in headings"
          :key="heading.id"
          :href="`#${heading.id}`"
          class="block px-2 py-1.5 text-sm leading-snug rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/30"
          :class="[
            heading.level === 3 ? 'ml-3' : '',
            activeId === heading.id
              ? 'text-brand-green font-medium bg-brand-green/10 dark:bg-brand-green/10'
              : 'text-ink-secondary dark:text-dark-muted hover:text-ink-primary dark:hover:text-dark-text hover:bg-surface-off-white/60 dark:hover:bg-dark-surface/60',
          ]"
          :aria-current="activeId === heading.id ? 'true' : undefined"
          @click.prevent="scrollTo(heading.id)"
        >
          {{ heading.text }}
        </a>
      </nav>

      <p v-else class="text-xs text-ink-muted dark:text-dark-subtle px-2">
        No headings on this page.
      </p>
    </div>
  </aside>
</template>

<script setup lang="ts">
const { headings, activeId, scan } = usePageHeadings(".docs-content");

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

// Re-scan when route changes
const route = useRoute();
watch(
  () => route.path,
  () => {
    activeId.value = "";
    scan();
  },
  { flush: "post" },
);
</script>
