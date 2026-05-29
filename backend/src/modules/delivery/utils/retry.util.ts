export type RetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
};

const DEFAULT_RETRYABLE = [408, 429, 500, 502, 503, 504];

function isRetryableError(error: unknown): boolean {
  const status = (error as { response?: { status?: number }; status?: number })?.response?.status
    ?? (error as { status?: number })?.status;
  if (status && DEFAULT_RETRYABLE.includes(status)) return true;
  const code = (error as { code?: string })?.code;
  return code === 'ECONNRESET' || code === 'ETIMEDOUT' || code === 'ENOTFOUND';
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry exponentiel avec jitter — usage providers HTTP.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 400;
  const maxDelayMs = options.maxDelayMs ?? 8000;
  const shouldRetry = options.shouldRetry ?? ((err) => isRetryableError(err));

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts || !shouldRetry(error, attempt)) {
        throw error;
      }
      const exp = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      const jitter = Math.floor(Math.random() * 120);
      await delay(exp + jitter);
    }
  }
  throw lastError;
}
