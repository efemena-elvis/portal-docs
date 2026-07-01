<template>
  <div
    v-show="active"
    class="fixed top-0 left-0 z-[9999] h-0.5 bg-brand-green pointer-events-none transition-all duration-200 ease-out"
    :style="{ width: barWidth, opacity: fading ? 0 : 1, transition: fading ? 'opacity 300ms ease, width 200ms ease' : 'width 200ms ease' }"
  />
</template>

<script setup lang="ts">
const active = ref(false)
const progress = ref(0)
const fading = ref(false)
let ticker: ReturnType<typeof setInterval> | null = null
let fadeTimer: ReturnType<typeof setTimeout> | null = null

function start() {
  if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null }
  fading.value = false
  progress.value = 5
  active.value = true
  if (ticker) clearInterval(ticker)
  ticker = setInterval(() => {
    // Ease toward 85% asymptotically — never reaches 100 on its own
    progress.value = Math.min(progress.value + (85 - progress.value) * 0.08 + 0.5, 85)
  }, 40)
}

function finish() {
  if (ticker) { clearInterval(ticker); ticker = null }
  progress.value = 100
  fading.value = true
  fadeTimer = setTimeout(() => {
    active.value = false
    progress.value = 0
    fading.value = false
  }, 350)
}

const barWidth = computed(() => `${progress.value}%`)

const router = useRouter()
router.beforeEach((_to, from) => {
  if (!from.name && from.path === '/') return
  start()
})
router.afterEach(finish)
</script>
