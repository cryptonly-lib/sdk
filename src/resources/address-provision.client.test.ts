import { Cryptonly } from '../client/cryptonly';
import { createFakeFetch } from './__test-helpers__/fake-fetch';

const BASE = 'https://api.test.example';

function buildClient(opts: { fetchImpl: typeof fetch }) {
  return new Cryptonly({
    apiKey: 'sk_live_test',
    baseUrl: BASE,
    fetch: opts.fetchImpl,
  });
}

const sampleCreateData = {
  id: 'ap-1',
  minimumAmount: 10,
  address: 'TXyz456',
  createdAt: '2026-01-01T00:00:00.000Z',
  expiresAt: '2026-02-01T00:00:00.000Z',
  qrCode: 'data:image/png;base64,xyz',
};

describe('AddressProvisionClient.create', () => {
  it('sends POST /address-provision and returns inner data', async () => {
    const fake = createFakeFetch();
    fake.setResponse({
      status: 201,
      body: { data: sampleCreateData },
    });
    const client = buildClient({ fetchImpl: fake.fetch });

    const data = await client.addressProvision.create({
      accountId: 'acc-1',
      cryptoCurrencyCode: 'USDT',
      customerId: 'cust-1',
      expiresInMinutes: 60,
    });

    const req = fake.lastRequest();
    expect(req.method).toBe('POST');
    expect(req.url).toBe(`${BASE}/address-provision`);
    expect(req.headers['x-tenant-api-key']).toBe('sk_live_test');
    expect(req.body).toEqual({
      accountId: 'acc-1',
      cryptoCurrencyCode: 'USDT',
      customerId: 'cust-1',
      expiresInMinutes: 60,
    });
    expect(data.id).toBe('ap-1');
    expect(data.address).toBe('TXyz456');
  });

  it('throws TypeError when the response is missing `data`', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ status: 200, body: {} });
    const client = buildClient({ fetchImpl: fake.fetch });
    await expect(
      client.addressProvision.create({
        accountId: 'acc-1',
        cryptoCurrencyCode: 'USDT',
        customerId: 'cust-1',
      }),
    ).rejects.toThrow('addressProvision.create: response missing `data`');
  });
});

describe('AddressProvisionClient.get', () => {
  it('sends GET /address-provision with accountId and id', async () => {
    const fake = createFakeFetch();
    fake.setResponse({
      body: {
        data: {
          ...sampleCreateData,
          status: 'active',
          customerId: 'cust-1',
        },
      },
    });
    const client = buildClient({ fetchImpl: fake.fetch });

    const data = await client.addressProvision.get({
      accountId: 'acc-1',
      id: 'ap-1',
    });

    const req = fake.lastRequest();
    expect(req.method).toBe('GET');
    expect(req.url).toBe(`${BASE}/address-provision?accountId=acc-1&id=ap-1`);
    expect(data.status).toBe('active');
    expect(data.customerId).toBe('cust-1');
  });

  it('throws TypeError when the response is missing `data`', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ status: 200, body: {} });
    const client = buildClient({ fetchImpl: fake.fetch });
    await expect(
      client.addressProvision.get({ accountId: 'acc-1', id: 'ap-1' }),
    ).rejects.toThrow('addressProvision.get: response missing `data`');
  });
});
