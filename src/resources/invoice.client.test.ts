import { Cryptonly } from '../client/cryptonly';
import { CryptonlyApiError } from '../errors/cryptonly-api-error';
import { CRYPTONLY_EXCEPTION_AUTH_INVALID_API_KEY } from '../errors/merchant-api-codes';
import { InvoiceStatus } from '../types/status';
import { createFakeFetch } from './__test-helpers__/fake-fetch';

const BASE = 'https://api.test.example';

function buildClient(opts: { fetchImpl: typeof fetch }) {
  return new Cryptonly({
    apiKey: 'sk_live_test',
    baseUrl: BASE,
    fetch: opts.fetchImpl,
  });
}

const sampleWireInvoice = {
  id: 'inv-1',
  accountId: 'acc-1',
  orderId: 'ord-1',
  amount: 100,
  fiatCurrencyCode: 'USD',
  items: [],
  status: InvoiceStatus.CREATED,
  description: 'Order #1',
  number: undefined,
  webhookUrl: undefined,
  returnUrl: undefined,
  expiresAt: '2026-02-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  source: 'api',
};

describe('InvoiceClient.create', () => {
  it('sends POST /invoice with the api-key header and returns inner data', async () => {
    const fake = createFakeFetch();
    fake.setResponse({
      status: 201,
      body: {
        data: {
          id: 'inv-1',
          status: InvoiceStatus.CREATED,
          accountId: 'acc-1',
          amount: 100,
          items: [],
          fiatCurrencyCode: 'USD',
          orderId: 'ord-1',
          paymentPageUrl: 'https://pay.example/inv-1',
          expiresAt: '2026-02-01T00:00:00.000Z',
          source: 'api',
        },
      },
    });
    const client = buildClient({ fetchImpl: fake.fetch });

    const data = await client.invoice.create({
      accountId: 'acc-1',
      amount: 100,
      fiatCurrencyCode: 'USD',
      orderId: 'ord-1',
      description: 'Order #1',
    });

    const req = fake.lastRequest();
    expect(req.method).toBe('POST');
    expect(req.url).toBe(`${BASE}/invoice`);
    expect(req.headers['x-tenant-api-key']).toBe('sk_live_test');
    expect(req.headers['content-type']).toBe('application/json');
    expect(req.body).toEqual({
      accountId: 'acc-1',
      amount: 100,
      fiatCurrencyCode: 'USD',
      orderId: 'ord-1',
      description: 'Order #1',
    });
    expect(data.id).toBe('inv-1');
    expect(data.paymentPageUrl).toBe('https://pay.example/inv-1');
    expect(data.expiresAt).toBe('2026-02-01T00:00:00.000Z');
    expect(data.source).toBe('api');
  });

  it('auto-generates an `orderId` when omitted', async () => {
    const fake = createFakeFetch();
    fake.setResponse({
      status: 201,
      body: {
        data: {
          id: 'inv-2',
          status: InvoiceStatus.CREATED,
          accountId: 'acc-2',
          amount: 50,
          items: [],
          fiatCurrencyCode: 'USD',
          orderId: 'cl_generated',
          paymentPageUrl: 'https://pay.example/inv-2',
          expiresAt: '2026-02-01T00:00:00.000Z',
        },
      },
    });
    const client = buildClient({ fetchImpl: fake.fetch });

    await client.invoice.create({
      accountId: 'acc-2',
      amount: 50,
      fiatCurrencyCode: 'USD',
    });

    const req = fake.lastRequest();
    expect(req.body).toEqual(
      expect.objectContaining({
        accountId: 'acc-2',
        amount: 50,
        fiatCurrencyCode: 'USD',
      }),
    );
    const sentOrderId = (req.body as { orderId: string }).orderId;
    expect(typeof sentOrderId).toBe('string');
    expect(sentOrderId).toMatch(/^cl_/);
  });

  it('throws TypeError when the response is missing `data`', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ status: 200, body: {} });
    const client = buildClient({ fetchImpl: fake.fetch });
    await expect(
      client.invoice.create({
        accountId: 'acc-1',
        amount: 1,
        fiatCurrencyCode: 'USD',
        orderId: 'ord-1',
      }),
    ).rejects.toBeInstanceOf(TypeError);
  });

  it('throws CryptonlyApiError with code/extension/requestId on a server error', async () => {
    const fake = createFakeFetch();
    fake.setResponse({
      status: 401,
      headers: { 'x-request-id': 'req-abc' },
      body: {
        code: 'exceptions.auth.invalidApiKey',
        message: 'Api key is invalid',
        extension: { hint: 'rotate' },
      },
    });
    const client = buildClient({ fetchImpl: fake.fetch });
    let caught: unknown;
    try {
      await client.invoice.create({
        accountId: 'acc-1',
        amount: 1,
        fiatCurrencyCode: 'USD',
        orderId: 'ord-1',
      });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(CryptonlyApiError);
    const err = caught as CryptonlyApiError;
    expect(err.status).toBe(401);
    expect(err.code).toBe(CRYPTONLY_EXCEPTION_AUTH_INVALID_API_KEY);
    expect(err.extension).toEqual({ hint: 'rotate' });
    expect(err.requestId).toBe('req-abc');
    expect(err.message).toBe('Api key is invalid');
  });
});

describe('InvoiceClient.list', () => {
  it('sends GET /invoice/list with query string filters and returns raw JSON data', async () => {
    const fake = createFakeFetch();
    fake.setResponse({
      body: {
        data: [sampleWireInvoice],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      },
    });
    const client = buildClient({ fetchImpl: fake.fetch });

    const res = await client.invoice.list({
      accountId: 'acc-1',
      status: InvoiceStatus.CREATED,
      page: 1,
      limit: 20,
    });

    const req = fake.lastRequest();
    expect(req.method).toBe('GET');
    expect(req.url).toBe(
      `${BASE}/invoice/list?accountId=acc-1&status=created&page=1&limit=20`,
    );
    expect(req.body).toBeUndefined();
    expect(res.total).toBe(1);
    expect(res.data).toHaveLength(1);
    expect(res.data[0].id).toBe('inv-1');
    expect(res.data[0].createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(res.data[0].source).toBe('api');
    expect(res.data[0].returnUrl).toBeUndefined();
  });

  it('throws TypeError when `data` is not an array', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: null, total: 0, page: 1, limit: 20, hasMore: false } });
    const client = buildClient({ fetchImpl: fake.fetch });
    await expect(client.invoice.list({ accountId: 'acc-1' })).rejects.toThrow(
      'invoice.list: response missing `data` array',
    );
  });
});

describe('InvoiceClient.get', () => {
  it('sends GET /invoice with id+accountId in the query', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: sampleWireInvoice } });
    const client = buildClient({ fetchImpl: fake.fetch });

    const inv = await client.invoice.get({ accountId: 'acc-1', id: 'inv-1' });

    const req = fake.lastRequest();
    expect(req.method).toBe('GET');
    expect(req.url).toBe(`${BASE}/invoice?accountId=acc-1&id=inv-1`);
    expect(inv.id).toBe('inv-1');
    expect(inv.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('forwards `orderId` instead of `id`', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: sampleWireInvoice } });
    const client = buildClient({ fetchImpl: fake.fetch });
    await client.invoice.get({ accountId: 'acc-1', orderId: 'ord-1' });

    expect(fake.lastRequest().url).toBe(`${BASE}/invoice?accountId=acc-1&orderId=ord-1`);
  });

  it('throws TypeError before fetch when accountId or selector is missing', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: sampleWireInvoice } });
    const client = buildClient({ fetchImpl: fake.fetch });
    await expect(client.invoice.get({ accountId: '', id: 'inv-1' })).rejects.toThrow(
      'invoice.get: `accountId` is required.',
    );
    await expect(client.invoice.get({ accountId: 'acc-1' })).rejects.toThrow(
      'invoice.get: supply `id` or `orderId`',
    );
    expect(fake.allRequests()).toHaveLength(0);
  });
});

describe('InvoiceClient.cancel', () => {
  it('sends POST /invoice/cancel with query and ignores empty body', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ status: 204, text: '' });
    const client = buildClient({ fetchImpl: fake.fetch });

    await expect(
      client.invoice.cancel({ accountId: 'acc-1', id: 'inv-1' }),
    ).resolves.toBeUndefined();
    const req = fake.lastRequest();
    expect(req.method).toBe('POST');
    expect(req.url).toBe(`${BASE}/invoice/cancel?accountId=acc-1&id=inv-1`);
  });

  it('throws TypeError before fetch when query is invalid', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ status: 204, text: '' });
    const client = buildClient({ fetchImpl: fake.fetch });
    await expect(client.invoice.cancel({ accountId: 'acc-1' })).rejects.toThrow(
      'invoice.cancel: supply `id` or `orderId`',
    );
    expect(fake.allRequests()).toHaveLength(0);
  });
});
