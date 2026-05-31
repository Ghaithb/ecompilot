'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEST_API_URL || 'http://127.0.0.1:3001';

/** Server Action — toggle recovery discount (Phase 4 pattern). */
export async function updateRecoveryDiscount(enabled: boolean, maxPercent = 10) {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) throw new Error('Non authentifié');

  const res = await fetch(`${API_BASE}/api/v1/conversion/recovery-config`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ discountEnabled: enabled, maxDiscountPercent: maxPercent }),
  });

  if (!res.ok) throw new Error('Échec mise à jour');
  revalidatePath('/dashboard');
  return res.json();
}
