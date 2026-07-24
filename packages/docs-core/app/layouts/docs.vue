<template>
  <SharedAppShell>
    <!-- ── Admin dialogs — rendered here (top-level) so Teleport works correctly ── -->
    <template v-if="isAdmin">
      <!-- Create Section dialog -->
      <AdminDialog
        :show="adminCollection.createSectionOpen.value"
        title="Create section"
        description="Sections are the top-level groupings in the sidebar."
        confirm-label="Create section"
        :confirm-disabled="!newSectionName.trim()"
        :loading="adminCollection.saving.value"
        @confirm="confirmCreateSection"
        @cancel="cancelDialog"
      >
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-ink-secondary dark:text-dark-muted">Section name</label>
          <UiInput
            v-model="newSectionName"
            placeholder="e.g. Getting Started"
            size="lg"
            @keydown.enter="confirmCreateSection"
            @keydown.esc="cancelDialog"
          />
        </div>
      </AdminDialog>

      <!-- Rename dialog -->
      <AdminDialog
        :show="!!adminCollection.renameTarget.value"
        :title="`Rename ${adminCollection.renameTarget.value?.kind ?? ''}`"
        confirm-label="Rename"
        :confirm-disabled="!newRenameName.trim() || newRenameName.trim() === adminCollection.renameTarget.value?.label"
        :loading="adminCollection.saving.value"
        @confirm="confirmRename"
        @cancel="cancelDialog"
      >
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-ink-secondary dark:text-dark-muted">New name</label>
          <UiInput
            v-model="newRenameName"
            placeholder="Enter a new name"
            size="lg"
            @keydown.enter="confirmRename"
            @keydown.esc="cancelDialog"
          />
        </div>
      </AdminDialog>

      <!-- Add Category / Page dialog -->
      <AdminDialog
        :show="!!adminCollection.addItemContext.value"
        :title="`Add to ${adminCollection.addItemContext.value?.parentLabel ?? ''}`"
        description="Choose what to create inside this section or category."
        confirm-label="Create"
        :confirm-disabled="!newItemName.trim()"
        :loading="adminCollection.saving.value"
        @confirm="confirmAddItem"
        @cancel="cancelDialog"
      >
        <div class="space-y-4">
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="opt in itemTypeOptions"
              :key="opt.value"
              type="button"
              class="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all"
              :class="newItemType === opt.value
                ? 'border-brand-green bg-brand-green/8 text-brand-green'
                : 'border-surface-sage-dark dark:border-dark-border text-ink-muted dark:text-dark-muted hover:border-brand-green/40 hover:text-ink-secondary dark:hover:text-dark-text'"
              @click="newItemType = opt.value"
            >
              <UiIcon :name="opt.icon" size="sm" />
              <span class="text-xs font-medium leading-none">{{ opt.label }}</span>
            </button>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-ink-secondary dark:text-dark-muted">
              {{ newItemType === 'category' ? 'Category name' : 'Page name' }}
            </label>
            <UiInput
              v-model="newItemName"
              :placeholder="newItemType === 'category' ? 'e.g. Mobile Payments' : 'e.g. Rate Limits'"
              size="lg"
              @keydown.enter="confirmAddItem"
              @keydown.esc="cancelDialog"
            />
          </div>
        </div>
      </AdminDialog>
    </template>

    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white dark:focus:bg-dark-bg focus:text-ink-primary dark:focus:text-dark-text focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:border focus:border-surface-sage dark:focus:border-dark-border"
    >
      Skip to main content
    </a>
    <template #topbar>
      <DocsTopbar
        :primary-nav="primaryNav"
        :utility-nav="utilityNav"
        :sidebar-open="sidebarOpen"
        @open-search="searchOpen = true"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />
    </template>

    <template #sidebar>
      <DocsSidebar
        :sections="sidebarSections"
        :loading="navLoading"
        :open="sidebarOpen"
        @close="sidebarOpen = false"
      />
    </template>

    <div id="main-content" tabindex="-1" class="block w-full overflow-x-hidden">
      <div class="docs-content max-w-3xl mx-auto px-8 lg:px-20 py-8 lg:py-12">
        <slot />
      </div>
    </div>

    <template #toc>
      <DocsOnThisPage />
    </template>

    <template #search-modal>
      <DocsSearchModal :open="searchOpen" @close="searchOpen = false" />
    </template>
  </SharedAppShell>
</template>

<script setup lang="ts">
import { useAdminEvents } from "~/composables/useAdminEvents";
import { useAdminCollection } from "~/composables/useAdminCollection";
import { useDocsNav } from "~/composables/useDocsNav";
import type { SidebarSection } from "~/types/docs";
import type { CreateItemType } from "~/composables/useAdminCollection";
import type { IconName } from "~/components/ui/Icon/icons";
import AdminDialog from "~/components/admin/AdminDialog/index.vue";
type NavLink = { label: string; href: string; visible?: boolean }
type NavLinkConfig = { label: string; href: string; visible?: boolean }
type PublicConfig = {
  nav: { footerLinks: { label: string; href: string; external?: boolean }[] }
  topbar?: { primaryLinks?: NavLinkConfig[]; utilityLinks?: NavLinkConfig[] }
}
const { nav: navConfig, topbar: topbarConfig } = useRuntimeConfig().public as unknown as PublicConfig

const { nav, navLoading, fetchNav } = useDocsNav();
const { navData, invalidate } = useContentNav();
const sidebarOpen = ref(false);
const searchOpen = ref(false);

const { isAdmin } = useAdmin();
const { refreshSignal } = useAdminEvents();
const adminCollection = useAdminCollection();
const { refresh: refreshDrafts } = useDraftState();

// ── Admin dialog form state ───────────────────────────────────────────────────
const newRenameName = ref("");
const newSectionName = ref("");
const newItemName = ref("");
const newItemType = ref<CreateItemType>("guide");

const itemTypeOptions: { label: string; value: CreateItemType; icon: IconName }[] = [
  { label: "Guide", value: "guide", icon: "list" },
  { label: "Endpoint", value: "endpoint", icon: "arrowRight" },
  { label: "Category", value: "category", icon: "folderPlus" },
];

watch(() => adminCollection.renameTarget.value, (t) => {
  if (t) newRenameName.value = t.label;
});

watch(() => adminCollection.createSectionOpen.value, (open) => {
  if (open) newSectionName.value = "";
});
watch(() => adminCollection.addItemContext.value, (ctx) => {
  if (ctx) { newItemName.value = ""; newItemType.value = "guide"; }
});

function cancelDialog() {
  adminCollection.closeModals();
}

async function confirmRename() {
  const t = adminCollection.renameTarget.value;
  const name = newRenameName.value.trim();
  if (!t || !name) return;
  if (t.kind === 'section') {
    await adminCollection.renameSection(t.path.sectionIdx, name);
  } else {
    await adminCollection.renameItem(t.path, name);
  }
  adminCollection.closeModals();
}

async function confirmCreateSection() {
  const name = newSectionName.value.trim();
  if (!name) return;
  await adminCollection.addSection(name);
  adminCollection.closeModals();
}

async function confirmAddItem() {
  const ctx = adminCollection.addItemContext.value;
  const name = newItemName.value.trim();
  if (!ctx || !name) return;
  await adminCollection.addItem(ctx.sectionIdx, ctx.categoryIdx, newItemType.value, name);
  adminCollection.closeModals();
}

async function loadNav() {
  await fetchNav();
  if (isAdmin.value) {
    await adminCollection.load();
    await refreshDrafts();
  }
}

onMounted(async () => {
  await loadNav();
  window.addEventListener("keydown", onKeydown);
});

// Refresh sidebar and draft count whenever a save/publish completes
watch(refreshSignal, async () => {
  invalidate();
  await loadNav();
  if (isAdmin.value) await refreshDrafts();
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
});

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    searchOpen.value = true;
  }
}

function resolveHref(href: string): string | null {
  const index = navData.value?.searchIndex ?? []
  if (href === 'auto:first-endpoint') {
    const entry = index.find(e => e.method)
    return entry ? `/${entry.slug}` : null
  }
  if (href === 'auto:first-page') {
    const entry = index[0]
    return entry ? `/${entry.slug}` : null
  }
  return href
}

const primaryNav = computed<NavLink[]>(() => {
  return (topbarConfig?.primaryLinks ?? []).flatMap(link => {
    if (link.visible === false) return []
    const resolved = resolveHref(link.href)
    if (resolved === null) return []
    return [{ label: link.label, href: resolved }]
  })
})

const utilityNav = computed<NavLink[]>(() => {
  return (topbarConfig?.utilityLinks ?? []).filter(l => l.visible !== false)
})

const sidebarSections = computed<SidebarSection[]>(() => {
  const dynamic = [...nav.value];
  if (navConfig.footerLinks.length) {
    dynamic.push({
      title: "Reference",
      collapsible: false,
      open: true,
      items: navConfig.footerLinks.map((link) => ({
        type: "page" as const,
        title: link.label,
        path: link.href,
      })),
    });
  }
  return dynamic;
});
</script>
