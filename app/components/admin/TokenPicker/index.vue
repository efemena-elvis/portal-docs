<template>
  <div class="space-y-2">
    <!-- Swatch groups -->
    <div
      v-for="group in TOKEN_GROUPS"
      :key="group.label"
      class="space-y-1"
    >
      <p class="text-[10px] text-ink-muted dark:text-dark-subtle font-medium uppercase tracking-wider">
        {{ group.label }}
      </p>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="token in group.tokens"
          :key="token.class"
          type="button"
          :title="token.class"
          class="w-6 h-6 rounded-md border-2 transition-all hover:scale-110"
          :class="[token.class.replace('text-', 'bg-'), modelValue === token.class ? 'border-ink-primary dark:border-dark-text scale-110' : 'border-transparent']"
          @click="select(token.class)"
        />
      </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-surface-sage dark:border-dark-border pt-2">
      <!-- Clear -->
      <button
        v-if="modelValue"
        type="button"
        class="text-[11px] text-ink-muted hover:text-ink-secondary dark:text-dark-subtle dark:hover:text-dark-muted mr-3"
        @click="select('')"
      >
        Clear
      </button>

      <!-- Custom input -->
      <div class="mt-2">
        <p class="text-[10px] text-ink-muted dark:text-dark-subtle font-medium uppercase tracking-wider mb-1">Custom</p>
        <UiTextarea
          :model-value="isCustom ? modelValue : ''"
          placeholder="text-[#ff0000] or any Tailwind class"
          size="sm"
          @update:model-value="select($event)"
        />
        <p class="mt-1 text-[10px] text-ink-muted dark:text-dark-subtle">
          Arbitrary Tailwind class (e.g. <code class="font-mono">text-[#3AB75D]</code>)
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function select(val: string) {
  emit('update:modelValue', val)
}

const isCustom = computed(() => {
  if (!props.modelValue) return false
  return !TOKEN_GROUPS.flatMap(g => g.tokens).some(t => t.class === props.modelValue)
})

const TOKEN_GROUPS = [
  {
    label: 'Brand',
    tokens: [
      { class: 'text-brand-navy', hex: '#011A27' },
      { class: 'text-brand-dark', hex: '#043B56' },
      { class: 'text-brand-blue', hex: '#0B618F' },
      { class: 'text-brand-sky', hex: '#24ACEE' },
      { class: 'text-brand-green', hex: '#3AB75D' },
    ],
  },
  {
    label: 'Ink',
    tokens: [
      { class: 'text-ink-primary', hex: '#171918' },
      { class: 'text-ink-secondary', hex: '#525857' },
      { class: 'text-ink-muted', hex: '#696F6E' },
    ],
  },
  {
    label: 'Status',
    tokens: [
      { class: 'text-red-500', hex: '#ef4444' },
      { class: 'text-amber-500', hex: '#f59e0b' },
      { class: 'text-green-500', hex: '#22c55e' },
      { class: 'text-blue-500', hex: '#3b82f6' },
      { class: 'text-purple-500', hex: '#a855f7' },
    ],
  },
  {
    label: 'Neutral',
    tokens: [
      { class: 'text-white', hex: '#ffffff' },
      { class: 'text-gray-100', hex: '#f3f4f6' },
      { class: 'text-gray-400', hex: '#9ca3af' },
      { class: 'text-gray-600', hex: '#4b5563' },
      { class: 'text-gray-900', hex: '#111827' },
    ],
  },
]
</script>
