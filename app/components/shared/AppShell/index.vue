<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-dark-bg font-sans">
    <DocsPageLoader />
    <slot name="topbar" />
    <div class="flex flex-1 pt-14 lg:pt-20 relative">
      <slot name="sidebar" />

      <main class="flex-1 min-w-0 block">
        <slot />
      </main>

      <slot name="toc" />
    </div>
    <slot name="search-modal" />
  </div>
</template>
