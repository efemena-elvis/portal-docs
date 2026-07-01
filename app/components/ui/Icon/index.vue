<template>
  <component
    :is="iconComponent"
    v-if="iconComponent"
    :class="[sizeClass, $attrs.class]"
    class="flex-none"
  />
</template>

<script setup lang="ts">
import { icons, type IconName } from './icons'

interface Props {
  name: IconName
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const iconComponent = computed(() => icons[props.name])

const sizeClass = computed(() => {
  const map = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  }
  return map[props.size]
})
</script>
