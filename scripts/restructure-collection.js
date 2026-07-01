#!/usr/bin/env node
/**
 * Restructure public/collection.json to match the Vesicash docs conventions.
 *
 * - Removes emojis from folder names
 * - Renames folders to user-intent groups
 * - Renames requests (removes numbering, shortens titles)
 * - Adds overview/guide requests for complex sections
 * - Cleans webhook placeholders
 * - Updates collection-level info description
 *
 * Run: node scripts/restructure-collection.js
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const inputPath = resolve(root, 'public/collection.json')
const outputPath = resolve(root, 'public/collection.json')

const collection = JSON.parse(readFileSync(inputPath, 'utf-8'))

// ─── Helpers ───────────────────────────────────────────────────────────────

function stripEmoji(str) {
  return str
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .trim()
}

function cleanRequestName(name) {
  return stripEmoji(name)
    .replace(/^\d+\.\s*/, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .replace(/\s*\[[^\]]*\]\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function codeBlock(lang, code) {
  return '```' + lang + '\n' + code + '\n```'
}

function makeGuideRequest({ name, title, description, urlPath = '{{base_url}}/overview' }) {
  return {
    name,
    request: {
      method: 'GET',
      header: [],
      url: {
        raw: urlPath,
        host: [urlPath],
      },
      description,
    },
    response: [],
  }
}

// ─── Content builders ───────────────────────────────────────────────────────

const overviewGettingStarted = makeGuideRequest({
  name: 'Overview',
  title: 'Overview',
  description: `---\ndocs-type: guide\n---\n
## Overview

### In a nutshell
The Vesicash Merchant API lets you accept payments, send payouts, and manage transactions across Africa from a single integration.

### What you can build
- **Accept Payments** — Mobile money and card payments via hosted checkout or your own UI.
- **Send Payouts** — Disburse funds to bank accounts and mobile money wallets.
- **Manage Transactions** — Verify, list, refund, and query payments.
- **Receive Webhooks** — Get real-time event notifications on your server.

### Base URL
${codeBlock('', 'Sandbox:    https://sandbox.api.vesicash.com\nProduction: https://api.vesicash.com')}

### Response format
${codeBlock('json', '{\n  "status": "success" | "error",\n  "code": 200,\n  "message": "Human-readable message",\n  "data": { ... }\n}')}

### Next steps
1. Read [Authentication](/getting-started/authentication).
2. Follow the [Quick Start](/getting-started/quick-start) guide.
3. Pick a payment flow in [Accept Payments](/accept-payments/accept-payments-overview).`,
})

const quickStartGuide = makeGuideRequest({
  name: 'Quick Start',
  title: 'Quick Start',
  description: `---\ndocs-type: guide\n---\n
## Quick Start

### In a nutshell
Make your first Vesicash API call in under 5 minutes.

### Before you begin
- You have a Vesicash merchant account.
- You have generated API keys from the dashboard.
- You have set the \`secret_key\`, \`public_key\`, and \`base_url\` collection variables.

### Step 1: Verify your credentials
Call [Authentication](/getting-started/authentication) to confirm your keys are active.

### Step 2: Initialize a payment
Call [Initialize Payment](/accept-payments/mobile-money-checkout/initialize-payment) to create a transaction.

### Step 3: Handle the redirect
Redirect the customer to the returned \`payment_link\`.

### Step 4: Verify the outcome
After the customer returns, call [Verify Payment Status](/accept-payments/mobile-money-checkout/verify-payment-status) to confirm the result. Do not rely on the redirect URL alone.

> ⚠️ **Warning:** Always verify the final payment status via the API before fulfilling an order.`,
})

const acceptPaymentsOverview = makeGuideRequest({
  name: 'Accept Payments Overview',
  title: 'Accept Payments Overview',
  description: `---\ndocs-type: guide\n---\n
## Accept Payments Overview

### In a nutshell
Accept mobile money and card payments from customers across Africa. Choose between a Vesicash-hosted checkout page or a direct integration built into your own UI.

### Before you begin
- You have completed KYC and generated API keys.
- You have set \`base_url\`, \`secret_key\`, and \`public_key\` in the collection variables.
- You have configured a \`webhook_url\` to receive event notifications.

### Payment flows

#### Hosted checkout
The simplest integration. Vesicash collects payment details on a hosted page.

${codeBlock('', '1. Your backend  →  POST /v1/payment/init\n2. Vesicash      →  Returns payment_link + reference\n3. Your frontend →  Redirects customer to payment_link\n4. Customer      →  Completes payment\n5. Vesicash      →  POSTs webhook event\n6. Your backend  →  GET /v1/payment/:reference (verify status)')}

#### Direct integration
Build your own payment UI. You collect payment details and submit them directly to Vesicash.

### Supported currencies
| Currency | Payment methods |
|----------|-----------------|
| \`NGN\` | card, bank_transfer, ussd |
| \`GHS\` | card, mobile_money |
| \`KES\` | card, mobile_money |
| \`ZMW\` | card, mobile_money |
| \`ZAR\` | card, bank_transfer |

### Related flows
- [Mobile Money — Checkout](/accept-payments/mobile-money-checkout/initialize-payment)
- [Mobile Money — Direct](/accept-payments/mobile-money-direct/initialize-payment)
- [Card — Checkout](/accept-payments/card-checkout/initialize-payment)
- [Card — Direct](/accept-payments/card-direct/initialize-payment)`,
})

const sendPayoutsOverview = makeGuideRequest({
  name: 'Send Payouts Overview',
  title: 'Send Payouts Overview',
  description: `---\ndocs-type: guide\n---\n
## Send Payouts Overview

### In a nutshell
Disburse funds to bank accounts and mobile money wallets across Africa.

### Before you begin
- Your merchant wallet has sufficient balance for the payout.
- You have collected accurate recipient details.
- You have configured a \`webhook_url\` to receive payout events.

### Payout flows

#### Bank payout
Send money to a bank account using the recipient's account number and bank code.

#### Mobile money payout
Send money directly to a mobile money wallet.

${codeBlock('', '1. Your backend  →  GET /v1/wallet/:country (check balance)\n2. Your backend  →  POST /v1/payout\n3. Vesicash      →  Processes payout asynchronously\n4. Vesicash      →  POSTs webhook event\n5. Your backend  →  GET /v1/payout/:reference (verify status)')}

### Related endpoints
- [Bank Payout](/send-payouts/bank-payout/process-payout)
- [Mobile Money Payout](/send-payouts/mobile-money-payout/process-payout)`,
})

const webhooksOverview = makeGuideRequest({
  name: 'Webhooks Overview',
  title: 'Webhooks Overview',
  description: `---\ndocs-type: guide\n---\n
## Webhooks Overview

### In a nutshell
Webhooks let your server receive real-time notifications when important payment events happen.

### Before you begin
1. Generate your webhook secret from [Auth & Setup](/getting-started/generate-webhook-secret).
2. Configure your \`webhook_url\` in the Vesicash dashboard.
3. Ensure your endpoint can receive POST requests and respond with \`200 OK\`.

### Event types

| Event | Trigger |
|-------|---------|
| \`payment.completed\` | Customer payment successfully processed |
| \`payment.failed\` | Payment attempt failed |
| \`payout.completed\` | Payout delivered to beneficiary |
| \`payout.failed\` | Payout could not be delivered |
| \`refund.completed\` | Refund successfully reversed to customer |
| \`refund.failed\` | Refund could not be processed |

### Retry policy
If your endpoint returns a non-2xx status, Vesicash retries with exponential backoff: 1 minute, 5 minutes, 30 minutes, 2 hours, 6 hours.

### Response requirements
Your endpoint must return \`200 OK\` within 30 seconds. Process the event asynchronously to avoid timeouts.

### Related
- [Verify Webhook Signature](/webhooks/verify-webhook-signature)`,
})

const verifyWebhookSignature = makeGuideRequest({
  name: 'Verify Webhook Signature',
  title: 'Verify Webhook Signature',
  description: `---\ndocs-type: guide\n---\n
## Verify Webhook Signature

### In a nutshell
Confirm that a webhook payload was sent by Vesicash and has not been tampered with.

### How it works
Vesicash signs the raw request body with HMAC-SHA256 using your webhook secret. The signature is sent in the \`x-vesicash-signature\` header.

### Node.js example
${codeBlock('javascript', `const crypto = require('crypto');\n\nfunction verifyWebhook(rawBody, signature, secret) {\n  const expected = crypto\n    .createHmac('sha256', secret)\n    .update(rawBody)\n    .digest('hex');\n  return crypto.timingSafeEqual(\n    Buffer.from(expected),\n    Buffer.from(signature)\n  );\n}\n\n// In your Express handler:\napp.post('/webhooks/vesicash', express.raw({ type: '*/*' }), (req, res) => {\n  const sig = req.headers['x-vesicash-signature'];\n  if (!verifyWebhook(req.body, sig, process.env.WEBHOOK_SECRET)) {\n    return res.status(400).send('Invalid signature');\n  }\n  const event = JSON.parse(req.body);\n  // Handle event...\n  res.json({ received: true });\n});`)}

### Python example
${codeBlock('python', `import hmac\nimport hashlib\n\ndef verify_webhook(raw_body: bytes, signature: str, secret: str) -> bool:\n    expected = hmac.new(\n        secret.encode(),\n        raw_body,\n        hashlib.sha256\n    ).hexdigest()\n    return hmac.compare_digest(expected, signature)`)}\n
> ⚠️ **Warning:** Never process a webhook event without verifying the signature first.

### Related
- [payment.completed](/webhooks/payment-completed)`,
})

// ─── Folder definitions ─────────────────────────────────────────────────────

const FOLDER_MAP = [
  {
    oldName: '🔑 Auth & Setup',
    newName: 'Getting Started',
    description: `## Getting Started

Welcome to the Vesicash Merchant API. This section covers authentication, environments, and your first API call.

### Before you begin

1. Sign up at [vesicash.com](https://vesicash.com) and complete KYC.
2. Go to **Dashboard → Developer → API Keys** to generate your test and live keys.
3. Set the collection variables:
   - \`base_url\`
   - \`secret_key\`
   - \`public_key\`
   - \`webhook_url\`
   - \`idempotency_key\`

### Environments

| Environment | Base URL | Key prefix |
|-------------|----------|------------|
| Sandbox | \`https://sandbox.api.vesicash.com\` | \`sk_test_\`, \`pk_test_\` |
| Production | \`https://api.vesicash.com\` | \`sk_live_\`, \`pk_live_\` |

> ✅ **Tip:** Always test thoroughly in sandbox before switching to live keys.`,
    requestMap: {
      '1. Verify API Credentials': 'Authentication',
      '2. Generate Webhook Secret': 'Generate Webhook Secret',
    },
    overviews: [overviewGettingStarted, quickStartGuide],
  },
  {
    oldName: '💳 Mobile money Payin — Checkout Flow',
    newName: 'Accept Payments',
    subFolderName: 'Mobile Money — Checkout',
    description: `## Mobile Money — Checkout

### In a nutshell
Host the payment experience on a Vesicash checkout page. This is the simplest integration and keeps your PCI scope minimal.

### When to use
- You want the fastest integration.
- You prefer Vesicash to handle payment details and provider redirects.

### Flow
${codeBlock('', '1. Your backend  →  POST /v1/payment/init\n2. Vesicash      →  Returns payment_link + reference\n3. Your frontend →  Redirects customer to payment_link\n4. Customer      →  Completes payment on Vesicash page\n5. Vesicash      →  POSTs webhook event to your server\n6. Your backend  →  GET /v1/payment/:reference (verify status)')}

> ⚠️ **Warning:** Never confirm an order based on the redirect URL alone. Always verify status via the API.`,
    requestMap: {
      '1. Initialize Payment (Checkout)': 'Initialize Payment',
      '2. Verify Payment Status (Post-Redirect)': 'Verify Payment Status',
    },
  },
  {
    oldName: '💳 Mobile money Payin — Non-Checkout Flow',
    newName: 'Accept Payments',
    subFolderName: 'Mobile Money — Direct',
    description: `## Mobile Money — Direct

### In a nutshell
Collect mobile money payments directly in your own UI without redirecting to Vesicash.

### When to use
- You want full control over the customer experience.
- You have the compliance and UI resources to collect payment details yourself.

### Flow
${codeBlock('', '1. Your backend  →  POST /v1/payment/init\n2. Vesicash      →  Returns payment_reference\n3. Your backend  →  POST /v1/payment/pay/:reference (customer details)\n4. Vesicash      →  POSTs webhook event to your server\n5. Your backend  →  GET /v1/payment/:reference (verify status)')}

> ⚠️ **Warning:** Always verify the final status via the API before fulfilling an order.`,
    requestMap: {
      '1. Initialize Payment (Non-Checkout)': 'Initialize Payment',
      '2. Complete Payment (Submit Customer Details)': 'Complete Payment',
      '3. Verify Transaction Status': 'Verify Payment Status',
    },
  },
  {
    oldName: '💳 Card Payin — Checkout Flow',
    newName: 'Accept Payments',
    subFolderName: 'Card — Checkout',
    description: `## Card — Checkout

### In a nutshell
Accept card payments through a Vesicash-hosted checkout page. Vesicash handles card data collection and 3DS2 authentication.

### When to use
- You want the simplest card integration.
- You want to minimize PCI-DSS scope.

### Flow
${codeBlock('', '1. Your backend  →  POST /v1/payment/init\n2. Vesicash      →  Returns payment_link + reference\n3. Your frontend →  Redirects customer to payment_link\n4. Customer      →  Enters card details on Vesicash page\n5. Vesicash      →  Handles 3DS2 with card issuer\n6. Vesicash      →  Redirects customer back to your site\n7. Vesicash      →  POSTs webhook event to your server\n8. Your backend  →  GET /v1/payment/:reference (verify status)')}

> ⚠️ **Warning:** Never confirm an order based on the redirect URL alone. Always verify status via the API.`,
    requestMap: {
      '1. Initialize Payment (Checkout)': 'Initialize Payment',
      '2. Verify Payment Status (Post-Redirect)': 'Verify Payment Status',
    },
  },
  {
    oldName: '💳 Card Payin — Non-Checkout Flow',
    newName: 'Accept Payments',
    subFolderName: 'Card — Direct',
    description: `## Card — Direct

### In a nutshell
Collect card details in your own UI and submit them directly to Vesicash. You maintain full control over the payment experience.

### When to use
- You want full control over the card UI.
- You are PCI-DSS compliant or use a certified card tokenization provider.

### Flow
${codeBlock('', '1. Your backend  →  POST /v1/payment/init\n2. Vesicash      →  Returns payment_reference\n3. Your backend  →  POST /v1/payment/pay/:reference (card data + device fingerprint)\n4. Vesicash      →  Returns success or 3DS2 challenge\n5. Vesicash      →  POSTs webhook event to your server\n6. Your backend  →  GET /v1/payment/:reference (verify status)')}

> ⚠️ **Warning:** Always verify the final status via the API before fulfilling an order.`,
    requestMap: {
      '1. Initialize Payment (Non-Checkout)': 'Initialize Payment',
      '2. Complete Payment (Submit Card Data)': 'Complete Payment',
      '3. Verify Transaction Status': 'Verify Payment Status',
    },
  },
  {
    oldName: '🏦 Mobile Money Payout — Disbursement',
    newName: 'Send Payouts',
    subFolderName: 'Mobile Money Payout',
    description: `## Mobile Money Payout

### In a nutshell
Disburse funds directly to mobile money wallets across supported countries.

### Before you begin
- Ensure your merchant wallet has sufficient balance.
- Confirm the recipient's mobile money number and country.

### Flow
${codeBlock('', '1. Your backend  →  GET /v1/wallet/:country (check balance)\n2. Your backend  →  POST /v1/payout\n3. Vesicash      →  Processes payout asynchronously\n4. Vesicash      →  POSTs webhook event to your server\n5. Your backend  →  GET /v1/payout/:reference (verify status)')}`,
    requestMap: {
      '1. Check Wallet Balance': 'Check Wallet Balance',
      '2. Process Mobile Money Payout': 'Process Payout',
      '3. Check Payout Status': 'Check Payout Status',
    },
  },
  {
    oldName: '🏦 Bank Payout — Disbursement',
    newName: 'Send Payouts',
    subFolderName: 'Bank Payout',
    description: `## Bank Payout

### In a nutshell
Send money directly to bank accounts in supported countries.

### Before you begin
- Ensure your merchant wallet has sufficient balance.
- Collect the recipient's bank account details and country.

### Flow
${codeBlock('', '1. Your backend  →  GET /v1/wallet/:country (check balance)\n2. Your backend  →  POST /v1/payout\n3. Vesicash      →  Processes payout asynchronously\n4. Vesicash      →  POSTs webhook event to your server\n5. Your backend  →  GET /v1/payout/:reference (verify status)')}`,
    requestMap: {
      '1. Check Wallet Balance': 'Check Wallet Balance',
      '2. Process bank Payout': 'Process Payout',
      '3. Check Payout Status': 'Check Payout Status',
    },
  },
  {
    oldName: '↩ Refund',
    newName: 'Manage Transactions',
    subFolderName: 'Process Refund',
    description: `## Process Refund

### In a nutshell
Reverse a completed payment back to the customer.

### Before you begin
- The original payment must have \`status: "success"\`.
- Your wallet must have sufficient balance to cover the refund amount.

### Flow
${codeBlock('', '1. Your backend  →  POST /v1/refund\n2. Vesicash      →  Processes refund asynchronously\n3. Vesicash      →  POSTs webhook event to your server\n4. Your backend  →  GET /v1/refund/:reference (verify status)')}`,
    requestMap: {
      '1. Process Refund': 'Process Refund',
      '2. Check Refund Status': 'Check Refund Status',
    },
  },
  {
    oldName: '📋 Payment Queries',
    newName: 'Manage Transactions',
    subFolderName: 'Query Payments',
    description: `## Query Payments

### In a nutshell
Search, list, and inspect transactions for reconciliation, reporting, and debugging.`,
    requestMap: {
      'Get All Payments (Paginated)': 'List Payments',
      'Get Payment Status by Reference': 'Get Payment by Reference',
      'Get Full Transaction Details (Refunds & Payouts)': 'Get Transaction Details',
    },
  },
  {
    oldName: '💰 Wallet',
    newName: 'Wallet',
    description: `## Wallet

### In a nutshell
Check balances and transaction history for your merchant wallets.`,
    requestMap: {
      'Get Wallet by Country': 'Get Wallet by Country',
      'Get All Wallets': 'List Wallets',
    },
  },
  {
    oldName: '🔔 Webhooks',
    newName: 'Webhooks',
    description: `## Webhooks

### In a nutshell
Vesicash sends real-time event notifications to your server via HTTP POST requests. Use them to drive order fulfilment, payout confirmations, and refund updates.

### Before you begin
- Configure your \`webhook_url\` in the Vesicash dashboard or via the Generate Webhook Secret endpoint.
- Store your webhook secret securely on your server.

### Security
Every webhook includes an \`x-vesicash-signature\` header. Always verify it before processing the payload.

### Retry policy
If your endpoint returns a non-2xx status, Vesicash retries with exponential backoff: 1 minute, 5 minutes, 30 minutes, 2 hours, 6 hours. After 5 failed attempts, the event is marked as undelivered.

### Response requirements
Your endpoint must return a \`200 OK\` response within 30 seconds.`,
    requestMap: {
      'payment.completed [PLACEHOLDER — event example]': 'payment.completed',
      'payment.failed [PLACEHOLDER — event example]': 'payment.failed',
      'payout.completed [PLACEHOLDER — event example]': 'payout.completed',
      'payout.failed [PLACEHOLDER — event example]': 'payout.failed',
      'refund.completed [PLACEHOLDER — event example]': 'refund.completed',
    },
    overviews: [webhooksOverview, verifyWebhookSignature],
  },
]

// ─── Build new folder structure ─────────────────────────────────────────────

const newFolders = []

function findOrCreateFolder(name, description = '') {
  let folder = newFolders.find(f => f.name === name)
  if (!folder) {
    folder = { name, description, item: [] }
    newFolders.push(folder)
  }
  return folder
}

for (const mapping of FOLDER_MAP) {
  const oldFolder = collection.item.find(f => f.name === mapping.oldName)
  if (!oldFolder) {
    console.warn(`Folder not found: ${mapping.oldName}`)
    continue
  }

  let targetFolder
  if (mapping.subFolderName) {
    const parent = findOrCreateFolder(mapping.newName, '')
    let subFolder = parent.item.find(i => i.name === mapping.subFolderName)
    if (!subFolder) {
      subFolder = { name: mapping.subFolderName, description: mapping.description, item: [] }
      parent.item.push(subFolder)
    }
    targetFolder = subFolder
  } else {
    targetFolder = findOrCreateFolder(mapping.newName, mapping.description)
  }

  // Add overview requests first
  if (mapping.overviews) {
    for (const overview of mapping.overviews) {
      targetFolder.item.push(overview)
    }
  }

  // Map requests
  for (const req of oldFolder.item || []) {
    const newName = mapping.requestMap[req.name]
    if (!newName) {
      console.warn(`Request not mapped: ${req.name} in ${mapping.oldName}`)
      continue
    }

    const clonedReq = JSON.parse(JSON.stringify(req))
    clonedReq.name = cleanRequestName(newName)

    // Clean webhook placeholder markers from descriptions
    if (clonedReq.request?.description) {
      clonedReq.request.description = clonedReq.request.description
        .replace(/\[PLACEHOLDER[^\]]*\]\s*/gi, '')
        .replace(/>\s*🚧\s*\*\*PLACEHOLDER[^*]*\*\*[^\n]*/gi, '')
        .trim()
    }

    targetFolder.item.push(clonedReq)
  }
}

// ─── Add parent-level overview guides ───────────────────────────────────────

if (acceptPaymentsOverview) {
  const acceptPaymentsFolder = newFolders.find(f => f.name === 'Accept Payments')
  if (acceptPaymentsFolder) {
    acceptPaymentsFolder.item.unshift(acceptPaymentsOverview)
  }
}

if (sendPayoutsOverview) {
  const sendPayoutsFolder = newFolders.find(f => f.name === 'Send Payouts')
  if (sendPayoutsFolder) {
    sendPayoutsFolder.item.unshift(sendPayoutsOverview)
  }
}

// ─── Update collection info ─────────────────────────────────────────────────

collection.info.description = `## Vesicash API — Merchant Integration

**Base URL:** \`https://api.vesicash.com\`  
**API Version:** v1  
**Protocol:** HTTPS only

---

### Quick Start

1. Open the **Variables** tab and fill in:
   - \`base_url\` — sandbox or production base URL
   - \`secret_key\` — your Vesicash secret key
   - \`public_key\` — your Vesicash public key
   - \`webhook_url\` — your server endpoint for Vesicash events
   - \`idempotency_key\` — unique string per POST request

2. Use **test keys** for development. Switch to **live keys** after KYC approval.

3. All requests return a standard JSON envelope:

${codeBlock('json', '{\n  "status": "success" | "error",\n  "code": 200,\n  "message": "Human-readable message",\n  "data": { ... }\n}')}

---

### Authentication

Every request requires these headers:

| Header | Value |
|--------|-------|
| \`x-api-key\` | Your secret API key — keep server-side only |
| \`public-key\` | Your public API key |
| \`Content-Type\` | \`application/json\` |
| \`Idempotency-Key\` | Unique string per POST request |

---

### Failure Reason Codes

| Code | Meaning |
|------|---------|
| \`ABANDONED_TRANSACTION\` | PIN not entered in time |
| \`DECLINED_TRANSACTION\` | Rejected by processor |
| \`INSUFFICIENT_FUNDS\` | Customer has insufficient funds |
| \`PROVIDER_TIMEOUT\` | Payment provider timed out |
| \`ACCOUNT_NOT_FOUND\` | Recipient account does not exist |
| \`DUPLICATE_REFERENCE\` | Idempotency or transaction reference already used |
| \`INVALID_CARD\` | Card failed validation |
| \`3DS_AUTHENTICATION_FAILED\` | 3D Secure authentication failed |`

// ─── Replace items and write output ─────────────────────────────────────────

collection.item = newFolders

writeFileSync(outputPath, JSON.stringify(collection, null, 2))

console.log('✅ Collection restructured successfully.')
console.log(`   Output: ${outputPath}`)
console.log(`   Backup: public/collection.backup.json`)

// Print new tree
console.log('\nNew folder tree:')
collection.item.forEach(folder => {
  console.log(`- ${folder.name}`)
  folder.item.forEach(child => {
    if (child.item) {
      console.log(`  - ${child.name}`)
      child.item.forEach(req => console.log(`    - ${req.name}`))
    } else {
      console.log(`  - ${child.name}`)
    }
  })
})
