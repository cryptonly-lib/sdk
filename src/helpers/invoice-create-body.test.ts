import { finalizeInvoiceCreateBody } from './invoice-create-body';

describe('finalizeInvoiceCreateBody', () => {
  it('keeps explicit fiatCurrencyCode, accountId, and orderId', () => {
    const body = finalizeInvoiceCreateBody({
      accountId: 'acc-1',
      fiatCurrencyCode: 'EUR',
      orderId: 'o1',
      amount: 10,
    });
    expect(body.fiatCurrencyCode).toBe('EUR');
    expect(body.orderId).toBe('o1');
  });

  it('generates orderId when missing', () => {
    const body = finalizeInvoiceCreateBody({
      accountId: 'acc-1',
      fiatCurrencyCode: 'USD',
    });
    expect(body.accountId).toBe('acc-1');
    expect(body.orderId).toMatch(/^cl_/);
    expect(body.fiatCurrencyCode).toBe('USD');
  });

  it('throws when no accountId', () => {
    expect(() => finalizeInvoiceCreateBody({ fiatCurrencyCode: 'USD' })).toThrow(
      /accountId/,
    );
  });

  it('throws when no fiatCurrencyCode', () => {
    expect(() => finalizeInvoiceCreateBody({ accountId: 'a' })).toThrow(
      /fiatCurrencyCode/,
    );
  });
});
