<template>
  <div class="mx-1 mb-2 rounded-lg border border-brand-green/30 bg-brand-green/5 dark:bg-brand-green/10 p-2.5">
    <input
      ref="inputRef"
      v-model="name"
      :placeholder="placeholder"
      class="w-full text-sm bg-transparent text-ink-primary dark:text-dark-text placeholder:text-ink-muted dark:placeholder:text-dark-subtle outline-none"
      @keydown.enter.prevent="submit"
      @keydown.esc.prevent="$emit('cancel')"
    />

    <div v-if="showTypeSelector" class="flex items-center gap-3 mt-2 pt-2 border-t border-brand-green/20">
      <label
        v-for="opt in typeOptions"
        :key="opt.value"
        class="flex items-center gap-1.5 text-xs cursor-pointer"
        :class="type === opt.value ? 'text-brand-green' : 'text-ink-muted dark:text-dark-subtle'"
      >
        <input
          type="radio"
          :value="opt.value"
          v-model="type"
          class="accent-brand-green"
        />
        {{ opt.label }}
      </label>
    </div>

    <div class="flex gap-1.5 mt-2">
      <UiButton size="sm" variant="outline" class="flex-1 !text-xs !py-1" @click="$emit('cancel')">
        Cancel
      </UiButton>
      <UiButton size="sm" variant="primary" class="flex-1 !text-xs !py-1" :disabled="!name.trim()" @click="submit">
        Create
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CreateItemType } from '~/composables/useAdminCollection'

interface Props {
  mode: 'section' | 'item'  // section = just name; item = name + type selector
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Name…',
})

const emit = defineEmits<{
  create: [name: string, type: CreateItemType | null]
  cancel: []
}>()

const name = ref('')
const type = ref<CreateItemType>('guide')
const inputRef = ref<HTMLInputElement | null>(null)

const showTypeSelector = computed(() => props.mode === 'item')

const typeOptions: { label: string; value: CreateItemType }[] = [
  { label: 'Guide', value: 'guide' },
  { label: 'Endpoint', value: 'endpoint' },
  { label: 'Category', value: 'category' },
]

onMounted(() => nextTick(() => inputRef.value?.focus()))

function submit() {
  const trimmed = name.value.trim()
  if (!trimmed) return
  emit('create', trimmed, showTypeSelector.value ? type.value : null)
  name.value = ''
}
</script>
