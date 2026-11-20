/** Shared, typed API error so callers can use `instanceof ApiError` with any backend. */
export class ApiError extends Error {
  constructor(message, code = 'bad_request') {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}
