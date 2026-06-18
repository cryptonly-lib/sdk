/** `event` field on outbound Cryptonly webhooks when an invoice status changes (e.g. paid). */
export const CRYPTONLY_WEBHOOK_EVENT_INVOICE_STATUS_CHANGED =
  'invoice.statusChanged' as const;

/** `event` field on outbound Cryptonly webhooks when a withdrawal reaches a terminal status. */
export const CRYPTONLY_WEBHOOK_EVENT_WITHDRAWAL_STATUS_CHANGED =
  'withdrawal.statusChanged' as const;

/** `event` field on outbound Cryptonly webhooks when a merchant deposit status changes. */
export const CRYPTONLY_WEBHOOK_EVENT_DEPOSIT_STATUS_CHANGED =
  'deposit.statusChanged' as const;
