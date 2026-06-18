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

const sampleWireAccount = {
  id: 'acc-1',
  name: 'Default',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('AccountsClient.list', () => {
  it('sends GET /accounts and maps wire rows to TenantAccount', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: [sampleWireAccount] } });
    const client = buildClient(fake.fetch);

    const rows = await client.accounts.list();

    const req = fake.lastRequest();
    expect(req.method).toBe('GET');
    expect(req.url).toBe(`${BASE}/accounts`);
    expect(req.headers['x-tenant-api-key']).toBe('sk_live_test');
    expect(req.body).toBeUndefined();
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe('acc-1');
    expect(rows[0].createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('throws TypeError when `data` is not an array', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: null } });
    const client = buildClient(fake.fetch);
    await expect(client.accounts.list()).rejects.toBeInstanceOf(TypeError);
  });
});

describe('AccountsClient.create', () => {
  it('sends POST /accounts with the body and maps the response', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ status: 201, body: { data: sampleWireAccount } });
    const client = buildClient(fake.fetch);

    const acc = await client.accounts.create({ name: 'Default' });

    const req = fake.lastRequest();
    expect(req.method).toBe('POST');
    expect(req.url).toBe(`${BASE}/accounts`);
    expect(req.body).toEqual({ name: 'Default' });
    expect(acc.id).toBe('acc-1');
    expect(acc.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });
});
