import { requireAdminToken } from '../../../../utils/adminToken'
import { readIndexJson, writeIndexJson } from '../../../../utils/contentAdmin'
import { getStorage } from '../../../../utils/storage'
import { clearNavCache } from '../../../content/nav.get'

export default defineEventHandler(async (event) => {
  requireAdminToken(event)
  const pathParam = getRouterParam(event, 'path')!
  const parts = pathParam.split('/')
  const itemSlug = parts[parts.length - 1]!
  const parentKey = parts.slice(0, -1).join('/')

  const storage = getStorage()
  const isCategory = await storage.fileExists(`${pathParam}/_index.json`)
  const isPage = await storage.fileExists(`${pathParam}.json`)

  if (!isCategory && !isPage) throw createError({ statusCode: 404, message: 'Item not found' })

  // Remove from parent _index.json
  const parentIndex = await readIndexJson(parentKey)
  if (parentIndex) {
    parentIndex.items = parentIndex.items.filter(i => i.slug !== itemSlug)
    await writeIndexJson(parentKey, parentIndex)
  }

  if (isCategory) {
    await storage.deletePrefix(`${pathParam}/`)
  } else {
    await storage.deleteFile(`${pathParam}.json`)
    await storage.deleteFile(`${pathParam}.draft.json`)
  }

  clearNavCache()
  return { deleted: true }
})
