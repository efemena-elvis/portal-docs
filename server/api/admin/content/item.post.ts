import { requireAdminToken } from '../../../utils/adminToken'
import { slugify, readIndexJson, writeIndexJson, guidePlaceholder, endpointPlaceholder } from '../../../utils/contentAdmin'
import { getStorage } from '../../../utils/storage'
import { clearNavCache } from '../../content/nav.get'

type CreateItemType = 'guide' | 'endpoint' | 'category'

export default defineEventHandler(async (event) => {
  requireAdminToken(event)
  const body = await readBody<{
    sectionSlug: string
    categorySlug?: string
    type: CreateItemType
    name: string
  }>(event)

  if (!body?.sectionSlug || !body?.name?.trim() || !body?.type) {
    throw createError({ statusCode: 400, message: 'sectionSlug, type, and name are required' })
  }

  const storage = getStorage()
  const parentKey = body.categorySlug
    ? `${body.sectionSlug}/${body.categorySlug}`
    : body.sectionSlug

  if (!(await storage.fileExists(`${body.sectionSlug}/_index.json`))) {
    throw createError({ statusCode: 404, message: 'Section not found' })
  }
  if (!(await storage.fileExists(`${parentKey}/_index.json`))) {
    throw createError({ statusCode: 404, message: 'Parent category not found' })
  }

  const index = await readIndexJson(parentKey)
  if (!index) throw createError({ statusCode: 500, message: 'Failed to read parent _index.json' })

  const itemSlug = slugify(body.name.trim())

  if (body.type === 'category') {
    if (await storage.fileExists(`${parentKey}/${itemSlug}/_index.json`)) {
      throw createError({ statusCode: 409, message: `Category "${itemSlug}" already exists` })
    }
    await writeIndexJson(`${parentKey}/${itemSlug}`, { title: body.name.trim(), items: [] })
    index.items.push({ type: 'category', slug: itemSlug })
  } else {
    if (await storage.fileExists(`${parentKey}/${itemSlug}.json`)) {
      throw createError({ statusCode: 409, message: `Page "${itemSlug}" already exists` })
    }
    const pageData = body.type === 'endpoint'
      ? endpointPlaceholder(body.name.trim())
      : guidePlaceholder(body.name.trim())
    await storage.writeFile(`${parentKey}/${itemSlug}.json`, JSON.stringify(pageData, null, 2))
    index.items.push({ type: 'page', slug: itemSlug })
  }

  await writeIndexJson(parentKey, index)
  clearNavCache()

  const parts = [body.sectionSlug]
  if (body.categorySlug) parts.push(body.categorySlug)
  parts.push(itemSlug)

  return { slug: parts.join('/'), type: body.type }
})
