const STORAGE_KEY = 'vesicash-docs:code-language'

export function useCodeLanguagePreference() {
  const language = ref('curl')

  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      language.value = stored
    }
  })

  function setLanguage(value: string) {
    language.value = value
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, value)
    }
  }

  return {
    language,
    setLanguage,
  }
}
