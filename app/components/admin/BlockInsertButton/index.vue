<template>
  <div class="group flex items-center gap-2 py-0.5">
    <div class="flex-1 h-px bg-transparent group-hover:bg-brand-green/20 transition-colors" />
    <button
      type="button"
      class="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-brand-green border border-brand-green/30 hover:bg-brand-green/10 transition-all"
      @click="$emit('click')"
    >
      <UiIcon name="plus" size="xs" />
      Add block
    </button>
    <div class="flex-1 h-px bg-transparent group-hover:bg-brand-green/20 transition-colors" />
  </div>
</template>

<script setup lang="ts">
defineEmits<{ click: [] }>()
</script>
