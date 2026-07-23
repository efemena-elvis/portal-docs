<template>
  <NuxtLayout name="docs">
    <DocsBreadcrumb section-title="Reference" page-title="Collection Variables" />

    <h1 class="text-[28px] font-bold text-ink-primary dark:text-dark-text mb-3 leading-tight">
      Collection Variables
    </h1>
    <p class="text-[15px] text-ink-muted dark:text-dark-muted mb-10 leading-relaxed">
      These variables are used as placeholders across all API requests. Set them in your Postman collection or replace them with real values in your code before making requests.
    </p>

    <div class="divide-y divide-surface-sage dark:divide-dark-border border-t border-surface-sage dark:border-dark-border">
      <div
        v-for="(v, i) in variables"
        :key="v.key"
        class="py-4 px-3 -mx-3 rounded-md"
        :class="i % 2 === 1 ? 'bg-surface-off-white/55 dark:bg-dark-surface/40' : ''"
      >
        <div class="flex items-baseline gap-2.5 mb-2">
          <code class="text-[13px] font-mono font-semibold text-ink-primary dark:text-dark-text tracking-tight">
            {{ wrapVar(v.key) }}
          </code>
          <span
            v-if="v.value"
            class="text-[13px] text-ink-muted dark:text-dark-subtle font-normal truncate"
          >
            {{ v.value }}
          </span>
        </div>
        <p
          v-if="v.description"
          class="text-[14.5px] text-ink-muted dark:text-dark-muted leading-[1.7]"
        >
          {{ v.description }}
        </p>
        <p
          v-else
          class="text-[14px] text-ink-muted/50 dark:text-dark-subtle/50 leading-[1.7] italic"
        >
          No description
        </p>
      </div>
    </div>

    <DocsPageFooter
      :prev="{ label: 'Overview', href: '/' }"
      :next="{ label: 'Failure Codes', href: '/reference/errors' }"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
interface CollectionVariable { key: string; value: string; description?: string }

const variables = ref<CollectionVariable[]>([])

function wrapVar(key: string): string {
  return '{{' + key + '}}'
}

onMounted(async () => {
  try {
    const page = await $fetch<any>('/api/content/reference/variables')
    const block = page?.blocks?.find((b: any) => b.type === 'table' || b.type === 'params-table')
    if (block?.type === 'table') {
      variables.value = (block.props.rows ?? [])
        .map((r: any) => ({
          key: r.cells?.[0]?.text ?? '',
          value: r.cells?.[1]?.text ?? '',
          description: r.cells?.[2]?.text,
        }))
        .filter((v: CollectionVariable) => v.key && v.key !== 'client_ip' && v.key !== 'method_url')
    } else if (block?.type === 'params-table') {
      variables.value = (block.props.rows ?? [])
        .map((r: any) => ({ key: r.name ?? '', value: r.type ?? '', description: r.description }))
        .filter((v: CollectionVariable) => v.key && v.key !== 'client_ip' && v.key !== 'method_url')
    }
  } catch {
    // variables page not found — silently skip
  }
})
</script>
