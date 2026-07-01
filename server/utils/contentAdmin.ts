import { getStorage } from './storage'
import type { SectionIndex } from '~/types/section'
import type { GuidePage, EndpointPage } from '~/types/page'

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// parentKey = relative path to the parent dir, e.g. "getting-started" or "accept-payments/mobile-money-checkout"
export async function readIndexJson(parentKey: string): Promise<SectionIndex | null> {
  try {
    const raw = await getStorage().readFile(`${parentKey}/_index.json`)
    if (!raw) return null
    return JSON.parse(raw) as SectionIndex
  } catch { return null }
}

export async function writeIndexJson(parentKey: string, data: SectionIndex): Promise<void> {
  await getStorage().writeFile(`${parentKey}/_index.json`, JSON.stringify(data, null, 2))
}

export function guidePlaceholder(title: string): GuidePage {
  return { type: 'guide', title, meta: { description: '', hidden: false }, blocks: [] }
}

export function endpointPlaceholder(title: string): EndpointPage {
  return {
    type: 'endpoint', title, meta: { description: '', hidden: false },
    description: '', auth: '',
    method: 'GET', path: '',
    headers: [], body: '', params: [],
    responseSchema: [], responses: [], errors: [],
    blocks: [],
  }
}
