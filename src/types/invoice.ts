import type { PaginatedList, PaginationQuery } from './pagination';
import type { InitiationSource } from './initiation';
import type { InvoiceStatus } from './status';
import type { SettlementBreakdown } from './settlement';

/** One line on an invoice (name, quantity, unit cost). */
export interface InvoiceItem {
  name: string;
  quantity: number;
  cost: number;
}

/**
 * `POST /invoice` wire JSON. Matches the merchant create-invoice DTO: `orderId` and
 * `fiatCurrencyCode` are required in the request body.
 */
export interface CreateInvoiceApiKeyRequest {
  accountId: string;
  amount?: number;
  items?: InvoiceItem[];
  fiatCurrencyCode: string;
  orderId: string;
  description?: string;
  /** Optional reference shown to the customer on the payment page. */
  number?: string;
  webhookUrl?: string;
  returnUrl?: string;
  expiresInMinutes?: number;
  customerId?: string;
  customPayload?: string;
}

/**
 * Parameters for `new Cryptonly(...).invoice.create(...)`. Looser than the wire body:
 * `accountId` is required; `orderId` is optional
 * and the client generates one when omitted (not idempotent for retries - pass
 * your own for idempotency). Pass `amount` or `items` per the server rules.
 */
export type CreateInvoiceParams = Partial<CreateInvoiceApiKeyRequest>;

/**
 * Payload in `data` for a successful `POST /invoice` (create) response, including
 * the hosted payment page URL (ISO timestamps as returned by JSON).
 */
export interface InvoiceCreateData extends Invoice {
  paymentPageUrl: string;
}

/** `POST /invoice` response: `{ data: … }` after create. */
export interface InvoiceCreatedResponse {
  data: InvoiceCreateData;
}

/**
 * Full invoice as returned on merchant `GET /invoice` and `GET /invoice/list`
 * (`x-tenant-api-key`). Omits internal `tenantId` and customer notification email.
 */
export interface Invoice {
  id: string;
  accountId: string;
  orderId?: string;
  amount: number;
  fiatCurrencyCode: string;
  items: InvoiceItem[];
  status: InvoiceStatus;
  /** Populated after payer locks crypto. */
  cryptoCurrencyCode?: string;
  cryptoAmountExpected?: number;
  cryptoAmountReceived?: number;
  address?: string;
  txHash?: string;
  settlement?: SettlementBreakdown;
  description?: string;
  /** Optional reference for the customer on the payment page, when set at creation. */
  number?: string;
  webhookUrl?: string;
  /** Post-payment return URL from invoice creation, when provided. */
  returnUrl?: string;
  expiresAt: string;
  createdAt: string;
  paidAt?: string;
  /** Echo of `customerId` from creation when stored. */
  customerId?: string;
  /** Echo of `customPayload` from creation when stored. */
  customPayload?: string;
  /** Hosted payment page URL; present on create, GET, list, and webhooks. */
  paymentPageUrl: string;
  /** Present when the API recorded an initiation channel for this invoice. */
  source?: InitiationSource;
}

/** `GET /invoice` response wrapper: `{ data: Invoice }`. */
export interface InvoiceDataResponse {
  data: Invoice;
}

/** `GET /invoice/list` response. */
export type InvoiceListResponse = PaginatedList<Invoice>;

/** Query for `GET /invoice/list` (and optional `status` filter). */
export interface GetInvoicesQuery extends PaginationQuery {
  accountId: string;
  status?: InvoiceStatus;
}

/**
 * Query for `GET /invoice` or `POST /invoice/cancel` - which invoice is
 * selected by `id` and/or `orderId` (plus `accountId` scope).
 */
export interface GetInvoiceQuery {
  accountId: string;
  id?: string;
  orderId?: string;
}
