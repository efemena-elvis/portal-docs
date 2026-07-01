import { requireAdminToken } from '../../../utils/adminToken'
import { getStorage } from '../../../utils/storage'

export default defineEventHandler(async (event) => {
  requireAdminToken(event)
  const slug = getRouterParam(event, 'slug')!
  const storage = getStorage()

  const published = await storage.readFile(`${slug}.json`)
  if (!published) throw createError({ statusCode: 404, message: 'Page not found' })

  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, message: 'Request body must be a JSON object' })
  }

  // Deep-equal check — if identical to published, discard any existing draft
  const incomingRaw = JSON.stringify(body, null, 2)
  const publishedNorm = JSON.stringify(JSON.parse(published), null, 2)

  if (incomingRaw === publishedNorm) {
    await storage.deleteFile(`${slug}.draft.json`)
    return { saved: false, clean: true }
  }

  await storage.writeFile(`${slug}.draft.json`, incomingRaw)
  return { saved: true, clean: false }
})
