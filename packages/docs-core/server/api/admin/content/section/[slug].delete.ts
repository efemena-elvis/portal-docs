import { requireAdminToken } from '../../../../utils/adminToken'
import { getStorage } from '../../../../utils/storage'
import { clearNavCache } from '../../../content/nav.get'

export default defineEventHandler(async (event) => {
  requireAdminToken(event)
  const slug = getRouterParam(event, 'slug')!
  const storage = getStorage()

  if (!(await storage.fileExists(`${slug}/_index.json`))) {
    throw createError({ statusCode: 404, message: 'Section not found' })
  }

  await storage.deletePrefix(`${slug}/`)
  clearNavCache()

  return { deleted: true }
})
