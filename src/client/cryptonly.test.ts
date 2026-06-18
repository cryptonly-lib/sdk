import { Cryptonly } from './cryptonly';
import { MERCHANT_API_BASE_URL } from '../config/constants';
import { createFakeFetch } from '../resources/__test-helpers__/fake-fetch';

describe('Cryptonly constructor', () => {
  it('throws when `apiKey` is missing', () => {
    expect(() => new Cryptonly({ apiKey: '' })).toThrow(/apiKey/);
  });

  it('uses MERCHANT_API_BASE_URL by default', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: [] } });
    const client = new Cryptonly({ apiKey: 'k', fetch: fake.fetch });

    await client.accounts.list();

    expect(fake.lastRequest().url.startsWith(MERCHANT_API_BASE_URL)).toBe(true);
  });

  it('honors `baseUrl` overrides and trims trailing slashes', async () => {
    const fake = createFakeFetch();
    fake.setResponse({ body: { data: [] } });
    const client = new Cryptonly({
      apiKey: 'k',
      baseUrl: 'https://staging.example/',
      fetch: fake.fetch,
    });

    await client.accounts.list();

    expect(fake.lastRequest().url).toBe('https://staging.example/accounts');
  });
});
