import { Cryptonly } from '../client/cryptonly';
import { CryptonlyApiError } from '../errors/cryptonly-api-error';
import { DepositStatus } from '../types/status';
import { createFakeFetch } from './__test-helpers__/fake-fetch';

const BASE = 'https://api.test.example';

function buildClient(opts: { fetchImpl: typeof fetch }) {
  return new Cryptonly({
    apiKey: 'sk_live_test',
    baseUrl: BASE,
    fetch: opts.fetchImpl,
  });
}

const sampleWireDeposit = {
  id: 'dep-1',
  accountId: 'acc-1',
  orderId: 'ord-1',
  status: DepositStatus.CREATED,
  cryptoCurrencyCode: 'USDT',
  address: 'TXyz123',
  expiresAt: '2026-02-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('DepositClient.create', () => {
  it('sends POST /deposit with the api-key header and returns inner data', async () => {
    const fake = createFakeFetch();
    fake.setResponse({
      status: 201,
      body: {
        data: {
          id: 'dep-1',
          minimumAmount: 10,
          address: 'TXyz123',
          createdAt: '2026-01-01T00:00:00.000Z',
          expiresAt: '2026-02-01T00:00:00.000Z',
          qrCode: 'data:image/png;base64,abc',
        },
      },
    });
    const client = buildClient({ fetchImpl: fake.fetch });

    const data = await client.deposit.create({
      accountId: 'acc-1',
      cryptoCurrencyCode: 'USDT',
      orderId: 'ord-1',
    });

    const req = fake.lastRequest();
    expect(req.method).toBe('POST');
    expect(req.url).toBe(`${BASE}/deposit`);
    expect(req.headers['x-tenant-api-key']).toBe('sk_live_test');
    expect(req.body).toEqual({
      accountId: 'acc-1',
      cryptoCurrencyCode: 'USDT',
      orderId: 'ord-1',
    });
    expect(data.id).toBe('dep-1');
    expect(data.address).toBe('TXyz123');
  });

  it('throws TypeError when the response is missing `data`', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ status: 200, body: {} });
    const client = buildClient({ fetchImpl: fake.fetch });
    await expect(
      client.deposit.create({
        accountId: 'acc-1',
        cryptoCurrencyCode: 'USDT',
        orderId: 'ord-1',
      }),
    ).rejects.toBeInstanceOf(TypeError);
  });
});

describe('DepositClient.list', () => {
  it('sends GET /deposit/list with query filters', async () => {
    const fake = createFakeFetch();
    fake.setResponse({
      body: {
        data: [sampleWireDeposit],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      },
    });
    const client = buildClient({ fetchImpl: fake.fetch });

    const res = await client.deposit.list({
      accountId: 'acc-1',
      status: DepositStatus.CREATED,
      page: 1,
      limit: 20,
    });

    const req = fake.lastRequest();
    expect(req.method).toBe('GET');
    expect(req.url).toBe(
      `${BASE}/deposit/list?accountId=acc-1&status=created&page=1&limit=20`,
    );
    expect(res.data).toHaveLength(1);
    expect(res.data[0].id).toBe('dep-1');
  });

  it('throws TypeError when `data` is not an array', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: null, total: 0, page: 1, limit: 20, hasMore: false } });
    const client = buildClient({ fetchImpl: fake.fetch });
    await expect(client.deposit.list({ accountId: 'acc-1' })).rejects.toThrow(
      'deposit.list: response missing `data` array',
    );
  });
});

describe('DepositClient.get', () => {
  it('sends GET /deposit with id+accountId in the query', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: sampleWireDeposit } });
    const client = buildClient({ fetchImpl: fake.fetch });

    const dep = await client.deposit.get({ accountId: 'acc-1', id: 'dep-1' });

    const req = fake.lastRequest();
    expect(req.method).toBe('GET');
    expect(req.url).toBe(`${BASE}/deposit?accountId=acc-1&id=dep-1`);
    expect(dep.id).toBe('dep-1');
  });

  it('throws TypeError before fetch when query is invalid', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: sampleWireDeposit } });
    const client = buildClient({ fetchImpl: fake.fetch });
    await expect(client.deposit.get({ accountId: 'acc-1' })).rejects.toThrow(
      'deposit.get: supply `id` or `orderId`',
    );
    expect(fake.allRequests()).toHaveLength(0);
  });

  it('throws CryptonlyApiError on server error', async () => {
    const fake = createFakeFetch();
    fake.setResponse({
      status: 404,
      body: { code: 'exceptions.deposit.notFound', message: 'Not found' },
    });
    const client = buildClient({ fetchImpl: fake.fetch });
    await expect(
      client.deposit.get({ accountId: 'acc-1', id: 'missing' }),
    ).rejects.toBeInstanceOf(CryptonlyApiError);
  });
});
