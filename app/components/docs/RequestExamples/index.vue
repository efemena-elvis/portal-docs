<template>
  <DocsCodeBlock
    variant="request"
    :method="method"
    :path="urlPath"
    :languages="languageOptions"
    @open-test-lab="$emit('open-test-lab')"
  />
</template>

<script setup lang="ts">
import type { CollectionHeader } from "~/types/page";
import type { TableRow, LanguageOption } from "~/types/docs";

interface Props {
  method: string;
  urlPath: string;
  headers: CollectionHeader[];
  body: string | null;
  baseUrl: string;
  params: TableRow[];
}

const props = defineProps<Props>();

defineEmits<{ 'open-test-lab': [] }>()

const { examples } = useCodeGenerator(
  computed(() => ({
    method: props.method,
    urlPath: props.urlPath,
    headers: props.headers,
    body: props.body,
    baseUrl: props.baseUrl,
  })),
);

const languageOptions = computed<LanguageOption[]>(() =>
  examples.value.map((e) => ({
    label: e.label,
    language: e.language,
    code: e.code,
  })),
);
</script>
