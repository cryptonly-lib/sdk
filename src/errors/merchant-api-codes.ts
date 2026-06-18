/**
 * Stable `CryptonlyApiError.code` values returned by the merchant HTTP API
 * (`exceptions.<domain>.<reason>`). Prefer comparing `err.code` to these
 * constants instead of parsing `err.message`.
 */
export const CRYPTONLY_EXCEPTION_PREFIX = 'exceptions' as const;

/** Auth / API key */
export const CRYPTONLY_EXCEPTION_AUTH_INVALID_API_KEY =
  'exceptions.auth.invalidApiKey' as const;

/** Invoice */
export const CRYPTONLY_EXCEPTION_INVOICE_FIAT_CURRENCY_NOT_FOUND =
  'exceptions.invoice.fiatCurrencyNotFound' as const;
export const CRYPTONLY_EXCEPTION_INVOICE_AMOUNT_OR_ITEMS_REQUIRED =
  'exceptions.invoice.amountOrItemsRequired' as const;
export const CRYPTONLY_EXCEPTION_INVOICE_AMOUNT_BELOW_MINIMUM =
  'exceptions.invoice.amountBelowMinimum' as const;
export const CRYPTONLY_EXCEPTION_INVOICE_AMOUNT_INVALID_DECIMAL_PLACES =
  'exceptions.invoice.amountInvalidDecimalPlaces' as const;
export const CRYPTONLY_EXCEPTION_INVOICE_ORDER_ID_ALREADY_EXISTS =
  'exceptions.invoice.orderIdAlreadyExists' as const;
export const CRYPTONLY_EXCEPTION_INVOICE_TENANT_NOT_FOUND =
  'exceptions.invoice.tenantNotFound' as const;
export const CRYPTONLY_EXCEPTION_INVOICE_CUSTOMER_BLOCKED =
  'exceptions.invoice.customerBlocked' as const;
export const CRYPTONLY_EXCEPTION_INVOICE_NOT_FOUND =
  'exceptions.invoice.notFound' as const;
export const CRYPTONLY_EXCEPTION_INVOICE_NOT_FOUND_BY_ORDER_ID =
  'exceptions.invoice.notFoundByOrderId' as const;
export const CRYPTONLY_EXCEPTION_INVOICE_NOT_AVAILABLE_FOR_PREVIEW =
  'exceptions.invoice.notAvailableForPreview' as const;
export const CRYPTONLY_EXCEPTION_INVOICE_CURRENCY_NOT_FOUND =
  'exceptions.invoice.currencyNotFound' as const;
export const CRYPTONLY_EXCEPTION_INVOICE_NOT_IN_CREATED_STATUS =
  'exceptions.invoice.notInCreatedStatus' as const;
export const CRYPTONLY_EXCEPTION_INVOICE_EXPIRED =
  'exceptions.invoice.expired' as const;
export const CRYPTONLY_EXCEPTION_INVOICE_DEPOSIT_CONFLICT =
  'exceptions.invoice.depositConflict' as const;
export const CRYPTONLY_EXCEPTION_INVOICE_NOT_IN_DEPOSIT_PENDING_STATUS =
  'exceptions.invoice.notInDepositPendingStatus' as const;
export const CRYPTONLY_EXCEPTION_INVOICE_CANNOT_CANCEL =
  'exceptions.invoice.cannotCancel' as const;

/** Withdrawal */
export const CRYPTONLY_EXCEPTION_WITHDRAWAL_AMOUNT_MUST_BE_POSITIVE =
  'exceptions.withdrawal.amountMustBePositive' as const;
export const CRYPTONLY_EXCEPTION_WITHDRAWAL_TENANT_ACCOUNT_NOT_FOUND =
  'exceptions.withdrawal.tenantAccountNotFound' as const;
export const CRYPTONLY_EXCEPTION_WITHDRAWAL_CURRENCY_NOT_FOUND =
  'exceptions.withdrawal.currencyNotFound' as const;
export const CRYPTONLY_EXCEPTION_WITHDRAWAL_INVALID_ADDRESS =
  'exceptions.withdrawal.invalidAddress' as const;
export const CRYPTONLY_EXCEPTION_WITHDRAWAL_AMOUNT_BELOW_MINIMUM =
  'exceptions.withdrawal.amountBelowMinimum' as const;
export const CRYPTONLY_EXCEPTION_WITHDRAWAL_AMOUNT_INVALID_DECIMAL_PLACES =
  'exceptions.withdrawal.amountInvalidDecimalPlaces' as const;
export const CRYPTONLY_EXCEPTION_WITHDRAWAL_QUOTE_KIND_MISMATCH =
  'exceptions.withdrawal.quoteKindMismatch' as const;
export const CRYPTONLY_EXCEPTION_WITHDRAWAL_TENANT_ACCOUNT_MISMATCH =
  'exceptions.withdrawal.tenantAccountMismatch' as const;
export const CRYPTONLY_EXCEPTION_WITHDRAWAL_TENANT_NOT_FOUND =
  'exceptions.withdrawal.tenantNotFound' as const;
export const CRYPTONLY_EXCEPTION_WITHDRAWAL_QUOTE_DECISION_MISSING =
  'exceptions.withdrawal.quoteDecisionMissing' as const;
export const CRYPTONLY_EXCEPTION_WITHDRAWAL_ORDER_ID_ALREADY_EXISTS =
  'exceptions.withdrawal.orderIdAlreadyExists' as const;
export const CRYPTONLY_EXCEPTION_WITHDRAWAL_LOCKED_BALANCE_MISSING =
  'exceptions.withdrawal.lockedBalanceMissing' as const;
export const CRYPTONLY_EXCEPTION_WITHDRAWAL_INSUFFICIENT_BALANCE =
  'exceptions.withdrawal.insufficientBalance' as const;
export const CRYPTONLY_EXCEPTION_WITHDRAWAL_MALFORMED_QUOTE =
  'exceptions.withdrawal.malformedQuote' as const;
export const CRYPTONLY_EXCEPTION_WITHDRAWAL_EITHER_ID_OR_ORDER_ID =
  'exceptions.withdrawal.eitherWithdrawalIdOrOrderIdMustBeProvided' as const;
export const CRYPTONLY_EXCEPTION_WITHDRAWAL_NOT_FOUND =
  'exceptions.withdrawal.notFound' as const;

/** Virtual balance conversion */
export const CRYPTONLY_EXCEPTION_CONVERTING_AMOUNT_MUST_BE_POSITIVE =
  'exceptions.converting.amountMustBePositive' as const;
export const CRYPTONLY_EXCEPTION_CONVERTING_SAME_CURRENCY =
  'exceptions.converting.sameCurrency' as const;
export const CRYPTONLY_EXCEPTION_CONVERTING_CURRENCY_NOT_FOUND =
  'exceptions.converting.currencyNotFound' as const;
export const CRYPTONLY_EXCEPTION_CONVERTING_QUOTE_NOT_FOUND =
  'exceptions.converting.quoteNotFound' as const;
export const CRYPTONLY_EXCEPTION_CONVERTING_QUOTE_NOT_QUOTED =
  'exceptions.converting.quoteNotQuoted' as const;
export const CRYPTONLY_EXCEPTION_CONVERTING_QUOTE_EXPIRED =
  'exceptions.converting.quoteExpired' as const;
export const CRYPTONLY_EXCEPTION_CONVERTING_BALANCE_NOT_FOUND =
  'exceptions.converting.balanceNotFound' as const;
export const CRYPTONLY_EXCEPTION_CONVERTING_AMOUNT_SPECIFICATION_INVALID =
  'exceptions.converting.amountSpecificationInvalid' as const;
export const CRYPTONLY_EXCEPTION_CONVERTING_AMOUNT_INVALID_DECIMAL_PLACES =
  'exceptions.converting.amountInvalidDecimalPlaces' as const;
export const CRYPTONLY_EXCEPTION_CONVERTING_INSUFFICIENT_BALANCE =
  'exceptions.converting.insufficientBalance' as const;
