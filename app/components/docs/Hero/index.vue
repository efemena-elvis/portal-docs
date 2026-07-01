<template>
  <div class="max-w-3xl mb-16 relative">
    <div v-if="$slots.admin" class="absolute top-0 right-0">
      <slot name="admin" />
    </div>
    <div
      v-if="badge"
      class="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
    >
      <span
        class="w-1.5 h-1.5 rounded-full bg-brand-green"
        :class="pulse ? 'animate-pulse' : ''"
      />
      {{ badge }}
    </div>
    <h1
      class="text-4xl lg:text-5xl font-extrabold text-ink-primary dark:text-dark-text leading-[1.1] mb-5"
    >
      {{ title }}
    </h1>
    <p
      class="text-[17px] text-ink-secondary dark:text-dark-muted leading-relaxed mb-8 max-w-2xl"
    >
      {{ description }}
    </p>
    <div v-if="$slots.actions" class="flex items-center gap-3 flex-wrap">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  description: string;
  badge?: string;
  pulse?: boolean;
}

defineProps<Props>();
</script>
