import { requireAdminToken } from '../../utils/adminToken'
import { getStorage } from '../../utils/storage'

export default defineEventHandler(async (event) => {
  requireAdminToken(event)
  const raw = await getStorage().readFile('_variables.json')
  if (!raw) return {}
  try { return JSON.parse(raw) }
  catch { return {} }
})
