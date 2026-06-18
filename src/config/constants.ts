/**
 * Default origin for the merchant API (no path; no trailing slash).
 * Update here if the production host changes.
 */
export const MERCHANT_API_BASE_URL = 'https://api-merchant.cryptonly.net' as const;

/**
 * Origin for the sandbox merchant API. Use this (or pass `sandbox: true` to
 * the {@link Cryptonly} constructor) to point the SDK at the sandbox environment.
 */
export const SANDBOX_MERCHANT_API_BASE_URL = 'https://sandbox-api-merchant.cryptonly.net' as const;

/** Header that carries the merchant (tenant) API key. */
export const MERCHANT_API_KEY_HEADER = 'x-tenant-api-key' as const;
