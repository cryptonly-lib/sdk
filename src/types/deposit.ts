import type { PaginatedList, PaginationQuery } from './pagination';
import type { DepositStatus } from './status';
import type { SettlementBreakdown } from './settlement';

/** `POST /deposit` request body (tenant API key). */
export interface CreateDepositApiKeyRequest {
  accountId: string;
  cryptoCurrencyCode: string;
  orderId: string;
  customerId?: string;
  /** Overrides tenant default deposit webhook when set. */
  webhookUrl?: string;
}

/** Minimal `POST /deposit` response. */
export interface DepositCreateData {
  id: string;
  minimumAmount: number;
  address: string;
  /** ISO 8601 — when the deposit address window started. */
  createdAt: string;
  expiresAt: string;
  qrCode: string;
}

/** `POST /deposit` response wrapper. */
export interface DepositCreatedResponse {
  data: DepositCreateData;
}

/** Full merchant deposit row from GET /deposit and GET /deposit/list. */
export interface Deposit {
  id: string;
  accountId: string;
  orderId?: string;
  customerId?: string;
  status: DepositStatus;
  cryptoCurrencyCode: string;
  address?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  settlement?: SettlementBreakdown;
}

export interface DepositDataResponse {
  data: Deposit;
}

export type DepositListResponse = PaginatedList<Deposit>;

export interface GetDepositsQuery extends PaginationQuery {
  accountId: string;
  status?: DepositStatus;
}

export interface GetDepositQuery {
  accountId: string;
  id?: string;
  orderId?: string;
}

export type CreateDepositParams = CreateDepositApiKeyRequest;
