import { requireAdminToken } from '../../../utils/adminToken'
import { getStorage } from '../../../utils/storage'
import { clearNavCache } from '../../content/nav.get'

type VisibilityKind = 'section' | 'category' | 'page'

export default defineEventHandler(async (event) => {
  requireAdminToken(event)

  const body = await readBody<{ kind: VisibilityKind; slug: string; hidden: boolean }>(event)
  if (!body?.kind || body.slug === undefined || body.hidden === undefined) {
    throw createError({ statusCode: 400, message: 'kind, slug, and hidden are required' })
  }

  const { kind, slug, hidden } = body
  const storage = getStorage()

  if (kind === 'page') {
    const raw = await storage.readFile(`${slug}.json`)
    if (!raw) throw createError({ statusCode: 404, message: 'Page not found' })
    const page = JSON.parse(raw)
    page.meta = { ...page.meta, hidden }
    await storage.writeFile(`${slug}.json`, JSON.stringify(page, null, 2))

  } else if (kind === 'section' || kind === 'category') {
    const raw = await storage.readFile(`${slug}/_index.json`)
    if (!raw) throw createError({ statusCode: 404, message: `${kind === 'section' ? 'Section' : 'Category'} not found` })
    const index = JSON.parse(raw)
    index.hidden = hidden
    await storage.writeFile(`${slug}/_index.json`, JSON.stringify(index, null, 2))

  } else {
    throw createError({ statusCode: 400, message: 'Invalid kind' })
  }

  clearNavCache()
  return { ok: true, kind, slug, hidden }
})
