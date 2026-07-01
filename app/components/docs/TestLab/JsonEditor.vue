<template>
  <div class="json-editor-wrap">
    <div ref="editorEl" class="json-editor" />
    <div class="json-editor-footer">
      <span v-if="jsonError" class="json-status error">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Invalid JSON
      </span>
      <span v-else class="json-status valid">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        Valid JSON
      </span>
      <button type="button" class="beautify-btn" @click="beautify">Beautify</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { json } from '@codemirror/lang-json'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { indentOnInput, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editorEl = ref<HTMLElement | null>(null)
let view: EditorView | null = null

const jsonError = ref(false)

function checkValidity(code: string) {
  if (!code.trim()) { jsonError.value = false; return }
  try { JSON.parse(code); jsonError.value = false }
  catch { jsonError.value = true }
}

function beautify() {
  if (!view) return
  const raw = view.state.doc.toString()
  try {
    const pretty = JSON.stringify(JSON.parse(raw), null, 2)
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: pretty },
    })
  } catch {
    // invalid JSON — do nothing, error indicator is already shown
  }
}

onMounted(() => {
  if (!editorEl.value) return

  try {
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const val = update.state.doc.toString()
        checkValidity(val)
        emit('update:modelValue', val)
      }
    })

    const lightTheme = EditorView.theme({
      '&': { maxHeight: '320px', minHeight: '120px', background: '#ffffff' },
      '.cm-scroller': { overflow: 'auto', fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace', fontSize: '12.5px', lineHeight: '1.6' },
      '.cm-content': { padding: '12px 0', caretColor: '#374151' },
      '.cm-line': { padding: '0 16px', color: '#1f2937' },
      '.cm-gutters': { background: '#f9fafb', borderRight: '1px solid #e5e7eb', color: '#9ca3af', paddingRight: '4px', minWidth: '36px' },
      '.cm-activeLineGutter': { backgroundColor: '#f3f4f6' },
      '.cm-activeLine': { backgroundColor: '#f8fafc' },
      '.cm-selectionBackground, ::selection': { backgroundColor: '#bfdbfe' },
      '.cm-cursor': { borderLeftColor: '#374151' },
      '.cm-foldPlaceholder': { backgroundColor: '#e5e7eb', border: 'none', color: '#6b7280', borderRadius: '3px', padding: '0 4px' },
    }, { dark: false })

    view = new EditorView({
      parent: editorEl.value,
      state: EditorState.create({
        doc: props.modelValue,
        extensions: [
          lightTheme,
          json(),
          history(),
          lineNumbers(),
          foldGutter(),
          drawSelection(),
          indentOnInput(),
          bracketMatching(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...foldKeymap,
            indentWithTab,
          ]),
          updateListener,
        ],
      }),
    })

    checkValidity(props.modelValue)
  } catch (err) {
    console.error('[JsonEditor] Failed to initialize CodeMirror:', err)
  }
})

watch(() => props.modelValue, (newVal) => {
  if (!view) return
  const current = view.state.doc.toString()
  if (current === newVal) return
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: newVal },
  })
})

onBeforeUnmount(() => {
  view?.destroy()
  view = null
})

defineExpose({ beautify })
</script>

<style scoped>
.json-editor-wrap {
  @apply rounded-lg overflow-hidden border border-surface-sage dark:border-dark-border;
}
.json-editor :deep(.cm-editor) {
  outline: none !important;
}
.json-editor :deep(.cm-editor.cm-focused) {
  outline: none !important;
  box-shadow: none !important;
}
.json-editor-footer {
  @apply flex items-center justify-between px-3 py-1.5 border-t border-surface-sage dark:border-dark-border bg-surface-off-white dark:bg-dark-sidebar;
}
.json-status {
  @apply inline-flex items-center gap-1 text-[11px] font-medium;
}
.json-status.valid { @apply text-emerald-600 dark:text-emerald-400; }
.json-status.error { @apply text-red-500 dark:text-red-400; }
.beautify-btn {
  @apply text-[11px] font-medium px-2 py-0.5 rounded transition-colors;
  @apply text-ink-secondary dark:text-dark-muted bg-white dark:bg-dark-surface border border-surface-sage-dark dark:border-dark-border;
}
.beautify-btn:hover {
  @apply text-ink-primary dark:text-dark-text;
}
</style>
