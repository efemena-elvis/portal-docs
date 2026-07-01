import { requireAdminToken } from '../../../utils/adminToken'
import { slugify, writeIndexJson, readIndexJson } from '../../../utils/contentAdmin'
import { getStorage } from '../../../utils/storage'
import { clearNavCache } from '../../content/nav.get'

export default defineEventHandler(async (event) => {
  requireAdminToken(event)
  const body = await readBody<{ name: string }>(event)
  if (!body?.name?.trim()) throw createError({ statusCode: 400, message: 'name is required' })

  const slug = slugify(body.name.trim())
  const storage = getStorage()

  if (await storage.fileExists(`${slug}/_index.json`)) {
    throw createError({ statusCode: 409, message: `Section "${slug}" already exists` })
  }

  // Assign next order value (max existing order + 1)
  const allKeys = await storage.listKeys('')
  const sectionSlugs = [...new Set(
    allKeys
      .filter(k => /^[^/]+\/_index\.json$/.test(k))
      .map(k => k.split('/')[0]!),
  )]

  let maxOrder = -1
  for (const s of sectionSlugs) {
    const idx = await readIndexJson(s)
    if (idx?.order !== undefined) maxOrder = Math.max(maxOrder, idx.order)
  }

  await writeIndexJson(slug, { title: body.name.trim(), items: [], order: maxOrder + 1 })
  clearNavCache()

  return { slug }
})
