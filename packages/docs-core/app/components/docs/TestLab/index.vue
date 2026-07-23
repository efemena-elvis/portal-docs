<template>
  <!-- Backdrop -->
  <Transition name="tl-backdrop">
    <div v-if="open" class="fixed inset-0 z-40 bg-ink-primary/20 dark:bg-black/40 pointer-events-none" />
  </Transition>

  <!-- Panel -->
  <Transition name="tl-slide">
    <div
      v-if="open"
      class="fixed top-0 right-0 h-screen z-50 flex flex-col bg-white dark:bg-dark-surface border-l border-surface-sage dark:border-dark-border shadow-2xl"
      style="width: 580px"
    >
      <!-- ── Panel header ─────────────────────────────────────────── -->
      <div class="shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-surface-sage dark:border-dark-border">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-brand-green shrink-0" aria-hidden="true">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="10" y1="13" x2="10" y2="17"/><line x1="14" y1="13" x2="14" y2="17"/>
          </svg>
          <span class="text-sm font-semibold text-ink-primary dark:text-dark-text">Test Lab</span>
          <span class="text-xs text-ink-muted dark:text-dark-subtle">· {{ localMethod }} {{ shortPath }}</span>
        </div>
        <button
          type="button"
          class="shrink-0 p-1.5 rounded-md text-ink-muted dark:text-dark-muted hover:text-ink-primary dark:hover:text-dark-text hover:bg-surface-sage dark:hover:bg-dark-border transition-colors"
          @click="$emit('close')"
        >
          <UiIcon name="close" size="sm" />
        </button>
      </div>

      <!-- ── Request row ──────────────────────────────────────────── -->
      <div class="shrink-0 flex items-center gap-2.5 px-5 py-3 border-b border-surface-sage dark:border-dark-border bg-surface-off-white dark:bg-dark-sidebar">
        <!-- Method: custom dropdown (admin) or static badge (viewer) -->
        <div v-if="isAdmin" class="relative shrink-0">
          <button
            type="button"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider font-sans select-none"
            :style="methodBadgeStyle"
            @click.stop="methodDropdownOpen = !methodDropdownOpen"
          >
            {{ localMethod }}
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <!-- Click-away overlay -->
          <div
            v-if="methodDropdownOpen"
            class="fixed inset-0"
            style="z-index: 51"
            @click="methodDropdownOpen = false"
          />
          <!-- Dropdown menu -->
          <div
            v-if="methodDropdownOpen"
            class="absolute top-full left-0 mt-1.5 bg-white dark:bg-dark-surface border border-surface-sage-dark dark:border-dark-border rounded-lg shadow-xl py-1 min-w-[104px]"
            style="z-index: 52"
          >
            <button
              v-for="m in HTTP_METHODS"
              :key="m"
              type="button"
              class="w-full flex items-center gap-2.5 px-3 py-1.5 text-left hover:bg-surface-sage dark:hover:bg-dark-sidebar transition-colors"
              @click.stop="selectMethod(m)"
            >
              <span
                class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                :style="methodColorStyle(m)"
              >{{ m }}</span>
            </button>
          </div>
        </div>
        <span
          v-else
          class="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider font-sans"
          :style="methodBadgeStyle"
        >{{ localMethod }}</span>

        <!-- URL row: base_url label + editable path (admin) or static (viewer) -->
        <div class="flex-1 min-w-0 overflow-hidden flex items-center font-mono text-[12.5px]">
          <span class="shrink-0 text-[#e07b3c] dark:text-[#e8a76b]">{{ baseUrlLabel }}</span>
          <input
            v-if="isAdmin"
            v-model="localPath"
            class="flex-1 min-w-0 bg-transparent border-none outline-none text-ink-primary dark:text-dark-text font-mono text-[12.5px] placeholder:text-ink-muted dark:placeholder:text-dark-subtle"
            placeholder="/path"
            spellcheck="false"
            autocomplete="off"
          />
          <span v-else class="flex-1 min-w-0 truncate text-ink-primary dark:text-dark-text">{{ localPath }}</span>
        </div>

        <button
          type="button"
          class="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold text-white transition-all duration-150 disabled:opacity-60"
          :class="sending ? 'bg-brand-green/80 cursor-not-allowed' : 'bg-brand-green hover:bg-brand-green/90 active:scale-[0.98]'"
          :disabled="sending"
          @click="sendRequest"
        >
          <svg v-if="sending" class="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          {{ sending ? 'Sending…' : 'Send' }}
        </button>
      </div>

      <!-- ── Tabs ────────────────────────────────────────────────── -->
      <div class="shrink-0 flex items-center border-b border-surface-sage dark:border-dark-border px-5">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="tab-btn"
          :class="activeTab === tab.id ? 'tab-active' : 'tab-inactive'"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
        </button>

        <!-- Copy cURL — far right of tab row -->
        <button
          type="button"
          class="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-medium border transition-all duration-150 mb-px"
          :class="curlCopied
            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
            : 'border-surface-sage-dark dark:border-dark-border text-ink-muted dark:text-dark-subtle hover:border-brand-green/40 hover:text-brand-green dark:hover:text-brand-green'"
          title="Copy as cURL"
          @click="copyCurl"
        >
          <UiIcon :name="curlCopied ? 'check' : 'copy'" size="xs" />
          {{ curlCopied ? 'Copied' : 'cURL' }}
        </button>
      </div>

      <div class="flex-1 overflow-y-auto">
        <!-- Auth tab -->
        <div v-if="activeTab === 'auth'" class="p-5 space-y-4">
          <div>
            <label class="tl-label">API Key <span class="tl-label-sub">x-api-key header</span></label>
            <div class="relative">
              <input
                :type="showApiKey ? 'text' : 'password'"
                :value="authKey"
                placeholder="Enter your API key…"
                class="tl-input pr-10"
                autocomplete="off"
                spellcheck="false"
                @input="authKey = ($event.target as HTMLInputElement).value"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted dark:text-dark-subtle hover:text-ink-primary dark:hover:text-dark-text transition-colors"
                @click="showApiKey = !showApiKey"
              >
                <UiIcon :name="showApiKey ? 'eyeOff' : 'eye'" size="xs" />
              </button>
            </div>
            <p class="mt-1.5 text-[11px] text-ink-muted dark:text-dark-subtle">Sent as <code class="font-mono text-brand-blue dark:text-brand-sky">x-api-key: &lt;value&gt;</code> on every request.</p>
          </div>
        </div>

        <!-- Headers tab -->
        <div v-if="activeTab === 'headers'" class="p-5 space-y-3">
          <div
            v-for="(row, ri) in headers"
            :key="ri"
            class="flex items-center gap-2"
          >
            <input
              :value="row.key"
              placeholder="Header name"
              class="tl-input flex-1 font-mono text-[12px]"
              spellcheck="false"
              @input="updateHeader(ri, 'key', ($event.target as HTMLInputElement).value)"
            />
            <input
              :value="row.value"
              placeholder="Value"
              class="tl-input flex-1 font-mono text-[12px]"
              spellcheck="false"
              @input="updateHeader(ri, 'value', ($event.target as HTMLInputElement).value)"
            />
            <button type="button" class="tl-icon-btn text-red-400 hover:text-red-500" @click="removeHeader(ri)">
              <UiIcon name="close" size="xs" />
            </button>
          </div>
          <button type="button" class="tl-add-btn" @click="addHeader">
            <UiIcon name="plus" size="xs" />
            Add header
          </button>
        </div>

        <!-- Body tab -->
        <div v-if="activeTab === 'body'" class="p-5">
          <DocsTestLabJsonEditor v-model="body" />
        </div>

        <!-- Variables tab (admin only) -->
        <div v-if="activeTab === 'variables'" class="p-5 space-y-4">
          <p class="text-[11.5px] text-ink-muted dark:text-dark-subtle leading-relaxed">
            Define global variables. Use
            <code class="font-mono text-[#e07b3c] dark:text-[#e8a76b] bg-surface-sage dark:bg-dark-sidebar px-1 py-0.5 rounded text-[11px]">&#123;&#123;key&#125;&#125;</code>
            in paths, headers, and body to substitute values at send-time.
          </p>

          <div class="space-y-2">
            <div
              v-for="(row, vi) in variableRows"
              :key="vi"
              class="flex items-center gap-2"
            >
              <input
                :value="row.key"
                placeholder="variable_name"
                class="tl-input flex-1 font-mono text-[12px]"
                spellcheck="false"
                @input="updateVariable(vi, 'key', ($event.target as HTMLInputElement).value)"
              />
              <input
                :value="row.value"
                placeholder="value"
                class="tl-input flex-1 font-mono text-[12px]"
                spellcheck="false"
                @input="updateVariable(vi, 'value', ($event.target as HTMLInputElement).value)"
              />
              <button type="button" class="tl-icon-btn text-red-400 hover:text-red-500" @click="removeVariable(vi)">
                <UiIcon name="close" size="xs" />
              </button>
            </div>
          </div>

          <button type="button" class="tl-add-btn" @click="addVariable">
            <UiIcon name="plus" size="xs" />
            Add variable
          </button>

          <div class="pt-3 border-t border-surface-sage dark:border-dark-border flex items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold text-white bg-brand-green hover:bg-brand-green/90 transition-colors disabled:opacity-60"
              :disabled="variablesSaving"
              @click="saveVariables"
            >
              <svg v-if="variablesSaving" class="animate-spin shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <UiIcon v-else name="save" size="xs" class="shrink-0" />
              {{ variablesSaving ? 'Saving…' : 'Save variables' }}
            </button>
            <span v-if="variablesSaved" class="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium">Saved</span>
          </div>
        </div>
      </div>

      <!-- ── Response area ────────────────────────────────────────── -->
      <div class="shrink-0 border-t border-surface-sage dark:border-dark-border" :class="response || sendError ? 'flex-[0_0_auto]' : ''">
        <!-- Empty state -->
        <div v-if="!response && !sendError && !sending" class="flex items-center justify-center gap-2 py-5 text-[12px] text-ink-muted dark:text-dark-subtle">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Hit Send to see the response
        </div>

        <!-- Network / CORS error -->
        <div v-else-if="sendError" class="px-5 py-4">
          <div class="flex items-start gap-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 px-4 py-3">
            <UiIcon name="alertTriangle" size="sm" class="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p class="text-[12.5px] font-medium text-red-700 dark:text-red-400">Request failed</p>
              <p class="text-[11.5px] text-red-600 dark:text-red-500 mt-0.5">{{ sendError }}</p>
            </div>
          </div>
        </div>

        <!-- Response -->
        <div v-else-if="response" class="flex flex-col" style="max-height: 360px">
          <!-- Response meta bar -->
          <div class="shrink-0 flex items-center gap-3 px-5 py-3 border-b border-surface-sage dark:border-dark-border bg-surface-off-white dark:bg-dark-sidebar">
            <span class="text-[12.5px] font-semibold text-ink-primary dark:text-dark-text">Response</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold" :class="statusBadgeClass">
              {{ response.status }} {{ response.statusText }}
            </span>
            <span class="text-[11px] text-ink-muted dark:text-dark-subtle ml-auto">{{ response.duration }}ms</span>
          </div>

          <!-- Response tabs -->
          <div class="shrink-0 flex border-b border-surface-sage dark:border-dark-border px-5">
            <button v-for="rt in ['Body', 'Headers']" :key="rt" type="button"
              class="tab-btn text-[11px]"
              :class="responseTab === rt ? 'tab-active' : 'tab-inactive'"
              @click="responseTab = rt"
            >{{ rt }}</button>
          </div>

          <!-- Response body -->
          <div v-if="responseTab === 'Body'" class="flex-1 overflow-auto">
            <pre class="text-[12px] font-mono leading-relaxed p-5 whitespace-pre-wrap break-all text-ink-primary dark:text-dark-text bg-surface-off-white dark:bg-dark-sidebar">{{ prettyResponseBody }}</pre>
          </div>

          <!-- Response headers -->
          <div v-else class="flex-1 overflow-auto p-5 space-y-1.5">
            <div v-for="(val, key) in response.headers" :key="key" class="flex gap-3 text-[12px] font-mono">
              <span class="text-ink-muted dark:text-dark-subtle shrink-0">{{ key }}</span>
              <span class="text-ink-primary dark:text-dark-text break-all">{{ val }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Admin save bar ───────────────────────────────────────── -->
      <div v-if="isAdmin" class="shrink-0 border-t border-surface-sage dark:border-dark-border bg-surface-off-white dark:bg-dark-sidebar px-5 py-3">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-[11px] font-medium text-ink-muted dark:text-dark-subtle mr-1">Save to draft:</span>
          <button type="button" class="save-chip" @click="saveAuth">Auth</button>
          <button type="button" class="save-chip" @click="saveHeaders">Headers</button>
          <button type="button" class="save-chip" @click="saveBody">Body</button>
          <!-- Path & method chip — only visible when changed -->
          <button
            v-if="isMethodPathDirty"
            type="button"
            class="save-chip"
            @click="saveMethodPath"
          >
            <UiIcon name="save" size="xs" class="shrink-0" />
            Save path &amp; method
          </button>
          <!-- Save response chip -->
          <button
            v-if="response && response.status >= 200 && response.status < 600"
            type="button"
            class="save-chip ml-auto transition-all duration-150"
            :class="saveResponseState === 'saved'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
              : 'save-chip-green'"
            :disabled="saveResponseState !== 'idle'"
            @click="saveResponse"
          >
            <svg v-if="saveResponseState === 'saving'" class="animate-spin shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <UiIcon v-else-if="saveResponseState === 'saved'" name="check" size="xs" class="shrink-0" />
            <UiIcon v-else name="plus" size="xs" class="shrink-0" />
            {{ saveResponseState === 'saving' ? 'Saving…' : saveResponseState === 'saved' ? 'Saved' : 'Save response' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { CollectionHeader } from '~/types/page'

interface Props {
  open: boolean
  method: string
  path: string
  baseUrl: string
  headers: CollectionHeader[]
  body: string | null
  auth: string | null
}

interface ResponseData {
  status: number
  statusText: string
  duration: number
  body: string
  headers: Record<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'save-auth': [value: string]
  'save-headers': [headers: CollectionHeader[]]
  'save-body': [body: string]
  'save-response': [entry: { status: number; statusText: string; body: string }]
  'save-method-path': [payload: { method: string; path: string }]
}>()

const { isAdmin, authHeaders } = useAdmin()

const baseUrlLabel = '{{base_url}}'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

// ── Local state ───────────────────────────────────────────────────────────────

const activeTab = ref<'auth' | 'headers' | 'body' | 'variables'>('body')
const responseTab = ref('Body')
const showApiKey = ref(false)
const sending = ref(false)
const sendError = ref<string | null>(null)
const response = ref<ResponseData | null>(null)

// Editable method + path (admin can change these)
const localMethod = ref(props.method)
const localPath = ref(props.path)
const methodDropdownOpen = ref(false)

// Keep in sync when parent updates (e.g. after save)
watch(() => props.method, (v) => { localMethod.value = v })
watch(() => props.path, (v) => { localPath.value = v })

// Editable copies — pre-filled from props
const authKey = ref(props.auth ?? '')
const headers = ref<{ key: string; value: string }[]>([])
const body = ref(props.body ?? '{}')

// Variables (admin only)
const variableRows = ref<{ key: string; value: string }[]>([])
const variablesSaving = ref(false)
const variablesSaved = ref(false)

// Seed headers from props
watchEffect(() => {
  headers.value = props.headers
    .filter(h => !h.disabled)
    .map(h => ({ key: h.key, value: h.value ?? '' }))
})

// Seed auth
watchEffect(() => { authKey.value = props.auth ?? '' })

// Seed body
watchEffect(() => { body.value = props.body ?? '{}' })

// Load variables on mount (admin only)
onMounted(async () => {
  if (!isAdmin.value) return
  try {
    const data = await $fetch<Record<string, string>>('/api/admin/variables', {
      headers: authHeaders(),
    })
    variableRows.value = Object.entries(data).map(([key, value]) => ({ key, value }))
    if (variableRows.value.length === 0) {
      variableRows.value.push({ key: '', value: '' })
    }
  } catch {
    variableRows.value = [{ key: '', value: '' }]
  }
})

// ── Computed ──────────────────────────────────────────────────────────────────

const shortPath = computed(() => {
  const p = localPath.value
  return p.length > 40 ? '…' + p.slice(-38) : p
})

const METHOD_COLORS: Record<string, { bg: string; color: string }> = {
  GET:    { bg: '#1a5c38', color: '#5de898' },
  POST:   { bg: '#1a3f70', color: '#7ab8f5' },
  PUT:    { bg: '#6b3d12', color: '#f5c06a' },
  PATCH:  { bg: '#4a2870', color: '#c9a0f5' },
  DELETE: { bg: '#6b1a1a', color: '#f5706a' },
}

const methodBadgeStyle = computed(() => {
  const c = METHOD_COLORS[localMethod.value.toUpperCase()] ?? { bg: '#394a5c', color: '#cdd9e5' }
  return { background: c.bg, color: c.color }
})

function methodColorStyle(m: string) {
  const c = METHOD_COLORS[m.toUpperCase()] ?? { bg: '#394a5c', color: '#cdd9e5' }
  return { background: c.bg, color: c.color }
}

function selectMethod(m: string) {
  localMethod.value = m
  methodDropdownOpen.value = false
}

const isMethodPathDirty = computed(() =>
  localMethod.value !== props.method || localPath.value !== props.path
)

const tabs = computed(() => {
  const base: { id: 'auth' | 'headers' | 'body' | 'variables'; label: string; count: number }[] = [
    { id: 'auth',    label: 'Auth',    count: authKey.value ? 1 : 0 },
    { id: 'headers', label: 'Headers', count: headers.value.filter(h => h.key).length },
    { id: 'body',    label: 'Body',    count: 0 },
  ]
  if (isAdmin.value) {
    base.push({
      id: 'variables',
      label: 'Variables',
      count: variableRows.value.filter(r => r.key.trim()).length,
    })
  }
  return base
})

const statusBadgeClass = computed(() => {
  const s = response.value?.status ?? 0
  if (s >= 200 && s < 300) return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
  if (s >= 400 && s < 500) return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
  if (s >= 500)            return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
  return 'bg-surface-sage dark:bg-dark-sidebar text-ink-muted dark:text-dark-subtle'
})

const prettyResponseBody = computed(() => {
  if (!response.value?.body) return ''
  try { return JSON.stringify(JSON.parse(response.value.body), null, 2) }
  catch { return response.value.body }
})

// ── cURL copy ─────────────────────────────────────────────────────────────────

const curlCopied = ref(false)

const curlCommand = computed(() => {
  const resolvedPath = applyVars(localPath.value)
  const targetUrl = props.baseUrl.replace(/\/$/, '') + resolvedPath
  const method = localMethod.value.toUpperCase()

  const reqHeaders: Record<string, string> = {}
  if (authKey.value) reqHeaders['x-api-key'] = applyVars(authKey.value)
  for (const h of headers.value) {
    if (h.key.trim()) reqHeaders[h.key.trim()] = applyVars(h.value)
  }
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method)
  if (hasBody && !reqHeaders['Content-Type'] && !reqHeaders['content-type']) {
    reqHeaders['Content-Type'] = 'application/json'
  }

  const parts: string[] = [`curl -X ${method} "${targetUrl}"`]
  for (const [k, v] of Object.entries(reqHeaders)) {
    parts.push(`  -H "${k}: ${v.replace(/"/g, '\\"')}"`)
  }
  if (hasBody && body.value && body.value.trim() !== '{}') {
    const escaped = applyVars(body.value).replace(/'/g, "'\\''")
    parts.push(`  -d '${escaped}'`)
  }
  return parts.join(' \\\n')
})

async function copyCurl() {
  await navigator.clipboard.writeText(curlCommand.value)
  curlCopied.value = true
  setTimeout(() => { curlCopied.value = false }, 2000)
}

// ── Variable helpers ──────────────────────────────────────────────────────────

function applyVars(str: string): string {
  const vars: Record<string, string> = {}
  for (const row of variableRows.value) {
    if (row.key.trim()) vars[row.key.trim()] = row.value
  }
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

function addVariable() {
  variableRows.value.push({ key: '', value: '' })
}

function removeVariable(vi: number) {
  variableRows.value.splice(vi, 1)
}

function updateVariable(vi: number, field: 'key' | 'value', val: string) {
  variableRows.value[vi]![field] = val
}

async function saveVariables() {
  if (variablesSaving.value) return
  variablesSaving.value = true
  variablesSaved.value = false
  try {
    const payload: Record<string, string> = {}
    for (const row of variableRows.value) {
      if (row.key.trim()) payload[row.key.trim()] = row.value
    }
    await $fetch('/api/admin/variables', {
      method: 'POST',
      headers: authHeaders(),
      body: payload,
    })
    variablesSaved.value = true
    setTimeout(() => { variablesSaved.value = false }, 2500)
  } catch (err) {
    console.error('Failed to save variables', err)
  } finally {
    variablesSaving.value = false
  }
}

// ── Header helpers ────────────────────────────────────────────────────────────

function addHeader() {
  headers.value.push({ key: '', value: '' })
}

function removeHeader(ri: number) {
  headers.value.splice(ri, 1)
}

function updateHeader(ri: number, field: 'key' | 'value', val: string) {
  headers.value[ri]![field] = val
}

// ── Send request (server-side proxy to bypass CORS) ──────────────────────────

async function sendRequest() {
  if (sending.value) return
  sending.value = true
  sendError.value = null
  response.value = null
  responseTab.value = 'Body'

  const resolvedPath = applyVars(localPath.value)
  const targetUrl = props.baseUrl.replace(/\/$/, '') + resolvedPath
  const method = localMethod.value.toUpperCase()

  const reqHeaders: Record<string, string> = {}
  if (authKey.value) reqHeaders['x-api-key'] = applyVars(authKey.value)
  for (const h of headers.value) {
    if (h.key.trim()) reqHeaders[h.key.trim()] = applyVars(h.value)
  }

  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method)
  if (hasBody && !reqHeaders['Content-Type'] && !reqHeaders['content-type']) {
    reqHeaders['Content-Type'] = 'application/json'
  }

  const t0 = Date.now()
  try {
    const res = await $fetch<{
      status: number
      statusText: string
      headers: Record<string, string>
      body: string
    }>('/api/testlab-proxy', {
      method: 'POST',
      body: {
        url: targetUrl,
        method,
        headers: reqHeaders,
        body: hasBody && body.value ? applyVars(body.value) : undefined,
      },
    })

    response.value = {
      status: res.status,
      statusText: res.statusText || httpStatusText(res.status),
      duration: Date.now() - t0,
      body: res.body,
      headers: res.headers,
    }
  } catch (err: any) {
    const data = err?.data
    if (data?.status) {
      response.value = {
        status: data.status,
        statusText: data.statusText || httpStatusText(data.status),
        duration: Date.now() - t0,
        body: data.body ?? '',
        headers: data.headers ?? {},
      }
    } else {
      sendError.value = err?.message ?? 'Request failed'
    }
  } finally {
    sending.value = false
  }
}

function httpStatusText(code: number): string {
  const map: Record<number, string> = {
    200:'OK', 201:'Created', 204:'No Content', 400:'Bad Request',
    401:'Unauthorized', 403:'Forbidden', 404:'Not Found', 409:'Conflict',
    422:'Unprocessable Entity', 429:'Too Many Requests', 500:'Internal Server Error',
  }
  return map[code] ?? ''
}

// ── Admin save actions ────────────────────────────────────────────────────────

function saveAuth() {
  emit('save-auth', authKey.value)
}

function saveHeaders() {
  const out: CollectionHeader[] = headers.value
    .filter(h => h.key.trim())
    .map(h => ({ key: h.key, value: h.value, description: '', disabled: false }))
  emit('save-headers', out)
}

function saveBody() {
  emit('save-body', body.value)
}

function saveMethodPath() {
  emit('save-method-path', { method: localMethod.value, path: localPath.value })
}

const saveResponseState = ref<'idle' | 'saving' | 'saved'>('idle')

function saveResponse() {
  if (!response.value || saveResponseState.value !== 'idle') return
  saveResponseState.value = 'saving'
  emit('save-response', {
    status: response.value.status,
    statusText: response.value.statusText,
    body: prettyResponseBody.value || response.value.body,
  })
  setTimeout(() => {
    saveResponseState.value = 'saved'
    setTimeout(() => { saveResponseState.value = 'idle' }, 2500)
  }, 700)
}

// Reset saved state when a new response arrives
watch(response, () => { saveResponseState.value = 'idle' })
</script>

<style scoped>
/* Panel transitions */
.tl-backdrop-enter-active, .tl-backdrop-leave-active { transition: opacity 0.25s ease; }
.tl-backdrop-enter-from, .tl-backdrop-leave-to { opacity: 0; }
.tl-slide-enter-active, .tl-slide-leave-active { transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); }
.tl-slide-enter-from, .tl-slide-leave-to { transform: translateX(100%); }

/* Tabs */
.tab-btn { @apply relative flex items-center gap-1.5 px-1 py-2.5 mr-5 text-[12.5px] font-medium transition-colors border-b-2 -mb-px; }
.tab-active { @apply border-brand-green text-ink-primary dark:text-dark-text; }
.tab-inactive { @apply border-transparent text-ink-muted dark:text-dark-subtle hover:text-ink-secondary dark:hover:text-dark-muted; }
.tab-count { @apply inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold bg-brand-green/15 text-brand-green; }

/* Form inputs */
.tl-input {
  @apply w-full h-9 px-3 rounded-lg text-[12.5px] text-ink-primary dark:text-dark-text bg-white dark:bg-dark-sidebar border border-surface-sage-dark dark:border-dark-border placeholder:text-ink-muted dark:placeholder:text-dark-subtle transition-colors focus:outline-none focus:border-brand-green dark:focus:border-brand-green;
}
.tl-label { @apply block text-[11.5px] font-semibold text-ink-secondary dark:text-dark-muted mb-1.5 uppercase tracking-wide; }
.tl-label-sub { @apply normal-case tracking-normal font-normal text-ink-muted dark:text-dark-subtle ml-1; }

/* Icon button */
.tl-icon-btn { @apply p-1 rounded transition-colors; }

/* Add row button */
.tl-add-btn { @apply inline-flex items-center gap-1.5 text-[12px] font-medium text-brand-green hover:text-brand-green/70 transition-colors mt-1; }

/* Admin save chips */
.save-chip {
  @apply inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors;
  @apply text-ink-secondary dark:text-dark-muted bg-white dark:bg-dark-surface border border-surface-sage-dark dark:border-dark-border;
  @apply hover:border-brand-green/50 hover:text-brand-green dark:hover:text-brand-green;
}
.save-chip-green {
  @apply bg-brand-green/10 text-brand-green border-brand-green/30 hover:bg-brand-green/15;
}
</style>
