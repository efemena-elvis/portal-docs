import { requireAdminToken } from '../../../../utils/adminToken'
import { readIndexJson, writeIndexJson } from '../../../../utils/contentAdmin'
import { getStorage } from '../../../../utils/storage'
import { clearNavCache } from '../../../content/nav.get'
import type { SectionIndexItem } from '~/types/section'

export default defineEventHandler(async (event) => {
  requireAdminToken(event)
  const slug = getRouterParam(event, 'slug')!
  const body = await readBody<{ name?: string; items?: SectionIndexItem[]; order?: number }>(event)

  if (!(await getStorage().fileExists(`${slug}/_index.json`))) {
    throw createError({ statusCode: 404, message: 'Section not found' })
  }

  const index = await readIndexJson(slug)
  if (!index) throw createError({ statusCode: 500, message: 'Failed to read _index.json' })

  if (body.name) index.title = body.name.trim()
  if (body.items) index.items = body.items
  if (body.order !== undefined) index.order = body.order

  await writeIndexJson(slug, index)
  clearNavCache()

  return { updated: true }
})
