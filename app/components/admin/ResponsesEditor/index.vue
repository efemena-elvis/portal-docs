<template>
  <div class="space-y-3">
    <div class="space-y-2">
      <div
        v-for="(resp, ri) in modelValue"
        :key="ri"
        class="rounded-lg border border-surface-sage dark:border-dark-border overflow-hidden"
      >
        <!-- Response header -->
        <div class="flex items-center gap-2 px-3 py-2 bg-surface-sage/30 dark:bg-dark-surface/50 border-b border-surface-sage dark:border-dark-border">
          <button
            type="button"
            class="flex-1 flex items-center gap-2 text-left"
            @click="toggleExpand(ri)"
          >
            <span class="text-xs font-mono font-bold" :class="statusColor(resp.code)">
              {{ resp.code }}
            </span>
            <span class="text-xs font-medium text-ink-primary dark:text-dark-text">
              {{ resp.name || 'Unnamed response' }}
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

        <!-- Response fields -->
        <div v-if="expanded.has(ri)" class="p-3 space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="field-label">Name / label</label>
              <UiTextarea :model-value="resp.name" size="sm" placeholder="Success"
                @update:model-value="updateResponse(ri, { name: $event })" />
            </div>
            <div>
              <label class="field-label">Status text</label>
              <UiTextarea :model-value="resp.status" size="sm" placeholder="OK"
                @update:model-value="updateResponse(ri, { status: $event })" />
            </div>
          </div>
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
import type { SavedResponse } from '~/types/page'

interface Props {
  modelValue: SavedResponse[]
}
const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: SavedResponse[]] }>()

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

function updateResponse(ri: number, patch: Partial<SavedResponse>) {
  emit('update:modelValue', props.modelValue.map((r, i) => i === ri ? { ...r, ...patch } : r))
}

function addResponse() {
  const next = [...props.modelValue, { name: 'Success', status: 'OK', code: 200, body: '{}' }]
  emit('update:modelValue', next)
  expanded.value = new Set([...expanded.value, next.length - 1])
}

function removeResponse(ri: number) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== ri))
}
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-0.5; }
.add-btn { @apply text-sm text-brand-green hover:text-brand-green/70 transition-colors; }
</style>
