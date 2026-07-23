<template>
  <NuxtLink
    :to="`/${result.slug}`"
    class="flex items-start gap-3 px-4 py-2.5 transition-colors cursor-pointer"
    :class="selected
      ? 'bg-brand-green/10 dark:bg-brand-green/10'
      : 'hover:bg-surface-off-white dark:hover:bg-dark-surface'"
    @click="$emit('select')"
    @mouseenter="$emit('hover')"
  >
    <UiBadge
      :variant="methodVariant(result.method)"
      size="sm"
      class="w-12 flex-none justify-center mt-0.5 font-mono uppercase"
    >
      {{ result.method || '—' }}
    </UiBadge>
    <div class="flex-1 min-w-0">
      <UiText variant="body" class="truncate">
        {{ cleanTitle(result.title) }}
      </UiText>
      <UiText variant="small" class="mt-0.5">
        {{ result.sectionTitle }}
      </UiText>
    </div>
    <UiIcon name="chevronRight" size="sm" class="text-ink-muted dark:text-dark-subtle flex-none mt-1" />
  </NuxtLink>
</template>

<script setup lang="ts">
import type { BadgeVariant } from '~/components/ui/Badge/index.vue'
import type { SearchResult } from '~/types/page'

interface Props {
  result: SearchResult
  selected?: boolean
}

defineProps<Props>()

defineEmits<{
  select: []
  hover: []
}>()

function cleanTitle(title: string): string {
  return title.replace(/^\d+\.\s*/, '')
}

function methodVariant(method?: string): BadgeVariant {
  if (!method) return 'default'
  switch (method.toUpperCase()) {
    case 'GET': return 'info'
    case 'POST': return 'success'
    case 'PUT':
    case 'PATCH': return 'warning'
    case 'DELETE': return 'error'
    default: return 'default'
  }
}
</script>
