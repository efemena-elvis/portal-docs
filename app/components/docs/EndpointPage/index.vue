<template>
  <div>
    <DocsBreadcrumb
      :section-title="sectionTitle"
      :sub-section-title="categoryTitle"
      :page-title="page.title"
    />

    <!-- Title row — "Edit page" only visible once the endpoint is configured -->
    <div class="relative flex items-start gap-3 mb-8">
      <h1 class="flex-1 text-3xl lg:text-4xl font-bold text-ink-primary dark:text-dark-text">
        {{ cleanTitle(page.title) }}
      </h1>
      <button
        v-if="isAdmin && !isEmpty"
        type="button"
        class="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors shrink-0"
        :class="editMode
          ? 'border-brand-green/40 bg-brand-green/10 text-brand-green'
          : 'border-surface-sage-dark dark:border-dark-border text-ink-secondary dark:text-dark-muted hover:border-brand-green/40 hover:text-brand-green'"
        @click="openEditor()"
      >
        <UiIcon name="pencil" size="sm" />
        {{ editMode ? 'Editing' : 'Edit page' }}
      </button>
    </div>

    <!-- ── Empty state ────────────────────────────────────────────────────── -->
    <template v-if="isEmpty">
      <!-- Admin view: setup guide -->
      <div v-if="isAdmin" class="mt-12">
        <!-- Icon + heading -->
        <div class="flex flex-col items-center text-center mb-10">
          <div class="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center mb-5">
            <UiIcon name="flask" class="text-teal-600 dark:text-teal-400" />
          </div>
          <h2 class="text-xl font-bold text-ink-primary dark:text-dark-text mb-2">
            Set up this endpoint
          </h2>
          <p class="text-[14.5px] text-ink-muted dark:text-dark-subtle leading-relaxed max-w-md">
            Configure the method and path, then run your first test in the Test Lab
            to automatically populate parameters, response schema, and error references.
          </p>
        </div>

        <!-- Workflow step cards -->
        <div class="grid grid-cols-3 gap-3 mb-10">
          <div class="rounded-xl border border-surface-sage dark:border-dark-border bg-surface-off-white/60 dark:bg-dark-sidebar/40 p-4">
            <div class="w-6 h-6 rounded-full bg-brand-green/15 text-brand-green text-[11px] font-bold flex items-center justify-center mb-3">1</div>
            <p class="text-[13px] font-semibold text-ink-primary dark:text-dark-text mb-1">Configure</p>
            <p class="text-[12px] text-ink-muted dark:text-dark-subtle leading-relaxed">Set the method, path, description, and authentication details.</p>
          </div>
          <div class="rounded-xl border border-surface-sage dark:border-dark-border bg-surface-off-white/60 dark:bg-dark-sidebar/40 p-4">
            <div class="w-6 h-6 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 text-[11px] font-bold flex items-center justify-center mb-3">2</div>
            <p class="text-[13px] font-semibold text-ink-primary dark:text-dark-text mb-1">Run tests</p>
            <p class="text-[12px] text-ink-muted dark:text-dark-subtle leading-relaxed">Use the Test Lab to send requests and capture real responses.</p>
          </div>
          <div class="rounded-xl border border-surface-sage dark:border-dark-border bg-surface-off-white/60 dark:bg-dark-sidebar/40 p-4">
            <div class="w-6 h-6 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 text-[11px] font-bold flex items-center justify-center mb-3">3</div>
            <p class="text-[13px] font-semibold text-ink-primary dark:text-dark-text mb-1">Annotate</p>
            <p class="text-[12px] text-ink-muted dark:text-dark-subtle leading-relaxed">Add descriptions to auto-discovered parameters and publish.</p>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center justify-center gap-3">
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-brand-green text-white hover:bg-brand-green/90 transition-colors shadow-sm"
            @click="configureOpen = true"
          >
            <UiIcon name="settings" size="sm" />
            Configure details
          </button>
          <button
            type="button"
            disabled
            class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-surface-sage-dark dark:border-dark-border text-ink-muted/50 dark:text-dark-subtle/50 cursor-not-allowed select-none"
            title="Complete configuration first"
          >
            <UiIcon name="flask" size="sm" />
            Open Test Lab
          </button>
        </div>
      </div>

      <!-- Non-admin view: page not ready -->
      <div v-else class="mt-16 text-center">
        <p class="text-[14.5px] text-ink-muted dark:text-dark-subtle">
          This page is coming soon.
        </p>
      </div>
    </template>

    <!-- ── Configured page content ────────────────────────────────────────── -->
    <template v-else>

      <!-- Render sections in the order stored in the page (same order as the editor panel) -->
      <template v-for="sectionKey in orderedSectionKeys" :key="sectionKey">

        <!-- Description -->
        <div
          v-if="sectionKey === 'description' && headingText('description', (mergedFields.description as string) ?? '') && sectionVisible('description')"
          class="relative"
          :class="{ 'group/blk': isAdmin }"
        >
          <component
            :is="headingTag('description', 'p')"
            class="text-[15px] text-ink-secondary dark:text-dark-muted leading-relaxed mb-4"
          >
            {{ headingText('description', (mergedFields.description as string) ?? '') }}
          </component>
          <template v-if="isAdmin">
            <div class="absolute inset-0 rounded pointer-events-none ring-1 ring-transparent group-hover/blk:ring-brand-green/40 group-hover/blk:bg-brand-green/[0.03] transition-all duration-150" />
            <button type="button" class="section-edit-btn" @click="openEditor('description')"><UiIcon name="pencil" size="xs" />Edit</button>
          </template>
        </div>

        <!-- Auth callout -->
        <div
          v-if="sectionKey === 'auth' && mergedFields.auth && sectionVisible('auth')"
          class="relative my-8"
          :class="{ 'group/blk': isAdmin }"
        >
          <div class="flex items-start gap-2.5 px-4 py-[18px] rounded-lg bg-surface-off-white dark:bg-dark-sidebar border border-surface-sage-dark dark:border-dark-border text-[14.5px] text-ink-secondary dark:text-dark-muted">
            <UiIcon name="lock" size="sm" class="mt-0.5 shrink-0 text-ink-muted dark:text-dark-subtle" />
            <span class="auth-note" v-html="renderAuthNote(mergedFields.auth as string)" />
          </div>
          <template v-if="isAdmin">
            <div class="absolute inset-0 rounded pointer-events-none ring-1 ring-transparent group-hover/blk:ring-brand-green/40 group-hover/blk:bg-brand-green/[0.03] transition-all duration-150" />
            <button type="button" class="section-edit-btn" @click="openEditor('auth')"><UiIcon name="pencil" size="xs" />Edit</button>
          </template>
        </div>

        <!-- Endpoint header -->
        <div
          v-if="sectionKey === 'endpoint' && sectionVisible('endpoint')"
          class="relative"
          :class="{ 'group/blk': isAdmin }"
        >
          <DocsEndpointHeader
            :method="(mergedFields.method as string) || page.method"
            :url-path="(mergedFields.path as string) || page.path"
            :base-url="baseUrl"
          />
          <template v-if="isAdmin">
            <div class="absolute inset-0 rounded pointer-events-none ring-1 ring-transparent group-hover/blk:ring-brand-green/40 group-hover/blk:bg-brand-green/[0.03] transition-all duration-150" />
            <button type="button" class="section-edit-btn" @click="openEditor('endpoint')"><UiIcon name="pencil" size="xs" />Edit</button>
          </template>
        </div>

        <!-- Free block at its stored position in sectionOrder -->
        <div v-if="blockMap[sectionKey]" class="docs-content mt-8">
          <DocsBlockRenderer :blocks="[blockMap[sectionKey] as Block]" @edit-block="openEditor" />
        </div>

        <!-- Parameters heading -->
        <div
          v-if="sectionKey === 'params-heading' && hasAnyParams && sectionVisible('params-heading')"
          class="relative"
          :class="{ 'group/blk': isAdmin }"
        >
          <component :is="headingTag('params-heading', 'h2')" id="parameters" class="text-xl font-bold text-ink-primary dark:text-dark-text mt-12 mb-1">{{ headingText('params-heading', 'Parameters') }}</component>
          <template v-if="isAdmin">
            <div class="absolute inset-0 rounded pointer-events-none ring-1 ring-transparent group-hover/blk:ring-brand-green/40 group-hover/blk:bg-brand-green/[0.03] transition-all duration-150" />
            <button type="button" class="section-edit-btn" @click="openEditor('params-heading')"><UiIcon name="pencil" size="xs" />Edit</button>
          </template>
        </div>

        <!-- Individual param tables — each key maps to its table via paramTableMap -->
        <div
          v-if="['path-params', 'query-params', 'headers', 'body-params'].includes(sectionKey) && paramTableMap[sectionKey] && sectionVisible(sectionKey)"
          class="relative"
          :class="{ 'group/blk': isAdmin }"
        >
          <DocsParamsTable
            :title="paramTableMap[sectionKey]!.title"
            :rows="paramTableMap[sectionKey]!.rows"
          />
          <template v-if="isAdmin">
            <div class="absolute inset-0 rounded pointer-events-none ring-1 ring-transparent group-hover/blk:ring-brand-green/40 group-hover/blk:bg-brand-green/[0.03] transition-all duration-150" />
            <button type="button" class="section-edit-btn" @click="openEditor(sectionKey)"><UiIcon name="pencil" size="xs" />Edit</button>
          </template>
        </div>

        <!-- Request example heading -->
        <div
          v-if="sectionKey === 'request-example-heading' && sectionVisible('request-example-heading')"
          class="relative"
          :class="{ 'group/blk': isAdmin }"
        >
          <component :is="headingTag('request-example-heading', 'h2')" id="request-example" class="text-xl font-bold text-ink-primary dark:text-dark-text mt-12 mb-4">{{ headingText('request-example-heading', 'Request example') }}</component>
          <template v-if="isAdmin">
            <div class="absolute inset-0 rounded pointer-events-none ring-1 ring-transparent group-hover/blk:ring-brand-green/40 group-hover/blk:bg-brand-green/[0.03] transition-all duration-150" />
            <button type="button" class="section-edit-btn" @click="openEditor('request-example-heading')"><UiIcon name="pencil" size="xs" />Edit</button>
          </template>
        </div>

        <!-- Request example code block -->
        <div
          v-if="sectionKey === 'request-example' && sectionVisible('request-example')"
          class="relative"
          :class="{ 'group/blk': isAdmin }"
        >
          <DocsRequestExamples
            :method="(mergedFields.method as string) || page.method"
            :url-path="(mergedFields.path as string) || page.path"
            :headers="requestExampleHeaders"
            :body="(mergedFields.body as string) ?? page.body"
            :base-url="baseUrl"
            :params="(mergedFields.params as ParamsTableRow[]) ?? page.params"
            @open-test-lab="openTestLab"
          />
          <template v-if="isAdmin">
            <div class="absolute inset-0 rounded pointer-events-none ring-1 ring-transparent group-hover/blk:ring-brand-green/40 group-hover/blk:bg-brand-green/[0.03] transition-all duration-150" />
            <button type="button" class="section-edit-btn" @click="openEditor('request-example')"><UiIcon name="pencil" size="xs" />Edit</button>
          </template>
        </div>

        <!-- Response heading -->
        <div
          v-if="sectionKey === 'response-heading' && hasResponse && sectionVisible('response-heading')"
          class="relative"
          :class="{ 'group/blk': isAdmin }"
        >
          <component :is="headingTag('response-heading', 'h2')" id="response" class="text-xl font-bold text-ink-primary dark:text-dark-text mt-12 mb-1">{{ headingText('response-heading', 'Response') }}</component>
          <template v-if="isAdmin">
            <div class="absolute inset-0 rounded pointer-events-none ring-1 ring-transparent group-hover/blk:ring-brand-green/40 group-hover/blk:bg-brand-green/[0.03] transition-all duration-150" />
            <button type="button" class="section-edit-btn" @click="openEditor('response-heading')"><UiIcon name="pencil" size="xs" />Edit</button>
          </template>
        </div>

        <!-- Response schema table -->
        <div
          v-if="sectionKey === 'response-schema' && responseSchema.length && sectionVisible('response-schema')"
          class="relative"
          :class="{ 'group/blk': isAdmin }"
        >
          <DocsParamsTable title="Response fields" :rows="responseSchema" />
          <template v-if="isAdmin">
            <div class="absolute inset-0 rounded pointer-events-none ring-1 ring-transparent group-hover/blk:ring-brand-green/40 group-hover/blk:bg-brand-green/[0.03] transition-all duration-150" />
            <button type="button" class="section-edit-btn" @click="openEditor('response-schema')"><UiIcon name="pencil" size="xs" />Edit</button>
          </template>
        </div>

        <!-- Response examples code block -->
        <div
          v-if="sectionKey === 'responses' && responseOptions.length && sectionVisible('responses')"
          class="relative"
          :class="{ 'group/blk': isAdmin }"
        >
          <DocsCodeBlock
            variant="response"
            :responses="responseOptions"
            :class="responseSchema.length ? 'mt-4' : 'mt-6'"
          />
          <template v-if="isAdmin">
            <div class="absolute inset-0 rounded pointer-events-none ring-1 ring-transparent group-hover/blk:ring-brand-green/40 group-hover/blk:bg-brand-green/[0.03] transition-all duration-150" />
            <button type="button" class="section-edit-btn" @click="openEditor('responses')"><UiIcon name="pencil" size="xs" />Edit</button>
          </template>
        </div>

        <!-- Errors heading -->
        <div
          v-if="sectionKey === 'errors-heading' && errorItems.length && sectionVisible('errors-heading')"
          class="relative"
          :class="{ 'group/blk': isAdmin }"
        >
          <component :is="headingTag('errors-heading', 'h2')" id="errors" class="text-xl font-bold text-ink-primary dark:text-dark-text mt-12 mb-4">{{ headingText('errors-heading', 'Errors') }}</component>
          <template v-if="isAdmin">
            <div class="absolute inset-0 rounded pointer-events-none ring-1 ring-transparent group-hover/blk:ring-brand-green/40 group-hover/blk:bg-brand-green/[0.03] transition-all duration-150" />
            <button type="button" class="section-edit-btn" @click="openEditor('errors-heading')"><UiIcon name="pencil" size="xs" />Edit</button>
          </template>
        </div>

        <!-- Errors table -->
        <div
          v-if="sectionKey === 'errors' && errorItems.length && sectionVisible('errors')"
          class="relative"
          :class="{ 'group/blk': isAdmin }"
        >
          <DocsErrorsTable :errors="errorItems" />
          <template v-if="isAdmin">
            <div class="absolute inset-0 rounded pointer-events-none ring-1 ring-transparent group-hover/blk:ring-brand-green/40 group-hover/blk:bg-brand-green/[0.03] transition-all duration-150" />
            <button type="button" class="section-edit-btn" @click="openEditor('errors')"><UiIcon name="pencil" size="xs" />Edit</button>
          </template>
        </div>

      </template>

      <DocsFeedback v-if="!editMode" />
      <DocsPageFooter v-if="!editMode" :prev="prevLink" :next="nextLink" />
    </template>

    <!-- Slide-from-right editor panel — suppressed during configure save or when Test Lab is open -->
    <AdminEditorPanel
      ref="editorPanel"
      :open="editMode && !configureSaving && !testLabOpen"
      :title="cleanTitle(page.title)"
      :save-status="saveStatus"
      :is-dirty="isDirty"
      :is-saving="isSaving"
      @exit="exitEditMode"
      @discard="onDiscard"
      @publish="publishPage"
      @retry-save="save"
    >
      <AdminEndpointEditorList :base-fields="mergedFields" />
    </AdminEditorPanel>

    <!-- Lightweight configure panel — first-time setup only -->
    <AdminEndpointConfigurePanel
      :open="configureOpen"
      :initial-method="(mergedFields.method as string) || 'GET'"
      :initial-path="(mergedFields.path as string) || ''"
      :initial-description="(mergedFields.description as string) || ''"
      @close="configureOpen = false"
      @save="onConfigureSave"
    />

    <!-- Test Lab panel -->
    <DocsTestLab
      :open="testLabOpen"
      :method="(mergedFields.method as string) || page.method || 'GET'"
      :path="(mergedFields.path as string) || page.path || '/'"
      :base-url="baseUrl"
      :headers="requestExampleHeaders"
      :body="(mergedFields.body as string | null) ?? page.body ?? null"
      :auth="(mergedFields.testLabAuth as string | null) ?? null"
      @close="closeTestLab"
      @save-auth="onSaveTestLabAuth"
      @save-headers="onSaveTestLabHeaders"
      @save-body="onSaveTestLabBody"
      @save-response="onSaveTestLabResponse"
      @save-method-path="onSaveTestLabMethodPath"
    />
  </div>
</template>

<script setup lang="ts">
import type { EndpointPage, CollectionHeader, EndpointError } from '~/types/page'
import type { PaginationNeighbor, TableRow, ResponseOption } from '~/types/docs'
import type { Block, ParamsTableRow } from '~/types/content'
import { ENDPOINT_DEFAULT_ORDER } from '~/utils/endpointSections'

interface Props {
  page: EndpointPage
  baseUrl: string
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

const { isAdmin } = useAdmin()
const { render: renderMd, cleanTitle } = useMarkdown()

function renderAuthNote(text: string): string {
  const html = renderMd(text || '').trim()
  // Strip single outer <p> wrapper so it flows inline inside the callout flex row
  const match = html.match(/^<p>([\s\S]*?)<\/p>$/)
  return match ? match[1]! : html
}

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
  patchFields,
  discardDraft,
  publishPage,
  focusBlock,
} = usePageEditor()

const editorPanel = ref<{ scrollToBlock: (id: string) => void } | null>(null)

// Maps each visible section key → the syntheticBlock.id used in AdminEndpointEditorList
const SECTION_BLOCK_ID: Record<string, string> = {
  'description':              'ep-description',
  'auth':                     'ep-auth',
  'endpoint':                 'ep-endpoint',
  'params-heading':           'ep-params-heading',
  'path-params':              'ep-path-params',
  'query-params':             'ep-query-params',
  'headers':                  'ep-headers',
  'body-params':              'ep-body-params',
  'request-example-heading':  'ep-req-heading',
  'request-example':          'ep-request-example',
  'response-heading':         'ep-resp-heading',
  'response-schema':          'ep-resp-schema',
  'responses':                'ep-responses',
  'errors-heading':           'ep-errors-heading',
  'errors':                   'ep-errors',
}

// Page is "empty" when no path is set (published or in draft)
const isEmpty = computed(() => !(mergedFields.value.path as string))

// Sections hidden via the editor panel
const hiddenSections = computed<string[]>(
  () => (mergedFields.value.hiddenSections as string[]) ?? []
)
function sectionVisible(key: string): boolean {
  return !hiddenSections.value.includes(key)
}

// Configure panel state
const configureOpen = ref(false)
const configureSaving = ref(false)

async function onConfigureSave(patch: Record<string, unknown>) {
  configureSaving.value = true
  try {
    await enterEditMode()
    patchFields(patch)
    await nextTick()
    await publishPage()
    exitEditMode()
    configureOpen.value = false
  } finally {
    configureSaving.value = false
  }
}

const testLabOpen = ref(false)

function openTestLab() {
  testLabOpen.value = true
}

function closeTestLab() {
  testLabOpen.value = false
  // AdminEditorPanel visibility is restored automatically via its :open binding
  // since editMode stays true while the Test Lab is open
}

async function onSaveTestLabAuth(value: string) {
  if (!editMode.value) await enterEditMode()
  patchFields({ testLabAuth: value })
}

async function onSaveTestLabHeaders(hdrs: CollectionHeader[]) {
  if (!editMode.value) await enterEditMode()
  patchFields({ headers: hdrs })
}

async function onSaveTestLabBody(body: string) {
  if (!editMode.value) await enterEditMode()
  patchFields({ body })
}

async function onSaveTestLabResponse(entry: { status: number; statusText: string; body: string }) {
  if (!editMode.value) await enterEditMode()
  const current = ((mergedFields.value.responses ?? []) as Array<Record<string, unknown>>)
  const newEntry = { id: crypto.randomUUID(), code: String(entry.status), status: entry.statusText, body: entry.body }
  patchFields({ responses: [...current, newEntry] })
}

async function onSaveTestLabMethodPath(payload: { method: string; path: string }) {
  if (!editMode.value) await enterEditMode()
  patchFields({ method: payload.method, path: payload.path })
}

async function openEditor(sectionKey?: string) {
  if (!editMode.value) await enterEditMode()
  if (sectionKey) {
    const blockId = SECTION_BLOCK_ID[sectionKey] ?? sectionKey
    focusBlock(blockId)
    await nextTick()
    editorPanel.value?.scrollToBlock(blockId)
  }
}

// Merge published page fields with in-editor overrides for live preview.
// Typed as Record<string, unknown> so stored custom fields (sectionOrder, hiddenSections,
// testLabAuth, etc.) are accessible without TypeScript complaining — all call sites already
// cast to the specific type they need. Spread order: published page first, then in-editor
// overrides, so any field survives after publish resets extraFields to {}.
const mergedFields = computed<Record<string, unknown>>(() => ({
  ...(props.page as unknown as Record<string, unknown>),
  description: props.page.description,
  auth: props.page.auth,
  method: props.page.method,
  path: props.page.path,
  headers: props.page.headers,
  body: props.page.body,
  params: props.page.params,
  responseSchema: props.page.responseSchema ?? [],
  responses: props.page.responses,
  errors: props.page.errors ?? [],
  ...extraFields.value,
}))

async function onDiscard() {
  if (!confirm('This will undo all unpublished changes to this page.')) return
  await discardDraft()
}

// ─── Params ───────────────────────────────────────────────────────────────────

const headerRows = computed((): TableRow[] => {
  const raw = (mergedFields.value.headers ?? []) as Record<string, unknown>[]
  return raw
    .map(h => {
      if ('key' in h) {
        // Legacy CollectionHeader format (Postman sync)
        return { name: h.key as string, type: 'string', required: !h.disabled, description: (h.description as string) ?? '' }
      }
      // New ParamsTableRow format (saved by editor)
      return { name: h.name as string, type: h.type as string, required: h.required as boolean, description: h.description as string }
    })
    .filter(r => r.name?.trim())
})

// CollectionHeader[] shape needed by the code generator for request examples
const requestExampleHeaders = computed((): CollectionHeader[] => {
  const raw = (mergedFields.value.headers ?? props.page.headers ?? []) as Record<string, unknown>[]
  return raw
    .filter(h => !h.disabled)
    .map(h => {
      if ('key' in h) return h as unknown as CollectionHeader
      return { key: (h.name as string) ?? '', value: '', description: (h.description as string) ?? '' }
    })
})

const pathParams = computed((): TableRow[] => {
  const path = (mergedFields.value.path as string) ?? ''
  const matches = [...path.matchAll(/\{\{([^}]+)\}\}/g)]
  return matches.map(m => ({
    name: m[1] ?? '',
    type: 'string',
    required: true,
    description: 'Path parameter — auto-populated from the previous step.',
  }))
})

const queryParams = computed((): TableRow[] => {
  const path = (mergedFields.value.path as string) ?? ''
  if (!path.includes('?')) return []
  const qs = path.split('?')[1] ?? ''
  return qs.split('&').filter(Boolean).map(p => {
    const [key] = p.split('=')
    return { name: key ?? '', type: 'string', required: false, description: '' }
  })
})

const requestBodyParams = computed((): TableRow[] =>
  ((mergedFields.value.params as ParamsTableRow[]) ?? [])
)

const paramTables = computed(() => [
  { title: 'Path Parameters', rows: pathParams.value, sectionKey: 'path-params' },
  { title: 'Query Parameters', rows: queryParams.value, sectionKey: 'query-params' },
  { title: 'Request Headers', rows: headerRows.value, sectionKey: 'headers' },
  { title: 'Request Body', rows: requestBodyParams.value, sectionKey: 'body-params' },
].filter(t => t.rows.length > 0))

const hasAnyParams = computed(() => paramTables.value.length > 0)

const paramTableMap = computed<Record<string, { title: string; rows: TableRow[]; sectionKey: string }>>(() =>
  Object.fromEntries(paramTables.value.map(t => [t.sectionKey, t]))
)

// Editable heading content — stores { content, variant, level } set by the editor
const sectionHeadings = computed<Record<string, Record<string, string>>>(
  () => (mergedFields.value as Record<string, unknown>).sectionHeadings as Record<string, Record<string, string>> ?? {}
)
function headingText(key: string, fallback: string): string {
  const data = sectionHeadings.value[key]
  return data?.content ?? fallback
}
// Returns the element tag the editor chose (h1/h2/h3/h4 or p for body text)
function headingTag(key: string, defaultTag: string): string {
  const data = sectionHeadings.value[key]
  if (!data) return defaultTag
  if (data.variant !== 'heading') return 'p'
  return data.level ?? defaultTag
}

// Section render order — driven by sectionOrder stored in the page (set by the editor).
// When no stored order exists, defaults to ENDPOINT_DEFAULT_ORDER with any free blocks
// inserted after 'endpoint' (matching the editor's initial buildOrder behaviour).
const orderedSectionKeys = computed<string[]>(() => {
  const stored = (mergedFields.value as Record<string, unknown>).sectionOrder as string[] | undefined
  if (stored?.length) return stored
  const blockIds = blocks.value.map(b => b.id)
  if (blockIds.length === 0) return [...ENDPOINT_DEFAULT_ORDER]
  const order: string[] = [...ENDPOINT_DEFAULT_ORDER]
  const epIdx = order.indexOf('endpoint')
  order.splice(epIdx >= 0 ? epIdx + 1 : order.length, 0, ...blockIds)
  return order
})

// Map block IDs to blocks so the template can render free blocks at their stored position
const blockMap = computed(() =>
  Object.fromEntries(blocks.value.map(b => [b.id, b]))
)

// ─── Response ─────────────────────────────────────────────────────────────────

const responseSchema = computed((): TableRow[] =>
  ((mergedFields.value.responseSchema as ParamsTableRow[]) ?? [])
)

const { examples: responseExamples } = useResponseExamples(
  computed(() => (mergedFields.value.responses as typeof props.page.responses) ?? [])
)

const responseOptions = computed<ResponseOption[]>(() =>
  responseExamples.value.map(e => ({
    label: e.label,
    code: e.code,
    language: e.language,
  }))
)

const hasResponse = computed(() =>
  responseSchema.value.length > 0 || responseOptions.value.length > 0
)

// ─── Errors ───────────────────────────────────────────────────────────────────

const errorItems = computed((): EndpointError[] =>
  ((mergedFields.value.errors as EndpointError[]) ?? [])
)

// ─── Pagination ───────────────────────────────────────────────────────────────

const prevLink = computed(() => props.prev ? { label: cleanTitle(props.prev.title), href: `/${props.prev.slug}` } : null)
const nextLink = computed(() => props.next ? { label: cleanTitle(props.next.title), href: `/${props.next.slug}` } : null)
</script>

<style scoped>
/* Auth note — full prose capabilities: links, code, bold, italic */
.auth-note :deep(a) {
  color: #0b618f;
  text-decoration: none;
}
.auth-note :deep(a:hover) { text-decoration: underline; }
.dark .auth-note :deep(a) { color: #24acee; }
.auth-note :deep(code) {
  font-family: ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace;
  font-size: 0.82em;
  background: #f1f7f6;
  border: 1px solid #e5edeb;
  border-radius: 4px;
  padding: 1px 6px;
  color: #525857;
  white-space: nowrap;
}
.dark .auth-note :deep(code) {
  background: #21262d;
  border-color: #30363d;
  color: #8b949e;
}
.auth-note :deep(strong) { font-weight: 600; }
.auth-note :deep(em) { font-style: italic; }

.section-edit-btn {
  @apply absolute top-1.5 right-1.5 z-10
         inline-flex items-center gap-1
         px-2 py-1 rounded
         text-[10px] font-medium
         bg-brand-navy dark:bg-dark-sidebar
         text-white shadow-md
         opacity-0 group-hover/blk:opacity-100
         transition-opacity duration-150
         whitespace-nowrap;
}
</style>
