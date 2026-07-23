<template>
  <NuxtLayout name="docs">
    <DocsHero
      title="Get Started with Vesicash"
      description="Integrate payments, payouts, and refunds in minutes. This guide walks you through authentication and your first API call."
      badge="Quickstart Guide"
    />

    <DocsStepTimeline>
      <DocsStep :number="1" title="Get your API credentials">
        <UiText variant="body" class="mb-4">
          Log in to your <a href="https://vesicash.com" target="_blank" class="text-brand-blue hover:text-brand-sky underline">Vesicash merchant dashboard</a> and navigate to <strong class="text-ink-primary dark:text-dark-text">Settings → API Keys</strong> to retrieve your secret key.
        </UiText>
        <UiCard class="p-4">
          <UiText variant="label" class="mb-3">What you'll receive</UiText>
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <span class="w-2 h-2 rounded-full bg-brand-green mt-1.5 flex-none" />
              <div>
                <UiText variant="body" class="font-medium">x-api-key</UiText>
                <UiText variant="small" color="muted">Your secret API key — keep this private and never expose it in frontend code</UiText>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="w-2 h-2 rounded-full bg-brand-sky mt-1.5 flex-none" />
              <div>
                <UiText variant="body" class="font-medium">Idempotency-Key</UiText>
                <UiText variant="small" color="muted">A unique UUID you generate per request to prevent duplicate transactions</UiText>
              </div>
            </div>
          </div>
        </UiCard>
      </DocsStep>

      <DocsStep :number="2" title="Authenticate every request">
        <UiText variant="body" class="mb-4">
          All API requests require three headers. Send them with every call:
        </UiText>
        <DocsCodeBlock language="bash" title="Request headers" dark :code="headersSnippet" />
      </DocsStep>

      <DocsStep :number="3" title="Make your first API call">
        <UiText variant="body" class="mb-4">
          Verify your credentials are working with a lightweight credential check:
        </UiText>
        <DocsCodeBlock language="bash" :title="`GET ${baseUrl}/verify`" dark :code="firstCallSnippet" />
        <DocsCallout variant="tip" title="Expected response" class="mt-4">
          A <code class="font-mono bg-brand-green/10 text-brand-green px-1 rounded">200 OK</code> with <code class="font-mono bg-surface-pale-blue dark:bg-dark-surface text-brand-sky px-1 rounded">"success": true</code> confirms your credentials are valid.
        </DocsCallout>
      </DocsStep>

      <DocsStep :number="4" title="Choose your integration path" last>
        <UiText variant="body" class="mb-4">
          Vesicash supports two flows per payment method. Choose based on your UX preference:
        </UiText>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DocsCapabilityCard v-for="flow in integrationFlows" :key="flow.href" v-bind="flow" />
        </div>
      </DocsStep>
    </DocsStepTimeline>

    <div class="mt-4 border-t border-surface-sage dark:border-dark-border pt-10">
      <UiText variant="heading" class="mb-2">Standard Response Format</UiText>
      <UiText variant="body" class="mb-4">Every API response follows this envelope:</UiText>
      <DocsCodeBlock language="json" dark :code="responseEnvelope" />
    </div>

    <div class="mt-10 border-t border-surface-sage dark:border-dark-border pt-10">
      <UiText variant="heading" class="mb-6">Next Steps</UiText>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DocsCapabilityCard v-for="link in nextLinks" :key="link.href" v-bind="link" />
      </div>
    </div>

    <DocsPageFooter
      :prev="{ label: 'Overview', href: '/' }"
      :next="{ label: 'Accept Payments Overview', href: '/accept-payments/accept-payments-overview' }"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import docsConfig from '../../docs.config'

const baseUrl = ref(docsConfig.api.baseUrl)

const headersSnippet = `x-api-key: YOUR_SECRET_KEY
Idempotency-Key: a4f3b2c1-d5e6-7890-abcd-ef1234567890
Content-Type: application/json`

const firstCallSnippet = computed(() => `curl -X GET ${baseUrl.value}/verify \\
  -H "x-api-key: YOUR_SECRET_KEY" \\
  -H "Idempotency-Key: $(uuidgen)"`)

const responseEnvelope = `{
  "success": true,
  "code": 200,
  "data": {
    // Response payload specific to each endpoint
  }
}

// Error response
{
  "success": false,
  "code": 400,
  "message": "Description of what went wrong"
}`

const integrationFlows = [
  {
    icon: '💳', bg: 'bg-brand-sky/10',
    title: 'Mobile Money — Checkout',
    description: 'Redirect to a Vesicash-hosted payment page. Simplest integration with no UI to build.',
    href: '/accept-payments/mobile-money-checkout/initialize-payment',
  },
  {
    icon: '📱', bg: 'bg-brand-green/10',
    title: 'Mobile Money — Direct',
    description: 'Collect payment details in your own UI. Full control over the customer experience.',
    href: '/accept-payments/mobile-money-direct/initialize-payment',
  },
  {
    icon: '💳', bg: 'bg-amber-100 dark:bg-amber-900/20',
    title: 'Card — Checkout',
    description: 'Vesicash-hosted card page with 3DS2 authentication included.',
    href: '/accept-payments/card-checkout/initialize-payment',
  },
  {
    icon: '🔐', bg: 'bg-purple-100 dark:bg-purple-900/20',
    title: 'Card — Direct',
    description: 'Build a custom card form with full 3DS2 challenge handling in your UI.',
    href: '/accept-payments/card-direct/initialize-payment',
  },
]

const nextLinks = [
  {
    icon: '📋', bg: 'bg-brand-sky/10',
    title: 'Query Payments',
    description: 'Look up transaction status, history, and details via the Queries API.',
    href: '/manage-transactions/query-payments/list-payments',
  },
  {
    icon: '❌', bg: 'bg-red-50 dark:bg-red-900/20',
    title: 'Error Reference',
    description: 'Full list of failure reason codes and what they mean.',
    href: '/reference/errors',
  },
]

</script>
