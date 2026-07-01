<template>
  <div class="overflow-hidden" :class="[bgClass]">
    <table class="w-full text-sm">
      <slot />
    </table>
  </div>
</template>

<script setup lang="ts">
const bgClass = 'bg-white dark:bg-dark-sidebar'
</script>
