import type { PaginatedList, PaginationQuery } from './pagination';
import type { InitiationSource } from './initiation';
import type { WithdrawalStatus } from './status';

/** One withdrawal record (`GET` / `POST …/commit` `data`), matching the REST JSON shape. */
export interface Withdrawal {
  id: string;
  orderId: string;
  /** Merchant account UUID (same value as internal `tenantAccountId`). */
  accountId: string;
  cryptoCurrencyCode: string;
  address: string;
  amount: number;
  transactionHash?: string | null;
  status: WithdrawalStatus;
  /** Optional funding conversion when auto-convert was used. */
  convertId?: string | null;
  /** Real on-chain fee, denominated in `cryptoCurrencyCode` (withdrawal asset). */
  feeAmount: number;
  /** Same fee, snapshotted to USD at commit time. */
  feeAmountUsd: number;
  amountUsd: number;
  /** Exact total debited in `cryptoCurrencyCode`. */
  debitedAmount: number;
  customData?: Record<string, unknown>;
  webhookUrl?: string;
  /** Present when the API recorded an initiation channel for this withdrawal. */
  source?: InitiationSource;
  createdAt: string;
  updatedAt: string;
  /** Opaque quote id when present (equals network transfer id at commit). */
  quoteId: string | null;
  /** Network transfer id backing this withdrawal when committed. */
  transferId: string | null;
}

export interface WithdrawalDataResponse {
  data: Withdrawal;
}

export type WithdrawalListResponse = PaginatedList<Withdrawal>;

/** Query for `GET /withdrawal/list` (and optional `status` filter). */
export interface GetWithdrawalsQuery extends PaginationQuery {
  accountId: string;
  status?: WithdrawalStatus;
}

/**
 * Query for `GET /withdrawal` - a single record by `id` or `orderId` and
 * `accountId` scope.
 */
export interface GetWithdrawalQuery {
  accountId: string;
  id?: string;
  orderId?: string;
}

/**
 * `POST /withdrawal/quote` JSON body - stage 1 of the two-step flow.
 *
 * The quote does NOT reserve any balance and expires after a short TTL
 * (usually ~60s). The merchant must call `POST /withdrawal/commit`
 * with the returned `quoteId` before that.
 */
export interface WithdrawalQuoteRequest {
  /** Account ID (must belong to your tenant). */
  accountId: string;
  /** e.g. USDT_TRC20, ETH */
  cryptoCurrencyCode: string;
  /** Destination wallet address. */
  address: string;
  /** Withdrawal amount. */
  amount: number;
  /**
   * If the withdrawal-asset balance is short of amount + on-chain fee, allow
   * a virtual conversion to top it up before a normal withdrawal debit.
   */
  allowAutoConvert?: boolean;
  /**
   * Merchant idempotency key, scoped to (tenant, account). Two quote
   * calls sharing an `orderId` collapse to the same quote, and
   * `(orderId, account)` can ever back at most one committed
   * withdrawal - re-quoting after commit yields a `409`.
   */
  orderId: string;
}

/** Fee breakdown attached to a `WithdrawalQuote`. */
export interface WithdrawalQuoteFeeBreakdown {
  /** Real on-chain fee, in network base currency (ETH/TRX/BNB/BTC). */
  feeNative: number;
  /** Network base currency symbol, e.g. `ETH`. */
  feeCurrency: string;
  /** On-chain fee at quote time, in the withdrawal `cryptoCurrencyCode`. */
  feeInCryptoCurrencyCode: number;
  /** Fee snapshotted to USD at quote time. */
  feeUsd: number;
}

export interface WithdrawalAutoConvertPreview {
  fromCryptoCurrencyCode: string;
  toCryptoCurrencyCode: string;
  fromAmount: number;
  totalFromDebit: number;
  toAmount: number;
  commissionAmount: number;
}

/**
 * Response of `POST /withdrawal/quote`.
 *
 * `amount` stays in `cryptoCurrencyCode` because that is the value sent
 * on-chain. `totalDeduction` and `fee` are in `cryptoCurrencyCode`. When
 * `autoConvert` is set, its commission is in `fromCryptoCurrencyCode`.
 */
export interface WithdrawalQuote {
  /** Opaque id; submit to `POST /withdrawal/commit` to commit. */
  quoteId: string;

  /** Echo of the merchant `orderId` from the quote request. */
  orderId: string;
  /** The currency sent on-chain (echo of the request). */
  cryptoCurrencyCode: string;
  address: string;
  /** Amount sent on-chain, in `cryptoCurrencyCode`. */
  amount: number;
  autoConvert: WithdrawalAutoConvertPreview | null;
  /**
   * Total to debit in `cryptoCurrencyCode` at commit (payout + on-chain fee
   * in the withdrawal asset).
   */
  totalDeduction: number;
  fee: WithdrawalQuoteFeeBreakdown;
  /**
   * ISO timestamp after which the quote can no longer be committed.
   * Re-issue a new quote if expired.
   */
  expiresAt: string;
}

export interface WithdrawalQuoteDataResponse {
  data: WithdrawalQuote;
}

/**
 * Body for `POST /withdrawal/commit` - stage 2 of the two-step flow.
 */
export interface CommitWithdrawalRequest {
  /** Quote id from `POST /withdrawal/quote`. */
  quoteId: string;
  /** Custom metadata. */
  customData?: Record<string, unknown>;
  /** URL to receive webhook notifications. */
  webhookUrl?: string;
}
