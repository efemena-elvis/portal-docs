import { requireAdminToken } from '../../utils/adminToken'
import { getStorage } from '../../utils/storage'

export default defineEventHandler(async (event) => {
  requireAdminToken(event)
  const body = await readBody<Record<string, string>>(event)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
  await getStorage().writeFile('_variables.json', JSON.stringify(body, null, 2))
  return { ok: true }
})
