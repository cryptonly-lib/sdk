/** Blockchain network a crypto currency lives on. Echoed from the server enum. */
export type SupportedNetwork =
  | 'Tron'
  | 'Ethereum'
  | 'BNB'
  | 'BTC'
  | 'Solana';

/** Token standard for non-native crypto assets. Omitted for chain-native coins. */
export type TokenType = 'erc20' | 'trc20' | 'bep20';

/**
 * One crypto currency from the merchant's perspective.
 *
 * `depositCommission` reflects the **tenant-effective** value: tenant-wide
 * override when configured, otherwise the platform default (1.3%).
 */
export interface MerchantCurrency {
  code: string;
  name: string;
  network: SupportedNetwork;
  tokenType?: TokenType;
  decimalPlaces: number;
  minDepositAmount: number;
  minWithdrawalAmount: number;
  /** Tenant-effective deposit commission. */
  depositCommission: number;
  /** Smart contract address for token currencies; `null` for native coins. */
  contractAddress: string | null;
  imageUrl: string | null;
  /** Optional regex (as a string) for client-side address pre-validation. */
  addressMask: string | null;
}

/** `GET /currencies` response wrapper: `{ data: MerchantCurrency[] }`. */
export interface MerchantCurrencyListResponse {
  data: MerchantCurrency[];
}

/** Optional filter for `GET /currencies`. */
export interface ListMerchantCurrenciesQuery {
  network?: SupportedNetwork;
}

/** One fiat (settlement) currency. Used as `fiatCurrencyCode` on `POST /invoice`. */
export interface MerchantFiatCurrency {
  code: string;
  name: string;
  decimalPlaces: number;
  minInvoiceAmount: number;
}

/** `GET /currencies/fiat` response wrapper: `{ data: MerchantFiatCurrency[] }`. */
export interface MerchantFiatCurrencyListResponse {
  data: MerchantFiatCurrency[];
}
