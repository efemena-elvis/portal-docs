# Vesicash Docs — Postman Collection Content Conventions

> This document defines how the Postman collection must be authored so that the docs site can parse it into a world-class developer experience. Follow these conventions when editing `public/collection.json` or the live Postman collection.

---

## 1. Collection Structure

The collection is organized into **folders**. Each top-level folder becomes a group in the left sidebar. Each request inside a folder becomes a page.

### 1.1 Folder naming

- Use plain English, **no emojis** in folder names.
- Use title case.
- Keep names short (1–4 words).
- Group by user intent, not internal resource names.

**Good:**
- `Accept Payments`
- `Send Payouts`
- `Manage Transactions`
- `Webhooks`

**Bad:**
- `💳 Card Payin — Checkout Flow`
- `🏦 Bank Payout — Disbursement`
- `↩ Refund`

### 1.2 Request naming

- Use action-oriented titles.
- Omit numbering; ordering in Postman defines sidebar order.
- Keep titles under 50 characters.

**Good:**
- `Initialize Payment`
- `Verify Payment Status`
- `Process Bank Payout`

**Bad:**
- `1. Initialize Payment (Checkout)`
- `2. Verify Payment Status (Post-Redirect)`

### 1.3 Recommended folder structure

```
Vesicash API — Merchants Integration
├── Getting Started
│   ├── Overview
│   ├── Authentication
│   ├── Environments
│   └── Quick Start
├── Accept Payments
│   ├── Accept Payments Overview
│   ├── Mobile Money — Checkout
│   ├── Mobile Money — Direct
│   ├── Card — Checkout
│   ├── Card — Direct
│   └── Payment Links
├── Send Payouts
│   ├── Send Payouts Overview
│   ├── Bank Payout
│   ├── Mobile Money Payout
│   └── Bulk Transfers
├── Manage Transactions
│   ├── Verify Transaction Status
│   ├── List Transactions
│   ├── Process Refund
│   └── Query Payments
├── Webhooks
│   ├── Webhooks Overview
│   ├── Verify Webhook Signature
│   ├── payment.completed
│   ├── payment.failed
│   ├── payout.completed
│   ├── payout.failed
│   ├── refund.completed
│   └── refund.failed
├── Reference Data
│   ├── Get Client IP
│   ├── List Countries
│   └── List Banks
└── Wallet
    ├── Get Wallet Balance
    └── List Wallets
```

### 1.4 Guide overview requests

For complex flows, add an **overview request** as the first item in the folder. Use a `GET` with URL `{{base_url}}/overview/{{topic}}` and mark it with `x-docs-type: guide` in the request description frontmatter.

The overview request holds:
- `### In a nutshell`
- `### Before you begin`
- Conceptual explanations
- Flow diagrams
- Links to the endpoint requests in the folder

---

## 2. Request Descriptions

Request descriptions are written in **Markdown**. The parser extracts specific sections to render the page.

### 2.1 Required sections

Every endpoint request description must contain:

```markdown
## Short Title

One-line description of what this endpoint does.

**Endpoint:** `METHOD /path`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Amount in smallest currency unit. |

### Response

Description of the response object.
```

### 2.2 Optional sections

Use these headings exactly. The parser recognizes them and renders them as special UI components.

| Section | Renders as |
|---------|-----------|
| `### In a nutshell` | Summary callout at top of page |
| `### Before you begin` | Prerequisite callout |
| `### When to use` | Info callout |
| `### When not to use` | Info callout |
| `### Flow Summary` | ASCII flow diagram / step list |
| `### Authentication` | Auth headers callout |
| `### Request Headers` | Headers table |
| `### Request Body` | Body parameters table |
| `### Path Parameters` | Path parameters table |
| `### Query Parameters` | Query parameters table |
| `### Response` | Response description + example |
| `### Response Object` | Response fields table |
| `### Error Codes` | Endpoint-specific errors |
| `### Fields to Monitor` | Monitor table |
| `### Next Step` | Next-step callout |
| `### Sample Request` | Inline request example |
| `### Sample Response` | Inline response example |
| `### Related` | Related links list |

### 2.3 Callout syntax

Use blockquotes with emoji prefixes. The parser converts these to styled callouts.

```markdown
> ℹ️ **Note:** Additional context here.

> ⚠️ **Warning:** Security-sensitive warning here.

> ✅ **Tip:** Best practice or recommendation.

> 🚧 **Placeholder:** Content still being finalized.
```

### 2.4 Code blocks

Use fenced code blocks with a language tag. The parser will syntax-highlight them.

```markdown
```json
{
  "status": "success",
  "data": { ... }
}
```
```

Supported languages:
- `json`
- `javascript` / `js`
- `node`
- `python`
- `php`
- `go`
- `ruby`
- `bash` / `shell` / `curl`

---

## 3. Parameter Tables

### 3.1 Body parameters

Use exactly 4 columns:

```markdown
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Amount in smallest currency unit. |
| `currency` | string | Yes | ISO 4217 currency code. |
| `metadata` | object | No | Arbitrary key-value pairs. |
```

- Field names must be wrapped in backticks.
- Use `Yes` / `No` for required.
- Type must be one of: `string`, `number`, `integer`, `boolean`, `object`, `array`, `enum`.
- For enums, list allowed values in the description: `Enum: "NGN", "GHS"`.

### 3.2 Headers

Use 3 columns:

```markdown
| Header | Value | Required |
|--------|-------|----------|
| `x-api-key` | `YOUR_SECRET_KEY` | Yes |
| `Content-Type` | `application/json` | Yes |
| `Idempotency-Key` | `unique-uuid` | For POST |
```

### 3.3 Path and query parameters

Use 3 columns:

```markdown
| Parameter | Type | Description |
|-----------|------|-------------|
| `payment_reference` | string | The reference returned by init. |
```

---

## 4. Saved Responses

Saved responses are used to generate scenario tabs on the page. Name them according to convention so the parser knows which tab to render.

### 4.1 Naming convention

| Name | Purpose |
|------|---------|
| `Required params only` | Request example with only required fields |
| `All params included` | Request example with all optional fields |
| `Passing metadata` | Request example showing metadata usage |
| `Success` / `200 Success` | Successful response |
| `Pending` / `202 Pending` | Pending/async response |
| `Failed` / `400 Bad Request` | Error/validation response |
| `Unauthorized` / `401 Unauthorized` | Auth error response |

### 4.2 Response body

Always use valid JSON. The formatter will pretty-print it.

---

## 5. Webhook Conventions

### 5.1 Webhook overview request

The first request in the `Webhooks` folder should be a guide-style overview with:

```markdown
## Webhooks Overview

### In a nutshell
Webhooks deliver real-time event notifications to your server.

### Before you begin
- Configure your `webhook_url` in the dashboard.
- Generate and securely store your webhook secret.

### Retry Policy
...

### Event Types
| Event | Trigger |
|-------|---------|
| `payment.completed` | Payment successfully processed |
```

### 5.2 Webhook event requests

Each event should be a `POST` request to `{{webhook_url}}` with:

```markdown
## payment.completed

### Trigger
When a customer payment is fully processed.

### Payload Fields
| Field | Type | Description |
|-------|------|-------------|
| `event` | string | Always `"payment.completed"` |
| `data.reference` | string | Vesicash transaction reference |

### Your handler should:
1. Verify `x-vesicash-signature`.
2. Respond with `200 OK` immediately.
3. Look up the order by `data.merchant_reference`.
```

### 5.3 Signature verification

Include a dedicated request or section named `Verify Webhook Signature` with code examples in multiple languages.

---

## 6. Variables

Collection variables are documented on the `/reference/variables` page. Use clear descriptions.

| Key | Example Value | Description |
|-----|---------------|-------------|
| `base_url` | `https://api.vesicash.com` | Base URL for all requests |
| `secret_key` | `sk_test_...` | Your secret API key |
| `public_key` | `pk_test_...` | Your public API key |
| `webhook_url` | `https://yourserver.com/webhooks` | Your webhook endpoint |
| `idempotency_key` | `uuid-v4` | Unique key per POST request |

---

## 7. Special Markers

### 7.1 Frontmatter (optional)

For advanced control, add a YAML frontmatter block at the very start of a request description:

```markdown
---
docs-type: guide      # guide | endpoint | webhook
sidebar-label: Short name
template: guide       # guide | reference | webhook
---

## Page Title
...
```

### 7.2 Hidden content

Use HTML comments to leave notes for editors that should not render:

```markdown
<!-- TODO: confirm exact endpoint path with backend -->
```

---

## 8. Examples

### 8.1 Endpoint page example

```markdown
---
docs-type: endpoint
---

## Initialize Payment

### In a nutshell
Creates a new transaction and returns a hosted payment link for the checkout flow.

**Endpoint:** `POST /v1/payment/init`

### Before you begin
- Ensure you have your `secret_key` and `public_key` configured.
- Set a `redirect_success_url` and `redirect_failed_url` on your dashboard or in the request.

### Request Headers
| Header | Value | Required |
|--------|-------|----------|
| `x-api-key` | `{{secret_key}}` | Yes |
| `public-key` | `{{public_key}}` | Yes |
| `Content-Type` | `application/json` | Yes |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Amount in smallest currency unit. |
| `currency` | string | Yes | ISO 4217 code, e.g. `GHS`. |
| `email` | string | Yes | Customer email address. |
| `metadata` | object | No | Arbitrary key-value pairs. |

### Response
Returns a Payment object.

```json
{
  "status": "success",
  "code": 200,
  "data": {
    "payment_link": "https://checkout.vesicash.com/pay/abc123",
    "reference": "APX-REF-XXXXXX"
  }
}
```

### Next Step
Redirect the customer to `data.payment_link`, then verify the final status with `GET /v1/payment/:reference`.

### Related
- [Verify Payment Status](/accept-payments/mobile-money-checkout/verify-payment-status)
- [Webhooks](/webhooks/payment-completed)
```

### 8.2 Guide page example

```markdown
---
docs-type: guide
---

## Accept Payments Overview

### In a nutshell
Accept mobile money and card payments across Africa through Vesicash-hosted checkout pages or your own custom UI.

### Before you begin
1. Complete KYC in the Vesicash dashboard.
2. Generate test API keys.
3. Configure your webhook URL.

### Payment flows

#### Hosted checkout
The simplest integration. Vesicash collects payment details on a hosted page.

```
1. Your backend → POST /v1/payment/init
2. Vesicash → returns payment_link
3. Redirect customer to payment_link
4. Customer completes payment
5. Vesicash → POST webhook to your server
6. Your backend → GET /v1/payment/:reference to verify
```

#### Direct integration
Build your own payment UI. Requires PCI compliance for card data.

### Supported currencies
| Currency | Payment methods |
|----------|-----------------|
| `NGN` | card, bank_transfer, ussd |
| `GHS` | card, mobile_money |
| `KES` | card, mobile_money |

### Related endpoints
- [Mobile Money — Checkout](/accept-payments/mobile-money-checkout/initialize-payment)
- [Card — Direct](/accept-payments/card-direct/initialize-payment)
```

---

## 9. Validation Checklist

Before exporting `collection.json` and deploying the docs, verify:

- [ ] All folders use plain English names without emojis.
- [ ] Every endpoint has `### Request Body` or `### Request Headers`.
- [ ] Parameter tables use the correct column headers.
- [ ] Required fields use `Yes` / `No`.
- [ ] Response JSON is valid.
- [ ] Webhook events follow the naming convention.
- [ ] Overview/guide requests use `docs-type: guide` frontmatter.
- [ ] No `[PLACEHOLDER]` labels remain in published content.
- [ ] Saved response names follow the scenario convention.
