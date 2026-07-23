<template>
  <!-- Backdrop -->
  <Transition name="panel-backdrop">
    <div
      v-if="open"
      class="fixed inset-0 z-40 bg-ink-primary/20 dark:bg-black/40 pointer-events-none"
    />
  </Transition>

  <!-- Panel -->
  <Transition name="panel-slide">
    <div
      v-if="open"
      class="fixed top-0 right-0 h-screen w-full sm:max-w-[480px] z-50 flex flex-col bg-white dark:bg-dark-surface border-l border-surface-sage dark:border-dark-border shadow-2xl"
    >
      <!-- Header -->
      <div class="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-surface-sage dark:border-dark-border">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <UiIcon name="settings" size="xs" class="text-ink-muted dark:text-dark-muted shrink-0" />
          <span class="text-sm font-semibold text-ink-primary dark:text-dark-text truncate">
            Configure endpoint
          </span>
        </div>
        <button
          type="button"
          class="shrink-0 p-1.5 rounded-md text-ink-muted dark:text-dark-muted hover:text-ink-primary dark:hover:text-dark-text hover:bg-surface-sage dark:hover:bg-dark-border transition-colors"
          @click="$emit('close')"
        >
          <UiIcon name="close" size="sm" />
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-4 space-y-5">
        <!-- Description -->
        <div>
          <label class="field-label">Description</label>
          <UiTextarea
            v-model="form.description"
            placeholder="A brief summary of what this endpoint does…"
            size="sm"
            style="min-height: 80px"
          />
        </div>

        <!-- Method + Path -->
        <div>
          <label class="field-label">
            Method & path
            <span class="text-red-400 ml-0.5">*</span>
          </label>
          <div class="flex gap-2">
            <!-- Inline select so the chevron stays inside the border -->
            <div class="relative shrink-0 w-28">
              <select
                v-model="form.method"
                class="w-full appearance-none text-[13px] font-medium bg-white dark:bg-dark-bg border border-surface-sage-dark dark:border-dark-border text-ink-primary dark:text-dark-text rounded-lg pl-2.5 pr-7 py-1.5 transition-colors focus:outline-none hover:border-brand-green/50 dark:hover:border-brand-green/50 focus:border-brand-green dark:focus:border-brand-green cursor-pointer"
              >
                <option v-for="opt in METHOD_OPTIONS" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
              </select>
              <div class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <UiIcon name="chevronDown" size="xs" class="text-ink-muted dark:text-dark-subtle" />
              </div>
            </div>
            <UiTextarea
              v-model="form.path"
              placeholder="/api/v1/…"
              size="sm"
              class="flex-1"
            />
          </div>
        </div>

        <!-- Request Headers -->
        <div>
          <label class="field-label">Request Headers</label>
          <p class="text-[11.5px] text-ink-muted dark:text-dark-subtle mb-2.5 leading-relaxed">
            Pre-filled from your last session. Stored for 8 hours across endpoint pages.
          </p>
          <div class="space-y-2">
            <div
              v-for="(h, i) in form.headers"
              :key="i"
              class="flex items-center gap-2"
            >
              <UiTextarea
                v-model="h.key"
                size="sm"
                placeholder="Key"
                class="flex-1 font-mono"
              />
              <UiTextarea
                v-model="h.value"
                size="sm"
                placeholder="Value"
                class="flex-1 font-mono"
              />
              <button
                type="button"
                class="shrink-0 text-ink-muted dark:text-dark-subtle hover:text-red-400 transition-colors"
                @click="removeHeader(i)"
              >
                <UiIcon name="close" size="xs" />
              </button>
            </div>
          </div>
          <button
            type="button"
            class="mt-2.5 text-sm text-brand-green hover:text-brand-green/70 transition-colors"
            @click="addHeader"
          >
            + Add header
          </button>
        </div>

        <!-- Authentication -->
        <div
          class="rounded-xl border transition-colors p-4 cursor-pointer select-none"
          :class="form.requiresAuth
            ? 'border-brand-green/40 bg-brand-green/5 dark:bg-brand-green/10'
            : 'border-surface-sage dark:border-dark-border'"
          @click="form.requiresAuth = !form.requiresAuth"
        >
          <div class="flex items-start gap-3">
            <!-- Custom checkbox -->
            <div
              class="mt-0.5 shrink-0 w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all"
              :class="form.requiresAuth
                ? 'bg-brand-green border-brand-green'
                : 'border-surface-sage-dark dark:border-dark-border bg-white dark:bg-dark-bg'"
            >
              <UiIcon
                v-if="form.requiresAuth"
                name="check"
                size="xs"
                class="text-white"
                style="width: 11px; height: 11px;"
              />
            </div>
            <div>
              <p class="text-[13px] font-semibold text-ink-primary dark:text-dark-text leading-snug">
                Requires authentication
              </p>
              <p class="text-[12px] text-ink-muted dark:text-dark-subtle mt-1 leading-relaxed">
                Adds a standard authentication note for integrators. You can customise the text later from the edit panel.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="shrink-0 flex items-center gap-2 px-4 py-3 border-t border-surface-sage dark:border-dark-border">
        <p class="flex-1 text-xs text-ink-muted dark:text-dark-subtle">
          <template v-if="!form.path.trim()">Path is required to continue</template>
          <template v-else>Ready to save</template>
        </p>
        <button
          type="button"
          class="px-3 py-1.5 rounded-md text-xs font-medium text-ink-secondary dark:text-dark-muted hover:text-ink-primary dark:hover:text-dark-text hover:bg-surface-sage dark:hover:bg-dark-border transition-colors"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-brand-green text-white hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="!form.path.trim() || saving"
          @click="handleSave"
        >
          <UiIcon v-if="saving" name="loader" size="xs" class="animate-spin" />
          Save &amp; continue
          <UiIcon v-if="!saving" name="arrowRight" size="xs" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { CollectionHeader } from '~/types/page'

interface Props {
  open: boolean
  initialMethod?: string
  initialPath?: string
  initialDescription?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialMethod: 'GET',
  initialPath: '',
  initialDescription: '',
})

const emit = defineEmits<{
  close: []
  save: [patch: Record<string, unknown>]
}>()

const SESSION_KEY = 'vesicash-configure-headers'
const SESSION_TTL = 8 * 60 * 60 * 1000 // 8 hours

const AUTH_NOTE = 'Requires a valid API key passed in the `x-api-key` request header. See the [Authentication](/getting-started/authentication) guide for details.'

const METHOD_OPTIONS = [
  { id: 'GET', label: 'GET' },
  { id: 'POST', label: 'POST' },
  { id: 'PUT', label: 'PUT' },
  { id: 'PATCH', label: 'PATCH' },
  { id: 'DELETE', label: 'DELETE' },
]

const saving = ref(false)

const form = reactive({
  description: '',
  method: 'GET',
  path: '',
  headers: [] as CollectionHeader[],
  requiresAuth: false,
})

function loadFromSession(): CollectionHeader[] {
  if (!import.meta.client) return []
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return []
    const { headers, savedAt } = JSON.parse(raw) as { headers: CollectionHeader[]; savedAt: number }
    if (Date.now() - savedAt > SESSION_TTL) {
      sessionStorage.removeItem(SESSION_KEY)
      return []
    }
    return headers
  } catch {
    return []
  }
}

function saveToSession(headers: CollectionHeader[]) {
  if (!import.meta.client) return
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ headers, savedAt: Date.now() }))
}

function addHeader() {
  form.headers.push({ key: '', value: '', description: '' })
}

function removeHeader(i: number) {
  form.headers.splice(i, 1)
}

async function handleSave() {
  if (!form.path.trim()) return
  saving.value = true

  // Persist non-empty headers to session
  const validHeaders = form.headers.filter(h => h.key.trim())
  saveToSession(validHeaders)

  emit('save', {
    description: form.description.trim() || undefined,
    method: form.method,
    path: form.path.trim(),
    headers: validHeaders,
    auth: form.requiresAuth ? AUTH_NOTE : undefined,
  })

  saving.value = false
}

// Reset form whenever panel opens
watch(() => props.open, (open) => {
  if (!open) return
  form.description = props.initialDescription ?? ''
  form.method = props.initialMethod ?? 'GET'
  form.path = props.initialPath ?? ''
  form.requiresAuth = false

  // Pre-fill headers from session
  const sessionHeaders = loadFromSession()
  form.headers = sessionHeaders.length > 0
    ? sessionHeaders.map(h => ({ ...h }))
    : []
})
</script>

<style scoped>
.field-label { @apply block text-[12px] font-semibold text-ink-secondary dark:text-dark-muted mb-1.5; }

.panel-backdrop-enter-active,
.panel-backdrop-leave-active { transition: opacity 0.25s ease; }
.panel-backdrop-enter-from,
.panel-backdrop-leave-to { opacity: 0; }

.panel-slide-enter-active,
.panel-slide-leave-active { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.panel-slide-enter-from,
.panel-slide-leave-to { transform: translateX(100%); }
</style>
