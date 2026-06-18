import type { CryptonlyContext } from '../client/context';
import type { RequestOptions } from './transport';

/** Request fields shared by every `merchantRequest` call for a `CryptonlyContext`. */
export function buildMerchantRequestFields(
  ctx: CryptonlyContext,
): Pick<RequestOptions, 'baseUrl' | 'apiKey' | 'timeout' | 'fetchImpl'> {
  return {
    baseUrl: ctx.baseUrl,
    apiKey: ctx.apiKey,
    timeout: ctx.timeout,
    fetchImpl: ctx.fetchImpl,
  };
}
