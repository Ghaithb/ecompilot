/** Central API base URL — always use VITE_API_URL, never hardcode localhost. */
const raw = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1').replace(/\/$/, '');

export const API_BASE_URL = raw;
export const API_ORIGIN = raw.replace(/\/api\/v\d+$/, '');

/** Build a full API path, e.g. apiUrl('/website') → …/api/v1/website */
export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (p.startsWith('/api/v1')) return `${API_ORIGIN}${p}`;
  return `${API_BASE_URL}${p}`;
}

/** Resolve a relative upload path to an absolute URL. */
export function resolveUploadUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getAuthHeaders(extra?: Record<string, string>): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}
