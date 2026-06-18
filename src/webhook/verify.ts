import { createHmac, timingSafeEqual } from 'crypto';
import {
  CRYPTONLY_WEBHOOK_EVENT_DEPOSIT_STATUS_CHANGED,
  CRYPTONLY_WEBHOOK_EVENT_INVOICE_STATUS_CHANGED,
  CRYPTONLY_WEBHOOK_EVENT_WITHDRAWAL_STATUS_CHANGED,
} from './constants';
import type {
  CryptonlyDepositStatusChangedWebhookBody,
  CryptonlyInvoiceStatusChangedWebhookBody,
  CryptonlyWithdrawalStatusChangedWebhookBody,
} from './types';

/** Why webhook verify helpers returned `ok: false`. */
export type CryptonlyWebhookVerifyFailureReason =
  | 'missing_signature'
  | 'invalid_signature'
  | 'invalid_json'
  | 'wrong_event';

export type CryptonlyInvoiceWebhookVerification =
  | { ok: true; envelope: CryptonlyInvoiceStatusChangedWebhookBody }
  | { ok: false; reason: CryptonlyWebhookVerifyFailureReason };

export type CryptonlyWithdrawalWebhookVerification =
  | { ok: true; envelope: CryptonlyWithdrawalStatusChangedWebhookBody }
  | { ok: false; reason: CryptonlyWebhookVerifyFailureReason };

export type CryptonlyDepositWebhookVerification =
  | { ok: true; envelope: CryptonlyDepositStatusChangedWebhookBody }
  | { ok: false; reason: CryptonlyWebhookVerifyFailureReason };

/** Exact webhook POST body as UTF-8 (string) or raw bytes (e.g. Express `req.body` before parsing). */
export type WebhookVerificationRawBody = string | Buffer;

function bodyBufferForHmac(rawBody: WebhookVerificationRawBody): Buffer {
  return Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8');
}

function bodyUtf8ForJson(rawBody: WebhookVerificationRawBody): string {
  return Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
}

function constantTimeHexEqual(expectedHex: string, receivedHex: string): boolean {
  const a = expectedHex.toLowerCase();
  const b = receivedHex.toLowerCase();
  if (a.length !== b.length || a.length % 2 !== 0) {
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

function verifyHmacSha256HexSignature(
  rawBody: WebhookVerificationRawBody,
  signatureHeader: string | null | undefined,
  secret: string,
): boolean {
  if (signatureHeader == null || String(signatureHeader).trim() === '') {
    return false;
  }
  const expected = createHmac('sha256', secret)
    .update(bodyBufferForHmac(rawBody))
    .digest('hex');
  return constantTimeHexEqual(expected, String(signatureHeader).trim());
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Verifies `x-webhook-signature` (hex HMAC-SHA256 over the exact raw body bytes) and
 * checks `event` is {@link CRYPTONLY_WEBHOOK_EVENT_INVOICE_STATUS_CHANGED}.
 *
 * @param rawBody Exact request body (same bytes Cryptonly signed - UTF-8 string or raw buffer; do not re-serialize JSON).
 * @param signatureHeader Value of the `x-webhook-signature` header.
 * @param secret Tenant signing key (64-char hex string from rotate flow).
 */
export function verifyInvoiceWebhook(
  rawBody: WebhookVerificationRawBody,
  signatureHeader: string | null | undefined,
  secret: string,
): CryptonlyInvoiceWebhookVerification {
  if (!verifyHmacSha256HexSignature(rawBody, signatureHeader, secret)) {
    return {
      ok: false,
      reason:
        signatureHeader == null || String(signatureHeader).trim() === ''
          ? 'missing_signature'
          : 'invalid_signature',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyUtf8ForJson(rawBody)) as unknown;
  } catch {
    return { ok: false, reason: 'invalid_json' };
  }

  if (!isRecord(parsed)) {
    return { ok: false, reason: 'invalid_json' };
  }

  if (parsed.event !== CRYPTONLY_WEBHOOK_EVENT_INVOICE_STATUS_CHANGED) {
    return { ok: false, reason: 'wrong_event' };
  }

  return {
    ok: true,
    envelope: parsed as unknown as CryptonlyInvoiceStatusChangedWebhookBody,
  };
}

/**
 * Verifies `x-webhook-signature` and checks `event` is
 * {@link CRYPTONLY_WEBHOOK_EVENT_WITHDRAWAL_STATUS_CHANGED}.
 *
 * @param rawBody Exact request body (same bytes Cryptonly signed - UTF-8 string or raw buffer).
 * @param signatureHeader Value of the `x-webhook-signature` header.
 * @param secret Tenant signing key (64-char hex string from rotate flow).
 */
export function verifyWithdrawalWebhook(
  rawBody: WebhookVerificationRawBody,
  signatureHeader: string | null | undefined,
  secret: string,
): CryptonlyWithdrawalWebhookVerification {
  if (!verifyHmacSha256HexSignature(rawBody, signatureHeader, secret)) {
    return {
      ok: false,
      reason:
        signatureHeader == null || String(signatureHeader).trim() === ''
          ? 'missing_signature'
          : 'invalid_signature',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyUtf8ForJson(rawBody)) as unknown;
  } catch {
    return { ok: false, reason: 'invalid_json' };
  }

  if (!isRecord(parsed)) {
    return { ok: false, reason: 'invalid_json' };
  }

  if (parsed.event !== CRYPTONLY_WEBHOOK_EVENT_WITHDRAWAL_STATUS_CHANGED) {
    return { ok: false, reason: 'wrong_event' };
  }

  return {
    ok: true,
    envelope: parsed as unknown as CryptonlyWithdrawalStatusChangedWebhookBody,
  };
}

/**
 * Verifies `x-webhook-signature` and checks `event` is
 * {@link CRYPTONLY_WEBHOOK_EVENT_DEPOSIT_STATUS_CHANGED}.
 */
export function verifyDepositWebhook(
  rawBody: WebhookVerificationRawBody,
  signatureHeader: string | null | undefined,
  secret: string,
): CryptonlyDepositWebhookVerification {
  if (!verifyHmacSha256HexSignature(rawBody, signatureHeader, secret)) {
    return {
      ok: false,
      reason:
        signatureHeader == null || String(signatureHeader).trim() === ''
          ? 'missing_signature'
          : 'invalid_signature',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyUtf8ForJson(rawBody)) as unknown;
  } catch {
    return { ok: false, reason: 'invalid_json' };
  }

  if (!isRecord(parsed)) {
    return { ok: false, reason: 'invalid_json' };
  }

  if (parsed.event !== CRYPTONLY_WEBHOOK_EVENT_DEPOSIT_STATUS_CHANGED) {
    return { ok: false, reason: 'wrong_event' };
  }

  return {
    ok: true,
    envelope: parsed as unknown as CryptonlyDepositStatusChangedWebhookBody,
  };
}
