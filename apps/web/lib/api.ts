import { getAuthToken } from './auth';

const SERVER_API =
  (process.env.NEST_API_URL || 'http://127.0.0.1:3001') + '/api/v1';

/** Browser uses Next rewrite; server actions use direct Nest URL. */
export function getApiBase(): string {
  if (typeof window !== 'undefined') return '/api/v1';
  return process.env.NEXT_PUBLIC_API_URL || SERVER_API;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { token?: string | null },
): Promise<T> {
  const token = init?.token ?? (typeof window !== 'undefined' ? getAuthToken() : null);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers || {}),
  };

  const res = await fetch(`${getApiBase()}${path}`, {
    ...init,
    headers,
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(body || `API ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export { SERVER_API as API_BASE };
