import type { CryptonlyContext } from '../client/context';
import { buildMerchantRequestFields } from '../http/merchant-request-options';
import { merchantRequest } from '../http/transport';
import type {
  ListMerchantCurrenciesQuery,
  MerchantCurrency,
  MerchantFiatCurrency,
} from '../types/currencies';

/**
 * Read-only directory of supported crypto and fiat currencies.
 *
 * Use this client to populate UI dropdowns, prefetch network and address
 * formatting metadata, and read the **tenant-effective** deposit
 * commission for invoice/deposit math without combining system defaults
 * with your override table client-side.
 *
 * @example
 * ```ts
 * const client = new Cryptonly({ apiKey });
 * const tronAssets = await client.currencies.list({ network: 'Tron' });
 * const fiats = await client.currencies.listFiat();
 * ```
 */
export class CurrenciesClient {
  constructor(private readonly ctx: CryptonlyContext) {}

  private transportOpts() {
    return buildMerchantRequestFields(this.ctx);
  }

  /**
   * `GET /currencies` - list every supported crypto currency, optionally
   * filtered by `network`. The returned `depositCommission` is the
   * tenant-wide effective rate (identical on every row).
   */
  async list(
    query?: ListMerchantCurrenciesQuery,
  ): Promise<MerchantCurrency[]> {
    const json = await merchantRequest<{ data: unknown[] }>({
      method: 'GET',
      path: '/currencies',
      query: query?.network ? { network: query.network } : undefined,
      ...this.transportOpts(),
    });
    if (!Array.isArray(json?.data)) {
      throw new TypeError('currencies.list: response missing `data` array');
    }
    return json.data as MerchantCurrency[];
  }

  /**
   * `GET /currencies/fiat` - list every fiat currency that can be passed
   * as `fiatCurrencyCode` on `POST /invoice`.
   */
  async listFiat(): Promise<MerchantFiatCurrency[]> {
    const json = await merchantRequest<{ data: unknown[] }>({
      method: 'GET',
      path: '/currencies/fiat',
      ...this.transportOpts(),
    });
    if (!Array.isArray(json?.data)) {
      throw new TypeError('currencies.listFiat: response missing `data` array');
    }
    return json.data as MerchantFiatCurrency[];
  }
}
