import type { CryptonlyContext } from '../client/context';
import { buildMerchantRequestFields } from '../http/merchant-request-options';
import { merchantRequest } from '../http/transport';
import type { CreateTenantAccountRequest, TenantAccount } from '../types/accounts';

export class AccountsClient {
  constructor(private readonly ctx: CryptonlyContext) {}

  private transportOpts() {
    return buildMerchantRequestFields(this.ctx);
  }

  private path(): string {
    return '/accounts';
  }

  /**
   * `GET /accounts` - list all merchant accounts for the tenant.
   */
  async list(): Promise<TenantAccount[]> {
    const json = await merchantRequest<{ data: TenantAccount[] }>({
      method: 'GET',
      path: this.path(),
      ...this.transportOpts(),
    });
    if (!Array.isArray(json.data)) {
      throw new TypeError('accounts.list: response missing `data`');
    }
    return json.data;
  }

  /**
   * `POST /accounts` - create a merchant account.
   */
  async create(body: CreateTenantAccountRequest): Promise<TenantAccount> {
    const json = await merchantRequest<{ data: TenantAccount }>({
      method: 'POST',
      path: this.path(),
      body,
      ...this.transportOpts(),
    });
    if (json == null || json.data == null) {
      throw new TypeError('accounts.create: response missing `data`');
    }
    return json.data;
  }
}
