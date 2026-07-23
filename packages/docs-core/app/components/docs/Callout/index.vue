<template>
  <div
    class="flex gap-3.5 rounded-lg border p-4 my-6"
    :class="[styles[type ?? 'note'], hasTitle ? 'items-start' : 'items-center']"
  >
    <UiIcon :name="iconName" size="md" class="flex-none mt-0.5" :class="iconColors[type ?? 'note']" aria-hidden="true" />
    <div class="flex-1 min-w-0">
      <div v-if="hasTitle" class="text-sm font-semibold mb-1" :class="titleColors[type ?? 'note']">
        {{ title }}
      </div>
      <div class="text-sm leading-relaxed" :class="textColors[type ?? 'note']">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { IconName } from '~/components/ui/Icon/icons'

type CalloutType = 'note' | 'warning' | 'tip' | 'nutshell' | 'before-you-begin'

const props = defineProps<{
  type?: CalloutType
  title?: string
}>()

const slots = useSlots()
const hasTitle = computed(() => !!props.title || !!slots.title)

const iconMap: Record<CalloutType, IconName> = {
  note: 'info',
  warning: 'alertTriangle',
  tip: 'lightbulb',
  nutshell: 'plusCircle',
  'before-you-begin': 'arrowLeftCircle',
}

const iconName = computed(() => iconMap[props.type ?? 'note'])

const styles: Record<CalloutType, string> = {
  note:             'bg-surface-pale-blue/60 dark:bg-brand-sky/10 border-brand-sky/25 dark:border-brand-sky/20',
  warning:          'bg-amber-50/70 dark:bg-amber-900/15 border-amber-200 dark:border-amber-700/40',
  tip:              'bg-emerald-50/60 dark:bg-brand-green/10 border-brand-green/20 dark:border-brand-green/20',
  nutshell:         'bg-surface-pale-blue/60 dark:bg-brand-sky/10 border-brand-sky/25 dark:border-brand-sky/20',
  'before-you-begin': 'bg-emerald-50/60 dark:bg-brand-green/10 border-brand-green/20 dark:border-brand-green/20',
}

const iconColors: Record<CalloutType, string> = {
  note:             'text-brand-sky',
  warning:          'text-amber-600 dark:text-amber-400',
  tip:              'text-brand-green',
  nutshell:         'text-brand-sky',
  'before-you-begin': 'text-brand-green',
}

const titleColors: Record<CalloutType, string> = {
  note:             'text-ink-primary dark:text-dark-text',
  warning:          'text-amber-900 dark:text-amber-300',
  tip:              'text-ink-primary dark:text-dark-text',
  nutshell:         'text-ink-primary dark:text-dark-text',
  'before-you-begin': 'text-ink-primary dark:text-dark-text',
}

const textColors: Record<CalloutType, string> = {
  note:             'text-ink-secondary dark:text-dark-muted',
  warning:          'text-amber-900/80 dark:text-amber-200/90',
  tip:              'text-ink-secondary dark:text-dark-muted',
  nutshell:         'text-ink-secondary dark:text-dark-muted',
  'before-you-begin': 'text-ink-secondary dark:text-dark-muted',
}
</script>
