<template>
  <div
    class="w-[420px] flex-none flex flex-col bg-brand-navy overflow-y-auto border-l border-white/10"
  >
    <!-- Panel header -->
    <div class="flex items-center justify-between px-4 pt-5 pb-3 flex-none">
      <UiText variant="label" class="uppercase tracking-wider text-white/50"
        >Request</UiText
      >
      <UiCopyButton :text="generatedCode" size="xs" />
    </div>

    <!-- Language tabs -->
    <div class="flex gap-0 px-4 mb-0 flex-none border-b border-white/10">
      <button
        v-for="lang in LANGUAGES"
        :key="lang.id"
        class="px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px"
        :class="
          activeLang === lang.id
            ? 'border-brand-green text-white'
            : 'border-transparent text-white/40 hover:text-white/70'
        "
        @click="activeLang = lang.id"
      >
        {{ lang.label }}
      </button>
    </div>

    <!-- Code block -->
    <div class="flex-1 overflow-y-auto p-4">
      <pre
        class="text-xs font-mono text-white/80 leading-relaxed whitespace-pre-wrap break-words"
      ><code>{{ generatedCode }}</code></pre>
    </div>

    <!-- Divider -->
    <div v-if="hasResponses" class="border-t border-white/10 flex-none" />

    <!-- Response tabs (inside dark panel) -->
    <div v-if="hasResponses" class="flex-none px-4 pt-4 pb-0">
      <UiText variant="label" class="uppercase tracking-wider text-white/50"
        >Responses</UiText
      >
    </div>
    <div v-if="hasResponses" class="px-4 pb-4">
      <!-- Response tab pills -->
      <div class="flex flex-wrap gap-1.5 mt-3 mb-3">
        <button
          v-for="(r, i) in responses"
          :key="i"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border"
          :class="
            activeResponse === i
              ? 'bg-white/10 border-white/20 text-white'
              : 'border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
          "
          @click="activeResponse = i"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="codeColor(r.code)" />
          <span>{{ r.name }}</span>
          <span class="opacity-60 font-mono">{{ r.code }}</span>
        </button>
      </div>

      <!-- Response body -->
      <div class="bg-black/30 rounded-lg overflow-hidden">
        <div
          class="flex items-center justify-between px-3 py-2 border-b border-white/10"
        >
          <span
            class="text-xs font-mono"
            :class="codeText(responses[activeResponse]?.code || 200)"
          >
            {{ responses[activeResponse]?.code }}
            {{ responses[activeResponse]?.status }}
          </span>
          <UiCopyButton :text="formattedResponse" size="xs" />
        </div>

        <pre
          class="text-xs font-mono text-white/70 p-3 overflow-x-auto leading-relaxed max-h-72"
        ><code>{{ formattedResponse }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LANGUAGES, generateCode } from "~/utils/codegen";
import type { Language } from "~/utils/codegen";
import type { CollectionHeader, SavedResponse } from "~/types/page";

const props = defineProps<{
  method: string;
  urlRaw: string;
  headers: CollectionHeader[];
  body: string | null;
  responses: SavedResponse[];
  baseUrl?: string;
}>();

const { language: preferredLanguage, setLanguage } =
  useCodeLanguagePreference();
const activeLang = ref<Language>(
  (preferredLanguage.value as Language) || "curl",
);
const activeResponse = ref(0);

watch(activeLang, (lang) => {
  setLanguage(lang);
});

onMounted(() => {
  if (
    preferredLanguage.value &&
    LANGUAGES.some((l) => l.id === preferredLanguage.value)
  ) {
    activeLang.value = preferredLanguage.value as Language;
  }
});

const hasResponses = computed(() => props.responses.length > 0);

const generatedCode = computed(() =>
  generateCode(activeLang.value, {
    method: props.method,
    urlRaw: props.urlRaw,
    headers: props.headers,
    body: props.body,
    baseUrl: props.baseUrl,
  }),
);

const formattedResponse = computed(() => {
  const body = props.responses[activeResponse.value]?.body || "";
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
});

function codeColor(code: number): string {
  if (code >= 200 && code < 300) return "bg-brand-green";
  if (code >= 400) return "bg-red-400";
  return "bg-yellow-400";
}

function codeText(code: number): string {
  if (code >= 200 && code < 300) return "text-brand-green";
  if (code >= 400) return "text-red-400";
  return "text-yellow-400";
}
</script>
