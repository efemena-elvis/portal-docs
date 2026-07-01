// POST /api/admin/drafts/[...slug] — publish: promote draft → published
import { requireAdminToken } from '../../../utils/adminToken'
import { getStorage } from '../../../utils/storage'
import { clearNavCache } from '../../content/nav.get'

export default defineEventHandler(async (event) => {
  requireAdminToken(event)
  const slug = getRouterParam(event, 'slug')!
  const storage = getStorage()

  const draft = await storage.readFile(`${slug}.draft.json`)
  if (!draft) throw createError({ statusCode: 404, message: 'No draft to publish' })

  const published = await storage.readFile(`${slug}.json`)
  if (!published) throw createError({ statusCode: 404, message: 'Published file not found' })

  await storage.writeFile(`${slug}.json`, draft)
  await storage.deleteFile(`${slug}.draft.json`)
  clearNavCache()

  return { published: true }
})
