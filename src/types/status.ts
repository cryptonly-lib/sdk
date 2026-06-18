/** Documented invoice lifecycle on the server. */
export const InvoiceStatus = {
  CREATED: 'created',
  DEPOSIT_PENDING: 'deposit_pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  PARTIALLY_PAID: 'partially_paid',
  OVERPAID: 'overpaid',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
  SUSPENDED: 'suspended',
} as const;

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export function isInvoicePaymentSettled(status: InvoiceStatus): boolean {
  return (
    status === InvoiceStatus.PAID ||
    status === InvoiceStatus.PARTIALLY_PAID ||
    status === InvoiceStatus.OVERPAID
  );
}

/** Documented deposit lifecycle on the server (snake_case wire values). */
export const DepositStatus = {
  CREATED: 'created',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  SUSPENDED: 'suspended',
  FAILED: 'failed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

export type DepositStatus = (typeof DepositStatus)[keyof typeof DepositStatus];

/** Documented withdrawal lifecycle on the server (snake_case wire values). */
export const WithdrawalStatus = {
  CREATED: 'created',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type WithdrawalStatus = (typeof WithdrawalStatus)[keyof typeof WithdrawalStatus];
