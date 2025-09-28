/** Central error taxonomy for domain & infra.
 * Categories:
 *  - ValidationError: user/content input invalid but recoverable.
 *  - NotFoundError: entity lookup failed.
 *  - ConflictError: optimistic concurrency / invariant violated.
 *  - SecurityError: authz/authn breach attempt.
 *  - RateLimitError: throttling triggered.
 *  - ExternalServiceError: upstream model/API failure (retryable maybe).
 *  - InternalError: unexpected bug (non-retry unless idempotent path).
 */

export abstract class BaseAppError extends Error {
  readonly code: string;
  readonly causeErr?: unknown;
  readonly retriable: boolean;
  readonly status?: number;
  constructor(code: string, message: string, opts: { cause?: unknown; retriable?: boolean; status?: number } = {}) {
    super(message);
    this.code = code;
    this.causeErr = opts.cause;
    this.retriable = !!opts.retriable;
    this.status = opts.status;
  }
}

export class ValidationError extends BaseAppError {
  constructor(message: string, cause?: unknown) { super('VALIDATION', message, { cause, retriable: false, status: 400 }); }
}
export class NotFoundError extends BaseAppError {
  constructor(message: string) { super('NOT_FOUND', message, { retriable: false, status: 404 }); }
}
export class ConflictError extends BaseAppError {
  constructor(message: string) { super('CONFLICT', message, { retriable: false, status: 409 }); }
}
export class SecurityError extends BaseAppError {
  constructor(message: string) { super('SECURITY', message, { retriable: false, status: 403 }); }
}
export class RateLimitError extends BaseAppError {
  constructor(message: string) { super('RATE_LIMIT', message, { retriable: true, status: 429 }); }
}
export class ExternalServiceError extends BaseAppError {
  constructor(message: string, cause?: unknown, retriable = true) { super('EXTERNAL', message, { cause, retriable, status: 502 }); }
}
export class InternalError extends BaseAppError {
  constructor(message: string, cause?: unknown) { super('INTERNAL', message, { cause, retriable: false, status: 500 }); }
}

export function mapUnknownError(e: unknown): BaseAppError {
  if (e instanceof BaseAppError) return e;
  const msg = (e as any)?.message || 'Unknown error';
  return new InternalError(msg, e);
}

export function errorResponse(err: unknown) {
  const e = mapUnknownError(err);
  return {
    ok: false,
    error: { code: e.code, message: e.message, retriable: e.retriable },
  };
}
