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

const sampleCrypto = {
  code: 'USDT_TRC20',
  name: 'Tether USD (TRC-20)',
  network: 'Tron',
  tokenType: 'trc20',
  decimalPlaces: 6,
  minDepositAmount: 1,
  minWithdrawalAmount: 5,
  depositCommission: 0.005,
  contractAddress: 'TXabc',
  imageUrl: null,
  addressMask: '^T[A-Za-z1-9]{33}$',
};

const sampleFiat = {
  code: 'USD',
  name: 'US Dollar',
  decimalPlaces: 2,
  minInvoiceAmount: 1,
};

describe('CurrenciesClient.list', () => {
  it('sends GET /currencies with no query when no filter is provided', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: [sampleCrypto] } });
    const client = buildClient(fake.fetch);

    const rows = await client.currencies.list();

    const req = fake.lastRequest();
    expect(req.method).toBe('GET');
    expect(req.url).toBe(`${BASE}/currencies`);
    expect(req.headers['x-tenant-api-key']).toBe('sk_live_test');
    expect(rows).toHaveLength(1);
    expect(rows[0].code).toBe('USDT_TRC20');
    expect(rows[0].depositCommission).toBe(0.005);
  });

  it('forwards `network` to the query string when provided', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: [sampleCrypto] } });
    const client = buildClient(fake.fetch);

    await client.currencies.list({ network: 'Tron' });

    expect(fake.lastRequest().url).toBe(`${BASE}/currencies?network=Tron`);
  });

  it('throws TypeError when `data` is not an array', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: null } });
    const client = buildClient(fake.fetch);
    await expect(client.currencies.list()).rejects.toBeInstanceOf(TypeError);
  });
});

describe('CurrenciesClient.listFiat', () => {
  it('sends GET /currencies/fiat and returns the inner array', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: [sampleFiat] } });
    const client = buildClient(fake.fetch);

    const rows = await client.currencies.listFiat();

    expect(fake.lastRequest().url).toBe(`${BASE}/currencies/fiat`);
    expect(rows).toEqual([sampleFiat]);
  });
});
