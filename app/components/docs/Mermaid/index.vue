<template>
  <UiCard class="my-6 overflow-hidden">
    <div v-if="title" class="px-4 py-2.5 border-b border-surface-sage dark:border-dark-border bg-surface-off-white/70 dark:bg-dark-surface">
      <UiText variant="label">{{ title }}</UiText>
    </div>
    <div ref="container" class="p-4 overflow-x-auto flex items-center justify-center min-h-[120px]">
      <pre v-if="!svg" class="text-xs font-mono text-ink-muted dark:text-dark-subtle">{{ diagram }}</pre>
      <div v-else class="mermaid-diagram" v-html="svg" />
    </div>
  </UiCard>
</template>

<script setup lang="ts">
interface Props {
  diagram: string
  title?: string
}

const props = defineProps<Props>()
const container = ref<HTMLDivElement | null>(null)
const svg = ref('')

async function render() {
  if (!import.meta.client) return
  try {
    const mermaid: any = await import('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs')
      .catch(() => import('https://unpkg.com/mermaid@10/dist/mermaid.esm.min.mjs'))
    mermaid.default.initialize({
      startOnLoad: false,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      securityLevel: 'strict',
    })
    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`
    const { svg: renderedSvg } = await mermaid.default.render(id, props.diagram)
    svg.value = renderedSvg
  } catch (e) {
    console.error('Mermaid render failed', e)
    svg.value = ''
  }
}

onMounted(render)
watch(() => props.diagram, render)
</script>

<style>
.mermaid-diagram svg {
  max-width: 100%;
  height: auto;
}
</style>
