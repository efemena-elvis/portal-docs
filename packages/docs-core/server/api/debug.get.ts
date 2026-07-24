import { getStorage } from '../utils/storage'

export default defineEventHandler(async () => {
  const hasAccountId = !!process.env.CF_ACCOUNT_ID
  const hasAccessKey = !!process.env.R2_ACCESS_KEY_ID
  const hasSecretKey = !!process.env.R2_SECRET_ACCESS_KEY
  const bucketName = process.env.R2_BUCKET_NAME ?? '(not set)'
  const usingR2 = hasAccountId && hasAccessKey && hasSecretKey && !!process.env.R2_BUCKET_NAME

  let keys: string[] = []
  let error: string | null = null
  try {
    const storage = getStorage()
    keys = await storage.listKeys('')
  } catch (e: any) {
    error = String(e?.message ?? e)
  }

  return {
    env: { hasAccountId, hasAccessKey, hasSecretKey, bucketName, usingR2 },
    storage: { keyCount: keys.length, keys: keys.slice(0, 20), error },
  }
})
