/** @internal */
export type CryptonlyContext = {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  fetchImpl: typeof fetch;
};
