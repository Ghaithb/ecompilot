import { api } from '@/lib/api';

export interface Review {
  _id: string;
  product: { _id: string; title: string };
  customer: { name: string; email: string };
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  createdAt: string;
}

export interface ReviewsStats {
  total: number;
  averageRating: number;
  byRating: { [key: number]: number };
  pending: number;
  approved: number;
  rejected: number;
}

export const reviewsApi = {
  getAll: async (params?: { status?: string; productId?: string }) => {
    const response = await api.get<{ reviews: Review[]; total: number }>('/reviews', { params });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<ReviewsStats>('/reviews/stats');
    return response.data;
  },

  approve: async (id: string) => {
    const response = await api.patch(`/reviews/${id}/approve`);
    return response.data;
  },

  reject: async (id: string) => {
    const response = await api.patch(`/reviews/${id}/reject`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};
