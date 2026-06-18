import type { CryptonlyContext } from '../client/context';
import { buildMerchantRequestFields } from '../http/merchant-request-options';
import { merchantRequest } from '../http/transport';
import type {
  AddressProvisionCreateData,
  AddressProvisionCreatedResponse,
  AddressProvisionGetData,
  AddressProvisionGetResponse,
  CreateAddressProvisionParams,
  GetAddressProvisionQuery,
} from '../types/address-provision';

export class AddressProvisionClient {
  constructor(private readonly ctx: CryptonlyContext) {}

  private transportOpts() {
    return buildMerchantRequestFields(this.ctx);
  }

  private route(suffix: string): string {
    return `/address-provision${suffix}`;
  }

  /** `POST /address-provision` - reserve a reusable pool address. */
  async create(
    params: CreateAddressProvisionParams,
  ): Promise<AddressProvisionCreateData> {
    const json = await merchantRequest<AddressProvisionCreatedResponse>({
      method: 'POST',
      path: this.route(''),
      body: params,
      ...this.transportOpts(),
    });
    if (!json?.data) {
      throw new TypeError('addressProvision.create: response missing `data`');
    }
    return json.data;
  }

  /** `GET /address-provision` - fetch one provision by id. */
  async get(q: GetAddressProvisionQuery): Promise<AddressProvisionGetData> {
    const { accountId, id } = q;
    const json = await merchantRequest<AddressProvisionGetResponse>({
      method: 'GET',
      path: this.route(''),
      query: { accountId, id },
      ...this.transportOpts(),
    });
    if (!json?.data) {
      throw new TypeError('addressProvision.get: response missing `data`');
    }
    return json.data;
  }
}
