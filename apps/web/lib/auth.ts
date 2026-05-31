export const AUTH_COOKIE = 'auth_token';
export const AUTH_STORAGE_KEY = 'auth_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEY, token);
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
}

export type AuthUser = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
};

export async function loginRequest(email: string, password: string): Promise<{ access_token: string; user?: AuthUser }> {
  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Connexion échouée');
  }
  return res.json();
}

export async function logoutRequest(): Promise<void> {
  try {
    await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {
    /* ignore */
  }
  clearAuthToken();
}
