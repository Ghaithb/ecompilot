import { api } from '@/lib/api';

export interface Customer {
  _id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  defaultAddress?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string;
  };
  addresses?: Array<{
    id?: string;
    label?: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string;
    isDefault?: boolean;
  }>;
  tags?: string[];
  status: 'active' | 'inactive' | 'blocked';
  stats: {
    totalOrders?: number;
    totalSpent?: number;
    averageOrderValue?: number;
    lastOrderAt?: Date;
    firstOrderAt?: Date;
  };
  metadata?: Record<string, any>;
  acceptsMarketing: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  topCustomers: Array<{
    id: string;
    name: string;
    email: string;
    totalSpent: number;
    totalOrders: number;
  }>;
}

export const customersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    tags?: string;
  }): Promise<{ customers: Customer[]; total: number; page: number; limit: number }> => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (data: Omit<Customer, '_id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<Customer> => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Omit<Customer, '_id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  getOrders: async (
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ orders: any[]; total: number; page: number; limit: number }> => {
    const response = await api.get(`/customers/${id}/orders`, { params });
    return response.data;
  },

  getStats: async (): Promise<CustomerStats> => {
    const response = await api.get('/customers/stats');
    return response.data;
  },
};
