import { Cryptonly } from '../client/cryptonly';
import { WithdrawalStatus } from '../types/status';
import { createFakeFetch } from './__test-helpers__/fake-fetch';

const BASE = 'https://api.test.example';

function buildClient(fetchImpl: typeof fetch) {
  return new Cryptonly({
    apiKey: 'sk_live_test',
    baseUrl: BASE,
    fetch: fetchImpl,
  });
}

const sampleWireWithdrawal = {
  id: 'w-1',
  orderId: 'ord-1',
  tenantId: 1,
  accountId: 'acc-1',
  cryptoCurrencyCode: 'USDT_TRC20',
  address: 'TXabc',
  amount: 10,
  transactionHash: null,
  status: WithdrawalStatus.CREATED,
  convertId: null,
  feeAmount: 0.01,
  feeAmountUsd: 0.01,
  amountUsd: 10,
  debitedAmount: 10.01,
  customData: { ref: 'X' },
  source: 'api',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  quoteId: '00000000-0000-7000-8000-000000000001',
  transferId: '00000000-0000-7000-8000-000000000001',
};

describe('WithdrawalClient.quote', () => {
  it('sends POST /withdrawal/quote and returns inner data', async () => {
    const fake = createFakeFetch();
    fake.setResponse({
      body: {
        data: {
          quoteId: 'q-1',
          orderId: 'ord-1',
          cryptoCurrencyCode: 'USDT_TRC20',
          address: 'TXabc',
          amount: 10,
          autoConvert: null,
          totalDeduction: 10.5,
          fee: {
            feeNative: 0.0001,
            feeCurrency: 'TRX',
            feeInCryptoCurrencyCode: 0.5,
            feeUsd: 0.5,
          },
          expiresAt: '2026-01-01T00:01:00.000Z',
        },
      },
    });
    const client = buildClient(fake.fetch);

    const q = await client.withdrawal.quote({
      accountId: 'acc-1',
      cryptoCurrencyCode: 'USDT_TRC20',
      address: 'TXabc',
      amount: 10,
      orderId: 'ord-1',
    });

    const req = fake.lastRequest();
    expect(req.method).toBe('POST');
    expect(req.url).toBe(`${BASE}/withdrawal/quote`);
    expect(req.body).toEqual({
      accountId: 'acc-1',
      cryptoCurrencyCode: 'USDT_TRC20',
      address: 'TXabc',
      amount: 10,
      orderId: 'ord-1',
    });
    expect(q.quoteId).toBe('q-1');
  });

  it('throws TypeError when response missing data', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: {} });
    const client = buildClient(fake.fetch);
    await expect(
      client.withdrawal.quote({
        accountId: 'acc-1',
        cryptoCurrencyCode: 'USDT_TRC20',
        address: 'TXabc',
        amount: 10,
        orderId: 'ord-1',
      }),
    ).rejects.toBeInstanceOf(TypeError);
  });
});

describe('WithdrawalClient.commit', () => {
  it('sends POST /withdrawal/commit and returns the wire row', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: sampleWireWithdrawal } });
    const client = buildClient(fake.fetch);

    const w = await client.withdrawal.commit({
      quoteId: 'q-1',
      customData: { ref: 'X' },
    });

    const req = fake.lastRequest();
    expect(req.method).toBe('POST');
    expect(req.url).toBe(`${BASE}/withdrawal/commit`);
    expect(req.body).toEqual({
      quoteId: 'q-1',
      customData: { ref: 'X' },
    });
    expect(w.id).toBe('w-1');
    expect(w.feeAmount).toBe(0.01);
    expect(w.source).toBe('api');
    expect(w.customData).toEqual({ ref: 'X' });
    expect(w.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(w.quoteId).toBe('00000000-0000-7000-8000-000000000001');
  });
});

describe('WithdrawalClient.list', () => {
  it('sends GET /withdrawal/list with filters', async () => {
    const fake = createFakeFetch();
    fake.setResponse({
      body: {
        data: [sampleWireWithdrawal],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      },
    });
    const client = buildClient(fake.fetch);

    const res = await client.withdrawal.list({
      accountId: 'acc-1',
      status: WithdrawalStatus.CREATED,
      page: 1,
      limit: 20,
    });

    const req = fake.lastRequest();
    expect(req.method).toBe('GET');
    expect(req.url).toBe(
      `${BASE}/withdrawal/list?accountId=acc-1&status=created&page=1&limit=20`,
    );
    expect(res.data).toHaveLength(1);
    expect(res.data[0].id).toBe('w-1');
    expect(res.data[0].source).toBe('api');
  });
});

describe('WithdrawalClient.get', () => {
  it('sends GET /withdrawal with id and accountId', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: sampleWireWithdrawal } });
    const client = buildClient(fake.fetch);

    const w = await client.withdrawal.get({ accountId: 'acc-1', id: 'w-1' });

    expect(fake.lastRequest().url).toBe(`${BASE}/withdrawal?accountId=acc-1&id=w-1`);
    expect(w.id).toBe('w-1');
  });

  it('throws TypeError before fetch when accountId or selector is missing', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: sampleWireWithdrawal } });
    const client = buildClient(fake.fetch);
    await expect(client.withdrawal.get({ accountId: 'acc-1' })).rejects.toThrow(
      'withdrawal.get: supply `id` or `orderId`',
    );
    expect(fake.allRequests()).toHaveLength(0);
  });
});
