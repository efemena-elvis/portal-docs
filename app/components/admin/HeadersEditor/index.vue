<template>
  <div class="space-y-2">
    <div
      v-for="(header, idx) in headers"
      :key="idx"
      class="flex gap-2 items-start"
    >
      <div class="flex-1 grid grid-cols-2 gap-2">
        <UiTextarea
          :model-value="header.key"
          placeholder="Header name"
          size="sm"
          @update:model-value="patch(idx, 'key', $event)"
        />
        <UiTextarea
          :model-value="header.value"
          placeholder="Value"
          size="sm"
          @update:model-value="patch(idx, 'value', $event)"
        />
        <UiTextarea
          :model-value="header.description ?? ''"
          placeholder="Description (optional)"
          size="sm"
          class="col-span-2"
          @update:model-value="patch(idx, 'description', $event || undefined)"
        />
      </div>
      <div class="flex flex-col gap-1 pt-0.5">
        <button
          type="button"
          class="p-1.5 rounded text-ink-muted hover:text-status-error hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          title="Remove"
          @click="remove(idx)"
        >
          <UiIcon name="close" size="sm" />
        </button>
        <button
          type="button"
          class="p-1.5 rounded transition-colors"
          :class="header.disabled
            ? 'text-ink-muted hover:text-ink-primary'
            : 'text-brand-green hover:text-brand-green/70'"
          :title="header.disabled ? 'Enable' : 'Disable'"
          @click="patch(idx, 'disabled', !header.disabled)"
        >
          <UiIcon :name="header.disabled ? 'eyeOff' : 'eye'" size="sm" />
        </button>
      </div>
    </div>

    <button
      type="button"
      class="flex items-center gap-1.5 text-sm text-brand-green hover:text-brand-green/70 transition-colors"
      @click="add"
    >
      <UiIcon name="plus" size="sm" />
      Add header
    </button>
  </div>
</template>

<script setup lang="ts">
import type { CollectionHeader } from '~/types/page'

interface Props {
  modelValue: CollectionHeader[]
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: CollectionHeader[]] }>()

const headers = computed(() => props.modelValue)

function patch(idx: number, key: keyof CollectionHeader, value: unknown) {
  const updated = headers.value.map((h, i) =>
    i === idx ? { ...h, [key]: value } : h
  )
  emit('update:modelValue', updated)
}

function remove(idx: number) {
  emit('update:modelValue', headers.value.filter((_, i) => i !== idx))
}

function add() {
  emit('update:modelValue', [...headers.value, { key: '', value: '', description: '' }])
}
</script>
