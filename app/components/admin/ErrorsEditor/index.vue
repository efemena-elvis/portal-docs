<template>
  <div class="space-y-3">
    <div class="space-y-2">
      <div
        v-for="(err, i) in modelValue"
        :key="i"
        class="p-3 rounded-lg border border-surface-sage dark:border-dark-border space-y-2"
      >
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="field-label">Error code</label>
            <UiTextarea
              :model-value="err.code"
              size="sm"
              placeholder="invalid_amount"
              class="font-mono"
              @update:model-value="update(i, { code: $event })"
            />
          </div>
          <div>
            <label class="field-label">HTTP status</label>
            <UiInput
              :model-value="String(err.status)"
              type="number"
              size="sm"
              placeholder="400"
              @update:model-value="update(i, { status: Number($event) || 400 })"
            />
          </div>
        </div>
        <div>
          <label class="field-label">Description</label>
          <UiTextarea
            :model-value="err.description"
            size="sm"
            placeholder="When this error occurs…"
            @update:model-value="update(i, { description: $event })"
          />
        </div>
        <button
          type="button"
          class="text-[11px] text-status-error hover:underline transition-colors"
          @click="remove(i)"
        >
          Remove
        </button>
      </div>
    </div>

    <button
      type="button"
      class="text-sm text-brand-green hover:text-brand-green/70 transition-colors"
      @click="add"
    >
      + Add error
    </button>
  </div>
</template>

<script setup lang="ts">
import type { EndpointError } from '~/types/page'

interface Props {
  modelValue: EndpointError[]
}
const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: EndpointError[]] }>()

function update(i: number, patch: Partial<EndpointError>) {
  emit('update:modelValue', props.modelValue.map((e, idx) => idx === i ? { ...e, ...patch } : e))
}

function add() {
  emit('update:modelValue', [...props.modelValue, { code: '', status: 400, description: '' }])
}

function remove(i: number) {
  emit('update:modelValue', props.modelValue.filter((_, idx) => idx !== i))
}
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-0.5; }
</style>
