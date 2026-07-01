<template>
  <NuxtLayout name="docs">
    <DocsBreadcrumb section-title="Reference" page-title="Failure Codes" />

    <h1 class="text-[28px] font-bold text-ink-primary dark:text-dark-text mb-3 leading-tight">
      Failure Reason Codes
    </h1>
    <p class="text-[15px] text-ink-muted dark:text-dark-muted mb-10 leading-relaxed">
      When a transaction fails, the
      <code class="font-mono text-[13px] bg-surface-off-white dark:bg-dark-surface text-ink-secondary dark:text-dark-text px-1.5 py-0.5 rounded border border-surface-sage dark:border-dark-border">failure_reason</code>
      field in the response contains one of these codes. Use them to determine the appropriate action for your integration.
    </p>

    <!-- HTTP Status Codes -->
    <h2 class="text-[17px] font-bold text-ink-primary dark:text-dark-text mb-7">HTTP Status Codes</h2>
    <div class="divide-y divide-surface-sage dark:divide-dark-border border-t border-surface-sage dark:border-dark-border mb-14">
      <div
        v-for="(r, i) in httpCodes"
        :key="r.code"
        class="py-4 px-3 -mx-3 rounded-md"
        :class="i % 2 === 1 ? 'bg-surface-off-white/55 dark:bg-dark-surface/40' : ''"
      >
        <div class="flex items-center gap-3 mb-2">
          <UiBadge :variant="badgeVariantFor(r.color)" rounded="md" class="font-mono text-[12.5px] tabular-nums shrink-0">
            {{ r.code }}
          </UiBadge>
          <span class="font-semibold text-[14.5px] text-ink-primary dark:text-dark-text">{{ r.meaning }}</span>
        </div>
        <p class="text-[14px] text-ink-muted dark:text-dark-muted leading-[1.7] pl-[52px]">{{ r.action }}</p>
      </div>
    </div>

    <!-- Business Failure Codes -->
    <h2 class="text-[17px] font-bold text-ink-primary dark:text-dark-text mb-7">Business Failure Codes</h2>
    <div class="divide-y divide-surface-sage dark:divide-dark-border border-t border-surface-sage dark:border-dark-border">
      <div
        v-for="(fc, i) in failureCodes"
        :key="fc.code"
        class="py-4 px-3 -mx-3 rounded-md"
        :class="i % 2 === 1 ? 'bg-surface-off-white/55 dark:bg-dark-surface/40' : ''"
      >
        <div class="mb-2">
          <code class="text-[13px] font-mono font-semibold text-ink-primary dark:text-dark-text tracking-tight">{{ fc.code }}</code>
        </div>
        <p class="text-[14.5px] text-ink-muted dark:text-dark-muted leading-[1.7]">{{ fc.meaning }}</p>
      </div>
    </div>

    <DocsPageFooter
      :prev="{ label: 'Collection Variables', href: '/reference/variables' }"
      :next="null"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
interface FailureCode { code: string; meaning: string }

const failureCodes = ref<FailureCode[]>([])

const httpCodes = [
  { code: '200', meaning: 'OK', action: 'Request succeeded.', color: 'green' },
  { code: '201', meaning: 'Created', action: 'Resource was successfully created.', color: 'green' },
  { code: '400', meaning: 'Bad Request', action: 'Fix the request parameters and retry.', color: 'yellow' },
  { code: '401', meaning: 'Unauthorized', action: 'Check your x-api-key header.', color: 'red' },
  { code: '403', meaning: 'Forbidden', action: 'Check IP whitelist or account permissions.', color: 'red' },
  { code: '404', meaning: 'Not Found', action: 'Verify the reference or URL path.', color: 'red' },
  { code: '409', meaning: 'Conflict', action: 'Duplicate Idempotency-Key — use a new one.', color: 'red' },
  { code: '429', meaning: 'Rate Limited', action: 'Back off and retry after a delay.', color: 'yellow' },
  { code: '500', meaning: 'Server Error', action: 'Vesicash-side issue — retry with exponential backoff.', color: 'red' },
]

function badgeVariantFor(color: string): 'success' | 'warning' | 'error' {
  if (color === 'green') return 'success'
  if (color === 'yellow') return 'warning'
  return 'error'
}

onMounted(async () => {
  try {
    const page = await $fetch<any>('/api/content/reference/errors')
    const block = page?.blocks?.find((b: any) => b.type === 'table' || b.type === 'params-table')
    if (block?.type === 'table') {
      failureCodes.value = (block.props.rows ?? []).map((r: any) => ({
        code: r.cells?.[0]?.text ?? '',
        meaning: r.cells?.[1]?.text ?? '',
      }))
    } else if (block?.type === 'params-table') {
      failureCodes.value = (block.props.rows ?? []).map((r: any) => ({
        code: r.name ?? '',
        meaning: r.description ?? '',
      }))
    }
  } catch {
    // errors page not found — silently skip
  }
})
</script>
