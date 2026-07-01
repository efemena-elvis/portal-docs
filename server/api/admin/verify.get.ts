import { requireAdminToken } from '../../utils/adminToken'

export default defineEventHandler((event) => {
  requireAdminToken(event)
  return { ok: true }
})
