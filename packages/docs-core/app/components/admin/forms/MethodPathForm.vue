<template>
  <div class="space-y-3">
    <!-- Method + Path -->
    <div>
      <label class="field-label">Method &amp; Path</label>
      <div class="flex gap-2">
        <div class="relative shrink-0 w-28">
          <select
            :value="block.props.method"
            class="w-full appearance-none text-[13px] font-medium bg-white dark:bg-dark-bg border border-surface-sage-dark dark:border-dark-border text-ink-primary dark:text-dark-text rounded-lg pl-2.5 pr-7 py-1.5 transition-colors focus:outline-none hover:border-brand-green/50 focus:border-brand-green cursor-pointer"
            @change="patchProps({ method: ($event.target as HTMLSelectElement).value as 'GET'|'POST'|'PUT'|'PATCH'|'DELETE' })"
          >
            <option v-for="m in METHODS" :key="m" :value="m">{{ m }}</option>
          </select>
          <div class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
            <UiIcon name="chevronDown" size="xs" class="text-ink-muted dark:text-dark-subtle" />
          </div>
        </div>
        <UiTextarea
          :model-value="block.props.path"
          placeholder="/api/v1/…"
          size="sm"
          class="flex-1 font-mono"
          @update:model-value="patchProps({ path: $event })"
        />
      </div>
    </div>

    <!-- Base URL override -->
    <div>
      <label class="field-label">Base URL override <span class="font-normal text-ink-muted dark:text-dark-subtle">(optional)</span></label>
      <UiTextarea
        :model-value="block.props.baseUrl ?? ''"
        placeholder="Leave blank to use the global base URL from docs.config"
        size="sm"
        @update:model-value="patchProps({ baseUrl: $event || undefined })"
      />
    </div>

    <!-- Display options -->
    <UiCheckbox
      :model-value="block.props.hideBaseUrl === true"
      @update:model-value="patchProps({ hideBaseUrl: $event || undefined })"
    >Hide <code class="text-[11px]">{{ baseUrlLabel }}</code> prefix in view</UiCheckbox>
  </div>
</template>

<script setup lang="ts">
import type { MethodPathBlock } from '~/types/content'

interface Props { block: MethodPathBlock }
const props = defineProps<Props>()
const emit = defineEmits<{ update: [block: MethodPathBlock] }>()

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const
const baseUrlLabel = '{{base_url}}'

function patchProps(patch: Partial<MethodPathBlock['props']>) {
  emit('update', { ...props.block, props: { ...props.block.props, ...patch } })
}
</script>

<style scoped>
.field-label { @apply block text-[11px] font-medium text-ink-secondary dark:text-dark-muted mb-0.5; }
</style>
