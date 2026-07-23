import { requireAdminToken } from '../../../../utils/adminToken'
import { slugify, readIndexJson, writeIndexJson } from '../../../../utils/contentAdmin'
import { getStorage, renameStoragePrefix } from '../../../../utils/storage'
import { clearNavCache } from '../../../content/nav.get'
import type { SectionIndexItem } from '~/types/section'

export default defineEventHandler(async (event) => {
  requireAdminToken(event)
  const pathParam = getRouterParam(event, 'path')!
  const parts = pathParam.split('/')
  const body = await readBody<{
    name?: string
    parentItems?: SectionIndexItem[]
    toPath?: string[]
  }>(event)

  const storage = getStorage()
  const itemSlug = parts[parts.length - 1]!
  const parentKey = parts.slice(0, -1).join('/')

  const isCategory = await storage.fileExists(`${pathParam}/_index.json`)
  const isPage = await storage.fileExists(`${pathParam}.json`)

  if (!isCategory && !isPage) throw createError({ statusCode: 404, message: 'Item not found' })

  // ── Rename ──────────────────────────────────────────────────────────────────
  if (body.name) {
    const newSlug = slugify(body.name.trim())
    const newPath = `${parentKey}/${newSlug}`

    if (isCategory) {
      await renameStoragePrefix(storage, `${pathParam}/`, `${newPath}/`)
      const idx = await readIndexJson(newPath)
      if (idx) { idx.title = body.name.trim(); await writeIndexJson(newPath, idx) }
    } else {
      await storage.moveFile(`${pathParam}.json`, `${newPath}.json`)
      const raw = await storage.readFile(`${newPath}.json`)
      if (raw) {
        const page = JSON.parse(raw)
        page.title = body.name.trim()
        await storage.writeFile(`${newPath}.json`, JSON.stringify(page, null, 2))
      }
      // Move draft too if it exists
      if (await storage.fileExists(`${pathParam}.draft.json`)) {
        await storage.moveFile(`${pathParam}.draft.json`, `${newPath}.draft.json`)
      }
    }

    const parentIndex = await readIndexJson(parentKey)
    if (parentIndex) {
      const entry = parentIndex.items.find(i => i.slug === itemSlug)
      if (entry) entry.slug = newSlug
      await writeIndexJson(parentKey, parentIndex)
    }
  }

  // ── Reorder: replace parent items array ─────────────────────────────────────
  if (body.parentItems) {
    const parentIndex = await readIndexJson(parentKey)
    if (parentIndex) {
      parentIndex.items = body.parentItems
      await writeIndexJson(parentKey, parentIndex)
    }
  }

  // ── Move to a different parent ───────────────────────────────────────────────
  if (body.toPath) {
    const toParentKey = body.toPath.join('/')
    if (!(await storage.fileExists(`${toParentKey}/_index.json`))) {
      throw createError({ statusCode: 404, message: 'Target parent not found' })
    }

    // Remove from old parent index
    const oldParentIndex = await readIndexJson(parentKey)
    let movedItem: SectionIndexItem | undefined
    if (oldParentIndex) {
      movedItem = oldParentIndex.items.find(i => i.slug === itemSlug)
      oldParentIndex.items = oldParentIndex.items.filter(i => i.slug !== itemSlug)
      await writeIndexJson(parentKey, oldParentIndex)
    }

    // Add to new parent index
    const newParentIndex = (await readIndexJson(toParentKey)) ?? { title: '', items: [] }
    if (movedItem) newParentIndex.items.push(movedItem)
    await writeIndexJson(toParentKey, newParentIndex)

    if (isCategory) {
      await renameStoragePrefix(storage, `${pathParam}/`, `${toParentKey}/${itemSlug}/`)
    } else {
      await storage.moveFile(`${pathParam}.json`, `${toParentKey}/${itemSlug}.json`)
      if (await storage.fileExists(`${pathParam}.draft.json`)) {
        await storage.moveFile(`${pathParam}.draft.json`, `${toParentKey}/${itemSlug}.draft.json`)
      }
    }
  }

  clearNavCache()
  return { updated: true }
})
