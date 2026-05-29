import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface SendMessageData {
  to: string;
  message: string;
  type?: 'text' | 'template' | 'image' | 'document';
}

export interface SendTemplateData {
  to: string;
  templateName: string;
  params?: Record<string, string>;
}

export interface OrderNotificationData {
  to: string;
  orderNumber: string;
  amount: string;
  customerName: string;
  link?: string;
}

export interface WhatsAppMessage {
  _id: string;
  to: string;
  from: string;
  message: string;
  type: string;
  status: string;
  direction: 'outbound' | 'inbound';
  createdAt: string;
  sentAt: string;
}

export interface WhatsAppStatistics {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  successRate: number;
  byType: Record<string, number>;
}

class WhatsAppService {
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

  async sendMessage(data: SendMessageData) {
    const response = await axios.post(
      `${API_URL}/api/v1/whatsapp/send-message`,
      data,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async sendTemplate(data: SendTemplateData) {
    const response = await axios.post(
      `${API_URL}/api/v1/whatsapp/send-template`,
      data,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async sendOrderNotification(data: OrderNotificationData) {
    const response = await axios.post(
      `${API_URL}/api/v1/whatsapp/notifications/order`,
      data,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async sendLowStockAlert(to: string, productName: string, stock: number) {
    const response = await axios.post(
      `${API_URL}/api/v1/whatsapp/notifications/low-stock`,
      { to, productName, stock },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getMessages(limit: number = 50, skip: number = 0): Promise<WhatsAppMessage[]> {
    const response = await axios.get(
      `${API_URL}/api/v1/whatsapp/messages`,
      {
        params: { limit, skip },
        headers: this.getHeaders(),
      }
    );
    return response.data;
  }

  async getMessagesByPhone(phoneNumber: string, limit: number = 50): Promise<WhatsAppMessage[]> {
    const response = await axios.get(
      `${API_URL}/api/v1/whatsapp/messages/${phoneNumber}`,
      {
        params: { limit },
        headers: this.getHeaders(),
      }
    );
    return response.data;
  }

  async getStatistics(startDate?: string, endDate?: string): Promise<WhatsAppStatistics> {
    const response = await axios.get(
      `${API_URL}/api/v1/whatsapp/statistics`,
      {
        params: { startDate, endDate },
        headers: this.getHeaders(),
      }
    );
    return response.data;
  }

  async checkConfiguration() {
    const response = await axios.get(
      `${API_URL}/api/v1/whatsapp/configuration`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getChatWidgetUrl(message?: string) {
    const response = await axios.get(
      `${API_URL}/api/v1/whatsapp/chat-widget-url`,
      {
        params: { message },
        headers: this.getHeaders(),
      }
    );
    return response.data;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      sent: 'text-blue-600',
      delivered: 'text-green-600',
      read: 'text-green-700',
      failed: 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      sent: 'Envoyé',
      delivered: 'Délivré',
      read: 'Lu',
      failed: 'Échec',
    };
    return labels[status] || status;
  }

  formatPhoneNumber(phone: string): string {
    // Format: +225 07 09 87 65 43
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)} ${cleaned.slice(11)}`.trim();
    }
    return phone;
  }
}

export const whatsappService = new WhatsAppService();
