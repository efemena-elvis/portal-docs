<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
        @click.self="$emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')" />

        <!-- Modal -->
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search docs"
          class="relative w-full max-w-xl bg-white dark:bg-dark-sidebar rounded-xl shadow-2xl border border-surface-sage dark:border-dark-border overflow-hidden"
        >
          <!-- Search input -->
          <div class="flex items-center gap-3 px-4 py-3.5 border-b border-surface-sage dark:border-dark-border">
            <UiIcon name="search" size="sm" class="text-ink-muted dark:text-dark-subtle flex-none" />
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="Search docs…"
              class="flex-1 text-sm bg-transparent text-ink-primary dark:text-dark-text placeholder:text-ink-muted dark:placeholder:text-dark-subtle outline-none"
              @keydown.escape="$emit('close')"
              @keydown.arrow-down.prevent="moveSelection(1)"
              @keydown.arrow-up.prevent="moveSelection(-1)"
              @keydown.enter.prevent="navigateToSelected"
            />
            <UiKbd>Esc</UiKbd>
          </div>

          <!-- Results -->
          <div class="max-h-[400px] overflow-y-auto">
            <div v-if="query && results.length === 0" class="px-4 py-8 text-center">
              <UiText variant="body">
                No results for "<span class="font-medium">{{ query }}</span>"
              </UiText>
            </div>

            <div v-else-if="results.length" class="py-2">
              <DocsSearchResultItem
                v-for="(result, i) in results"
                :key="result.slug"
                :result="result"
                :selected="i === selectedIndex"
                @select="$emit('close')"
                @hover="selectedIndex = i"
              />
            </div>

            <div v-else class="px-4 py-6 text-center">
              <UiText variant="small">Type to search endpoints, flows, and references</UiText>
            </div>
          </div>

          <!-- Footer hint -->
          <div class="flex items-center gap-4 px-4 py-2.5 border-t border-surface-sage dark:border-dark-border bg-surface-off-white dark:bg-dark-sidebar">
            <span class="flex items-center gap-1.5">
              <UiKbd>↑↓</UiKbd>
              <UiText variant="small">navigate</UiText>
            </span>
            <span class="flex items-center gap-1.5">
              <UiKbd>↵</UiKbd>
              <UiText variant="small">open</UiText>
            </span>
            <span class="flex items-center gap-1.5">
              <UiKbd>Esc</UiKbd>
              <UiText variant="small">close</UiText>
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { SearchResult } from '~/types/page'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const router = useRouter()
const query = ref('')
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement>()

const { results } = useSearchResults(query)

watch(() => props.open, async (val) => {
  if (val) {
    query.value = ''
    selectedIndex.value = 0
    await nextTick()
    inputRef.value?.focus()
  }
})

watch(results, () => {
  selectedIndex.value = 0
})

function moveSelection(delta: number) {
  const max = results.value.length - 1
  selectedIndex.value = Math.max(0, Math.min(max, selectedIndex.value + delta))
}

function navigateToSelected() {
  const result = results.value[selectedIndex.value]
  if (result) {
    router.push(`/${result.slug}`)
    emit('close')
  }
}
</script>
