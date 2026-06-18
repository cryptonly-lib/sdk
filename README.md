# `@cryptonly/sdk`

Official JavaScript/TypeScript SDK for the Cryptonly merchant API.

Use it to create invoices and deposits, manage withdrawals and balance conversions, reserve reusable deposit addresses, and work with merchant accounts from secure backend environments.

- Website: [cryptonly.net](https://cryptonly.net)
- Documentation: [cryptonly.gitbook.io/docs](https://cryptonly.gitbook.io/docs)

> This SDK is for **server-side use only**. Never expose your Cryptonly API key in browser code, mobile apps, or other client-side environments.

---

## Installation

```bash
npm install @cryptonly/sdk
```

### TypeScript

If you use TypeScript, use **TypeScript 4.5+** so the package declaration files parse correctly.

The package declares `typescript` as an optional `peerDependency`, so JavaScript-only projects do not need to install it.

---

## Quick start

```ts
import { Cryptonly } from '@cryptonly/sdk';

const client = new Cryptonly({
  apiKey: process.env.CRYPTONLY_API_KEY!,
});

const invoice = await client.invoice.create({
  accountId: process.env.CRYPTONLY_ACCOUNT_ID!,
  amount: 100,
  fiatCurrencyCode: 'USD',
  description: 'Order #123',
  orderId: 'order_123',
});

console.log(invoice);
```

---

## Features

- Typed client for the Cryptonly merchant API
- Invoice creation and management
- Crypto **deposits** (one-shot top-up addresses)
- **Address provision** (reusable pool addresses per customer)
- Withdrawal creation and lookup (quote + commit)
- **Converting** (virtual balance FX: quote, preview, commit)
- Merchant account operations
- Supported crypto and fiat currency directory
- Built-in API key authentication
- Idempotent create operations via `orderId` (invoices, deposits, withdrawals)
- Structured error handling with `CryptonlyApiError`
- **`verifyInvoiceWebhook`**, **`verifyWithdrawalWebhook`**, and **`verifyDepositWebhook`** — HMAC verification helpers for Cryptonly-signed outbound webhooks (see below)

---

## Verifying inbound webhooks

When Cryptonly POSTs to your `webhookUrl`, the body is JSON (`event`, `data`, `timestamp`) and the `x-webhook-signature` header is **hex HMAC-SHA256** over the **exact raw request body** (UTF-8), using your tenant webhook signing secret.

Import **`verifyInvoiceWebhook`**, **`verifyWithdrawalWebhook`**, or **`verifyDepositWebhook`**: pass the raw body as a **UTF-8 string** or **`Buffer`** (same bytes Cryptonly signed), the `x-webhook-signature` header value, and the secret. Each returns `{ ok: true, envelope }` or `{ ok: false, reason }` (e.g. wrong signature or wrong `event`). Related types (`WebhookVerificationRawBody`, `InvoiceStatusChangedWebhookData`, `DepositStatusChangedWebhookData`, …) and event constants are exported from the same package.

| Event constant | Verifier | When sent |
|----------------|----------|-----------|
| `invoice.statusChanged` | `verifyInvoiceWebhook` | Invoice status transitions (includes linked deposit settlement on the invoice payload) |
| `withdrawal.statusChanged` | `verifyWithdrawalWebhook` | Withdrawal status transitions |
| `deposit.statusChanged` | `verifyDepositWebhook` | Standalone merchant deposits and address-provision **payment** deposits (not invoice-linked deposits) |

The `data` object largely matches merchant **GET** invoice, **GET** withdrawal, or **GET** deposit; the account UUID is **`accountId`**. Webhooks include optional `previousStatus`.

Obtain and rotate your webhook signing secret in the Cryptonly **admin app → Settings → Security** (the full key is shown once after rotate; store it like an API key). The signature is **HMAC-SHA256** over the exact raw request body bytes (UTF-8), sent as lowercase hex in `x-webhook-signature`. For threat model, replay handling, default webhook URLs, and integration examples, see [Cryptonly docs → webhooks](https://cryptonly.gitbook.io/docs).

---

## Authentication

Pass your tenant API key to the client constructor:

```ts
import { Cryptonly } from '@cryptonly/sdk';

const client = new Cryptonly({
  apiKey: process.env.CRYPTONLY_API_KEY!,
});
```

The SDK automatically sends the key in the `x-tenant-api-key` header on every request.

### Important

API keys must only be used in systems you control, such as:

- backend services
- internal APIs
- workers
- cron jobs
- secure server environments

Do **not** use this SDK directly in:

- browser-based frontend apps
- mobile apps
- public client bundles
- environments visible to end users

---

## Configuration

### `apiKey`

**Required.** Your Cryptonly tenant API key.

```ts
const client = new Cryptonly({
  apiKey: process.env.CRYPTONLY_API_KEY!,
});
```

### `sandbox`

**Optional.** When `true`, uses `SANDBOX_MERCHANT_API_BASE_URL` instead of production. Ignored when `baseUrl` is set explicitly.

```ts
import { Cryptonly, SANDBOX_MERCHANT_API_BASE_URL } from '@cryptonly/sdk';

const client = new Cryptonly({
  apiKey: process.env.CRYPTONLY_API_KEY!,
  sandbox: true,
});

console.log(SANDBOX_MERCHANT_API_BASE_URL);
// https://sandbox-api-merchant.cryptonly.net
```

### `timeout`

**Optional.** Per-request timeout in milliseconds. Defaults to `60_000`.

### `fetch`

**Optional.** Custom `fetch` implementation. Defaults to `globalThis.fetch`
(Node 18+). Provide a polyfill or test double when running on older runtimes.

---

## Default API origin

The SDK uses the default merchant API origin:

```ts
import { MERCHANT_API_BASE_URL } from '@cryptonly/sdk';

console.log(MERCHANT_API_BASE_URL);
// https://api-merchant.cryptonly.net
```

This constant is also exported for custom `fetch` calls and lower-level integrations.

---

## API surface

The `Cryptonly` client exposes seven resource clients. Request/response types are exported from `@cryptonly/sdk` (see `CreateInvoiceParams`, `CreateDepositParams`, `ConvertingQuoteRequest`, and related types).

| Client property | Methods |
|-----------------|---------|
| `invoice` | `create`, `list`, `get`, `cancel` |
| `withdrawal` | `quote`, `commit`, `list`, `get` |
| `deposit` | `create`, `list`, `get` |
| `addressProvision` | `create`, `get` |
| `accounts` | `list`, `create` |
| `currencies` | `list`, `listFiat` |
| `converting` | `quote`, `preview`, `commit` |

**Top-level exports (not on `client`):** `verifyInvoiceWebhook`, `verifyWithdrawalWebhook`, `verifyDepositWebhook`, `CryptonlyApiError`, `newSdkOrderId`, merchant API constants, webhook event constants, and error code constants.

### REST paths

Use SDK methods instead of constructing `x-tenant-api-key` headers manually.

- `POST /invoice` — `invoice.create`
- `GET /invoice/list` — `invoice.list`
- `GET /invoice` — `invoice.get` (query: `accountId`, `id` or `orderId`)
- `POST /invoice/cancel` — `invoice.cancel`
- `POST /withdrawal/quote` — `withdrawal.quote`
- `POST /withdrawal/commit` — `withdrawal.commit`
- `GET /withdrawal/list` — `withdrawal.list`
- `GET /withdrawal` — `withdrawal.get`
- `POST /deposit` — `deposit.create`
- `GET /deposit/list` — `deposit.list`
- `GET /deposit` — `deposit.get`
- `POST /address-provision` — `addressProvision.create`
- `GET /address-provision` — `addressProvision.get`
- `POST /converting/quote` — `converting.quote`
- `POST /converting/preview` — `converting.preview`
- `POST /converting/commit` — `converting.commit`
- `GET /accounts` — `accounts.list`
- `POST /accounts` — `accounts.create`
- `GET /currencies` — `currencies.list` (optional `network` query)
- `GET /currencies/fiat` — `currencies.listFiat`

### `client.invoice`

| Method | HTTP | Purpose |
|--------|------|---------|
| `create` | `POST /invoice` | Create a hosted-payment invoice. Body: `CreateInvoiceParams` — `accountId`, `fiatCurrencyCode`, `orderId` (or omit to auto-generate), `amount` or `items`, `description`, `returnUrl`, `customerId`, etc. Response `expiresAt` is a **`Date`**. |
| `list` | `GET /invoice/list` | Paginated list. Query: `accountId`, optional `status`, `page`, `limit`. Returns `{ data, total, page, limit, hasMore }`. |
| `get` | `GET /invoice` | Single invoice. Query: `accountId`, `id` or `orderId`. |
| `cancel` | `POST /invoice/cancel` | Cancel a pending invoice. Same query as `get`. |

`invoice.get` and `invoice.cancel` validate locally: `accountId` required; at least one of `id` or `orderId` — otherwise **`TypeError`**.

### `client.withdrawal`

Two-step flow: **`quote`** then **`commit`** (like converting). The quote does not reserve balance; it returns a short-lived `quoteId` and fee breakdown.

| Method | HTTP | Purpose |
|--------|------|---------|
| `quote` | `POST /withdrawal/quote` | Stage 1. Body: `WithdrawalQuoteRequest` — `accountId`, `amount`, `cryptoCurrencyCode`, `address`, optional `orderId` (idempotency). |
| `commit` | `POST /withdrawal/commit` | Stage 2. Body: `{ quoteId }`. |
| `list` | `GET /withdrawal/list` | Paginated list. Query: `accountId`, optional `status`, `page`, `limit`. |
| `get` | `GET /withdrawal` | Single withdrawal. Query: `accountId`, `id` or `orderId`. |

`withdrawal.get` validates locally (`accountId` + `id` or `orderId`) or throws **`TypeError`**.

### `client.deposit`

| Method | HTTP | Purpose |
|--------|------|---------|
| `create` | `POST /deposit` | One-shot crypto top-up address. Body: `CreateDepositParams` — `accountId`, `cryptoCurrencyCode`, `orderId`; optional `customerId`. Returns `id`, `address`, `minimumAmount`, `createdAt`, `expiresAt`, `qrCode`. |
| `list` | `GET /deposit/list` | Paginated deposits. Query: `accountId`, optional `status`, `page`, `limit`. |
| `get` | `GET /deposit` | Single deposit. Query: `accountId`, `id` or `orderId`. |

`deposit.get` validates like invoice lookup (`accountId` + `id` or `orderId`) or throws **`TypeError`**. Idempotent retries: reuse the same `orderId` on `create`.

### `client.addressProvision`

Reserve a **reusable** pool address for a customer (repeat top-ups to the same address until expiry).

| Method | HTTP | Purpose |
|--------|------|---------|
| `create` | `POST /address-provision` | Body: `CreateAddressProvisionParams` — `accountId`, `cryptoCurrencyCode`, `customerId`; optional `expiresInMinutes` (15–90, server default 30). Response shape matches deposit create; `id` is the provision id. Includes `createdAt`, `expiresAt`. |
| `get` | `GET /address-provision` | Query: `accountId`, `id`. Returns status (`active` \| `expired` \| `closed`), `createdAt`, and address fields. |

Exported bounds: `ADDRESS_PROVISION_MIN_EXPIRES_MINUTES`, `ADDRESS_PROVISION_MAX_EXPIRES_MINUTES`, `ADDRESS_PROVISION_DEFAULT_EXPIRES_MINUTES`, `ADDRESS_PROVISION_GRACE_MINUTES`.

### `client.accounts`

| Method | HTTP | Purpose |
|--------|------|---------|
| `list` | `GET /accounts` | All merchant accounts for the tenant. |
| `create` | `POST /accounts` | Body: `CreateTenantAccountRequest`. |

### `client.currencies`

Read-only directory (no account id required).

| Method | HTTP | Purpose |
|--------|------|---------|
| `list` | `GET /currencies` | All supported crypto currencies; optional `{ network: 'Tron' }`. `depositCommission` is the tenant-wide effective rate (identical on every row). |
| `listFiat` | `GET /currencies/fiat` | Fiat codes valid for `invoice.create` (`fiatCurrencyCode`). |

```ts
const supported = await client.currencies.list();
const tronAssets = await client.currencies.list({ network: 'Tron' });
const fiats = await client.currencies.listFiat();
```

### `client.converting`

Virtual balance conversion (no on-chain transfer). **`preview`** is for UI sync; **`quote`** stores a short-lived `quoteId`; **`commit`** applies it.

| Method | HTTP | Purpose |
|--------|------|---------|
| `quote` | `POST /converting/quote` | Body: `ConvertingQuoteRequest` — `accountId`, `fromCryptoCurrencyCode`, `toCryptoCurrencyCode`, and either `fromAmount` or `toAmount`. Returns locked amounts + `quoteId` + `expiresAt`. |
| `preview` | `POST /converting/preview` | Same body as `quote`; returns FX breakdown without persisting a quote. |
| `commit` | `POST /converting/commit` | Body: `CommitConvertingRequest` — `{ quoteId }`. |

### Shared response notes

- **`invoice.list`**, **`withdrawal.list`**, and **`deposit.list`** return paginated envelopes. List rows use **`Date`** for timestamp fields where the SDK parses them; **`source`** (`api` \| `admin_panel`) appears when the API includes initiation metadata.
- **Invoices:** optional **`returnUrl`**, **`customerId`**, **`customPayload`**, and linked **`deposit`** summary when present.
- **Withdrawals:** **`createdAt`**, **`updatedAt`**, **`quoteId`**, **`transferId`** (nullable) alongside fee and amount fields.
- Prefer exported error constants (e.g. **`CRYPTONLY_EXCEPTION_INVOICE_NOT_FOUND`**, **`CRYPTONLY_EXCEPTION_INVOICE_CUSTOMER_BLOCKED`**, **`CRYPTONLY_EXCEPTION_WITHDRAWAL_INSUFFICIENT_BALANCE`**, **`CRYPTONLY_EXCEPTION_AUTH_INVALID_API_KEY`**) over string literals on **`CryptonlyApiError.code`**.

```ts
import {
  Cryptonly,
  CryptonlyApiError,
  CRYPTONLY_EXCEPTION_WITHDRAWAL_INSUFFICIENT_BALANCE,
} from '@cryptonly/sdk';
```

---

## Usage examples

### Create an invoice

```ts
import { Cryptonly } from '@cryptonly/sdk';

const client = new Cryptonly({
  apiKey: process.env.CRYPTONLY_API_KEY!,
});

const invoice = await client.invoice.create({
  accountId: process.env.CRYPTONLY_ACCOUNT_ID!,
  amount: 100,
  fiatCurrencyCode: 'USD',
  description: 'Order #123',
  orderId: 'order_123',
});

console.log(invoice);
```

### List accounts

```ts
const accounts = await client.accounts.list();

console.log(accounts);
```

### Create a withdrawal

Withdrawals are created via the two-step quote + commit flow. The quote
returns the real on-chain fee converted into the withdrawal currency,
and pins the merchant's `orderId` (idempotency key) to that quote - so
retrying the quote call with the same `orderId` collapses to the same
quote, and `(orderId, account)` can ever back at most one committed
withdrawal. Omit `orderId` to get a fresh, non-deduplicating quote.

```ts
const quote = await client.withdrawal.quote({
  accountId: 'acc_123',
  amount: '50',
  cryptoCurrencyCode: 'USDT_TRC20',
  address: 'TJn22ewJPN89yNtrnBkagsunbrLnPyQCgs',
  orderId: 'withdrawal_123',
});

const withdrawal = await client.withdrawal.commit({
  quoteId: quote.quoteId,
});

console.log(withdrawal);
```

### Get a withdrawal

```ts
const withdrawal = await client.withdrawal.get({
  accountId: 'acc_123',
  id: 'wd_123',
});

console.log(withdrawal);
```

### Create a deposit

```ts
const deposit = await client.deposit.create({
  accountId: 'acc_123',
  cryptoCurrencyCode: 'USDT_TRC20',
  orderId: 'deposit_123',
  customerId: 'cust_456', // optional
});

console.log(deposit.address, deposit.qrCode);
```

### Reserve an address provision

```ts
const provision = await client.addressProvision.create({
  accountId: 'acc_123',
  cryptoCurrencyCode: 'USDT_TRC20',
  customerId: 'cust_456',
  expiresInMinutes: 60,
});

const status = await client.addressProvision.get({
  accountId: 'acc_123',
  id: provision.id,
});

console.log(status.status, status.address);
```

### Convert balances

Use `preview` to show rates in UI, then `quote` + `commit` to execute.

```ts
const preview = await client.converting.preview({
  accountId: 'acc_123',
  fromCryptoCurrencyCode: 'USDT_TRC20',
  toCryptoCurrencyCode: 'BTC',
  fromAmount: 100,
});

const quote = await client.converting.quote({
  accountId: 'acc_123',
  fromCryptoCurrencyCode: 'USDT_TRC20',
  toCryptoCurrencyCode: 'BTC',
  fromAmount: 100,
});

const result = await client.converting.commit({
  quoteId: quote.quoteId,
});

console.log(result);
```

---

## Idempotency

Invoice, deposit, and withdrawal creation are idempotent through the `orderId` field.

Use a unique `orderId` for each logical operation. If you need to retry the same request, send the same `orderId` again.

This helps prevent duplicate invoices, deposits, or withdrawals when requests are retried after timeouts or temporary failures.

### Example

```ts
await client.invoice.create({
  amount: 100,
  fiatCurrencyCode: 'USD',
  description: 'Order #123',
  orderId: 'order_123',
});
```

If the same create request is retried with the same `orderId`, Cryptonly treats it as the same logical operation.

---

## Error handling

Failed HTTP responses (`4xx` / `5xx`), network errors, and request timeouts
throw a `CryptonlyApiError`.

This error includes:

- `status` - HTTP status code (`0` for transport-level errors such as aborted
  requests and DNS failures)
- `path` - request path
- `message` - human-readable message, taken from the server when available
- `code` - stable machine-readable error code from the server, e.g.
  `exceptions.auth.invalidApiKey`,
  `exceptions.withdrawal.insufficientBalance`,
  `exceptions.rateLimit.exceeded`. Branch on this rather than `message`.
- `extension` - structured payload accompanying the error, when the server
  provided one (e.g. `{ msBeforeNext: 1234 }` for rate-limit errors)
- `requestId` - value of the `x-request-id` (or `x-correlation-id`) response
  header, when set. Include this when contacting support.
- `body` - full parsed response body

### Example

```ts
import { Cryptonly, CryptonlyApiError } from '@cryptonly/sdk';

const client = new Cryptonly({
  apiKey: process.env.CRYPTONLY_API_KEY!,
});

try {
  await client.invoice.create({
    amount: 100,
    fiatCurrencyCode: 'USD',
    description: 'Order #123',
    orderId: 'order_123',
  });
} catch (error) {
  if (error instanceof CryptonlyApiError) {
    if (error.code === 'exceptions.rateLimit.exceeded') {
      const wait = Number(error.extension?.msBeforeNext ?? 1000);
      // back off and retry
    }
    console.error('Status:', error.status);
    console.error('Code:', error.code);
    console.error('Path:', error.path);
    console.error('Request ID:', error.requestId);
    console.error('Body:', error.body);
  } else {
    console.error('Unexpected error:', error);
  }

  throw error;
}
```

---

## Recommended usage pattern

Use the SDK from your backend only.

A typical integration looks like this:

1. your frontend sends a request to your backend
2. your backend calls Cryptonly using this SDK
3. your backend stores the result and returns only the data your frontend needs

This keeps your API key secure and gives you control over validation, retries, and business logic.

---

## Security

Treat your Cryptonly API key like a password.

Recommended practices:

- store it in environment variables or a secrets manager
- never commit it to source control
- never expose it in client-side code
- rotate it if you suspect it has been compromised
- use separate keys for different environments when appropriate

If a key is exposed, revoke it immediately and issue a new one.

---

## Related documentation

For full API behavior and product-level flows, see the Cryptonly docs for:

- API authorization
- invoices
- deposits
- address provision
- withdrawals
- converting
- idempotency
- webhooks
- merchant accounts

---

## License

UNLICENSED