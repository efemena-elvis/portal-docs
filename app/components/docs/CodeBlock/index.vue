<template>
  <div
    class="rounded-lg overflow-hidden"
    :class="hideHeader ? '' : 'my-6'"
    style="
      background: #203146;
      font-family:
        ui-monospace, &quot;SFMono-Regular&quot;, Menlo, Monaco, Consolas,
        monospace;
      font-size: 0.8125rem;
    "
  >
    <!-- Header -->
    <div
      v-if="!hideHeader"
      class="flex items-center justify-between gap-4 px-5 pt-3.5 pb-3"
      style="background: #515f6f"
    >
      <!-- Left: method badge + path  |  response title  |  simple title -->
      <div class="flex items-center gap-2 min-w-0">
        <span
          v-if="variant === 'request' && method"
          class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-sans uppercase tracking-wider flex-none"
          :style="methodBadgeStyle"
          >{{ method }}</span
        >
        <span
          class="font-sans text-[13px] font-medium truncate"
          style="color: #cdd9e5"
          >{{ leftLabel }}</span
        >
      </div>

      <!-- Right: language switcher (request) or response code switcher (response) -->
      <select
        v-if="hasDropdown"
        v-model="selectedKey"
        class="code-block-select flex-none"
      >
        <option v-for="opt in dropdownOptions" :key="opt.key" :value="opt.key">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Code area (bottom padding reduced when footer is shown) -->
    <div class="relative">
      <div v-if="!hideCopy" class="absolute top-3 right-5 z-10">
        <button
          type="button"
          class="copy-btn inline-flex items-center gap-1.5 text-[13.25px] px-1.5 py-0.5 rounded-md transition-colors"
          @click="copyCode"
        >
          <UiIcon :name="copied ? 'check' : 'copy'" size="xs" />
          <span>{{ copied ? "Copied!" : "Copy" }}</span>
        </button>
      </div>

      <div
        class="flex overflow-x-auto"
        :class="[
          hideCopy ? 'pt-3' : 'pt-6',
          variant === 'request' ? 'pb-3' : 'py-5',
        ]"
      >
        <!-- Line number gutter -->
        <div
          class="select-none text-right flex-none border-r"
          style="
            color: #586679;
            border-color: #2d4060;
            padding: 0.5rem 1.25rem 0 1rem;
            min-width: 3.5rem;
            line-height: 1.495rem;
          "
        >
          <div v-for="n in lineCount" :key="n" style="line-height: 1.495rem">
            {{ n }}
          </div>
        </div>

        <!-- Highlighted code -->
        <div class="flex-1 overflow-x-auto" style="padding: 0 1.5rem">
          <div v-if="highlighted" class="shiki-output" v-html="highlighted" />
          <pre
            v-else
            class="whitespace-pre"
            style="
              color: #cdd9e5;
              line-height: 1.495rem;
              margin: 0;
              width: max-content;
              min-width: 100%;
              padding-top: 0.5rem;
              padding-right: 1.5rem;
            "
            >{{ activeCode }}</pre
          >
        </div>
      </div>
    </div>

    <!-- Test Lab footer — request variant only -->
    <div
      v-if="variant === 'request'"
      class="flex items-center justify-between px-5 py-2.5 border-t"
      style="background: #515f6f; border-color: #3a4f63"
    >
      <span
        class="text-[11.5px] font-sans"
        style="color: rgba(205, 217, 229, 0.8)"
      >
        Test this endpoint interactively
      </span>
      <button
        type="button"
        class="test-lab-btn inline-flex items-center gap-1.5 text-[12.5px] font-semibold font-sans px-3.5 py-1.5 rounded-md transition-colors"
        @click="$emit('open-test-lab')"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"
          />
        </svg>
        Open Test Lab
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHighlighter } from "~/composables/useHighlighter";
import type { LanguageOption, ResponseOption } from "~/types/docs";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  /**
   * request — shows HTTP method badge + path on the left, optional language
   *           switcher dropdown on the right.
   * response — shows a title ("Response sample") on the left, optional
   *            response-code switcher dropdown on the right.
   * simple  — (default) shows a plain title on the left, no right controls.
   */
  variant?: "request" | "response" | "simple";

  // ── Direct code (used when there is no multi-option dropdown) ──
  code?: string;
  language?: string;

  // ── Simple / response: left-side title ──
  title?: string;

  // ── Request variant ──
  method?: string; // e.g. "POST"
  path?: string; // e.g. "/api/v1/transactions/{reference}"
  /** Multiple languages to show in the language switcher */
  languages?: LanguageOption[];

  // ── Response variant ──
  /** Multiple responses to show in the response-code switcher */
  responses?: ResponseOption[];

  // ── Visibility ──
  hideHeader?: boolean;
  hideCopy?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "simple",
  language: "text",
  hideHeader: false,
  hideCopy: false,
});

defineEmits<{ "open-test-lab": [] }>();

// ── Dropdown options ──────────────────────────────────────────────────────────

interface DropdownOption {
  key: string;
  label: string;
  code: string;
  language: string;
}

const dropdownOptions = computed<DropdownOption[]>(() => {
  if (props.variant === "request" && props.languages?.length) {
    return props.languages.map((l) => ({
      key: l.language,
      label: l.label,
      code: l.code,
      language: l.language,
    }));
  }
  if (props.variant === "response" && props.responses?.length) {
    return props.responses.map((r) => ({
      key: r.label,
      label: r.label,
      code: r.code,
      language: r.language ?? "json",
    }));
  }
  return [];
});

const hasDropdown = computed(() => dropdownOptions.value.length > 1);

const selectedKey = ref(dropdownOptions.value[0]?.key ?? "");

// Reset selection if options change (e.g. on navigation)
watch(dropdownOptions, (opts) => {
  if (!opts.find((o) => o.key === selectedKey.value)) {
    selectedKey.value = opts[0]?.key ?? "";
  }
});

const activeOption = computed(
  () => dropdownOptions.value.find((o) => o.key === selectedKey.value) ?? null,
);

const activeCode = computed(() => activeOption.value?.code ?? props.code ?? "");
const activeLanguage = computed(
  () => activeOption.value?.language ?? props.language ?? "text",
);

// ── Header left label ─────────────────────────────────────────────────────────

const leftLabel = computed(() => {
  if (props.variant === "request") return props.path ?? "";
  if (props.variant === "response") return props.title ?? "Response sample";
  return props.title ?? resolveDisplayLanguage(activeLanguage.value);
});

// ── Method badge colour ───────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, { bg: string; color: string }> = {
  GET: { bg: "#1a5c38", color: "#5de898" },
  POST: { bg: "#1a3f70", color: "#7ab8f5" },
  PUT: { bg: "#6b3d12", color: "#f5c06a" },
  PATCH: { bg: "#4a2870", color: "#c9a0f5" },
  DELETE: { bg: "#6b1a1a", color: "#f5706a" },
};

const methodBadgeStyle = computed(() => {
  const c = METHOD_COLORS[(props.method ?? "").toUpperCase()] ?? {
    bg: "#394a5c",
    color: "#cdd9e5",
  };
  return { background: c.bg, color: c.color };
});

// ── Syntax highlighting ───────────────────────────────────────────────────────

const lineCount = computed(() => (activeCode.value || "").split("\n").length);
const highlighted = ref("");
const copied = ref(false);
let copyTimer: ReturnType<typeof setTimeout> | null = null;

function copyCode() {
  if (!activeCode.value) return;
  navigator.clipboard.writeText(activeCode.value).then(() => {
    copied.value = true;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copied.value = false;
    }, 1500);
  });
}

function resolveDisplayLanguage(lang: string): string {
  const map: Record<string, string> = {
    bash: "cURL",
    shell: "cURL",
    curl: "cURL",
    javascript: "Node.js",
    js: "Node.js",
    typescript: "TypeScript",
    ts: "TypeScript",
    python: "Python",
    php: "PHP",
    go: "Go",
    ruby: "Ruby",
    json: "JSON",
  };
  return map[lang] || lang.toUpperCase();
}

function normalizeLang(lang: string): string {
  if (["curl", "bash", "shell"].includes(lang)) return "bash";
  if (["node", "js"].includes(lang)) return "javascript";
  if (lang === "ts") return "typescript";
  const supported = [
    "bash",
    "json",
    "javascript",
    "typescript",
    "python",
    "php",
    "go",
    "ruby",
    "html",
    "css",
    "markdown",
  ];
  return supported.includes(lang) ? lang : "text";
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function highlight() {
  if (!activeCode.value) {
    highlighted.value = "";
    return;
  }
  try {
    const h = await useHighlighter();
    highlighted.value = h.codeToHtml(activeCode.value, {
      lang: normalizeLang(activeLanguage.value),
      theme: "tokyo-night",
    });
  } catch {
    highlighted.value = `<pre style="margin:0;color:#cdd9e5"><code>${escapeHtml(activeCode.value)}</code></pre>`;
  }
}

onMounted(highlight);
watch([activeCode, activeLanguage], highlight);
</script>

<style>
.shiki-output pre {
  margin: 0;
  width: max-content;
  min-width: 100%;
  padding: 0.5rem 1.5rem 0 0;
  background: transparent !important;
  line-height: 1.495rem;
}
.shiki-output code {
  display: block;
  line-height: 0;
}
.shiki-output .line {
  display: block;
  min-height: 1.495rem;
  line-height: 1.495rem;
}

.copy-btn {
  color: rgba(205, 217, 229, 0.65);
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.copy-btn:hover {
  color: rgba(205, 217, 229, 0.95);
  background: rgba(255, 255, 255, 0.13);
}

.test-lab-btn {
  color: #ffffff;
  background: #3ab75d;
  border: 1px solid transparent;
}
.test-lab-btn:hover {
  background: #33a554;
}

/* Dropdown select in the code block header */
.code-block-select {
  appearance: none;
  background-color: rgba(255, 255, 255, 0.1);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23cdd9e5' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 7px center;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #cdd9e5;
  font-size: 12px;
  font-family: ui-sans-serif, system-ui, sans-serif;
  padding: 3px 26px 3px 9px;
  cursor: pointer;
  outline: none;
  transition:
    background-color 0.15s,
    border-color 0.15s;
}
.code-block-select:hover {
  background-color: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.25);
}
.code-block-select option {
  background: #2a3f55;
  color: #cdd9e5;
}
</style>
