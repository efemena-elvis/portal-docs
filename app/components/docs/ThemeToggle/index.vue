<template>
  <button
    type="button"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    class="w-8 h-8 flex items-center justify-center rounded-lg text-ink-muted dark:text-dark-muted hover:bg-surface-sage dark:hover:bg-dark-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/30"
    @click="toggle"
  >
    <UiIcon :name="isDark ? 'sun' : 'moon'" size="sm" />
  </button>
</template>

<script setup lang="ts">
const isDark = ref(false)

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
    || localStorage.getItem('theme') === 'dark'
    || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  applyTheme(isDark.value)
})

function toggle() {
  isDark.value = !isDark.value
  applyTheme(isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function applyTheme(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
</script>
