import { createHmac, timingSafeEqual } from 'crypto'

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

interface TokenPayload {
  iat: number
  exp: number
}

export function signToken(secret: string): string {
  const payload: TokenPayload = {
    iat: Date.now(),
    exp: Date.now() + TOKEN_TTL_MS,
  }
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', secret).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifyToken(token: string, secret: string): boolean {
  if (!token || !secret) return false

  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [data, sig] = parts as [string, string]

  const expected = createHmac('sha256', secret).update(data).digest('base64url')

  // Timing-safe comparison to prevent timing attacks
  try {
    const sigBuf = Buffer.from(sig, 'base64url')
    const expectedBuf = Buffer.from(expected, 'base64url')
    if (sigBuf.length !== expectedBuf.length) return false
    if (!timingSafeEqual(sigBuf, expectedBuf)) return false
  } catch {
    return false
  }

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as TokenPayload
    if (!payload.exp || Date.now() > payload.exp) return false
    return true
  } catch {
    return false
  }
}

export function requireAdminToken(event: Parameters<typeof getHeader>[0]): void {
  const { adminJwtSecret } = useRuntimeConfig() as unknown as { adminJwtSecret: string }
  const auth = getHeader(event, 'authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''

  if (!verifyToken(token, adminJwtSecret)) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
}
