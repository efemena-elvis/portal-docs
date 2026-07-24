import { requireAdminToken } from '../../../utils/adminToken'
import { getStorage } from '../../../utils/storage'

interface DraftEntry {
  slug: string
  title: string
  sectionTitle: string
}

export default defineEventHandler(async (event) => {
  requireAdminToken(event)
  const storage = getStorage()
  const allKeys = await storage.listKeys('')
  const draftKeys = allKeys.filter(k => k.endsWith('.draft.json'))

  const entries: DraftEntry[] = []
  for (const key of draftKeys) {
    try {
      const raw = await storage.readFile(key)
      if (!raw) continue
      const page = JSON.parse(raw)
      const slug = key.replace(/\.draft\.json$/, '')
      const parts = slug.split('/')
      entries.push({ slug, title: page.title ?? slug, sectionTitle: parts[0] ?? '' })
    } catch {}
  }

  return entries
})
