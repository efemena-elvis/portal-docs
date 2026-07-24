<template>
  <div class="space-y-0.5">

    <AdminBlockInsertButton @click="openInsertPalette(0)" />

    <template v-for="(item, idx) in visibleItems" :key="item.key">
      <div
        :data-section-key="item.kind === 'section' ? item.key : undefined"
        :data-block-id="item.kind === 'section' ? item.section.syntheticBlock.id : item.block.id"
      >
        <AdminBlockEditorCard
          :block="(item.kind === 'section' ? item.section.syntheticBlock : item.block) as unknown as Block"
          :is-first="idx === 0"
          :is-last="idx === visibleItems.length - 1"
          @toggle-hidden="onToggleHidden(item)"
          @delete="onDelete(item)"
          @move-up="moveItem(idx, -1)"
          @move-down="moveItem(idx, 1)"
        >
          <template v-if="item.kind === 'section'">
            <div v-if="item.key === 'path-params' || item.key === 'query-params'" class="px-4 pb-4 pt-2">
              <p class="text-[11.5px] text-ink-muted dark:text-dark-subtle italic">
                Auto-extracted from the path. Edit Method &amp; Path above to update.
              </p>
            </div>
            <AdminBlockForm
              v-else
              :block="(item.section.syntheticBlock as unknown as Block)"
              @update="onSectionUpdate(item.key, $event)"
            />
          </template>
          <AdminBlockForm
            v-else
            :block="(item.block as unknown as Block)"
            @update="onBlockUpdate(item.key, $event)"
          />
        </AdminBlockEditorCard>
      </div>

      <AdminBlockInsertButton @click="openInsertPalette(idx + 1)" />
    </template>

  </div>

  <AdminBlockPalette
    :open="paletteOpen"
    @close="paletteOpen = false"
    @select="onPaletteSelect"
  />
</template>

<script setup lang="ts">
import type { Block, ParamsTableBlock, ParamsTableRow, ProseBlock, AuthNoteBlock, MethodPathBlock, CodeResponseBlock, ErrorsTableBlock, ErrorsTableRow } from '~/types/content'
import type { SavedResponse, EndpointError } from '~/types/page'
import { createDefaultBlock } from '~/utils/blockDefaults'
import { ENDPOINT_DEFAULT_ORDER } from '~/utils/endpointSections'

// ─── Normalize legacy data formats ───────────────────────────────────────────

function normalizeHeaders(raw: unknown): ParamsTableRow[] {
  if (!Array.isArray(raw)) return []
  return (raw as Record<string, unknown>[]).map(h => {
    if ('key' in h) {
      return { name: (h.key as string) ?? '', type: 'string', required: !h.disabled, description: (h.description as string) ?? '' }
    }
    return h as unknown as ParamsTableRow
  }).filter(r => (r.name ?? '').trim())
}

function normalizeErrors(raw: unknown): ErrorsTableRow[] {
  if (!Array.isArray(raw)) return []
  return (raw as Record<string, unknown>[]).map(e => ({
    code: (e.code as string) ?? '',
    status: Number(e.status) || 400,
    description: (e.description as string) ?? '',
  }))
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  baseFields?: Record<string, unknown>
}
const props = withDefaults(defineProps<Props>(), { baseFields: () => ({}) })

// ─── Page editor state ────────────────────────────────────────────────────────

const { blocks, extraFields, patchFields, scheduleSave } = usePageEditor()

const mergedFields = computed<Record<string, unknown>>(() => ({
  ...props.baseFields,
  ...extraFields.value,
}))

function patch(partial: Record<string, unknown>) {
  patchFields(partial)
}

// ─── Section meta ─────────────────────────────────────────────────────────────

type SectionMetaEntry = { class?: string; style?: string }

const sectionMeta = computed<Record<string, SectionMetaEntry>>(
  () => (extraFields.value.sectionMeta as Record<string, SectionMetaEntry>) ?? {}
)

function onSectionMetaUpdate(key: string, block: Block) {
  patchFields({
    sectionMeta: {
      ...sectionMeta.value,
      [key]: { class: block.meta.class || undefined, style: block.meta.style || undefined },
    },
  })
}

// ─── Editable prose/heading content ──────────────────────────────────────────

const HEADING_DEFAULTS: Record<string, string> = {
  'params-heading':          'Parameters',
  'request-example-heading': 'Request example',
  'response-heading':        'Response',
  'errors-heading':          'Errors',
}

const PROSE_VARIANT_DEFAULTS: Record<string, string> = {
  description: 'body',
}

interface HeadingData { content: string; variant: string; level: string }

const sectionHeadings = computed<Record<string, HeadingData>>(
  () => (extraFields.value.sectionHeadings as Record<string, HeadingData>) ?? {}
)

function headingContent(key: string): string {
  if (key === 'description') {
    return sectionHeadings.value[key]?.content ?? (mergedFields.value.description as string) ?? ''
  }
  return sectionHeadings.value[key]?.content ?? HEADING_DEFAULTS[key] ?? ''
}

function headingVariant(key: string): string {
  return sectionHeadings.value[key]?.variant ?? PROSE_VARIANT_DEFAULTS[key] ?? 'heading'
}

function headingLevel(key: string): string {
  return sectionHeadings.value[key]?.level ?? 'h2'
}

function patchHeadingData(key: string, block: ProseBlock) {
  patchFields({
    sectionHeadings: {
      ...sectionHeadings.value,
      [key]: {
        content: block.content ?? '',
        variant: block.props.variant ?? 'body',
        level: block.props.level ?? 'h2',
      },
    },
    ...(key === 'description' ? { description: block.content ?? undefined } : {}),
  })
}

// ─── Section update handler ───────────────────────────────────────────────────

function onSectionUpdate(key: string, block: Block) {
  onSectionMetaUpdate(key, block)

  switch (key) {
    case 'auth':
      patchFields({ auth: (block as AuthNoteBlock).content ?? undefined })
      break
    case 'endpoint': {
      const b = block as MethodPathBlock
      patchFields({ method: b.props.method, path: b.props.path, baseUrl: b.props.baseUrl, hideBaseUrl: b.props.hideBaseUrl })
      break
    }
    case 'headers': {
      const b = block as ParamsTableBlock
      const p: Record<string, unknown> = { headersTitle: b.props.title, headersShowInToc: b.props.showInToc }
      if (b.props.rows.length > 0) p.headers = b.props.rows
      patchFields(p)
      break
    }
    case 'body-params': {
      const b = block as ParamsTableBlock
      const p: Record<string, unknown> = { bodyParamsTitle: b.props.title, bodyParamsShowInToc: b.props.showInToc }
      if (b.props.rows.length > 0) p.params = b.props.rows
      patchFields(p)
      break
    }
    case 'response-schema': {
      const b = block as ParamsTableBlock
      const p: Record<string, unknown> = { responseSchemaTitle: b.props.title, responseSchemaShowInToc: b.props.showInToc }
      if (b.props.rows.length > 0) p.responseSchema = b.props.rows
      patchFields(p)
      break
    }
    case 'responses': {
      const b = block as CodeResponseBlock
      patchFields({ responses: b.props.responses })
      break
    }
    case 'errors': {
      const b = block as ErrorsTableBlock
      const p: Record<string, unknown> = { errorsTitle: b.props.title, errorsShowInToc: b.props.showInToc }
      if (b.props.rows.length > 0) {
        p.errors = b.props.rows.map(r => ({ code: r.code, status: r.status, description: r.description }))
      }
      patchFields(p)
      break
    }
    default:
      if (block.type === 'prose') patchHeadingData(key, block as ProseBlock)
      break
  }
}

// ─── Computed visibility ──────────────────────────────────────────────────────

const hasDescriptionContent = computed(() => !!headingContent('description'))
const hasAuthContent        = computed(() => !!(mergedFields.value.auth as string))
const hasPathParams         = computed(() => /\{\{[^}]+\}\}/.test((mergedFields.value.path as string) ?? ''))
const hasQueryParams        = computed(() => ((mergedFields.value.path as string) ?? '').includes('?'))
const hasHeaders            = computed(() => normalizeHeaders(mergedFields.value.headers).length > 0)
const hasBodyParams         = computed(() => ((mergedFields.value.params as ParamsTableRow[]) ?? []).length > 0)
const hasAnyParams          = computed(() => hasPathParams.value || hasQueryParams.value || hasHeaders.value || hasBodyParams.value)
const hasResponseSchema     = computed(() => ((mergedFields.value.responseSchema as ParamsTableRow[]) ?? []).length > 0)
const hasResponses          = computed(() => ((mergedFields.value.responses as SavedResponse[]) ?? []).length > 0)
const hasResponse           = computed(() => hasResponseSchema.value || hasResponses.value)
const hasErrors             = computed(() => ((mergedFields.value.errors as EndpointError[]) ?? []).length > 0)

// ─── Hidden sections ──────────────────────────────────────────────────────────

const hiddenSections = computed<string[]>(
  () => (extraFields.value.hiddenSections as string[]) ?? []
)

function toggleHidden(key: string) {
  const current = hiddenSections.value
  patchFields({
    hiddenSections: current.includes(key)
      ? current.filter(k => k !== key)
      : [...current, key],
  })
}

// ─── Synthetic block definitions ─────────────────────────────────────────────

interface SyntheticBlock {
  id: string
  type: Block['type']
  props: Record<string, unknown>
  content: string | null
  meta: { hidden: boolean; class?: string; style?: string }
}

interface SectionDef {
  key: string
  showWhen: boolean
  syntheticBlock: SyntheticBlock
}

const allSections = computed<SectionDef[]>(() => {
  const mf = mergedFields.value
  const sm = sectionMeta.value

  return [
    {
      key: 'description',
      showWhen: hasDescriptionContent.value,
      syntheticBlock: {
        id: 'ep-description', type: 'prose',
        props: { variant: headingVariant('description'), level: headingLevel('description') },
        content: headingContent('description'),
        meta: { hidden: hiddenSections.value.includes('description'), ...sm.description },
      },
    },
    {
      key: 'auth',
      showWhen: hasAuthContent.value,
      syntheticBlock: {
        id: 'ep-auth', type: 'auth-note',
        props: {},
        content: (mf.auth as string) ?? '',
        meta: { hidden: hiddenSections.value.includes('auth'), ...sm.auth },
      },
    },
    {
      key: 'endpoint',
      showWhen: true,
      syntheticBlock: {
        id: 'ep-endpoint', type: 'method-path',
        props: { method: mf.method || 'GET', path: mf.path || '', baseUrl: mf.baseUrl as string | undefined, hideBaseUrl: mf.hideBaseUrl as boolean | undefined },
        content: null,
        meta: { hidden: hiddenSections.value.includes('endpoint'), ...sm.endpoint },
      },
    },
    {
      key: 'params-heading',
      showWhen: hasAnyParams.value,
      syntheticBlock: {
        id: 'ep-params-heading', type: 'prose',
        props: { variant: headingVariant('params-heading'), level: headingLevel('params-heading') },
        content: headingContent('params-heading'),
        meta: { hidden: hiddenSections.value.includes('params-heading'), ...sm['params-heading'] },
      },
    },
    {
      key: 'path-params',
      showWhen: hasPathParams.value,
      syntheticBlock: {
        id: 'ep-path-params', type: 'params-table',
        props: { title: 'Path Parameters', rows: [] },
        content: null,
        meta: { hidden: hiddenSections.value.includes('path-params'), ...sm['path-params'] },
      },
    },
    {
      key: 'query-params',
      showWhen: hasQueryParams.value,
      syntheticBlock: {
        id: 'ep-query-params', type: 'params-table',
        props: { title: 'Query Parameters', rows: [] },
        content: null,
        meta: { hidden: hiddenSections.value.includes('query-params'), ...sm['query-params'] },
      },
    },
    {
      key: 'headers',
      showWhen: hasHeaders.value,
      syntheticBlock: {
        id: 'ep-headers', type: 'params-table',
        props: {
          title: (extraFields.value.headersTitle as string) ?? '',
          showInToc: (extraFields.value.headersShowInToc as boolean) ?? false,
          rows: normalizeHeaders(mf.headers),
        },
        content: null,
        meta: { hidden: hiddenSections.value.includes('headers'), ...sm.headers },
      },
    },
    {
      key: 'body-params',
      showWhen: hasBodyParams.value,
      syntheticBlock: {
        id: 'ep-body-params', type: 'params-table',
        props: {
          title: (extraFields.value.bodyParamsTitle as string) ?? '',
          showInToc: (extraFields.value.bodyParamsShowInToc as boolean) ?? false,
          rows: (mf.params as ParamsTableRow[]) ?? [],
        },
        content: null,
        meta: { hidden: hiddenSections.value.includes('body-params'), ...sm['body-params'] },
      },
    },
    {
      key: 'request-example-heading',
      showWhen: true,
      syntheticBlock: {
        id: 'ep-req-heading', type: 'prose',
        props: { variant: headingVariant('request-example-heading'), level: headingLevel('request-example-heading') },
        content: headingContent('request-example-heading'),
        meta: { hidden: hiddenSections.value.includes('request-example-heading'), ...sm['request-example-heading'] },
      },
    },
    {
      key: 'request-example',
      showWhen: true,
      syntheticBlock: {
        id: 'ep-request-example', type: 'code-request',
        props: {},
        content: null,
        meta: { hidden: hiddenSections.value.includes('request-example') },
      },
    },
    {
      key: 'response-heading',
      showWhen: hasResponse.value,
      syntheticBlock: {
        id: 'ep-resp-heading', type: 'prose',
        props: { variant: headingVariant('response-heading'), level: headingLevel('response-heading') },
        content: headingContent('response-heading'),
        meta: { hidden: hiddenSections.value.includes('response-heading'), ...sm['response-heading'] },
      },
    },
    {
      key: 'response-schema',
      showWhen: hasResponseSchema.value,
      syntheticBlock: {
        id: 'ep-resp-schema', type: 'params-table',
        props: {
          title: (extraFields.value.responseSchemaTitle as string) ?? '',
          showInToc: (extraFields.value.responseSchemaShowInToc as boolean) ?? false,
          rows: (mf.responseSchema as ParamsTableRow[]) ?? [],
        },
        content: null,
        meta: { hidden: hiddenSections.value.includes('response-schema'), ...sm['response-schema'] },
      },
    },
    {
      key: 'responses',
      showWhen: hasResponses.value,
      syntheticBlock: {
        id: 'ep-responses', type: 'code-response',
        props: { responses: (mf.responses as SavedResponse[]) ?? [] },
        content: null,
        meta: { hidden: hiddenSections.value.includes('responses'), ...sm.responses },
      },
    },
    {
      key: 'errors-heading',
      showWhen: hasErrors.value,
      syntheticBlock: {
        id: 'ep-errors-heading', type: 'prose',
        props: { variant: headingVariant('errors-heading'), level: headingLevel('errors-heading') },
        content: headingContent('errors-heading'),
        meta: { hidden: hiddenSections.value.includes('errors-heading'), ...sm['errors-heading'] },
      },
    },
    {
      key: 'errors',
      showWhen: hasErrors.value,
      syntheticBlock: {
        id: 'ep-errors', type: 'errors-table',
        props: {
          title: (extraFields.value.errorsTitle as string) ?? '',
          showInToc: (extraFields.value.errorsShowInToc as boolean) ?? false,
          rows: normalizeErrors(mf.errors),
        },
        content: null,
        meta: { hidden: hiddenSections.value.includes('errors'), ...sm.errors },
      },
    },
  ] satisfies SectionDef[]
})

// ─── Unified flat list ────────────────────────────────────────────────────────
// currentOrder is the LIVE reactive source for the template.
// It's updated directly on every operation (immediate re-render),
// and a watchEffect keeps it in sync when extraFields changes externally (page load/navigation).

type VisibleItem =
  | { kind: 'section'; key: string; section: SectionDef }
  | { kind: 'block';   key: string; block: Block }

const currentOrder = ref<string[]>([])

function buildOrder(stored: string[] | undefined, allSectionKeys: string[], allBlockIds: string[]): string[] {
  const base = (stored && stored.length > 0) ? [...stored] : [...ENDPOINT_DEFAULT_ORDER]
  const missing = allBlockIds.filter(id => !base.includes(id))
  if (missing.length > 0) {
    const epIdx = base.indexOf('endpoint')
    base.splice(epIdx >= 0 ? epIdx + 1 : base.length, 0, ...missing)
  }
  const validKeys = new Set([...allSectionKeys, ...allBlockIds])
  return base.filter(k => validKeys.has(k))
}

// Track the last order we pushed into currentOrder ourselves, so we can skip
// redundant watchEffect runs without reading currentOrder (which would create a
// circular dependency and trigger the effect every time we move an item).
let _lastSyncedJoin = ''

watchEffect(() => {
  // Read from mergedFields (baseFields from published page + extraFields overrides) so the
  // editor's initial order matches the live page even when there is no active draft.
  const stored = mergedFields.value.sectionOrder as string[] | undefined
  const allSectionKeys = allSections.value.map(s => s.key)
  const allBlockIds    = blocks.value.map(b => b.id)
  const newOrder = buildOrder(stored, allSectionKeys, allBlockIds)
  const newJoin = newOrder.join('\0')
  // Only update currentOrder when something genuinely changed externally
  // (e.g. page load, draft fetch). Skip when we're the ones who just called patchFields.
  if (newJoin !== _lastSyncedJoin) {
    _lastSyncedJoin = newJoin
    currentOrder.value = newOrder
  }
})

const visibleItems = computed<VisibleItem[]>(() => {
  const sectionMap = Object.fromEntries(allSections.value.map(s => [s.key, s]))
  const blockMap   = Object.fromEntries(blocks.value.map(b => [b.id, b]))

  return currentOrder.value
    .map((key): VisibleItem | null => {
      if (sectionMap[key]) {
        if (!sectionMap[key]!.showWhen) return null
        return { kind: 'section', key, section: sectionMap[key]! }
      }
      if (blockMap[key]) {
        return { kind: 'block', key, block: blockMap[key]! }
      }
      return null
    })
    .filter((item): item is VisibleItem => item !== null)
})

// ─── Unified move ─────────────────────────────────────────────────────────────

function saveUnifiedOrder(newVisibleKeys: string[]) {
  const visibleSet = new Set(newVisibleKeys)
  const hidden = currentOrder.value.filter(k => !visibleSet.has(k))
  const newFullOrder = [...newVisibleKeys, ...hidden]
  // Pre-sync the join so watchEffect skips this update when patchFields fires it
  _lastSyncedJoin = newFullOrder.join('\0')
  // Update immediately for instant visual feedback, THEN persist
  currentOrder.value = newFullOrder
  patchFields({ sectionOrder: newFullOrder })
}

function moveItem(idx: number, dir: -1 | 1) {
  const target = idx + dir
  if (target < 0 || target >= visibleItems.value.length) return
  const keys = visibleItems.value.map(item => item.key)
  ;[keys[idx], keys[target]] = [keys[target]!, keys[idx]!]
  saveUnifiedOrder(keys)
}

// ─── Delete ───────────────────────────────────────────────────────────────────

function deleteSection(section: SectionDef) {
  switch (section.key) {
    case 'description':      patch({ description: undefined }); break
    case 'auth':             patch({ auth: undefined }); break
    case 'headers':          patch({ headers: [] }); break
    case 'body-params':      patch({ params: [] }); break
    case 'response-schema':  patch({ responseSchema: [] }); break
    case 'responses':        patch({ responses: [] }); break
    case 'errors':           patch({ errors: [] }); break
    default:
      patchFields({ sectionOrder: currentOrder.value.filter(k => k !== section.key) })
      break
  }
}

function deleteBlockById(id: string) {
  const idx = blocks.value.findIndex(b => b.id === id)
  if (idx === -1) return
  blocks.value.splice(idx, 1)
  const newOrder = currentOrder.value.filter(k => k !== id)
  _lastSyncedJoin = newOrder.join('\0')
  currentOrder.value = newOrder
  patchFields({ sectionOrder: newOrder })
}

function onDelete(item: VisibleItem) {
  if (item.kind === 'section') deleteSection(item.section)
  else deleteBlockById(item.key)
}

// ─── Toggle hidden ────────────────────────────────────────────────────────────

function toggleBlockHiddenById(id: string) {
  const idx = blocks.value.findIndex(b => b.id === id)
  if (idx === -1) return
  const b = blocks.value[idx]!
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks.value[idx] = { ...b, meta: { ...b.meta, hidden: !b.meta.hidden } } as any
  scheduleSave()
}

function onToggleHidden(item: VisibleItem) {
  if (item.kind === 'section') toggleHidden(item.key)
  else toggleBlockHiddenById(item.key)
}

// ─── Block content update ─────────────────────────────────────────────────────

function onBlockUpdate(id: string, updated: Block) {
  const idx = blocks.value.findIndex(b => b.id === id)
  if (idx === -1) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks.value[idx] = updated as any
  scheduleSave()
}

// ─── Insert palette ───────────────────────────────────────────────────────────

const paletteOpen = ref(false)
const paletteInsertAfter = ref(0)

function openInsertPalette(afterIdx: number) {
  paletteInsertAfter.value = afterIdx
  paletteOpen.value = true
}

function onPaletteSelect(type: Block['type']) {
  paletteOpen.value = false
  const newBlock = createDefaultBlock(type)
  blocks.value.push(newBlock)

  const keys = visibleItems.value.map(item => item.key)
  keys.splice(paletteInsertAfter.value, 0, newBlock.id)
  saveUnifiedOrder(keys) // updates currentOrder immediately + persists via patchFields
}
</script>
