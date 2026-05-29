import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface MobileMoneyProvider {
  id: string;
  name: string;
  countries: string[];
  logo?: string;
}

export interface CreatePaymentData {
  amount: number;
  currency: string;
  description: string;
  phoneNumber: string;
  provider: string;
  customerName?: string;
  customerEmail?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl: string;
  transactionId: string;
  provider: string;
  amount: number;
  currency: string;
}

export interface PaymentStatus {
  transactionId: string;
  status: 'pending' | 'accepted' | 'refused' | 'processing';
  amount: number;
  currency: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

class PaymentService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async createMobileMoneyPayment(data: CreatePaymentData): Promise<PaymentResponse> {
    const response = await axios.post(
      `${API_URL}/api/v1/payment/mobile-money/create`,
      data,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    const response = await axios.get(
      `${API_URL}/api/v1/payment/mobile-money/status/${transactionId}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getAvailableProviders(country: string): Promise<MobileMoneyProvider[]> {
    const response = await axios.get(
      `${API_URL}/api/v1/payment/mobile-money/providers/${country}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // Helpers
  formatPhoneNumber(phone: string, countryCode: string = '225'): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if missing
    if (!cleaned.startsWith('+')) {
      if (!cleaned.startsWith(countryCode)) {
        cleaned = `+${countryCode}${cleaned}`;
      } else {
        cleaned = `+${cleaned}`;
      }
    }
    
    return cleaned;
  }

  getProviderName(providerId: string): string {
    const providers: Record<string, string> = {
      orange_money: 'Orange Money',
      mtn_momo: 'MTN Mobile Money',
      moov_money: 'Moov Money',
      wave: 'Wave',
      airtel_money: 'Airtel Money',
    };
    return providers[providerId] || providerId;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      accepted: 'Accepté',
      refused: 'Refusé',
      processing: 'En cours',
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'text-yellow-600',
      accepted: 'text-green-600',
      refused: 'text-red-600',
      processing: 'text-blue-600',
    };
    return colors[status] || 'text-gray-600';
  }
}

export const paymentService = new PaymentService();
