import type { GetDepositQuery } from '../types/deposit';
import type { GetInvoiceQuery } from '../types/invoice';
import type { GetWithdrawalQuery } from '../types/withdrawal';

function missingAccountId(kind: string): TypeError {
  return new TypeError(`${kind}: \`accountId\` is required.`);
}

function missingInvoiceSelector(kind: string): TypeError {
  return new TypeError(
    `${kind}: supply \`id\` or \`orderId\` (the API prefers \`id\` when both are set).`,
  );
}

function missingWithdrawalSelector(kind: string): TypeError {
  return new TypeError(`${kind}: supply \`id\` or \`orderId\`.`);
}

/** Validates query for {@link DepositClient.get}. */
export function assertDepositLookupQuery(
  q: GetDepositQuery,
  methodLabel: 'deposit.get',
): void {
  if (!q.accountId?.trim()) {
    throw missingAccountId(methodLabel);
  }
  if (!q.id?.trim() && !q.orderId?.trim()) {
    throw new TypeError(
      `${methodLabel}: supply \`id\` or \`orderId\` (the API prefers \`id\` when both are set).`,
    );
  }
}

/** Validates query for {@link InvoiceClient.get} and {@link InvoiceClient.cancel}. */
export function assertInvoiceLookupQuery(
  q: GetInvoiceQuery,
  methodLabel: 'invoice.get' | 'invoice.cancel',
): void {
  if (!q.accountId?.trim()) {
    throw missingAccountId(methodLabel);
  }
  if (!q.id?.trim() && !q.orderId?.trim()) {
    throw missingInvoiceSelector(methodLabel);
  }
}

/** Validates query for {@link WithdrawalClient.get}. */
export function assertWithdrawalLookupQuery(q: GetWithdrawalQuery): void {
  if (!q.accountId?.trim()) {
    throw missingAccountId('withdrawal.get');
  }
  if (!q.id?.trim() && !q.orderId?.trim()) {
    throw missingWithdrawalSelector('withdrawal.get');
  }
}
