/**
 * `page` / `limit` query parameters for list endpoints. Defaults and caps
 * are applied on the server.
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

/**
 * Paginated list: items in `data`, with row count and current window metadata.
 */
export interface PaginatedList<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
