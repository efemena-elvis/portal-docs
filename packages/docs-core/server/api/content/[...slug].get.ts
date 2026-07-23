import { getStorage } from '../../utils/storage'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, message: 'Slug is required' })

  const raw = await getStorage().readFile(`${slug}.json`)
  if (!raw) throw createError({ statusCode: 404, message: `Page not found: ${slug}` })

  try { return JSON.parse(raw) }
  catch { throw createError({ statusCode: 500, message: 'Failed to parse page content' }) }
})
