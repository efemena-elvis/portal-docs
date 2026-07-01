<template>
  <div class="space-y-3">
    <div class="flex items-start gap-2.5 rounded-lg bg-surface-sage/50 dark:bg-dark-sidebar/60 border border-surface-sage-dark dark:border-dark-border px-4 py-3.5">
      <UiIcon name="info" size="sm" class="shrink-0 mt-0.5 text-brand-blue dark:text-brand-sky" />
      <div class="space-y-1">
        <p class="text-[12.5px] font-medium text-ink-primary dark:text-dark-text">Auto-generated</p>
        <p class="text-[12px] text-ink-secondary dark:text-dark-muted leading-relaxed">
          This request example is generated automatically from the endpoint's method, path, and headers.
          To test or customise the request interactively, use the <strong>Test Lab</strong>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CodeRequestBlock } from '~/types/content'
defineProps<{ block: CodeRequestBlock }>()
defineEmits<{ update: [block: CodeRequestBlock] }>()
</script>
