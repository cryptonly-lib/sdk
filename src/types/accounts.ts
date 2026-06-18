/** `POST /accounts` JSON body. */
export interface CreateTenantAccountRequest {
  name: string;
}

/** Merchant (tenant) account. */
export interface TenantAccount {
  id: string;
  name: string;
  createdAt: string;
}

/** `POST /accounts` response: `{ data: TenantAccount }`. */
export interface TenantAccountResponse {
  data: TenantAccount;
}

/** `GET /accounts` response. */
export interface TenantAccountListResponse {
  data: TenantAccount[];
}
