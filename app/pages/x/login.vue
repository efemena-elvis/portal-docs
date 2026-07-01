<template>
  <div class="min-h-screen bg-surface-off-white dark:bg-dark-bg flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="flex flex-col items-center mb-8">
        <img
          v-if="config.public.site.logo.image"
          :src="config.public.site.logo.image"
          :alt="config.public.site.logo.text"
          class="h-8 w-auto mb-6"
        />
        <span v-else class="text-xl font-bold text-ink-primary dark:text-dark-text mb-6">
          {{ config.public.site.logo.text }}
        </span>
        <h1 class="text-xl font-semibold text-ink-primary dark:text-dark-text">
          Editor access
        </h1>
        <p class="text-sm text-ink-muted dark:text-dark-muted mt-1 text-center">
          Enter your access code to enable editing mode
        </p>
      </div>

      <!-- Card -->
      <div class="bg-white dark:bg-dark-surface border border-surface-sage-dark dark:border-dark-border rounded-xl p-6 shadow-sm">
        <form @submit.prevent="handleLogin">
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-ink-secondary dark:text-dark-muted mb-1.5">
                Access code
              </label>
              <div class="relative">
                <UiInput
                  v-model="code"
                  :type="showCode ? 'text' : 'password'"
                  placeholder="Enter your access code"
                  icon="lock"
                  :error="!!error"
                  :disabled="loading"
                  size="lg"
                  autofocus
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted dark:text-dark-subtle hover:text-ink-primary dark:hover:text-dark-text transition-colors"
                  @click="showCode = !showCode"
                >
                  <UiIcon :name="showCode ? 'eyeOff' : 'eye'" size="sm" />
                </button>
              </div>
              <p v-if="error" class="text-xs text-red-500 mt-1.5">{{ error }}</p>
            </div>

            <UiButton
              type="submit"
              variant="primary"
              size="lg"
              :loading="loading"
              :disabled="!code || loading"
              class="w-full"
            >
              <UiIcon v-if="loading" name="loader" size="sm" class="animate-spin" />
              {{ loading ? 'Verifying…' : 'Sign in' }}
            </UiButton>
          </div>
        </form>
      </div>

      <!-- Back link -->
      <div class="text-center mt-5">
        <NuxtLink
          to="/"
          class="text-sm text-ink-muted dark:text-dark-muted hover:text-ink-primary dark:hover:text-dark-text transition-colors inline-flex items-center gap-1"
        >
          <UiIcon name="arrowLeft" size="xs" />
          Back to docs
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const config = useRuntimeConfig()
const { isAdmin, login } = useAdmin()

const code = ref('')
const showCode = ref(false)
const loading = ref(false)
const error = ref('')

// Already logged in — redirect to docs
onMounted(async () => {
  const { init } = useAdmin()
  await init()
  if (isAdmin.value) {
    await navigateTo('/')
  }
})

async function handleLogin() {
  if (!code.value || loading.value) return

  error.value = ''
  loading.value = true

  const result = await login(code.value)

  loading.value = false

  if (result.ok) {
    await navigateTo('/')
  } else {
    error.value = result.error ?? 'Invalid access code'
    code.value = ''
  }
}
</script>
