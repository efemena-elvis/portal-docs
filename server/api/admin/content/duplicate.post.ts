import { requireAdminToken } from '../../../utils/adminToken'
import { readIndexJson, writeIndexJson } from '../../../utils/contentAdmin'
import { getStorage } from '../../../utils/storage'
import { clearNavCache } from '../../content/nav.get'

export default defineEventHandler(async (event) => {
  requireAdminToken(event)
  const body = await readBody<{ sourceSlug: string }>(event)

  if (!body?.sourceSlug) {
    throw createError({ statusCode: 400, message: 'sourceSlug is required' })
  }

  const parts = body.sourceSlug.split('/')
  const sourceName = parts[parts.length - 1]!
  const parentParts = parts.slice(0, -1)

  if (parentParts.length === 0) {
    throw createError({ statusCode: 400, message: 'Cannot duplicate a top-level item' })
  }

  const storage = getStorage()
  const parentKey = parentParts.join('/')
  const sourceKey = `${parentKey}/${sourceName}.json`

  const sourceRaw = await storage.readFile(sourceKey)
  if (!sourceRaw) throw createError({ statusCode: 404, message: 'Source page not found' })

  const sourceData = JSON.parse(sourceRaw)

  // Find a unique sibling slug: <source>-copy, <source>-copy-2, …
  let newSlug = `${sourceName}-copy`
  let attempt = 2
  while (await storage.fileExists(`${parentKey}/${newSlug}.json`)) {
    newSlug = `${sourceName}-copy-${attempt++}`
  }

  const newData = JSON.parse(JSON.stringify(sourceData))
  newData.title = `${sourceData.title} (Copy)`

  await storage.writeFile(`${parentKey}/${newSlug}.json`, JSON.stringify(newData, null, 2))

  const index = await readIndexJson(parentKey)
  if (index) {
    const srcIdx = index.items.findIndex(
      (item: any) => item.type === 'page' && item.slug === sourceName,
    )
    const insertAt = srcIdx >= 0 ? srcIdx + 1 : index.items.length
    index.items.splice(insertAt, 0, { type: 'page', slug: newSlug })
    await writeIndexJson(parentKey, index)
  }

  clearNavCache()
  return { slug: [...parentParts, newSlug].join('/') }
})
