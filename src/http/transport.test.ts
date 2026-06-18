import { CryptonlyApiError } from '../errors/cryptonly-api-error';
import { buildQueryString, joinBasePath, merchantRequest, trimBaseUrl } from './transport';

describe('transport helpers', () => {
  it('trimBaseUrl removes trailing slashes', () => {
    expect(trimBaseUrl('https://x.com/')).toBe('https://x.com');
  });

  it('joinBasePath joins', () => {
    expect(joinBasePath('https://x.com', '/a')).toBe('https://x.com/a');
  });

  it('buildQueryString skips null and undefined', () => {
    expect(
      buildQueryString({ a: 1, b: undefined, c: null, d: 'x' }),
    ).toBe('?a=1&d=x');
  });
});

describe('merchantRequest', () => {
  it('throws CryptonlyApiError with parseError on 200 non-JSON body', async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response('not json {', { status: 200, statusText: 'OK' });
    let err: unknown;
    try {
      await merchantRequest({
        method: 'GET',
        path: '/x',
        fetchImpl,
        apiKey: 'k',
        baseUrl: 'https://x.com',
        timeout: 5000,
      });
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(CryptonlyApiError);
    const c = err as CryptonlyApiError;
    expect(c.status).toBe(200);
    expect(c.path).toBe('/x');
    expect(c.body).toEqual(
      expect.objectContaining({ parseError: true, raw: 'not json {' }),
    );
    expect((c as Error & { cause?: unknown }).cause).toBeDefined();
  });

  it('maps AbortError to CryptonlyApiError with status 0', async () => {
    const err = new Error('aborted');
    err.name = 'AbortError';
    const fetchImpl: typeof fetch = async () => {
      throw err;
    };
    await expect(
      merchantRequest({
        method: 'GET',
        path: '/y',
        fetchImpl,
        apiKey: 'k',
        baseUrl: 'https://x.com',
        timeout: 5000,
      }),
    ).rejects.toMatchObject({
      name: 'CryptonlyApiError',
      status: 0,
      path: '/y',
    });
  });

  it('uses error field on 4xx JSON body', async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ error: 'bad' }), {
        status: 400,
        statusText: 'Bad Request',
      });
    await expect(
      merchantRequest({
        method: 'GET',
        path: '/z',
        fetchImpl,
        apiKey: 'k',
        baseUrl: 'https://x.com',
        timeout: 5000,
      }),
    ).rejects.toMatchObject({
      message: 'bad',
      status: 400,
    });
  });
});
