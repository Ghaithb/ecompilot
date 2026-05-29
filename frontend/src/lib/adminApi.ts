import { api } from '@/lib/api';

export type AdminUser = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  status: 'active' | 'invited' | 'disabled';
  createdAt: string;
  lastLoginAt?: string;
  tenant?: { id: string; name: string; plan: string };
};

export type UsersListResponse = {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
};

const LS_KEY = 'admin_users_demo';

function seedLocal() {
  const existing = localStorage.getItem(LS_KEY);
  if (existing) return;
  const seed: AdminUser[] = [
    {
      _id: 'u1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      roles: ['admin'],
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      tenant: { id: 't1', name: 'Demo Tenant', plan: 'pro' },
    },
    {
      _id: 'u2',
      email: 'client@example.com',
      firstName: 'Client',
      lastName: 'User',
      roles: ['user'],
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      tenant: { id: 't1', name: 'Demo Tenant', plan: 'pro' },
    },
  ];
  localStorage.setItem(LS_KEY, JSON.stringify(seed));
}

function lsRead(): AdminUser[] {
  seedLocal();
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function lsWrite(users: AdminUser[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(users));
}

export const adminApi = {
  async listUsers(params: { page?: number; limit?: number; search?: string } = {}): Promise<UsersListResponse> {
    try {
      const res = await api.get('/admin/users', { params });
      return res.data as UsersListResponse;
    } catch (error: any) {
      // Fallback localStorage demo
      const all = lsRead();
      const search = (params.search || '').toLowerCase();
      const filtered = search
        ? all.filter(u =>
            u.email.toLowerCase().includes(search) ||
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(search)
          )
        : all;
      const page = params.page || 1;
      const limit = params.limit || 10;
      const start = (page - 1) * limit;
      const data = filtered.slice(start, start + limit);
      return { data, total: filtered.length, page, limit };
    }
  },

  async createUser(payload: Omit<AdminUser, '_id' | 'createdAt' | 'lastLoginAt'>): Promise<AdminUser> {
    try {
      const res = await api.post('/admin/users', payload);
      return res.data as AdminUser;
    } catch (error: any) {
      const all = lsRead();
      const user: AdminUser = {
        _id: `u_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...payload,
      };
      all.unshift(user);
      lsWrite(all);
      return user;
    }
  },

  async updateUser(id: string, payload: Partial<AdminUser>): Promise<AdminUser> {
    try {
      const res = await api.patch(`/admin/users/${id}`, payload);
      return res.data as AdminUser;
    } catch (error: any) {
      const all = lsRead();
      const idx = all.findIndex(u => u._id === id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...payload } as AdminUser;
        lsWrite(all);
        return all[idx];
      }
      throw error;
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/admin/users/${id}`);
    } catch (error: any) {
      const all = lsRead().filter(u => u._id !== id);
      lsWrite(all);
    }
  },
};
