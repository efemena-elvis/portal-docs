<template>
  <details class="group">
    <summary class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted dark:text-dark-subtle cursor-pointer hover:text-ink-secondary dark:hover:text-dark-muted select-none list-none py-2 border-t border-surface-sage dark:border-dark-border">
      <UiIcon name="chevronRight" size="xs" class="transition-transform group-open:rotate-90" />
      Advanced
    </summary>

    <div class="pt-3 space-y-3">
      <!-- CSS class -->
      <div>
        <label class="block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-1">
          Tailwind class override
        </label>
        <UiTextarea
          :model-value="block.meta.class ?? ''"
          placeholder="e.g. mt-8 bg-brand-green/10"
          size="sm"
          @update:model-value="patch({ class: $event || undefined })"
        />
      </div>

      <!-- Inline style -->
      <div>
        <label class="block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-1">
          Inline style override
        </label>
        <UiTextarea
          :model-value="block.meta.style ?? ''"
          placeholder="e.g. border-left: 4px solid #3AB75D"
          size="sm"
          @update:model-value="patch({ style: $event || undefined })"
        />
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
import type { Block, BlockMeta } from '~/types/content'

interface Props { block: Block }
const props = defineProps<Props>()
const emit = defineEmits<{ update: [block: Block] }>()

function patch(metaPatch: Partial<BlockMeta>) {
  emit('update', { ...props.block, meta: { ...props.block.meta, ...metaPatch } })
}
</script>
