<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useHighlighter } from '~/composables/useHighlighter'

// Apply saved theme before first paint to prevent flash
if (import.meta.client) {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (saved === 'dark' || (!saved && prefersDark)) {
    document.documentElement.classList.add('dark')
  }
}

// Warm up Shiki on app init so code blocks don't trigger a delayed reflow
// when the highlighter lazily initializes on first use
onMounted(async () => {
  useHighlighter().catch(() => {})
  await useAdmin().init()

  // Admin-only: load Tailwind Play CDN so any class an editor types is
  // generated on the fly without a rebuild. Not loaded on public pages.
  if (useAdmin().isAdmin.value) {
    loadTailwindCdn()
  }
})

function loadTailwindCdn() {
  if (document.querySelector('[data-tw-cdn]')) return
  const s = document.createElement('script')
  s.src = 'https://cdn.tailwindcss.com'
  s.setAttribute('data-tw-cdn', '')
  s.onload = () => {
    // @ts-ignore – runtime global injected by CDN
    if (window.tailwind) {
      // @ts-ignore
      window.tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              brand: { navy: '#011A27', dark: '#043B56', blue: '#0B618F', sky: '#24ACEE', green: '#3AB75D' },
              surface: { 'off-white': '#F1F7F6', 'pale-blue': '#EEF9FD', sage: '#E5EDEB', 'sage-dark': '#D1D9D7' },
              ink: { primary: '#171918', secondary: '#525857', muted: '#696F6E' },
              dark: { bg: '#161b22', sidebar: '#161b22', surface: '#21262d', border: '#30363d', text: '#e6edf3', muted: '#8b949e', subtle: '#6e7681' },
            },
          },
        },
      }
    }
  }
  document.head.appendChild(s)
}
</script>
