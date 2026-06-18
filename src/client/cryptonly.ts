import { MERCHANT_API_BASE_URL, SANDBOX_MERCHANT_API_BASE_URL } from '../config/constants';
import { AccountsClient } from '../resources/accounts.client';
import { CurrenciesClient } from '../resources/currencies.client';
import { AddressProvisionClient } from '../resources/address-provision.client';
import { DepositClient } from '../resources/deposit.client';
import { InvoiceClient } from '../resources/invoice.client';
import { WithdrawalClient } from '../resources/withdrawal.client';
import { ConvertingClient } from '../resources/converting.client';
import { trimBaseUrl } from '../http/transport';
import type { CryptonlyContext } from './context';

export type CryptonlyConfig = {
  /**
   * Tenant API key (same as the `x-tenant-api-key` header for the merchant
   * HTTP API).
   */
  apiKey: string;
  /**
   * Override the API origin (no trailing slash). Useful for staging,
   * self-hosted deployments, and integration tests. Defaults to
   * {@link MERCHANT_API_BASE_URL}.
   *
   * Takes precedence over {@link sandbox}.
   *
   * @example
   * ```ts
   * new Cryptonly({
   *   apiKey,
   *   baseUrl: 'https://api.staging.merchant.cryptonly.net',
   * });
   * ```
   */
  baseUrl?: string;
  /**
   * When `true`, points the client at {@link SANDBOX_MERCHANT_API_BASE_URL}
   * instead of the production API. Ignored when {@link baseUrl} is set explicitly.
   *
   * @example
   * ```ts
   * const client = new Cryptonly({ apiKey, sandbox: true });
   * ```
   */
  sandbox?: boolean;
  /**
   * Request timeout in ms.
   * @default 60_000
   */
  timeout?: number;
  /**
   * Custom `fetch` (test doubles, older Node, etc.). Defaults to `globalThis.fetch`.
   */
  fetch?: typeof fetch;
};

/**
 * Client for the Cryptonly **merchant** HTTP API: send your API key in the
 * `x-tenant-api-key` header and call the public paths (for example `/invoice`).
 *
 * @example
 * ```ts
 * const client = new Cryptonly({
 *   apiKey: process.env.CRYPTONLY_API_KEY!,
 * });
 * const inv = await client.invoice.create({
 *   accountId: process.env.CRYPTONLY_ACCOUNT_ID!,
 *   amount: 100,
 *   fiatCurrencyCode: 'USD',
 *   description: 'Order #123',
 *   orderId: 'order_123',
 * });
 * ```
 */
export class Cryptonly {
  private readonly _ctx: CryptonlyContext;

  /**
   * Create and list crypto top-up deposits (merchant API).
   */
  readonly deposit: DepositClient;

  /**
   * Reserve reusable pool addresses for repeated customer top-ups.
   */
  readonly addressProvision: AddressProvisionClient;

  /**
   * Create and list invoices, cancel pending invoices.
   */
  readonly invoice: InvoiceClient;

  /**
   * Create and list withdrawals, fetch by id or `orderId`.
   */
  readonly withdrawal: WithdrawalClient;

  /**
   * List and create merchant (tenant) accounts.
   */
  readonly accounts: AccountsClient;

  /**
   * Read-only directory of supported crypto and fiat currencies, with
   * tenant-effective deposit commission already applied.
   */
  readonly currencies: CurrenciesClient;

  /**
   * Virtual balance conversion between currencies (no on-chain transfer).
   */
  readonly converting: ConvertingClient;

  constructor(config: CryptonlyConfig) {
    if (!config?.apiKey) {
      throw new TypeError('Cryptonly: `apiKey` is required');
    }
    const fetchImpl =
      config.fetch ??
      (typeof globalThis.fetch === 'function'
        ? globalThis.fetch.bind(globalThis)
        : undefined);
    if (typeof fetchImpl !== 'function') {
      throw new TypeError(
        'Cryptonly: `fetch` is not available. Use Node 18+ or pass `fetch` in the config.',
      );
    }
    // Priority: explicit baseUrl > sandbox flag > production default
    const rawBaseUrl =
      typeof config.baseUrl === 'string' && config.baseUrl.length > 0
        ? config.baseUrl
        : config.sandbox
          ? SANDBOX_MERCHANT_API_BASE_URL
          : MERCHANT_API_BASE_URL;
    this._ctx = {
      baseUrl: trimBaseUrl(rawBaseUrl),
      apiKey: config.apiKey,
      timeout: config.timeout ?? 60_000,
      fetchImpl,
    };
    this.deposit = new DepositClient(this._ctx);
    this.addressProvision = new AddressProvisionClient(this._ctx);
    this.invoice = new InvoiceClient(this._ctx);
    this.withdrawal = new WithdrawalClient(this._ctx);
    this.accounts = new AccountsClient(this._ctx);
    this.currencies = new CurrenciesClient(this._ctx);
    this.converting = new ConvertingClient(this._ctx);
  }
}
