import type { CryptonlyContext } from '../client/context';
import { buildMerchantRequestFields } from '../http/merchant-request-options';
import { merchantRequest } from '../http/transport';
import type {
  CommitConvertingRequest,
  ConvertingCommitDataResponse,
  ConvertingCommitResult,
  ConvertingPreview,
  ConvertingPreviewDataResponse,
  ConvertingQuote,
  ConvertingQuoteDataResponse,
  ConvertingQuoteRequest,
} from '../types/converting';

export class ConvertingClient {
  constructor(private readonly ctx: CryptonlyContext) {}

  private transportOpts() {
    return buildMerchantRequestFields(this.ctx);
  }

  private route(suffix: string): string {
    return `/converting${suffix}`;
  }

  /**
   * `POST /converting/quote` - returns a short-lived `quoteId` and locked amounts.
   */
  async quote(body: ConvertingQuoteRequest): Promise<ConvertingQuote> {
    const json = await merchantRequest<ConvertingQuoteDataResponse>({
      method: 'POST',
      path: this.route('/quote'),
      body,
      ...this.transportOpts(),
    });
    if (json == null || json.data == null) {
      throw new TypeError('converting.quote: response missing `data`');
    }
    return json.data;
  }

  /**
   * `POST /converting/preview` - same FX as `quote` without storing a quote (for UI sync).
   */
  async preview(body: ConvertingQuoteRequest): Promise<ConvertingPreview> {
    const json = await merchantRequest<ConvertingPreviewDataResponse>({
      method: 'POST',
      path: this.route('/preview'),
      body,
      ...this.transportOpts(),
    });
    if (json == null || json.data == null) {
      throw new TypeError('converting.preview: response missing `data`');
    }
    return json.data;
  }

  /**
   * `POST /converting/commit` - applies the virtual conversion for `quoteId`.
   */
  async commit(body: CommitConvertingRequest): Promise<ConvertingCommitResult> {
    const json = await merchantRequest<ConvertingCommitDataResponse>({
      method: 'POST',
      path: this.route('/commit'),
      body,
      ...this.transportOpts(),
    });
    if (json == null || json.data == null) {
      throw new TypeError('converting.commit: response missing `data`');
    }
    return json.data;
  }
}
