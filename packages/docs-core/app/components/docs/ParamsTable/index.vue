<template>
  <div v-if="rows.length" class="my-12">
    <!-- Section heading -->
    <h3
      v-if="title?.trim()"
      class="text-[17px] font-bold text-ink-primary dark:text-dark-text mb-7"
      :data-no-toc="showInToc === false ? '' : undefined"
    >
      {{ title }}
    </h3>

    <!-- Param list -->
    <div
      class="divide-y divide-surface-sage dark:divide-dark-border border-t border-surface-sage dark:border-dark-border"
    >
      <div
        v-for="(row, i) in rows"
        :key="i"
        class="py-4 px-3 -mx-3 rounded-md"
        :class="i % 2 === 1 ? 'bg-surface-off-white/55 dark:bg-dark-surface/40' : ''"
      >
        <!-- Name · type row + optional badge pinned right -->
        <div class="flex items-start justify-between gap-4 mb-2">
          <div class="flex items-baseline gap-2 flex-wrap min-w-0">
            <span class="font-semibold text-[14.5px] text-ink-primary dark:text-dark-text">
              {{ row.name }}
            </span>
            <span
              v-if="row.type"
              class="text-[13px] text-ink-muted dark:text-dark-subtle font-normal"
            >
              {{ row.type }}
            </span>
          </div>
          <span
            v-if="!row.required"
            class="text-[12px] text-ink-muted/70 dark:text-dark-subtle/70 font-normal flex-none pt-0.5"
          >
            optional
          </span>
        </div>

        <!-- Description always below -->
        <div
          v-if="row.description"
          class="params-desc text-[14.5px] text-ink-muted dark:text-dark-muted leading-[1.7]"
          v-html="renderDesc(row.description)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableRow } from "~/types/docs";

defineProps<{
  title?: string;
  rows: TableRow[];
  showInToc?: boolean;
}>();

const { render } = useMarkdown();

function renderDesc(text: string): string {
  if (!text) return "";
  const html = render(text).trim();
  // Strip outer <p> wrapper for single-paragraph descriptions
  const match = html.match(/^<p>([\s\S]*?)<\/p>$/);
  return match ? match[1]! : html;
}
</script>

<style>
.params-desc a {
  color: #0b618f;
  text-decoration: none;
}
.dark .params-desc a {
  color: #24acee;
}
.params-desc a:hover {
  text-decoration: underline;
}
.params-desc code {
  font-family:
    ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace;
  font-size: 0.82em;
  background: #f1f7f6;
  border: 1px solid #e5edeb;
  border-radius: 4px;
  padding: 1px 6px;
  color: #525857;
  white-space: nowrap;
}
.dark .params-desc code {
  background: #21262d;
  border-color: #30363d;
  color: #8b949e;
}
.params-desc p {
  margin: 0 0 0.4rem 0;
}
.params-desc p:last-child {
  margin-bottom: 0;
}
.params-desc strong {
  font-weight: 600;
  color: #171918;
}
.dark .params-desc strong {
  color: #e6edf3;
}
.params-desc ul,
.params-desc ol {
  padding-left: 1.2rem;
  margin: 0.3rem 0 0;
}
.params-desc li {
  margin-bottom: 0.2rem;
}
</style>
