<template>
  <header
    class="fixed top-0 inset-x-0 z-40 h-14 lg:h-20 bg-white/95 dark:bg-dark-bg/95 backdrop-blur border-b border-surface-sage dark:border-dark-border"
  >
    <div class="h-full px-8 lg:px-20 flex items-center gap-4">
      <!-- Mobile menu toggle -->
      <button
        type="button"
        class="lg:hidden w-8 h-8 flex items-center justify-center text-ink-secondary dark:text-dark-muted hover:text-ink-primary dark:hover:text-dark-text rounded-md hover:bg-surface-off-white dark:hover:bg-dark-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/30"
        :aria-label="
          sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'
        "
        :aria-expanded="sidebarOpen"
        aria-controls="docs-sidebar"
        @click="$emit('toggle-sidebar')"
      >
        <UiIcon name="menu" size="md" />
      </button>

      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2.5 min-w-0 mr-2">
        <template v-if="logoImage">
          <img
            :src="logoImage"
            alt="Vesicash"
            class="h-9 w-auto object-contain flex-none dark:hidden"
          />
          <img
            :src="logoDarkImage || logoImage"
            alt="Vesicash"
            class="h-9 w-auto object-contain flex-none hidden dark:block"
          />
        </template>
        <template v-else>
          <div
            class="w-7 h-7 rounded-lg bg-brand-navy flex items-center justify-center flex-none"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7L5.5 10.5L12 3.5"
                stroke="#3AB75D"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="min-w-0 hidden sm:block">
            <div
              class="text-sm font-bold text-brand-navy dark:text-dark-text leading-none"
            >
              VESICASH
            </div>
            <div
              class="text-xs text-ink-muted dark:text-dark-subtle leading-none mt-0.5"
            >
              Developer Docs
            </div>
          </div>
        </template>
      </NuxtLink>

      <!-- Primary nav (desktop) -->
      <nav class="hidden lg:flex items-center gap-1">
        <NuxtLink
          v-for="link in primaryNav"
          :key="link.href"
          :to="link.href"
          class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="
            isActive(link.href)
              ? 'text-brand-green bg-brand-green/10'
              : 'text-ink-secondary dark:text-dark-muted hover:text-ink-primary dark:hover:text-dark-text hover:bg-surface-off-white dark:hover:bg-dark-surface'
          "
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="flex-1" />

      <!-- Search trigger -->
      <button
        class="hidden sm:flex items-center gap-2 w-48 lg:w-64 bg-transparent border border-surface-sage-dark dark:border-dark-border rounded-lg px-3 py-2 text-sm text-ink-muted dark:text-dark-subtle hover:border-brand-green/40 dark:hover:border-brand-green/40 transition-colors"
        @click="$emit('open-search')"
      >
        <UiIcon
          name="search"
          size="sm"
          class="text-ink-muted dark:text-dark-muted"
        />
        <span class="flex-1 text-left text-xs">Search docs…</span>
        <UiKbd>⌘K</UiKbd>
      </button>

      <!-- Mobile search icon -->
      <button
        aria-label="Open search"
        class="sm:hidden w-8 h-8 flex items-center justify-center text-ink-muted dark:text-dark-muted hover:text-ink-primary dark:hover:text-dark-text rounded-md hover:bg-surface-off-white dark:hover:bg-dark-surface transition-colors"
        @click="$emit('open-search')"
      >
        <UiIcon name="search" size="sm" />
      </button>

      <!-- Utility links (desktop) — hidden in editor mode -->
      <nav v-if="!isAdmin" class="hidden lg:flex items-center gap-1">
        <a
          v-for="link in utilityNav"
          :key="link.href"
          :href="link.href"
          target="_blank"
          rel="noopener"
          class="px-3 py-1.5 rounded-md text-sm font-medium text-ink-secondary dark:text-dark-muted hover:text-ink-primary dark:hover:text-dark-text hover:bg-surface-off-white dark:hover:bg-dark-surface transition-colors"
        >
          {{ link.label }}
        </a>
      </nav>

      <!-- Publish button (admin only, when there are pending drafts) -->
      <button
        v-if="isAdmin && hasDrafts"
        type="button"
        :disabled="publishing"
        class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-brand-green text-white hover:bg-brand-green/90 disabled:opacity-60 transition-colors"
        @click="showPublishModal = true"
      >
        <UiIcon name="upload" size="xs" />
        Publish {{ drafts.length }} change{{ drafts.length === 1 ? '' : 's' }}
      </button>

      <!-- Admin indicator + sign-out (only when logged in as editor) -->
      <div
        v-if="isAdmin"
        class="hidden sm:flex items-center gap-2 pl-4 py-1 border-l border-surface-sage dark:border-dark-border"
      >
        <span
          class="inline-flex items-center gap-1 text-xs font-medium text-brand-green bg-brand-green/10 px-2 py-1 rounded-md"
        >
          <UiIcon name="pencil" size="xs" />
          Editor
        </span>

        <button
          type="button"
          class="w-7 h-7 flex items-center justify-center text-ink-muted dark:text-dark-muted hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-surface-off-white dark:hover:bg-dark-surface transition-colors"
          title="Sign out of editor mode"
          @click="logout"
        >
          <UiIcon name="logOut" size="sm" />
        </button>
      </div>

      <!-- Theme toggle -->
      <div class="pl-2 border-l border-surface-sage dark:border-dark-border">
        <DocsThemeToggle />
      </div>
    </div>
  </header>

  <!-- Publish confirmation modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showPublishModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="showPublishModal = false"
      >
        <div class="bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
          <div class="px-6 py-5 border-b border-surface-sage dark:border-dark-border">
            <h2 class="text-base font-semibold text-ink-primary dark:text-dark-text">
              Publish {{ drafts.length }} draft change{{ drafts.length === 1 ? '' : 's' }}
            </h2>
            <p class="mt-1 text-sm text-ink-secondary dark:text-dark-muted">
              These pages will go live immediately.
            </p>
          </div>

          <ul class="max-h-60 overflow-y-auto divide-y divide-surface-sage dark:divide-dark-border">
            <li
              v-for="draft in drafts"
              :key="draft.slug"
              class="px-6 py-3 flex items-start gap-3"
            >
              <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-green flex-none" />
              <div class="min-w-0">
                <div class="text-sm font-medium text-ink-primary dark:text-dark-text truncate">{{ draft.title }}</div>
                <div class="text-xs text-ink-muted dark:text-dark-subtle">{{ draft.sectionTitle }}</div>
              </div>
            </li>
          </ul>

          <div class="px-6 py-4 flex justify-end gap-3 border-t border-surface-sage dark:border-dark-border">
            <button
              type="button"
              class="px-4 py-2 rounded-md text-sm font-medium text-ink-secondary dark:text-dark-muted hover:bg-surface-off-white dark:hover:bg-dark-card transition-colors"
              :disabled="publishing"
              @click="showPublishModal = false"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="publishing"
              class="px-4 py-2 rounded-md text-sm font-medium bg-brand-green text-white hover:bg-brand-green/90 disabled:opacity-60 transition-colors"
              @click="onConfirmPublish"
            >
              {{ publishing ? 'Publishing…' : 'Publish all' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from "#app";

const route = useRoute();
const config = useRuntimeConfig();
const { isAdmin, logout } = useAdmin();
const { drafts, hasDrafts, publishing, refresh: refreshDrafts, publishAll } = useDraftState();

const logoImage = computed(
  () => (config.public.site as any)?.logo?.image || null,
);
const logoDarkImage = computed(
  () => (config.public.site as any)?.logo?.darkImage || null,
);

const showPublishModal = ref(false);

const { triggerRefresh } = useAdminEvents();

async function onConfirmPublish() {
  await publishAll();
  showPublishModal.value = false;
  triggerRefresh();
}

interface Props {
  primaryNav?: { label: string; href: string }[];
  utilityNav?: { label: string; href: string }[];
  sidebarOpen?: boolean;
}

withDefaults(defineProps<Props>(), {
  primaryNav: () => [
    { label: "Docs", href: "/" },
    { label: "Guides", href: "/getting-started/introduction" },
  ],
  utilityNav: () => [
    { label: "Dashboard", href: "https://portal.vesicash.com" },
    { label: "Support", href: "mailto:developers@vesicash.com" },
  ],
});

defineEmits<{
  "open-search": [];
  "toggle-sidebar": [];
}>();

function isActive(href: string): boolean {
  if (href === "/") return route.path === "/";
  return route.path.startsWith(href);
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
