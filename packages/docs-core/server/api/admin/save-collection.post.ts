import { requireAdminToken } from '../../utils/adminToken'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  requireAdminToken(event)

  const body = await readBody(event)
  if (!body) throw createError({ statusCode: 400, message: 'Collection data required' })

  const { sourceJsonPath: jsonPath } = useRuntimeConfig() as unknown as { sourceJsonPath: string }
  if (!jsonPath) throw createError({ statusCode: 503, message: 'JSON save path not configured' })

  const absolute = resolve(process.cwd(), jsonPath)

  const toSave = body.info ? { collection: body } : body
  writeFileSync(absolute, JSON.stringify(toSave, null, 2), 'utf-8')

  return { ok: true }
})
