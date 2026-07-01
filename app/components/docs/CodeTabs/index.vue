<template>
  <DocsCodeBlock
    :variant="variant"
    :title="title"
    :languages="variant === 'request' ? tabOptions : undefined"
    :responses="variant === 'response' ? responseOptions : undefined"
    :code="singleTab?.code"
    :language="singleTab?.language"
  />
</template>

<script setup lang="ts">
import type { LanguageOption, ResponseOption } from '~/types/docs'

interface Tab {
  id: string
  label: string
  language: string
  languageLabel?: string
  code: string
}

interface Props {
  tabs: Tab[]
  defaultTab?: string
  variant?: 'request' | 'response' | 'simple'
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'response',
})

// When there's only one tab, pass it as direct code (no dropdown)
const singleTab = computed(() =>
  props.tabs.length === 1 ? props.tabs[0] : undefined
)

// Language options for request variant
const tabOptions = computed<LanguageOption[]>(() =>
  props.tabs.map(t => ({
    label: t.label,
    language: t.language,
    code: t.code,
  }))
)

// Response options for response variant
const responseOptions = computed<ResponseOption[]>(() =>
  props.tabs.map(t => ({
    label: t.label,
    code: t.code,
    language: t.language,
  }))
)
</script>
