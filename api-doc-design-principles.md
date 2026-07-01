# API Documentation Design Principles

> Lessons synthesized from reviewing Stripe, Flutterwave, Paystack, and StartButton documentation.
> These principles define what separates world-class API docs from mediocre ones.

---

## 1. Information Architecture

### Three-Panel Layout (The Industry Standard)
The most effective API documentation uses a persistent three-column layout:

```
┌─────────────────┬─────────────────────────────┬──────────────────────┐
│  Left Sidebar   │     Main Content             │  Right Code Panel    │
│  (Navigation)   │  (Prose + Parameters)        │  (Examples, sticky)  │
├─────────────────┼─────────────────────────────┼──────────────────────┤
│ - Section tree  │ - Endpoint description       │ - cURL               │
│ - Collapsible   │ - Parameter list             │ - Node.js            │
│ - Search bar    │ - Types, constraints         │ - Python             │
│ - Active state  │ - Response object            │ - PHP / Ruby / Java  │
│                 │ - Error handling             │  (Tab switcher)      │
└─────────────────┴─────────────────────────────┴──────────────────────┘
```

**Why it works:** The right panel is sticky — developers never have to scroll away from a code example while reading a parameter description. Context is always visible.

### Two Types of Documentation — Keep Them Separate
| Type | Purpose | Tone |
|------|----------|------|
| **Guides** | Narrative, step-by-step flows (e.g., "Accept a Payment") | Educational, walkthrough |
| **API Reference** | Exhaustive technical specs for every endpoint | Precise, scannable |

Never mix these. A guide page should not list every parameter. A reference page should not tell a story.

---

## 2. Navigation Structure

### Sidebar Organization — Role and Task-Based, Not Resource-Based
Group navigation by what developers are trying to *do*, not by internal API resource names:

```
Getting Started
  ├── Introduction
  ├── Authentication
  ├── Environments (Sandbox vs Live)
  └── Quick Start

Collect Payments
  ├── Cards
  ├── Mobile Money
  ├── Bank Transfer
  └── Payment Links

Payouts & Transfers
  ├── Initiate Transfer
  ├── Bulk Transfers
  └── Bank List

Transaction Management
  ├── Verify Transaction
  ├── Refunds
  └── Webhooks

Reference
  ├── API Endpoints
  ├── Error Codes
  ├── Test Credentials
  └── SDKs
```

### Multiple Entry Points — One Home Page, Three Paths
The documentation home page should offer three clickable entry cards:
1. **Quick Start** — For developers who want to run code in under 10 minutes
2. **API Reference** — For developers who already know what they're doing
3. **Use Cases / Guides** — For developers deciding what to build

This accommodates both exploration-oriented and action-oriented developers.

---

## 3. Authentication Documentation (First, Always)

Authentication must be the first technical content a developer encounters — before any endpoint docs.

**Required elements:**
1. Public key vs. Secret key distinction (role of each, client vs. server)
2. Where to find keys (exact dashboard path: *"Settings → API Keys"*)
3. Exact header format shown as literal text:
   ```
   Authorization: Bearer YOUR_SECRET_KEY
   Content-Type: application/json
   ```
4. A working cURL example that only tests authentication (nothing else)
5. Link to sandbox/test key instructions

---

## 4. Endpoint Documentation Format

Every endpoint page must follow the exact same structure — no exceptions:

```
## Endpoint Name

One-line description of what this endpoint does.

POST /v1/resource/action

### Request Headers

| Header        | Value                          |
|---------------|-------------------------------|
| Authorization | Bearer YOUR_SECRET_KEY         |
| Content-Type  | application/json               |

### Request Body

| Parameter  | Type    | Required | Description                                 |
|------------|---------|----------|---------------------------------------------|
| amount     | integer | Required | Amount in smallest currency unit (e.g., kobo for NGN: ₦300 = 30000) |
| currency   | string  | Required | ISO 4217 currency code. Enum: `NGN`, `GHS`, `KES`, `ZAR` |
| email      | string  | Required | Customer's email address |
| reference  | string  | Optional | Unique transaction reference. Auto-generated if not provided |
| metadata   | object  | Optional | Arbitrary key-value pairs attached to the transaction |

### Response

Returns a [Transaction Object](#transaction-object).

[Success Response] [Error Response]   ← tabs

{ JSON example here }

### Error Codes

| Code | Meaning |
|------|---------|
| 400  | Bad Request — missing or invalid parameters |
| 401  | Unauthorized — invalid or missing API key |
| 409  | Conflict — duplicate transaction reference |
```

### Parameter Annotation Rules
- **`required` / `optional`** must be explicit labels — never implied by position or convention
- **Types** must be stated: `integer`, `string`, `boolean`, `enum`, `object`, `array`
- **Enum values** must be fully listed with a description for each option
- **Nested objects** use dot-notation: `payment_method_options.card.cvv`
- **Constraints** are inline: *"An integer greater than 0"*, *"Maximum 100 characters"*, *"Must be a future date"*
- **Business context** is in the description: say *"Amount in kobo (₦300 = 30000)"*, not just *"Amount"*
- **Mutual exclusivity** noted: *"This field cannot be used alongside `redirect_url`"*

---

## 5. Code Examples

### Language Coverage
Every endpoint must have working code in at minimum:
- `cURL` (universal, always first)
- `JavaScript / Node.js`
- `Python`
- One of: `PHP`, `Java`, `Ruby`, `C#`, `Go`

### Tab Switcher Pattern
Show one language at a time with a persistent tab bar. The selected language should be remembered across all pages in the session.

### Quality Rules for Examples
1. **Use real-ish values** — `"amount": 30000` not `"amount": <YOUR_AMOUNT>`. Show a value that actually runs in sandbox.
2. **Minimal but complete** — The smallest working example. No extra noise.
3. **Show the full request** — Include headers, not just the body.
4. **Show the full response** — With real-looking IDs, not placeholders.
5. **Scenario tabs** — Split by *Required params only* / *Full options* / *Success response* / *Error response*.

### Example Pattern (StartButton-style multi-scenario)
```
[Required Params]  [All Params]  [Success Response]  [Failed Response]
```

---

## 6. Response Documentation

### Always Show a Real JSON Response Object
```json
{
  "status": "success",
  "message": "Transaction initialized",
  "data": {
    "id": "txn_01J2KXMN8A9BQRV3",
    "reference": "ref_20240617_abc123",
    "amount": 30000,
    "currency": "NGN",
    "status": "pending",
    "authorization_url": "https://checkout.vesicash.com/pay/abc123",
    "created_at": "2024-06-17T10:30:00Z"
  }
}
```

### Response Object Reference
Define each response object once with all fields, then link to it from every endpoint that returns it. Never repeat the full object definition on every page.

---

## 7. Error Documentation

### Three Layers of Error Documentation

**Layer 1 — HTTP Status Code Table** (single reference page)
| Code | Category | Meaning |
|------|----------|---------|
| 200 | Success | Request succeeded |
| 400 | Client Error | Invalid parameters |
| 401 | Auth Error | Missing or invalid API key |
| 403 | Forbidden | IP not whitelisted / insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate reference or request |
| 422 | Validation | Parameters valid but request cannot be processed |
| 429 | Rate Limit | Too many requests |
| 500 | Server Error | Temporary Vesicash-side issue |

**Layer 2 — Error Type Taxonomy** (4 categories max)
| Type | When It Occurs |
|------|---------------|
| `authentication_error` | Bad or missing API key |
| `validation_error` | Missing required fields, invalid types |
| `business_logic_error` | Insufficient balance, duplicate transaction, card declined |
| `server_error` | Temporary server-side issue |

**Layer 3 — Business-Logic Errors as Response Tabs**
Show common failure states inline on the endpoint page, not just in a separate error reference:
```json
{
  "status": "error",
  "message": "Insufficient funds in NGN wallet",
  "code": "INSUFFICIENT_BALANCE"
}
```

### Key Design Rule
Distinguish *developer-facing* errors (fix your code) from *user-facing* errors (show this to the user). Label each error with guidance: *"Display to user"* vs. *"Log and retry"*.

---

## 8. Page-Level Content Structure

### Guide Pages (Step-by-Step Flows)
```
# Title (what the user will accomplish)

Brief intro (2-3 sentences max — what, why, when to use this guide)

## Before You Begin
- [ ] Prerequisite 1
- [ ] Prerequisite 2

## Step 1: Do X
Explanation.
[Code example]

## Step 2: Do Y
Explanation.
[Code example]

## Step 3: Handle the Response
[Code example showing success and error branches]

## What's Next
- Link to related guide
- Link to reference docs for this endpoint
```

### Reference Pages (API Endpoints)
```
# Endpoint Name

[Badge: POST]  /v1/endpoint-path

One-line description.

## Request
[Parameters table]
[Code example — right panel]

## Response
[Response object]
[Code example — success + error tabs]

## Related
- [Webhook events for this endpoint]
- [Object reference]
```

---

## 9. Visual Callout Patterns

Use 3 callout types maximum:

```
ℹ️ NOTE
Used for: Additional context, edge cases, regional differences

⚠️ WARNING
Used for: Security-sensitive actions, irreversible operations, known gotchas

✅ TIP
Used for: Best practices, performance hints, recommended approaches
```

**Rules:**
- Never use a callout for content that belongs in the main flow
- A callout should be skippable without losing understanding of the endpoint
- Keep callout text to 1–3 sentences

---

## 10. Versioning and Environments

### Surface Environment Differences Early
On the authentication page, show both sandbox and production:

| Environment | Base URL | Key Prefix |
|-------------|----------|------------|
| Sandbox     | `https://sandbox.api.vesicash.com/v1` | `pk_test_`, `sk_test_` |
| Production  | `https://api.vesicash.com/v1`         | `pk_live_`, `sk_live_` |

### Version in the URL
Always include a version segment: `/v1/`. Announce deprecations with a minimum 6-month notice, and document the migration path alongside the old endpoint.

---

## 11. Testing & Sandbox

### Test Credentials Page — Required Elements
- Test API keys (hardcoded, safe to publish)
- Test card numbers by scenario (success, decline, insufficient funds, 3DS)
- Test mobile money numbers by country
- Test bank account numbers for transfers
- Expected behavior for each test credential

**Pattern (from StartButton):**
| Test Number | Network | Scenario |
|-------------|---------|---------|
| 0551234567  | MTN GH  | Successful payment |
| 0201234567  | Vodafone| Payment pending → expires |
| 0271234567  | AirtelTigo | Insufficient funds |

---

## 12. Webhook Documentation

Every webhook page must include:
1. **Event list** — All event names with one-line descriptions
2. **Payload structure** — Full JSON example for each event type
3. **Signature verification** — Exact code showing how to validate the HMAC signature
4. **Retry policy** — How many retries, at what intervals, what triggers a retry
5. **Response requirements** — *"Your endpoint must return 200 within 30 seconds"*

---

## 13. Tone and Voice

| Principle | Good | Bad |
|-----------|------|-----|
| **Action-first** | "Initialize a transaction" | "This endpoint is used for the purpose of initializing..." |
| **Present tense** | "Returns a Transaction object" | "Will return a Transaction object" |
| **You / your** | "Your server receives a webhook" | "The server receives a webhook" |
| **Concrete, not vague** | "Pass amount in kobo: ₦300 = 30000" | "Pass amount in the appropriate format" |
| **No filler** | "Set `currency` to `NGN`" | "Please note that you should set the value of the currency field to NGN" |

### What Not to Write
- Do not explain what REST is
- Do not explain what JSON is
- Do not explain what HTTP status codes are (link to a reference instead)
- Do not repeat the endpoint URL in prose if it's already in the header

---

## 14. Navigation and Discovery

### Search — Non-Negotiable
Every documentation site must have full-text search. It must:
- Search across endpoint names, parameter names, and description text
- Return results with the section title and a snippet
- Be accessible via keyboard shortcut (⌘K or Ctrl+K)

### Sidebar Active State
The current page must be visually highlighted in the sidebar at all times. Sub-sections of a long page should appear as nested items under the active page as the user scrolls.

### "On This Page" Jump Links
For any page longer than 3 sections, show a sticky in-page table of contents (right or top of main column):
```
On this page
  ├── Request Headers
  ├── Request Body
  ├── Response
  └── Error Codes
```

---

## 15. Developer Trust Signals

These elements, placed consistently, build confidence:
- **Sandbox first** — Always mention sandbox before production. Say *"without affecting your live data"*
- **Response time expectations** — State expected latency where relevant
- **Changelog / API versioning** — Show developers the API is maintained and evolving
- **SDK availability** — Surface official SDK links near the top of the docs
- **Status page link** — Link to a service status page in the footer
- **OpenAPI spec** — Offer a downloadable OpenAPI/Swagger file for power users
- **Postman collection** — Offer a one-click "Run in Postman" button

---

## Summary Checklist

Before publishing any API documentation, verify:

- [ ] Authentication page is the first technical page, before any endpoints
- [ ] Every endpoint has: description, method+URL, headers, parameters (with required/optional), code example, success response, error response
- [ ] Parameter types and constraints are explicit on every field
- [ ] Code examples exist in at least 3 languages
- [ ] Errors are documented at three layers (HTTP codes, error types, business errors)
- [ ] A working Sandbox environment exists with test credentials documented
- [ ] Webhooks have payload examples AND signature verification code
- [ ] Search works across the full documentation
- [ ] Navigation shows the active page with visual highlight
- [ ] All pages follow the same structural template — no one-offs
