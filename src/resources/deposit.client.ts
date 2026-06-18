import type { CryptonlyContext } from '../client/context';
import { assertDepositLookupQuery } from '../helpers/merchant-query';
import { buildMerchantRequestFields } from '../http/merchant-request-options';
import { merchantRequest } from '../http/transport';
import type {
  CreateDepositParams,
  Deposit,
  DepositCreateData,
  DepositCreatedResponse,
  DepositDataResponse,
  DepositListResponse,
  GetDepositQuery,
  GetDepositsQuery,
} from '../types/deposit';

export class DepositClient {
  constructor(private readonly ctx: CryptonlyContext) {}

  private transportOpts() {
    return buildMerchantRequestFields(this.ctx);
  }

  private route(suffix: string): string {
    return `/deposit${suffix}`;
  }

  /** `POST /deposit` - create a crypto top-up address. */
  async create(params: CreateDepositParams): Promise<DepositCreateData> {
    const json = await merchantRequest<DepositCreatedResponse>({
      method: 'POST',
      path: this.route(''),
      body: params,
      ...this.transportOpts(),
    });
    if (!json?.data) {
      throw new TypeError('deposit.create: response missing `data`');
    }
    return json.data;
  }

  /** `GET /deposit/list` - paginated merchant top-up deposits. */
  async list(q: GetDepositsQuery): Promise<DepositListResponse> {
    const { accountId, status, page, limit } = q;
    const json = await merchantRequest<DepositListResponse>({
      method: 'GET',
      path: this.route('/list'),
      query: { accountId, status, page, limit },
      ...this.transportOpts(),
    });
    if (json == null || !Array.isArray(json.data)) {
      throw new TypeError('deposit.list: response missing `data` array');
    }
    return json;
  }

  /** `GET /deposit` - single deposit by `id` or `orderId`. */
  async get(q: GetDepositQuery): Promise<Deposit> {
    assertDepositLookupQuery(q, 'deposit.get');
    const { accountId, id, orderId } = q;
    const json = await merchantRequest<DepositDataResponse>({
      method: 'GET',
      path: this.route(''),
      query: { accountId, id, orderId },
      ...this.transportOpts(),
    });
    if (!json?.data) {
      throw new TypeError('deposit.get: response missing `data`');
    }
    return json.data;
  }
}
