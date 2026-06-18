import { MERCHANT_API_KEY_HEADER } from '../config/constants';
import { CryptonlyApiError } from '../errors/cryptonly-api-error';

const MAX_ERR_BODY_SNIPPET = 240;

function extractErrorMessage(statusText: string, parsed: unknown): string {
  if (parsed == null || parsed === '') {
    return statusText || 'Request failed';
  }
  if (typeof parsed === 'string') {
    return parsed;
  }
  if (typeof parsed === 'object' && parsed !== null) {
    const o = parsed as Record<string, unknown>;
    if (typeof o.message === 'string') {
      return o.message;
    }
    if (typeof o.error === 'string') {
      return o.error;
    }
    const first = (o.errors as unknown[] | undefined)?.[0];
    if (first && typeof first === 'object' && 'message' in first) {
      const m = (first as { message?: unknown }).message;
      if (typeof m === 'string') {
        return m;
      }
    }
  }
  return statusText || 'Request failed';
}

/**
 * Pulls the merchant API error envelope (`code` / `extension`) out of a
 * parsed response body, when the server returned the expected shape.
 *
 * Tolerant: returns `undefined` fields if the body is not a plain object,
 * if `code` is not a string, etc. Never throws.
 */
function extractServerErrorEnvelope(parsed: unknown): {
  code: string | undefined;
  extension: Record<string, unknown> | undefined;
} {
  if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { code: undefined, extension: undefined };
  }
  const o = parsed as Record<string, unknown>;
  const code = typeof o.code === 'string' ? o.code : undefined;
  const ext = o.extension;
  const extension =
    ext && typeof ext === 'object' && !Array.isArray(ext)
      ? (ext as Record<string, unknown>)
      : undefined;
  return { code, extension };
}

/**
 * Try a few well-known correlation-id header names and return the first
 * non-empty value, or `undefined` if none were set.
 */
function readRequestIdHeader(headers: Headers | undefined): string | undefined {
  if (!headers || typeof headers.get !== 'function') {
    return undefined;
  }
  for (const name of ['x-request-id', 'x-correlation-id']) {
    const v = headers.get(name);
    if (v != null && v !== '') {
      return v;
    }
  }
  return undefined;
}

function trimBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

function joinBasePath(baseUrl: string, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${trimBaseUrl(baseUrl)}${p}`;
}

function buildQueryString(
  query: Record<string, string | number | boolean | null | undefined>,
): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

export type RequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Absolute path on the API host (e.g. `/invoice`, `/invoice/list`). */
  path: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  /** When true, do not `JSON.parse` the body (e.g. 204 or empty). */
  emptyResponse?: boolean;
  fetchImpl: typeof fetch;
  apiKey: string;
  baseUrl: string;
  /** Milliseconds. */
  timeout: number;
};

/**
 * Returns parsed JSON, or `undefined` for 204 or empty.
 */
export async function merchantRequest<T = unknown>(opts: RequestOptions): Promise<T> {
  const { path, method, query = {}, body, emptyResponse, fetchImpl, apiKey, baseUrl, timeout } = opts;
  if (!path.startsWith('/')) {
    throw new TypeError(`Path must be absolute, starting with / (got ${path})`);
  }
  const url = joinBasePath(baseUrl, path) + buildQueryString(query);
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeout);
  const headers: Record<string, string> = {
    [MERCHANT_API_KEY_HEADER]: apiKey,
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const init: RequestInit = {
    method,
    signal: ac.signal,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };
  try {
    const res = await fetchImpl(url, init);
    const text = await res.text();
    const requestId = readRequestIdHeader(res.headers);
    if (!res.ok) {
      let parsed: unknown = text;
      try {
        if (text) {
          parsed = JSON.parse(text) as unknown;
        }
      } catch {
        /* non-JSON body: keep as string */
      }
      const message = extractErrorMessage(res.statusText, parsed);
      const { code, extension } = extractServerErrorEnvelope(parsed);
      throw new CryptonlyApiError(message, res.status, path, parsed, undefined, {
        code,
        extension,
        requestId,
      });
    }
    if (emptyResponse || res.status === 204 || !text) {
      return undefined as T;
    }
    let parsed: T;
    try {
      parsed = JSON.parse(text) as T;
    } catch (e) {
      const snippet = text.length > MAX_ERR_BODY_SNIPPET
        ? `${text.slice(0, MAX_ERR_BODY_SNIPPET)}…`
        : text;
      const msg = `Response body is not valid JSON (status ${res.status})${snippet ? `: ${snippet}` : ''}`;
      throw new CryptonlyApiError(
        msg,
        res.status,
        path,
        { raw: text, parseError: true },
        e,
        { requestId },
      );
    }
    return parsed;
  } catch (e) {
    if (e instanceof CryptonlyApiError) {
      throw e;
    }
    const name = typeof e === 'object' && e !== null ? (e as { name?: string }).name : undefined;
    if (name === 'AbortError' || (e instanceof Error && e.name === 'AbortError')) {
      throw new CryptonlyApiError(
        'Request timed out or was aborted',
        0,
        path,
        null,
        e,
      );
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

export { joinBasePath, buildQueryString, trimBaseUrl };
