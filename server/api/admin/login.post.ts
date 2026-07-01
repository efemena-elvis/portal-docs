import { signToken } from '../../utils/adminToken'
import { createHmac, timingSafeEqual } from 'crypto'

export default defineEventHandler(async (event) => {
  const { adminAccessCode, adminJwtSecret } = useRuntimeConfig()
  const body = await readBody<{ code: string }>(event)

  if (!body?.code) {
    throw createError({ statusCode: 400, message: 'Access code is required' })
  }

  const stored = adminAccessCode?.trim()

  if (!stored) {
    throw createError({ statusCode: 503, message: 'Admin access is not configured on this server' })
  }

  const submitted = body.code.trim()

  // HMAC both sides so comparison is always fixed-length regardless of input length
  const key = Buffer.from(adminJwtSecret)
  const hashA = createHmac('sha256', key).update(submitted).digest()
  const hashB = createHmac('sha256', key).update(stored).digest()
  const match = timingSafeEqual(hashA, hashB)

  if (!match) {
    if (import.meta.dev) {
      console.warn(`[admin] Login failed. Submitted length: ${submitted.length}, stored length: ${stored.length}`)
    }
    await new Promise(r => setTimeout(r, 500))
    throw createError({ statusCode: 401, message: 'Invalid access code' })
  }

  const token = signToken(adminJwtSecret)
  return { token }
})
