import { Cryptonly } from '../client/cryptonly';
import { createFakeFetch } from './__test-helpers__/fake-fetch';

const BASE = 'https://api.test.example';

function buildClient(fetchImpl: typeof fetch) {
  return new Cryptonly({
    apiKey: 'sk_live_test',
    baseUrl: BASE,
    fetch: fetchImpl,
  });
}

const sampleQuote = {
  quoteId: '00000000-0000-7000-8000-000000000001',
  fromCryptoCurrencyCode: 'USDT_TRC20',
  toCryptoCurrencyCode: 'USDC_ERC20',
  principalFromAmount: 100,
  commissionAmount: 0.5,
  totalFromDebit: 100.5,
  toAmount: 99.95,
  commissionUsd: 0.5,
  expiresAt: '2026-01-01T00:01:00.000Z',
};

describe('ConvertingClient', () => {
  it('preview sends POST /converting/preview and returns data', async () => {
    const fake = createFakeFetch();
    const preview = {
      fromCryptoCurrencyCode: 'USDT_TRC20',
      toCryptoCurrencyCode: 'USDC_ERC20',
      principalFromAmount: 100,
      commissionAmount: 0.5,
      totalFromDebit: 100.5,
      toAmount: 99.95,
      commissionUsd: 0.5,
    };
    fake.setResponse({ body: { data: preview } });
    const client = buildClient(fake.fetch);

    const p = await client.converting.preview({
      accountId: 'acc-1',
      fromCryptoCurrencyCode: 'USDT_TRC20',
      toCryptoCurrencyCode: 'USDC_ERC20',
      toAmount: 99.95,
    });

    const req = fake.lastRequest();
    expect(req.method).toBe('POST');
    expect(req.url).toBe(`${BASE}/converting/preview`);
    expect(req.body).toEqual({
      accountId: 'acc-1',
      fromCryptoCurrencyCode: 'USDT_TRC20',
      toCryptoCurrencyCode: 'USDC_ERC20',
      toAmount: 99.95,
    });
    expect(p).toEqual(preview);
  });

  it('quote sends POST /converting/quote and returns data', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: sampleQuote } });
    const client = buildClient(fake.fetch);

    const q = await client.converting.quote({
      accountId: 'acc-1',
      fromCryptoCurrencyCode: 'USDT_TRC20',
      toCryptoCurrencyCode: 'USDC_ERC20',
      fromAmount: 100,
    });

    const req = fake.lastRequest();
    expect(req.method).toBe('POST');
    expect(req.url).toBe(`${BASE}/converting/quote`);
    expect(req.body).toEqual({
      accountId: 'acc-1',
      fromCryptoCurrencyCode: 'USDT_TRC20',
      toCryptoCurrencyCode: 'USDC_ERC20',
      fromAmount: 100,
    });
    expect(q).toEqual(sampleQuote);
  });

  it('commit sends POST /converting/commit and returns data', async () => {
    const fake = createFakeFetch();
    const commit = {
      ...sampleQuote,
      completedAt: '2026-01-01T00:00:05.000Z',
    };
    fake.setResponse({ body: { data: commit } });
    const client = buildClient(fake.fetch);

    const r = await client.converting.commit({
      quoteId: sampleQuote.quoteId,
    });

    const req = fake.lastRequest();
    expect(req.method).toBe('POST');
    expect(req.url).toBe(`${BASE}/converting/commit`);
    expect(req.body).toEqual({
      quoteId: sampleQuote.quoteId,
    });
    expect(r).toEqual(commit);
  });
});
