import { newSdkOrderId } from './util-id';
import type { CreateInvoiceApiKeyRequest, CreateInvoiceParams } from '../types/invoice';

/**
 * Builds the wire JSON body for `POST /invoice`. Fills `orderId` when missing
 * and ensures `accountId` / `fiatCurrencyCode` for the request.
 */
export function finalizeInvoiceCreateBody(
  params: CreateInvoiceParams,
): CreateInvoiceApiKeyRequest {
  const { ...rest } = params;
  const accountId = rest.accountId;
  if (!accountId) {
    throw new TypeError('invoice.create: `accountId` is required.');
  }
  const fiat = rest.fiatCurrencyCode;
  if (!fiat) {
    throw new TypeError('invoice.create: set `fiatCurrencyCode` (e.g. "USD").');
  }
  const orderId = rest.orderId ?? newSdkOrderId();
  return {
    ...rest,
    accountId,
    orderId,
    fiatCurrencyCode: fiat,
  };
}
