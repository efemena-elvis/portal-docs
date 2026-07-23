interface DraftEntry {
  slug: string
  title: string
  sectionTitle: string
}

const _drafts = ref<DraftEntry[]>([])
const _loaded = ref(false)
const _loading = ref(false)
const _publishing = ref(false)

function apiFetch(url: string, method: string, headers: Record<string, string>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ($fetch as any)(url, { method, headers }) as Promise<unknown>
}

export function useDraftState() {
  const { authHeaders, isAdmin } = useAdmin()

  async function refresh() {
    if (!isAdmin.value) {
      _drafts.value = []
      return
    }
    _loading.value = true
    try {
      const data = await $fetch<DraftEntry[]>('/api/admin/drafts', {
        headers: authHeaders(),
      })
      _drafts.value = data ?? []
      _loaded.value = true
    } catch {
      _drafts.value = []
    } finally {
      _loading.value = false
    }
  }

  async function publish(slug: string): Promise<boolean> {
    try {
      await apiFetch(`/api/admin/drafts/${slug}`, 'POST', authHeaders())
      return true
    } catch {
      return false
    }
  }

  async function discard(slug: string): Promise<boolean> {
    try {
      await apiFetch(`/api/admin/drafts/${slug}`, 'DELETE', authHeaders())
      return true
    } catch {
      return false
    }
  }

  async function publishAll(): Promise<{ published: number; failed: string[] }> {
    _publishing.value = true
    const failed: string[] = []
    let published = 0
    for (const draft of [..._drafts.value]) {
      const ok = await publish(draft.slug)
      if (ok) published++
      else failed.push(draft.slug)
    }
    await refresh()
    _publishing.value = false
    return { published, failed }
  }

  const hasDrafts = computed(() => _drafts.value.length > 0)

  return {
    drafts: readonly(_drafts),
    hasDrafts,
    loaded: readonly(_loaded),
    loading: readonly(_loading),
    publishing: readonly(_publishing),
    refresh,
    publish,
    discard,
    publishAll,
  }
}
