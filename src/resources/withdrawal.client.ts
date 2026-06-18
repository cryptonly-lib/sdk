import type { CryptonlyContext } from '../client/context';
import { assertWithdrawalLookupQuery } from '../helpers/merchant-query';
import { buildMerchantRequestFields } from '../http/merchant-request-options';
import { merchantRequest } from '../http/transport';
import type {
  CommitWithdrawalRequest,
  GetWithdrawalQuery,
  GetWithdrawalsQuery,
  Withdrawal,
  WithdrawalDataResponse,
  WithdrawalListResponse,
  WithdrawalQuote,
  WithdrawalQuoteDataResponse,
  WithdrawalQuoteRequest,
} from '../types/withdrawal';

export class WithdrawalClient {
  constructor(private readonly ctx: CryptonlyContext) {}

  private transportOpts() {
    return buildMerchantRequestFields(this.ctx);
  }

  private route(suffix: string): string {
    return `/withdrawal${suffix}`;
  }

  /**
   * `POST /withdrawal/quote` - stage 1 of the two-step flow.
   *
   * Returns a fee breakdown plus a short-lived `quoteId`. Submit the
   * `quoteId` to `POST /withdrawal/commit` to actually create the withdrawal.
   * The quote does NOT reserve any balance and expires after a short
   * TTL (`expiresAt`).
   */
  async quote(body: WithdrawalQuoteRequest): Promise<WithdrawalQuote> {
    const json = await merchantRequest<WithdrawalQuoteDataResponse>({
      method: 'POST',
      path: this.route('/quote'),
      body,
      ...this.transportOpts(),
    });
    if (json == null || json.data == null) {
      throw new TypeError('withdrawal.quote: response missing `data`');
    }
    return json.data;
  }

  /**
   * `POST /withdrawal/commit` - stage 2 of the two-step flow.
   *
   * Commits a previously-obtained `quoteId` and creates the
   * withdrawal. The chosen deduction currency and total deduction were
   * locked at quote time, so commit just locks that single balance,
   * verifies it still covers the locked amount, and deducts inside a
   * serializable transaction. If the locked currency's balance has
   * dropped below the locked amount, commit returns
   * `withdrawal.insufficientBalance` and the merchant must re-quote -
   * commit does not retry against other currencies.
   */
  async commit(body: CommitWithdrawalRequest): Promise<Withdrawal> {
    const json = await merchantRequest<WithdrawalDataResponse>({
      method: 'POST',
      path: this.route('/commit'),
      body,
      ...this.transportOpts(),
    });
    if (json == null || json.data == null) {
      throw new TypeError('withdrawal.commit: response missing `data`');
    }
    return json.data;
  }

  /**
   * `GET /withdrawal/list` - paginated withdrawals.
   */
  async list(q: GetWithdrawalsQuery): Promise<WithdrawalListResponse> {
    const { accountId, status, page, limit } = q;
    const json = await merchantRequest<WithdrawalListResponse>({
      method: 'GET',
      path: this.route('/list'),
      query: { accountId, status, page, limit },
      ...this.transportOpts(),
    });
    if (json == null || !Array.isArray(json.data)) {
      throw new TypeError('withdrawal.list: response missing `data` array');
    }
    return json;
  }

  /**
   * `GET /withdrawal` - a single withdrawal by `id` or
   * `orderId` (and `accountId`).
   */
  async get(q: GetWithdrawalQuery): Promise<Withdrawal> {
    assertWithdrawalLookupQuery(q);
    const { accountId, id, orderId } = q;
    const json = await merchantRequest<WithdrawalDataResponse>({
      method: 'GET',
      path: this.route(''),
      query: { accountId, id, orderId },
      ...this.transportOpts(),
    });
    if (json == null || json.data == null) {
      throw new TypeError('withdrawal.get: response missing `data`');
    }
    return json.data;
  }
}
