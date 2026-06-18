import type { CryptonlyContext } from '../client/context';
import { finalizeInvoiceCreateBody } from '../helpers/invoice-create-body';
import { assertInvoiceLookupQuery } from '../helpers/merchant-query';
import { buildMerchantRequestFields } from '../http/merchant-request-options';
import { merchantRequest } from '../http/transport';
import type {
  CreateInvoiceParams,
  GetInvoiceQuery,
  GetInvoicesQuery,
  Invoice,
  InvoiceCreateData,
  InvoiceDataResponse,
  InvoiceListResponse,
} from '../types/invoice';

export class InvoiceClient {
  constructor(private readonly ctx: CryptonlyContext) {}

  private transportOpts() {
    return buildMerchantRequestFields(this.ctx);
  }

  private route(suffix: string): string {
    return `/invoice${suffix}`;
  }

  /**
   * `POST /invoice` - create an invoice. Returns the inner
   * `data` (hosted payment page URL, ids, status).
   */
  async create(params: CreateInvoiceParams): Promise<InvoiceCreateData> {
    const body = finalizeInvoiceCreateBody(params);
    const json = await merchantRequest<{ data: InvoiceCreateData }>({
      method: 'POST',
      path: this.route(''),
      body,
      ...this.transportOpts(),
    });
    if (!json?.data) {
      throw new TypeError('invoice.create: response missing `data`');
    }
    return json.data;
  }

  /**
   * `GET /invoice/list` - paginated list for a merchant
   * account. Timestamps are ISO strings as in the API response.
   */
  async list(q: GetInvoicesQuery): Promise<InvoiceListResponse> {
    const { accountId, status, page, limit } = q;
    const json = await merchantRequest<InvoiceListResponse>({
      method: 'GET',
      path: this.route('/list'),
      query: { accountId, status, page, limit },
      ...this.transportOpts(),
    });
    if (json == null || !Array.isArray(json.data)) {
      throw new TypeError('invoice.list: response missing `data` array');
    }
    return json;
  }

  /**
   * `GET /invoice` - a single invoice by `id` or `orderId`.
   */
  async get(q: GetInvoiceQuery): Promise<Invoice> {
    assertInvoiceLookupQuery(q, 'invoice.get');
    const { accountId, id, orderId } = q;
    const json = await merchantRequest<InvoiceDataResponse>({
      method: 'GET',
      path: this.route(''),
      query: { accountId, id, orderId },
      ...this.transportOpts(),
    });
    if (!json?.data) {
      throw new TypeError('invoice.get: response missing `data`');
    }
    return json.data;
  }

  /**
   * `POST /invoice/cancel` - cancels a pending invoice.
   */
  async cancel(q: GetInvoiceQuery): Promise<void> {
    assertInvoiceLookupQuery(q, 'invoice.cancel');
    const { accountId, id, orderId } = q;
    await merchantRequest({
      method: 'POST',
      path: this.route('/cancel'),
      query: { accountId, id, orderId },
      emptyResponse: true,
      ...this.transportOpts(),
    });
  }
}