<template>
  <div class="space-y-3">
    <!-- Variant -->
    <div class="flex gap-2">
      <button
        v-for="v in ['heading', 'body']"
        :key="v"
        type="button"
        class="flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors"
        :class="block.props.variant === v
          ? 'border-brand-green bg-brand-green/10 text-brand-green'
          : 'border-surface-sage-dark dark:border-dark-border text-ink-muted dark:text-dark-muted hover:border-brand-green/40'"
        @click="patch({ props: { ...block.props, variant: v } })"
      >
        {{ v === 'heading' ? 'Heading' : 'Body text' }}
      </button>
    </div>

    <!-- Level (heading only) -->
    <div v-if="block.props.variant === 'heading'" class="flex gap-2">
      <button
        v-for="lvl in ['h1', 'h2', 'h3', 'h4']"
        :key="lvl"
        type="button"
        class="flex-1 py-1 rounded-md text-xs font-mono border transition-colors"
        :class="(block.props.level ?? 'h2') === lvl
          ? 'border-brand-green bg-brand-green/10 text-brand-green'
          : 'border-surface-sage-dark dark:border-dark-border text-ink-muted dark:text-dark-muted hover:border-brand-green/40'"
        @click="patch({ props: { ...block.props, level: lvl } })"
      >
        {{ lvl }}
      </button>
    </div>

    <!-- Content -->
    <div>
      <label class="field-label">Content</label>
      <UiTextarea
        class="font-mono"
        :model-value="block.content ?? ''"
        placeholder="Write content here…"
        @update:model-value="patch({ content: $event })"
      />
      <div class="mt-1.5">
        <button
          type="button"
          class="flex items-center gap-1 text-[10px] text-ink-muted dark:text-dark-subtle hover:text-brand-green dark:hover:text-brand-green transition-colors"
          @click="showTips = !showTips"
        >
          <UiIcon name="helpCircle" size="xs" />
          {{ showTips ? 'Hide formatting tips' : 'Formatting tips' }}
        </button>
        <div v-if="showTips" class="mt-1.5 rounded-lg border border-surface-sage dark:border-dark-border bg-surface-off-white dark:bg-dark-surface px-3 py-2.5">
          <div class="grid grid-cols-2 gap-x-6 gap-y-1">
            <div class="flex items-center gap-1.5">
              <code class="text-[10px] text-brand-blue dark:text-brand-sky font-mono">**bold**</code>
            </div>
            <div class="flex items-center gap-1.5">
              <code class="text-[10px] text-brand-blue dark:text-brand-sky font-mono">*italic*</code>
            </div>
            <div class="flex items-center gap-1.5">
              <code class="text-[10px] text-brand-blue dark:text-brand-sky font-mono">***bold italic***</code>
            </div>
            <div class="flex items-center gap-1.5">
              <code class="text-[10px] text-brand-blue dark:text-brand-sky font-mono">`inline code`</code>
            </div>
            <div class="col-span-2 flex items-center gap-1.5">
              <code class="text-[10px] text-brand-blue dark:text-brand-sky font-mono">[link text](https://url)</code>
            </div>
            <div class="col-span-2 flex items-center gap-1.5">
              <code class="text-[10px] text-brand-blue dark:text-brand-sky font-mono">&lt;span style="color:#3AB75D"&gt;word&lt;/span&gt;</code>
            </div>
            <div class="col-span-2 flex items-center gap-1.5">
              <code class="text-[10px] text-brand-blue dark:text-brand-sky font-mono">&lt;span class="text-brand-green font-bold"&gt;word&lt;/span&gt;</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProseBlock } from '~/types/content'
interface Props { block: ProseBlock }
const props = defineProps<Props>()
const emit = defineEmits<{ update: [block: ProseBlock] }>()
const showTips = ref(false)
function patch(partial: Partial<ProseBlock>) {
  emit('update', { ...props.block, ...partial } as ProseBlock)
}
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-1; }
</style>
