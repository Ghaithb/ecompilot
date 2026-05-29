import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface AbandonedCart {
  _id: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  totalAmount: number;
  recovered: boolean;
  recoveredAt?: Date;
  recoveryChannel?: string;
  remindersSent: number;
  lastReminderAt?: Date;
  reminderDates?: Date[];
  channelAttempts?: Array<{
    channel: string;
    attemptedAt: Date;
    success: boolean;
    errorMessage?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AbandonedCartStats {
  total: number;
  recovered: number;
  pending: number;
  pendingRelance?: number;
  recoveryRate: string | number;
  revenueLost: number;
  revenueRecovered: number;
}

function authHeaders() {
  const token = localStorage.getItem('auth_token');
  return { Authorization: `Bearer ${token}` };
}

export const abandonedCartApi = {
  async getAll(): Promise<{ carts: AbandonedCart[]; count: number }> {
    const response = await axios.get(`${API_URL}/abandoned-cart`, { headers: authHeaders() });
    return response.data;
  },

  async getStats(): Promise<AbandonedCartStats> {
    const response = await axios.get(`${API_URL}/abandoned-cart/stats`, { headers: authHeaders() });
    return response.data;
  },

  async sendReminder(id: string): Promise<void> {
    await axios.post(`${API_URL}/abandoned-cart/${id}/send-reminder`, {}, { headers: authHeaders() });
  },

  async startRecoverySequence(id: string): Promise<void> {
    await axios.post(`${API_URL}/abandoned-cart-recovery/${id}/start`, {}, { headers: authHeaders() });
  },

  async sendWhatsApp(id: string): Promise<void> {
    await axios.post(`${API_URL}/abandoned-cart-recovery/${id}/send-whatsapp`, {}, { headers: authHeaders() });
  },

  async markAsRecovered(id: string): Promise<void> {
    await axios.post(`${API_URL}/abandoned-cart-recovery/${id}/mark-recovered`, {}, { headers: authHeaders() });
  },

  async getRecoveryStats() {
    const response = await axios.get(`${API_URL}/abandoned-cart-recovery/stats`, { headers: authHeaders() });
    return response.data;
  },
};
