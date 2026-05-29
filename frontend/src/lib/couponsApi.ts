import { api } from '@/lib/api';

export interface Coupon {
  _id: string;
  tenantId: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validFrom?: Date;
  validUntil?: Date;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  usageLimitPerCustomer?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  status: 'active' | 'inactive' | 'expired';
  metadata?: Record<string, any>;
  usageHistory: Array<{
    customerId?: string;
    customerEmail: string;
    orderId: string;
    discountAmount: number;
    usedAt: Date;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalUsage: number;
  totalDiscountGiven: number;
  topCoupons: Array<{
    code: string;
    description: string;
    usedCount: number;
    totalDiscount: number;
  }>;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  message?: string;
}

export const couponsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ coupons: Coupon[]; total: number; page: number; limit: number }> => {
    const response = await api.get('/coupons', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Coupon> => {
    const response = await api.get(`/coupons/${id}`);
    return response.data;
  },

  create: async (data: Omit<Coupon, '_id' | 'tenantId' | 'usedCount' | 'usageHistory' | 'createdAt' | 'updatedAt'>): Promise<Coupon> => {
    const response = await api.post('/coupons', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Omit<Coupon, '_id' | 'tenantId' | 'code' | 'usedCount' | 'usageHistory' | 'createdAt' | 'updatedAt'>>): Promise<Coupon> => {
    const response = await api.patch(`/coupons/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },

  validate: async (data: {
    code: string;
    orderAmount: number;
    customerEmail?: string;
    productIds?: string[];
  }): Promise<ValidateCouponResponse> => {
    const response = await api.post('/coupons/validate', data);
    return response.data;
  },

  getStats: async (): Promise<CouponStats> => {
    const response = await api.get('/coupons/stats');
    return response.data;
  },
};
