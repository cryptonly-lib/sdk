import type { DepositCreateData } from './deposit';

export type AddressProvisionStatus = 'active' | 'expired' | 'closed';

/** `POST /address-provision` request body (tenant API key). */
export interface CreateAddressProvisionApiKeyRequest {
  accountId: string;
  cryptoCurrencyCode: string;
  customerId: string;
  /** 15–90, default 30 on the server */
  expiresInMinutes?: number;
  /** Overrides tenant default deposit webhook for payments under this provision. */
  webhookUrl?: string;
}

export type CreateAddressProvisionParams = CreateAddressProvisionApiKeyRequest;

/**
 * `POST /address-provision` response `data` — same fields as deposit create;
 * `id` is the address provision id.
 */
export type AddressProvisionCreateData = DepositCreateData;

/** `POST /address-provision` response wrapper. */
export interface AddressProvisionCreatedResponse {
  data: AddressProvisionCreateData;
}

/** Query for `GET /address-provision`. */
export interface GetAddressProvisionQuery {
  accountId: string;
  id: string;
}

export interface AddressProvisionGetData extends AddressProvisionCreateData {
  status: AddressProvisionStatus;
  customerId: string;
}

export interface AddressProvisionGetResponse {
  data: AddressProvisionGetData;
}
