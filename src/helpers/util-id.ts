/**
 * Opaque idempotency value when `orderId` is not passed. Prefer a stable
 * `orderId` in production.
 */
export function newSdkOrderId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') {
    return `cl_${c.randomUUID()}`;
  }
  return `cl_${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
