<template>
  <NuxtLayout name="docs">
    <div
      v-if="notFound"
      class="flex-1 flex items-center justify-center"
    >
      <div class="text-center">
        <div class="text-4xl mb-3">🔍</div>
        <UiText variant="heading" class="mb-1">Page not found</UiText>
        <UiText variant="body" class="mb-4">
          No page at
          <code
            class="font-mono text-xs bg-surface-pale-blue dark:bg-dark-sidebar text-brand-blue px-1.5 py-0.5 rounded"
            >{{ slug }}</code
          >
        </UiText>
        <NuxtLink
          to="/"
          class="text-sm text-brand-blue hover:text-brand-sky underline"
          >← Back to overview</NuxtLink
        >
      </div>
    </div>

    <Transition name="page-content">
      <DocsGuidePage
        v-if="guidePage"
        :key="guidePage.title"
        :page="guidePage"
        :section-title="sectionTitle"
        :category-title="categoryTitle"
        :prev="prevPage"
        :next="nextPage"
      />
      <DocsEndpointPage
        v-else-if="endpointPage"
        :key="endpointPage.title"
        :page="endpointPage"
        :base-url="baseUrl"
        :section-title="sectionTitle"
        :category-title="categoryTitle"
        :prev="prevPage"
        :next="nextPage"
      />
    </Transition>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { GuidePage, EndpointPage } from '~/types/page'

const route = useRoute()
const slug = computed(() => (route.params.slug as string[]).join('/'))

const { page, baseUrl, notFound, refetch } = useEndpointPage(slug)
const { prevPage, nextPage } = usePagePagination(slug)

usePageEditor(slug, page)
const { navData } = useContentNav()
const { refreshSignal } = useAdminEvents()

watch(refreshSignal, () => refetch())

// Keep last known page visible while the next page is fetching — no blank state
const lastPage = ref<GuidePage | EndpointPage | null>(null)
watch(page, (v) => { if (v) lastPage.value = v as GuidePage | EndpointPage })
const displayPage = computed(() => page.value ?? lastPage.value)

const guidePage = computed(() => displayPage.value?.type === 'guide' ? displayPage.value as GuidePage : null)
const endpointPage = computed(() => displayPage.value?.type === 'endpoint' ? displayPage.value as EndpointPage : null)

const navEntry = computed(() => {
  if (!navData.value) return null
  for (const section of navData.value.sections) {
    for (const entry of section.entries) {
      if (entry.type === 'page' && entry.slug === slug.value) return entry
      if (entry.type === 'category') {
        const child = entry.children.find(c => c.slug === slug.value)
        if (child) return child
      }
    }
  }
  return null
})

const sectionTitle = computed(() => navEntry.value?.sectionTitle ?? '')
const categoryTitle = computed(() => navEntry.value?.categoryTitle)
</script>

<style>
.page-content-enter-active,
.page-content-leave-active {
  transition: opacity 0.15s ease;
}
.page-content-enter-from,
.page-content-leave-to {
  opacity: 0;
}
</style>
