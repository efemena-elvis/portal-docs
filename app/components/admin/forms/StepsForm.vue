<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <label class="field-label">Steps</label>
      <button type="button" class="add-btn" @click="addStep">+ Step</button>
    </div>
    <div class="space-y-2">
      <div
        v-for="(child, ci) in block.children"
        :key="child.id"
        class="p-3 rounded-lg border border-surface-sage dark:border-dark-border"
      >
        <div class="flex items-center gap-2 mb-2">
          <span class="text-[11px] font-mono text-ink-muted">{{ ci + 1 }}</span>
          <UiTextarea :model-value="child.props.title" size="sm" placeholder="Step title"
            class="flex-1"
            @update:model-value="updateChild(ci, { props: { ...child.props, title: $event } })" />
          <button type="button" class="text-ink-muted hover:text-red-500"
            @click="removeStep(ci)"><UiIcon name="trash" size="xs" /></button>
        </div>
        <UiTextarea
          :model-value="child.content ?? ''"
          placeholder="Body (optional)"
          @update:model-value="updateChild(ci, { content: $event || null })"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StepsBlock, StepBlock } from '~/types/content'

interface Props { block: StepsBlock }
const props = defineProps<Props>()
const emit = defineEmits<{ update: [block: StepsBlock] }>()

function updateChild(ci: number, patch: Partial<StepBlock>) {
  const children = props.block.children.map((c, i) => i === ci ? { ...c, ...patch } as StepBlock : c)
  emit('update', { ...props.block, children })
}

function addStep() {
  const n = props.block.children.length + 1
  const newStep: StepBlock = {
    id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
    type: 'step',
    props: { number: n, title: `Step ${n}`, description: '', last: false },
    content: null,
    meta: { class: '', style: '', toc: '', hidden: false },
  }
  emit('update', { ...props.block, children: [...props.block.children, newStep] })
}

function removeStep(ci: number) {
  emit('update', { ...props.block, children: props.block.children.filter((_, i) => i !== ci) })
}
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted; }
.add-btn { @apply text-[11px] text-brand-green hover:underline font-medium; }
</style>
