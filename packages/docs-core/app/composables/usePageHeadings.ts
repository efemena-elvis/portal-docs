import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export interface PageHeading {
  id: string
  text: string
  level: number
}

export function usePageHeadings(containerSelector = '.docs-content') {
  const headings = ref<PageHeading[]>([])
  const activeId = ref<string>('')
  let intersectionObserver: IntersectionObserver | null = null
  let mutationObserver: MutationObserver | null = null

  async function scan() {
    await nextTick()
    const container = document.querySelector(containerSelector)
    if (!container) {
      headings.value = []
      return
    }

    // h2 + h3 headings AND any element given a data-toc attribute; skip data-no-toc elements
    const raw = Array.from(container.querySelectorAll('h2, h3, [data-toc]')) as HTMLElement[]
    // Deduplicate and exclude opt-out headings
    const seen = new Set<HTMLElement>()
    const elements = raw.filter(el => {
      if (seen.has(el)) return false
      seen.add(el)
      return !el.hasAttribute('data-no-toc')
    })

    headings.value = elements.map(el => {
      const tocLabel = el.dataset.toc
      if (tocLabel) {
        // Directive element with an explicit label — id should already be set by tocAttrs()
        if (!el.id) {
          el.id = tocLabel.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 60)
        }
        return { id: el.id, text: tocLabel, level: 2 }
      }
      // Regular heading
      if (!el.id) {
        el.id = el.textContent?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 60) || ''
      }
      return {
        id: el.id,
        text: el.textContent?.replace(/#/, '').trim() || '',
        level: Number(el.tagName[1]),
      }
    })

    setupIntersectionObserver(elements)
  }

  function setupIntersectionObserver(elements: Element[]) {
    if (intersectionObserver) {
      intersectionObserver.disconnect()
    }

    if (!elements.length) return

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        // Find the heading that is currently intersecting and closest to top
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length) {
          activeId.value = (visible[0]!.target as HTMLElement).id
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    )

    for (const el of elements) {
      intersectionObserver.observe(el)
    }
  }

  function setupMutationObserver() {
    if (mutationObserver) return

    const container = document.querySelector(containerSelector)
    if (!container) return

    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    mutationObserver = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => { scan() }, 200)
    })

    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
    })
  }

  onMounted(() => {
    scan()
    setupMutationObserver()
  })
  onUnmounted(() => {
    if (intersectionObserver) {
      intersectionObserver.disconnect()
      intersectionObserver = null
    }
    if (mutationObserver) {
      mutationObserver.disconnect()
      mutationObserver = null
    }
  })

  return { headings, activeId, scan }
}
