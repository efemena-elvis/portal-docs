<template>
  <textarea
    ref="el"
    v-bind="$attrs"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    class="w-full text-[13px] bg-white dark:bg-dark-bg text-ink-primary dark:text-dark-text placeholder:text-ink-muted dark:placeholder:text-dark-subtle border border-surface-sage-dark dark:border-dark-border rounded-lg resize-none transition-colors focus:outline-none hover:border-brand-green/50 dark:hover:border-brand-green/50 focus:border-brand-green dark:focus:border-brand-green disabled:opacity-60"
    :class="[sizeClass, errorClass]"
    @input="onInput"
  />
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md'
  error?: boolean | string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  size: 'md',
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const MAX_HEIGHT = 240

const el = ref<HTMLTextAreaElement | null>(null)

const sizeClass = computed(() =>
  props.size === 'sm' ? 'py-1.5 px-2.5 leading-normal' : 'py-2 px-3 leading-relaxed'
)

const errorClass = computed(() =>
  props.error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : ''
)

function resize() {
  const t = el.value
  if (!t) return
  t.style.height = '0px'
  const next = Math.min(t.scrollHeight, MAX_HEIGHT)
  t.style.height = next + 'px'
  t.style.overflowY = t.scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden'
}

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
  resize()
}

onMounted(() => nextTick(resize))
watch(() => props.modelValue, () => nextTick(resize))
</script>
