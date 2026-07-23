import type { Page } from '~/types/page'
import type { Block } from '~/types/content'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'clean' | 'error'

function apiFetch(url: string, method: string, headers: Record<string, string>, body?: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ($fetch as any)(url, { method, headers, ...(body !== undefined ? { body } : {}) }) as Promise<unknown>
}

// Module-level singleton — only one page editor is active at a time
const _slug = ref('')
const _publishedPage = shallowRef<Page | null>(null)
const _blocks = ref<Block[]>([])
// Extra non-block fields (method, path, headers, body, params, responses for endpoint pages)
const _extraFields = ref<Record<string, unknown>>({})
const _editMode = ref(false)
const _isDirty = ref(false)
const _isSaving = ref(false)
const _saveStatus = ref<SaveStatus>('idle')
const _loading = ref(false)
// Block to expand + scroll to when the editor panel opens
const _focusedBlockId = ref<string | null>(null)

let _stopWatch: (() => void) | null = null
let _saveTimer: ReturnType<typeof setTimeout> | null = null

function stopAutoSave() {
  if (_saveTimer) { clearTimeout(_saveTimer); _saveTimer = null }
}

// Silently loads draft data into state without entering edit mode.
// Called on page load and after closing the editor so admins always see
// the draft state in the live view. If no draft exists, reverts to published.
async function _loadDraftPreview(slug: string) {
  const { isAdmin, authHeaders } = useAdmin()
  if (!isAdmin.value || _editMode.value) return
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const draft = await ($fetch as any)(`/api/admin/drafts/${slug}`, { headers: authHeaders() }) as any
    if (_editMode.value) return // edit mode may have opened while awaiting
    if (draft?.blocks) {
      const { blocks: draftBlocks, type: _t, title: _ti, meta: _m, ...structuredFields } = draft
      _blocks.value = JSON.parse(JSON.stringify(draftBlocks))
      _extraFields.value = structuredFields
    } else {
      // No draft — show published state
      _extraFields.value = {}
      if (_publishedPage.value) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _blocks.value = JSON.parse(JSON.stringify((_publishedPage.value as any).blocks ?? []))
      }
    }
  } catch {
    // Draft request failed — show published state
    _extraFields.value = {}
    if (_publishedPage.value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      _blocks.value = JSON.parse(JSON.stringify((_publishedPage.value as any).blocks ?? []))
    }
  }
}

function setupEditor(slug: Ref<string>, publishedPage: Ref<Page | null>) {
  _stopWatch?.()
  _stopWatch = watch(
    [slug, publishedPage],
    ([newSlug, newPage], old) => {
      const oldSlug = old?.[0] ?? ''
      if (newSlug !== oldSlug) {
        stopAutoSave()
        _slug.value = newSlug
        _editMode.value = false
        _isDirty.value = false
        _isSaving.value = false
        _saveStatus.value = 'idle'
        _extraFields.value = {}
      }
      _publishedPage.value = newPage
      if (!_editMode.value && newPage) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _blocks.value = JSON.parse(JSON.stringify((newPage as any).blocks ?? []))
        // Admins always see the draft state — auto-preview draft if one exists
        _loadDraftPreview(newSlug)
      }
    },
    { immediate: true }
  )
}

export function usePageEditor(slug?: Ref<string>, publishedPage?: Ref<Page | null>) {
  if (slug && publishedPage) setupEditor(slug, publishedPage)

  const { isAdmin, authHeaders } = useAdmin()
  const { refresh: refreshDrafts } = useDraftState()

  async function enterEditMode() {
    if (!isAdmin.value) return
    _loading.value = true
    try {
      const draft = await $fetch<Page | null>(`/api/admin/drafts/${_slug.value}`, {
        headers: authHeaders(),
      })
      if (draft && (draft as any).blocks) {
        const { blocks: draftBlocks, ...draftRest } = draft as any
        _blocks.value = JSON.parse(JSON.stringify(draftBlocks))
        // Preserve non-block structured fields (endpoint method/path/headers/etc.)
        const { type: _t, title: _ti, meta: _m, blocks: _b, ...structuredFields } = draftRest
        _extraFields.value = structuredFields
        _isDirty.value = true
        _editMode.value = true
        _loading.value = false
        return
      }
    } catch {}
    _blocks.value = JSON.parse(JSON.stringify((_publishedPage.value as any)?.blocks ?? []))
    _isDirty.value = false
    _editMode.value = true
    _loading.value = false
  }

  function exitEditMode() {
    stopAutoSave()
    _editMode.value = false
    _isDirty.value = false
    _saveStatus.value = 'idle'
    _focusedBlockId.value = null
    if (isAdmin.value) {
      // Re-preview draft so live page keeps showing draft state after panel closes.
      // If no draft exists (after publish/discard), reverts to published automatically.
      _loadDraftPreview(_slug.value)
    } else {
      _extraFields.value = {}
      if (_publishedPage.value) {
        _blocks.value = JSON.parse(JSON.stringify((_publishedPage.value as any).blocks ?? []))
      }
    }
  }

  function focusBlock(id: string) {
    _focusedBlockId.value = id
  }

  async function save(): Promise<void> {
    if (!isAdmin.value || !_publishedPage.value || _isSaving.value) return
    _isSaving.value = true
    _saveStatus.value = 'saving'
    try {
      const body = { ..._publishedPage.value, ..._extraFields.value, blocks: _blocks.value }
      const res = await apiFetch(
        `/api/admin/content/${_slug.value}`, 'PUT', authHeaders(), body
      ) as { saved: boolean; clean: boolean }
      if (res.clean) {
        _isDirty.value = false
        _saveStatus.value = 'clean'
        await refreshDrafts()
      } else {
        _isDirty.value = true
        _saveStatus.value = 'saved'
        await refreshDrafts()
      }
    } catch {
      _saveStatus.value = 'error'
    } finally {
      _isSaving.value = false
      _loading.value = false
    }
  }

  function scheduleSave() {
    _isDirty.value = true
    stopAutoSave()
    _saveTimer = setTimeout(save, 400)
  }

  async function discardDraft() {
    stopAutoSave()
    try {
      await apiFetch(`/api/admin/drafts/${_slug.value}`, 'DELETE', authHeaders())
    } catch {}
    // Draft deleted — revert live page to published state
    _blocks.value = JSON.parse(JSON.stringify((_publishedPage.value as any)?.blocks ?? []))
    _extraFields.value = {}
    _isDirty.value = false
    _saveStatus.value = 'idle'
    await refreshDrafts()
  }

  async function publishPage() {
    if (!isAdmin.value) return
    if (_isDirty.value) await save()
    try {
      await apiFetch(`/api/admin/drafts/${_slug.value}`, 'POST', authHeaders())
      _isDirty.value = false
      _saveStatus.value = 'idle'
      _editMode.value = false
      _extraFields.value = {}
      stopAutoSave()
      await refreshDrafts()
      // Bust the page cache so the freshly published content is served on next load
      const { invalidatePageCache } = await import('~/composables/useEndpointPage')
      invalidatePageCache(_slug.value)
      // Trigger page content refetch in [...slug].vue via refreshSignal
      const { triggerRefresh } = useAdminEvents()
      triggerRefresh()
    } catch {}
  }

  function patchFields(partial: Record<string, unknown>) {
    _extraFields.value = { ..._extraFields.value, ...partial }
    scheduleSave()
  }

  return {
    slug: readonly(_slug),
    blocks: _blocks,
    extraFields: readonly(_extraFields),
    editMode: readonly(_editMode),
    isDirty: readonly(_isDirty),
    isSaving: readonly(_isSaving),
    saveStatus: readonly(_saveStatus),
    editorLoading: readonly(_loading),
    focusedBlockId: readonly(_focusedBlockId),
    enterEditMode,
    exitEditMode,
    save,
    scheduleSave,
    patchFields,
    discardDraft,
    publishPage,
    focusBlock,
  }
}
