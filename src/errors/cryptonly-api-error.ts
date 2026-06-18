/**
 * Thrown when the API responds with a non-2xx status of a `Cryptonly` request,
 * or when a transport-level failure (network error, timeout, parse error)
 * prevents a successful response.
 *
 * The Cryptonly API returns errors as a JSON envelope:
 *
 * ```json
 * {
 *   "code": "exceptions.<area>.<reason>",
 *   "message": "Human-readable message",
 *   "extension": { "...": "structured details" }
 * }
 * ```
 *
 * When the body matches this shape, {@link code}, {@link extension}, and the
 * raw {@link body} are populated so application code can branch on stable
 * machine-readable codes rather than parsing `message`.
 */
export class CryptonlyApiError extends Error {
  override readonly name = 'CryptonlyApiError';

  /**
   * Stable machine-readable error code from the server, when the response
   * body included one (e.g. `exceptions.auth.invalidApiKey`,
   * `exceptions.withdrawal.insufficientBalance`).
   *
   * Always prefer branching on this value instead of {@link message}, which
   * is intended for humans and may be localized or rephrased over time.
   */
  readonly code: string | undefined;

  /**
   * Structured `extension` payload from the server error body (e.g.
   * `{ msBeforeNext: 1234 }` for `rateLimit.exceeded`). `undefined` when the
   * server did not include one.
   */
  readonly extension: Record<string, unknown> | undefined;

  /**
   * Server-assigned request id, taken from the `x-request-id` (or
   * `x-correlation-id`) response header when present. Useful when contacting
   * support: include this value alongside the timestamp.
   */
  readonly requestId: string | undefined;

  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
    readonly body: unknown,
    cause?: unknown,
    extras?: {
      code?: string;
      extension?: Record<string, unknown>;
      requestId?: string;
    },
  ) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.code = extras?.code;
    this.extension = extras?.extension;
    this.requestId = extras?.requestId;
  }
}
