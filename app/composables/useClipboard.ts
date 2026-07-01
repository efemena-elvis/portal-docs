export function useClipboard() {
  const copied = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => { copied.value = false }, 1500)
    } catch (e) {
      console.error('Clipboard copy failed', e)
    }
  }

  onScopeDispose(() => {
    if (timer) clearTimeout(timer)
  })

  return { copied, copy }
}
