/**
 * Test helpers for resource-client tests.
 *
 * Centralizes the boilerplate of mounting a fake `fetch`, capturing the
 * request that the SDK made (URL, method, body, headers), and replying
 * with a pre-baked JSON body or status code.
 */

export interface FakeRequest {
  url: string;
  method: string;
  body: unknown;
  headers: Record<string, string>;
}

export interface FakeResponseSpec {
  status?: number;
  body?: unknown;
  text?: string;
  headers?: Record<string, string>;
}

export interface FakeFetchHandle {
  fetch: typeof fetch;
  /** Set the response for the next request. */
  setResponse: (spec: FakeResponseSpec) => void;
  /** Last request the SDK made. */
  lastRequest: () => FakeRequest;
  /** All requests the SDK made (oldest first). */
  allRequests: () => FakeRequest[];
}

function headersToRecord(init: HeadersInit | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!init) return out;
  if (init instanceof Headers) {
    init.forEach((v, k) => {
      out[k.toLowerCase()] = v;
    });
    return out;
  }
  if (Array.isArray(init)) {
    for (const [k, v] of init) {
      out[k.toLowerCase()] = v;
    }
    return out;
  }
  for (const [k, v] of Object.entries(init)) {
    out[k.toLowerCase()] = String(v);
  }
  return out;
}

/** Statuses where the WHATWG fetch spec disallows a response body. */
const NO_BODY_STATUSES = new Set([101, 103, 204, 205, 304]);

function buildResponse(spec: FakeResponseSpec): Response {
  const status = spec.status ?? 200;
  const rawBody =
    spec.text !== undefined
      ? spec.text
      : spec.body !== undefined
        ? JSON.stringify(spec.body)
        : '';
  const headers = new Headers(spec.headers ?? {});
  if (rawBody && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  const body = NO_BODY_STATUSES.has(status) ? null : rawBody;
  return new Response(body, { status, headers });
}

export function createFakeFetch(): FakeFetchHandle {
  let nextSpec: FakeResponseSpec = { status: 200, body: {} };
  const requests: FakeRequest[] = [];

  const fetchImpl: typeof fetch = async (input, init) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : (input as Request).url;
    const method = (init?.method ?? 'GET').toUpperCase();
    const headers = headersToRecord(init?.headers);
    let body: unknown;
    if (init?.body == null) {
      body = undefined;
    } else if (typeof init.body === 'string') {
      try {
        body = JSON.parse(init.body) as unknown;
      } catch {
        body = init.body;
      }
    } else {
      body = init.body;
    }
    requests.push({ url, method, body, headers });
    return buildResponse(nextSpec);
  };

  return {
    fetch: fetchImpl,
    setResponse: (spec) => {
      nextSpec = spec;
    },
    lastRequest: () => {
      const r = requests[requests.length - 1];
      if (!r) throw new Error('No requests captured yet');
      return r;
    },
    allRequests: () => [...requests],
  };
}
