<template>
  <UiBadge :variant="variant" size="sm" class="font-medium uppercase tracking-wide">
    {{ method }}
  </UiBadge>
</template>

<script setup lang="ts">
import type { BadgeVariant } from '~/components/ui/Badge/index.vue'

const props = defineProps<{ method: string }>()

const variant = computed<BadgeVariant>(() => {
  switch (props.method?.toUpperCase()) {
    case 'GET': return 'info'
    case 'POST': return 'success'
    case 'PUT':
    case 'PATCH': return 'warning'
    case 'DELETE': return 'error'
    default: return 'default'
  }
})
</script>
