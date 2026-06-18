import { createHmac } from 'crypto';
import {
  CRYPTONLY_WEBHOOK_EVENT_DEPOSIT_STATUS_CHANGED,
  CRYPTONLY_WEBHOOK_EVENT_INVOICE_STATUS_CHANGED,
  CRYPTONLY_WEBHOOK_EVENT_WITHDRAWAL_STATUS_CHANGED,
} from './constants';
import {
  verifyDepositWebhook,
  verifyInvoiceWebhook,
  verifyWithdrawalWebhook,
} from './verify';
import { DepositStatus, InvoiceStatus, WithdrawalStatus } from '../types/status';

describe('verifyInvoiceWebhook', () => {
  const secret = 'a'.repeat(64);
  const timestamp = '2026-01-15T12:00:00.000Z';
  const data = {
    id: 'inv-1',
    tenantId: 1,
    accountId: 'acc-1',
    orderId: 'ord-1',
    amount: 100,
    fiatCurrencyCode: 'USD',
    items: [],
    status: InvoiceStatus.PAID,
    depositId: 'dep-1',
    lockedCurrencyCode: 'USDT_TRC20',
    lockedCryptoAmount: 99.5,
    lockedFiatRateUSD: null,
    lockedCryptoRateUSD: null,
    lockedAt: null,
    description: null,
    webhookUrl: null,
    returnUrl: null,
    expiresAt: null,
    createdAt: timestamp,
    paidAt: timestamp,
  };
  const rawBody = JSON.stringify({
    event: CRYPTONLY_WEBHOOK_EVENT_INVOICE_STATUS_CHANGED,
    data,
    timestamp,
  });
  const signature = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');

  it('accepts a valid body and signature', () => {
    const r = verifyInvoiceWebhook(rawBody, signature, secret);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.envelope.event).toBe(CRYPTONLY_WEBHOOK_EVENT_INVOICE_STATUS_CHANGED);
      expect(r.envelope.data.id).toBe('inv-1');
      expect(r.envelope.timestamp).toBe(timestamp);
    }
  });

  it('rejects wrong secret', () => {
    const r = verifyInvoiceWebhook(rawBody, signature, 'b'.repeat(64));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('invalid_signature');
  });

  it('rejects wrong event', () => {
    const body = JSON.stringify({
      event: CRYPTONLY_WEBHOOK_EVENT_WITHDRAWAL_STATUS_CHANGED,
      data,
      timestamp,
    });
    const sig = createHmac('sha256', secret).update(body, 'utf8').digest('hex');
    const r = verifyInvoiceWebhook(body, sig, secret);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('wrong_event');
  });

  it('rejects missing signature', () => {
    const r = verifyInvoiceWebhook(rawBody, '', secret);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('missing_signature');
  });

  it('accepts raw body as UTF-8 Buffer', () => {
    const buf = Buffer.from(rawBody, 'utf8');
    const r = verifyInvoiceWebhook(buf, signature, secret);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.envelope.data.id).toBe('inv-1');
    }
  });
});

describe('verifyWithdrawalWebhook', () => {
  const secret = 'c'.repeat(64);
  const timestamp = '2026-01-15T12:00:00.000Z';
  const data = {
    id: 'w1',
    orderId: 'o1',
    accountId: 'acc-2',
    cryptoCurrencyCode: 'USDT_TRC20',
    address: 'addr',
    amount: 10,
    transactionHash: '0xabc',
    status: WithdrawalStatus.COMPLETED,
    convertId: null,
    feeAmount: 0,
    feeAmountUsd: 0,
    amountUsd: 10,
    debitedAmount: 10,
    createdAt: timestamp,
    updatedAt: timestamp,
    quoteId: null,
    transferId: null,
  };
  const rawBody = JSON.stringify({
    event: CRYPTONLY_WEBHOOK_EVENT_WITHDRAWAL_STATUS_CHANGED,
    data,
    timestamp,
  });
  const signature = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');

  it('accepts a valid body and signature', () => {
    const r = verifyWithdrawalWebhook(rawBody, signature, secret);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.envelope.event).toBe(CRYPTONLY_WEBHOOK_EVENT_WITHDRAWAL_STATUS_CHANGED);
      expect(r.envelope.data.id).toBe('w1');
    }
  });

  it('accepts raw body as UTF-8 Buffer', () => {
    const buf = Buffer.from(rawBody, 'utf8');
    const r = verifyWithdrawalWebhook(buf, signature, secret);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.envelope.data.id).toBe('w1');
    }
  });
});

describe('verifyDepositWebhook', () => {
  const secret = 'd'.repeat(64);
  const timestamp = '2026-01-15T12:00:00.000Z';
  const data = {
    id: 'dep-1',
    accountId: 'acc-1',
    orderId: 'ord-dep-1',
    status: DepositStatus.COMPLETED,
    cryptoCurrencyCode: 'USDT_TRC20',
    address: 'TAddr',
    expiresAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
    previousStatus: DepositStatus.PROCESSING,
  };
  const rawBody = JSON.stringify({
    event: CRYPTONLY_WEBHOOK_EVENT_DEPOSIT_STATUS_CHANGED,
    data,
    timestamp,
  });
  const signature = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');

  it('accepts a valid body and signature', () => {
    const r = verifyDepositWebhook(rawBody, signature, secret);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.envelope.event).toBe(CRYPTONLY_WEBHOOK_EVENT_DEPOSIT_STATUS_CHANGED);
      expect(r.envelope.data.id).toBe('dep-1');
    }
  });

  it('rejects wrong event', () => {
    const body = JSON.stringify({
      event: CRYPTONLY_WEBHOOK_EVENT_INVOICE_STATUS_CHANGED,
      data,
      timestamp,
    });
    const sig = createHmac('sha256', secret).update(body, 'utf8').digest('hex');
    const r = verifyDepositWebhook(body, sig, secret);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('wrong_event');
  });
});
