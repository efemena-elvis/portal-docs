import { $fetch } from 'ofetch'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

let _cache: { data: any; fetchedAt: number } | null = null

async function fromPostman(apiKey: string, collectionUid: string, cacheTtlMs: number): Promise<any> {
  const effectiveTtl = import.meta.dev ? 10_000 : cacheTtlMs
  const now = Date.now()

  if (_cache && now - _cache.fetchedAt < effectiveTtl) {
    return _cache.data
  }

  const response = await $fetch<{ collection: any }>(
    `https://api.getpostman.com/collections/${collectionUid}`,
    { headers: { 'X-Api-Key': apiKey } }
  )

  if (!response?.collection) {
    throw new Error('Invalid response from Postman API')
  }

  _cache = { data: response.collection, fetchedAt: now }
  return response.collection
}

function fromJson(jsonPath: string): any {
  if (!jsonPath) throw new Error('JSON fallback path is not configured')

  const absolute = resolve(process.cwd(), jsonPath)
  if (!existsSync(absolute)) throw new Error(`Collection JSON not found at: ${absolute}`)

  const raw = JSON.parse(readFileSync(absolute, 'utf-8'))
  return raw.collection ?? raw
}

export default defineEventHandler(async () => {
  const {
    sourcePriority: priority,
    sourceJsonPath: jsonPath,
    sourcePostmanCacheTtlMs: cacheTtlMs,
    postmanApiKey,
    postmanCollectionUid,
  } = useRuntimeConfig()

  const hasPostmanCredentials = Boolean(postmanApiKey && postmanCollectionUid)

  if (priority === 'postman') {
    if (hasPostmanCredentials) {
      try {
        return await fromPostman(postmanApiKey, postmanCollectionUid, cacheTtlMs)
      } catch (postmanErr) {
        console.warn('[docs] Postman fetch failed, trying JSON fallback:', (postmanErr as Error).message)
      }
    } else {
      console.warn('[docs] Postman credentials not set, falling back to JSON')
    }

    try {
      return fromJson(jsonPath)
    } catch (jsonErr) {
      throw createError({ statusCode: 502, message: `Collection unavailable. ${(jsonErr as Error).message}` })
    }
  }

  // priority === 'json'
  try {
    return fromJson(jsonPath)
  } catch (jsonErr) {
    console.warn('[docs] JSON source failed, trying Postman fallback:', (jsonErr as Error).message)

    if (!hasPostmanCredentials) {
      throw createError({ statusCode: 502, message: 'JSON source failed and Postman credentials are not configured.' })
    }

    try {
      return await fromPostman(postmanApiKey, postmanCollectionUid, cacheTtlMs)
    } catch (postmanErr) {
      throw createError({ statusCode: 502, message: `Both sources failed. ${(postmanErr as Error).message}` })
    }
  }
})
