<template>
  <NuxtLayout name="docs">
    <!-- Hero — content-managed via _home.json hero fields -->
    <DocsHero
      :title="mergedPage.heroTitle as string"
      :description="mergedPage.heroDescription as string"
      :badge="mergedPage.heroBadge as string"
      pulse
    >
      <template #actions>
        <UiButton
          :to="(mergedPage.heroPrimaryHref as string) || '/getting-started/introduction'"
          icon="arrowRight"
          icon-position="right"
        >
          {{ (mergedPage.heroPrimaryLabel as string) || 'Get started' }}
        </UiButton>
        <UiButton
          :to="(mergedPage.heroSecondaryHref as string) || '/getting-started/authentication'"
          variant="secondary"
        >
          {{ (mergedPage.heroSecondaryLabel as string) || 'Authentication' }}
        </UiButton>
      </template>

      <template v-if="isAdmin" #admin>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors"
          :class="editMode
            ? 'border-brand-green/40 bg-brand-green/10 text-brand-green'
            : 'border-surface-sage-dark dark:border-dark-border text-ink-muted dark:text-dark-muted hover:border-brand-green/50 hover:text-brand-green dark:hover:text-brand-green'"
          @click="editMode ? undefined : enterEditMode()"
        >
          <UiIcon name="pencil" size="xs" />
          {{ editMode ? 'Editing' : 'Edit page' }}
        </button>
      </template>
    </DocsHero>

    <!-- Content blocks — fully editable -->
    <div v-if="blocks.length" class="docs-content">
      <DocsBlockRenderer :blocks="blocks" @edit-block="openEditor" />
    </div>

    <DocsPageFooter
      v-if="!editMode"
      :prev="null"
      :next="{ label: 'Introduction', href: '/getting-started/introduction' }"
    />

    <!-- Slide-in editor panel -->
    <AdminEditorPanel
      ref="editorPanel"
      :open="editMode"
      title="Home page"
      :save-status="saveStatus"
      :is-dirty="isDirty"
      :is-saving="isSaving"
      @exit="exitEditMode"
      @discard="onDiscard"
      @publish="onPublish"
      @retry-save="save"
    >
      <!-- Hero fields editor -->
      <div class="px-4 pb-4 border-b border-surface-sage-dark dark:border-dark-border">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-ink-muted dark:text-dark-subtle mb-3">
          Hero
        </p>
        <div class="space-y-3">
          <div>
            <label class="block text-xs text-ink-muted dark:text-dark-subtle mb-1">Title</label>
            <UiTextarea
              size="sm"
              rows="2"
              :model-value="(extraFields.heroTitle as string) ?? (page as any)?.heroTitle ?? ''"
              @update:model-value="patchFields({ heroTitle: $event })"
            />
          </div>
          <div>
            <label class="block text-xs text-ink-muted dark:text-dark-subtle mb-1">Description</label>
            <UiTextarea
              size="sm"
              rows="3"
              :model-value="(extraFields.heroDescription as string) ?? (page as any)?.heroDescription ?? ''"
              @update:model-value="patchFields({ heroDescription: $event })"
            />
          </div>
          <div>
            <label class="block text-xs text-ink-muted dark:text-dark-subtle mb-1">Badge text</label>
            <UiInput
              size="sm"
              :model-value="(extraFields.heroBadge as string) ?? (page as any)?.heroBadge ?? ''"
              @update:model-value="patchFields({ heroBadge: $event })"
            />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-ink-muted dark:text-dark-subtle mb-1">Primary button label</label>
              <UiInput
                size="sm"
                :model-value="(extraFields.heroPrimaryLabel as string) ?? (page as any)?.heroPrimaryLabel ?? ''"
                @update:model-value="patchFields({ heroPrimaryLabel: $event })"
              />
            </div>
            <div>
              <label class="block text-xs text-ink-muted dark:text-dark-subtle mb-1">Primary button URL</label>
              <UiInput
                size="sm"
                :model-value="(extraFields.heroPrimaryHref as string) ?? (page as any)?.heroPrimaryHref ?? ''"
                @update:model-value="patchFields({ heroPrimaryHref: $event })"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-ink-muted dark:text-dark-subtle mb-1">Secondary button label</label>
              <UiInput
                size="sm"
                :model-value="(extraFields.heroSecondaryLabel as string) ?? (page as any)?.heroSecondaryLabel ?? ''"
                @update:model-value="patchFields({ heroSecondaryLabel: $event })"
              />
            </div>
            <div>
              <label class="block text-xs text-ink-muted dark:text-dark-subtle mb-1">Secondary button URL</label>
              <UiInput
                size="sm"
                :model-value="(extraFields.heroSecondaryHref as string) ?? (page as any)?.heroSecondaryHref ?? ''"
                @update:model-value="patchFields({ heroSecondaryHref: $event })"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Content blocks editor -->
      <AdminBlockEditorList />
    </AdminEditorPanel>
  </NuxtLayout>
</template>

<script setup lang="ts">
const HOME_SLUG = '_home'
const slug = ref(HOME_SLUG)

const { page, refetch } = useEndpointPage(slug)
const { refreshSignal } = useAdminEvents()

usePageEditor(slug, page)
watch(refreshSignal, () => refetch())

const { isAdmin } = useAdmin()
const {
  blocks,
  extraFields,
  editMode,
  isDirty,
  isSaving,
  saveStatus,
  enterEditMode,
  exitEditMode,
  save,
  discardDraft,
  publishPage,
  focusBlock,
  patchFields,
} = usePageEditor()

// Merge published page fields with in-editor overrides (mirrors EndpointPage pattern)
const mergedPage = computed<Record<string, unknown>>(() => ({
  ...(page.value as unknown as Record<string, unknown> ?? {}),
  ...extraFields.value,
}))

const editorPanel = ref<{ scrollToBlock: (id: string) => void } | null>(null)

async function openEditor(blockId?: string) {
  if (!editMode.value) enterEditMode()
  if (blockId) {
    focusBlock(blockId)
    await nextTick()
    editorPanel.value?.scrollToBlock(blockId)
  }
}

async function onDiscard() {
  if (!confirm('Discard all unpublished changes to the home page?')) return
  await discardDraft()
}

async function onPublish() {
  await publishPage()
}
</script>
