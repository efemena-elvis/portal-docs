import { requireAdminToken } from '../../../utils/adminToken'
import { getStorage } from '../../../utils/storage'

export default defineEventHandler(async (event) => {
  requireAdminToken(event)
  const slug = getRouterParam(event, 'slug')!

  const raw = await getStorage().readFile(`${slug}.draft.json`)
  if (!raw) return null

  try { return JSON.parse(raw) }
  catch { return null }
})
