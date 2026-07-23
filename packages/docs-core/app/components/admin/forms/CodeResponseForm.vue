<template>
  <div class="space-y-3">
    <div class="space-y-2">
      <div
        v-for="(resp, ri) in responses"
        :key="ri"
        class="rounded-lg border border-surface-sage dark:border-dark-border overflow-hidden"
      >
        <!-- Collapsible header -->
        <div class="flex items-center gap-2 px-3 py-2 bg-surface-sage/30 dark:bg-dark-surface/50 border-b border-surface-sage dark:border-dark-border">
          <button
            type="button"
            class="flex-1 flex items-center gap-2 text-left"
            @click="toggleExpand(ri)"
          >
            <span class="text-xs font-mono font-bold" :class="statusColor(resp.code)">
              {{ resp.code }}
            </span>
            <span class="text-xs font-medium text-ink-secondary dark:text-dark-muted">
              — {{ resp.status || 'No status' }}
            </span>
          </button>
          <button
            type="button"
            class="p-1 rounded text-ink-muted hover:text-status-error transition-colors"
            title="Remove"
            @click="removeResponse(ri)"
          >
            <UiIcon name="close" size="sm" />
          </button>
        </div>

        <!-- Fields -->
        <div v-if="expanded.has(ri)" class="p-3 space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="field-label">HTTP code</label>
              <UiInput
                :model-value="String(resp.code)"
                size="sm"
                type="number"
                placeholder="200"
                @update:model-value="updateResponse(ri, { code: Number($event) || 200 })"
              />
            </div>
            <div>
              <label class="field-label">Status text</label>
              <UiTextarea :model-value="resp.status" size="sm" placeholder="OK"
                @update:model-value="updateResponse(ri, { status: $event })" />
            </div>
          </div>
          <div>
            <label class="field-label">Response body (JSON)</label>
            <UiTextarea
              class="font-mono text-xs"
              :model-value="resp.body"
              @update:model-value="updateResponse(ri, { body: $event })"
            />
          </div>
        </div>
      </div>
    </div>

    <button type="button" class="add-btn" @click="addResponse">+ Add response</button>
  </div>
</template>

<script setup lang="ts">
import type { CodeResponseBlock, CodeResponseEntry } from '~/types/content'

interface Props { block: CodeResponseBlock }
const props = defineProps<Props>()
const emit = defineEmits<{ update: [block: CodeResponseBlock] }>()

const responses = computed(() => props.block.props.responses ?? [])
const expanded = ref(new Set<number>([0]))

function toggleExpand(ri: number) {
  const next = new Set(expanded.value)
  next.has(ri) ? next.delete(ri) : next.add(ri)
  expanded.value = next
}

function statusColor(code: number) {
  if (code >= 200 && code < 300) return 'text-status-success'
  if (code >= 400 && code < 500) return 'text-status-warning'
  if (code >= 500) return 'text-status-error'
  return 'text-ink-muted'
}

function emit_(responses: CodeResponseEntry[]) {
  emit('update', { ...props.block, props: { ...props.block.props, responses } })
}

function updateResponse(ri: number, patch: Partial<CodeResponseEntry>) {
  emit_(responses.value.map((r, i) => i === ri ? { ...r, ...patch } : r))
}

function addResponse() {
  const next = [...responses.value, { status: 'OK', code: 200, body: '{}' }]
  emit_(next)
  expanded.value = new Set([...expanded.value, next.length - 1])
}

function removeResponse(ri: number) {
  emit_(responses.value.filter((_, i) => i !== ri))
}
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-0.5; }
.add-btn { @apply text-sm text-brand-green hover:text-brand-green/70 transition-colors; }
</style>
