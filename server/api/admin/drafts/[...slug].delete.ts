import { requireAdminToken } from '../../../utils/adminToken'
import { getStorage } from '../../../utils/storage'

export default defineEventHandler(async (event) => {
  requireAdminToken(event)
  const slug = getRouterParam(event, 'slug')!
  const storage = getStorage()

  if (!(await storage.fileExists(`${slug}.draft.json`))) {
    throw createError({ statusCode: 404, message: 'Draft not found' })
  }

  await storage.deleteFile(`${slug}.draft.json`)
  return { discarded: true }
})
