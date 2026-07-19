/** `POST /converting/quote` body. */
export interface ConvertingQuoteRequest {
  accountId: string;
  fromCryptoCurrencyCode: string;
  toCryptoCurrencyCode: string;
  /** Source amount to convert when quoting by debit side. */
  fromAmount?: number;
  /** Desired credit in `toCryptoCurrencyCode`; server derives `fromAmount`. */
  toAmount?: number;
}

/** `POST /converting/preview` response `data` (same shape, no `quoteId` / `expiresAt`). */
export interface ConvertingPreview {
  fromCryptoCurrencyCode: string;
  toCryptoCurrencyCode: string;
  fromAmount: number;
  toAmount: number;
}

export interface ConvertingPreviewDataResponse {
  data: ConvertingPreview;
}
export interface ConvertingQuote {
  quoteId: string;
  fromCryptoCurrencyCode: string;
  toCryptoCurrencyCode: string;
  fromAmount: number;
  toAmount: number;
  expiresAt: string;
}

export interface ConvertingQuoteDataResponse {
  data: ConvertingQuote;
}

/** `POST /converting/commit` body. */
export interface CommitConvertingRequest {
  quoteId: string;
}

/** `POST /converting/commit` response `data`. */
export interface ConvertingCommitResult {
  quoteId: string;
  fromCryptoCurrencyCode: string;
  toCryptoCurrencyCode: string;
  fromAmount: number;
  toAmount: number;
  completedAt: string;
}

export interface ConvertingCommitDataResponse {
  data: ConvertingCommitResult;
}
