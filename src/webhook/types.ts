import type { Deposit } from '../types/deposit';
import type { Invoice } from '../types/invoice';
import type { InitiationSource } from '../types/initiation';
import type { DepositStatus, InvoiceStatus, WithdrawalStatus } from '../types/status';
import {
  CRYPTONLY_WEBHOOK_EVENT_DEPOSIT_STATUS_CHANGED,
  CRYPTONLY_WEBHOOK_EVENT_INVOICE_STATUS_CHANGED,
  CRYPTONLY_WEBHOOK_EVENT_WITHDRAWAL_STATUS_CHANGED,
} from './constants';

type CryptonlyWebhookEvent =
  | typeof CRYPTONLY_WEBHOOK_EVENT_INVOICE_STATUS_CHANGED
  | typeof CRYPTONLY_WEBHOOK_EVENT_WITHDRAWAL_STATUS_CHANGED
  | typeof CRYPTONLY_WEBHOOK_EVENT_DEPOSIT_STATUS_CHANGED;

/**
 * JSON body Cryptonly POSTs to merchant `webhookUrl` (UTF-8, same string that is HMAC-signed).
 * Field order when built by the API is always `event`, `data`, `timestamp`.
 */
export interface CryptonlyOutboundWebhookBody<TData = unknown> {
  event: CryptonlyWebhookEvent;
  data: TData;
  /** ISO 8601 string from `new Date().toISOString()`. */
  timestamp: string;
}

/** `data` for {@link CRYPTONLY_WEBHOOK_EVENT_INVOICE_STATUS_CHANGED}. */
export interface InvoiceStatusChangedWebhookData extends Invoice {
  /** Status immediately before this transition. */
  previousStatus?: InvoiceStatus;
}

/**
 * Withdrawal snapshot aligned with merchant GET withdrawal (`WithdrawalDto`),
 * except `tenantAccountId` is sent as `accountId`.
 * Date fields are ISO strings on the wire.
 */
export interface WithdrawalMerchantWebhookSnapshot {
  id: string;
  orderId: string;
  /** Merchant-scoped account UUID (same value as `tenantAccountId` on GET withdrawal). */
  accountId: string;
  cryptoCurrencyCode: string;
  address: string;
  amount: number;
  transactionHash?: string | null;
  status: WithdrawalStatus;
  /** Optional funding conversion for auto-convert. */
  convertId: string | null;
  feeAmount: number;
  feeAmountUsd: number;
  amountUsd: number;
  debitedAmount: number;
  customData?: Record<string, unknown>;
  webhookUrl?: string;
  source?: InitiationSource;
  createdAt: string;
  updatedAt: string;
  quoteId: string | null;
  transferId: string | null;
}

/** `data` for {@link CRYPTONLY_WEBHOOK_EVENT_WITHDRAWAL_STATUS_CHANGED}. */
export interface WithdrawalStatusChangedWebhookData extends WithdrawalMerchantWebhookSnapshot {
  /** Status immediately before this transition. */
  previousStatus?: WithdrawalStatus;
}

export type CryptonlyInvoiceStatusChangedWebhookBody =
  CryptonlyOutboundWebhookBody<InvoiceStatusChangedWebhookData> & {
    event: typeof CRYPTONLY_WEBHOOK_EVENT_INVOICE_STATUS_CHANGED;
  };

export type CryptonlyWithdrawalStatusChangedWebhookBody =
  CryptonlyOutboundWebhookBody<WithdrawalStatusChangedWebhookData> & {
    event: typeof CRYPTONLY_WEBHOOK_EVENT_WITHDRAWAL_STATUS_CHANGED;
  };

/** `data` for {@link CRYPTONLY_WEBHOOK_EVENT_DEPOSIT_STATUS_CHANGED}. */
export interface DepositStatusChangedWebhookData extends Deposit {
  /** Status immediately before this transition. */
  previousStatus?: DepositStatus;
  /** Present when this deposit is a payment under an address provision. */
  addressProvisionId?: string;
  depositTransactionHash?: string | null;
  actuallyReceivedAmount?: number | null;
  actuallyReceivedAmountUsd?: number | null;
}

export type CryptonlyDepositStatusChangedWebhookBody =
  CryptonlyOutboundWebhookBody<DepositStatusChangedWebhookData> & {
    event: typeof CRYPTONLY_WEBHOOK_EVENT_DEPOSIT_STATUS_CHANGED;
  };
