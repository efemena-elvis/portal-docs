<template>
  <div>
    <DocsBreadcrumb
      :section-title="sectionTitle"
      :sub-section-title="categoryTitle"
      :page-title="page.title"
    />

    <div class="mb-8 flex items-start gap-4">
      <h1 class="flex-1 text-3xl lg:text-4xl font-bold text-ink-primary dark:text-dark-text">
        {{ cleanTitle(page.title) }}
      </h1>

      <!-- Edit page button: always visible to admins as a fallback trigger -->
      <button
        v-if="isAdmin"
        type="button"
        class="mt-1 flex-none inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors"
        :class="editMode
          ? 'border-brand-green/40 bg-brand-green/10 text-brand-green'
          : 'border-surface-sage-dark dark:border-dark-border text-ink-muted dark:text-dark-muted hover:border-brand-green/50 hover:text-brand-green dark:hover:text-brand-green'"
        @click="openEditor()"
      >
        <UiIcon name="pencil" size="xs" />
        {{ editMode ? 'Editing' : 'Edit page' }}
      </button>
    </div>

    <!-- Live view: always rendered so changes appear in real time while editing -->
    <div class="docs-content">
      <DocsBlockRenderer :blocks="displayBlocks" @edit-block="openEditor" />
    </div>

    <DocsFeedback v-if="!editMode" />
    <DocsPageFooter v-if="!editMode" :prev="prevLink" :next="nextLink" />

    <!-- Slide-from-right editor panel (overlay, doesn't shift the page layout) -->
    <AdminEditorPanel
      ref="editorPanel"
      :open="editMode"
      :title="cleanTitle(page.title)"
      :save-status="saveStatus"
      :is-dirty="isDirty"
      :is-saving="isSaving"
      @exit="exitEditMode"
      @discard="onDiscard"
      @publish="onPublish"
      @retry-save="save"
    >
      <AdminBlockEditorList />
    </AdminEditorPanel>
  </div>
</template>

<script setup lang="ts">
import type { GuidePage } from '~/types/page'
import type { PaginationNeighbor } from '~/types/docs'

interface Props {
  page: GuidePage
  sectionTitle: string
  categoryTitle?: string
  prev?: PaginationNeighbor | null
  next?: PaginationNeighbor | null
}

const props = withDefaults(defineProps<Props>(), {
  categoryTitle: undefined,
  prev: null,
  next: null,
})

const { cleanTitle } = useMarkdown()
const { isAdmin } = useAdmin()
const {
  blocks,
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
} = usePageEditor()

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
  if (!confirm('Discard all unpublished changes to this page?')) return
  await discardDraft()
}

async function onPublish() {
  await publishPage()
}

// Use props.page.blocks as the authoritative source for display so the content
// renders immediately on mount without depending on the async editor state.
// In edit mode, switch to editor blocks so draft changes appear in real time.
const displayBlocks = computed(() =>
  editMode.value && blocks.value.length > 0 ? blocks.value : (props.page.blocks ?? [])
)

const prevLink = computed(() =>
  props.prev ? { label: cleanTitle(props.prev.title), href: `/${props.prev.slug}` } : null
)
const nextLink = computed(() =>
  props.next ? { label: cleanTitle(props.next.title), href: `/${props.next.slug}` } : null
)
</script>
