import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface SendMessageRequest {
  message: string;
  conversationId?: string;
  channel?: string;
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  text: string;
  timestamp: Date;
  intent?: string;
  confidence?: number;
  buttons?: Array<{
    title: string;
    payload: string;
  }>;
  quickReplies?: string[];
}

export interface SendMessageResponse {
  conversationId: string;
  userMessage: Message;
  botMessages: Message[];
  confidence: number;
}

export interface Conversation {
  _id: string;
  userId: string;
  tenantId: string;
  channel: string;
  status: string;
  startedAt: Date;
  endedAt?: Date;
  messages: Message[];
  currentIntent?: string;
  averageConfidence?: number;
  resolved: boolean;
  satisfaction?: number;
  messageCount: number;
}

export interface Analytics {
  totalConversations: number;
  activeConversations: number;
  resolvedConversations: number;
  resolutionRate: number;
  averageConfidence: number;
  averageSatisfaction: number;
}

export interface TopIntent {
  intent: string;
  count: number;
}

class RasaApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Envoie un message au chatbot
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const response = await axios.post<SendMessageResponse>(
        `${API_URL}/rasa/message`,
        request,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  }

  /**
   * Récupère une conversation par ID
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    try {
      const response = await axios.get<Conversation>(
        `${API_URL}/rasa/conversations/${conversationId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la conversation:', error);
      throw error;
    }
  }

  /**
   * Récupère la liste des conversations
   */
  async getConversations(params?: {
    page?: number;
    limit?: number;
    status?: string;
    channel?: string;
    userId?: string;
  }): Promise<{
    conversations: Conversation[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const response = await axios.get(`${API_URL}/rasa/conversations`, {
        headers: this.getAuthHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      throw error;
    }
  }

  /**
   * Met à jour une conversation
   */
  async updateConversation(
    conversationId: string,
    data: {
      status?: string;
      satisfaction?: number;
      satisfactionFeedback?: string;
      tags?: string[];
    }
  ): Promise<Conversation> {
    try {
      const response = await axios.patch<Conversation>(
        `${API_URL}/rasa/conversations/${conversationId}`,
        data,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la conversation:', error);
      throw error;
    }
  }

  /**
   * Clôture une conversation
   */
  async closeConversation(conversationId: string): Promise<Conversation> {
    try {
      const response = await axios.post<Conversation>(
        `${API_URL}/rasa/conversations/${conversationId}/close`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la clôture de la conversation:', error);
      throw error;
    }
  }

  /**
   * Récupère les analytics du chatbot
   */
  async getAnalytics(): Promise<Analytics> {
    try {
      const response = await axios.get<Analytics>(
        `${API_URL}/rasa/analytics`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics:', error);
      throw error;
    }
  }

  /**
   * Récupère les top intents
   */
  async getTopIntents(limit: number = 10): Promise<TopIntent[]> {
    try {
      const response = await axios.get<TopIntent[]>(
        `${API_URL}/rasa/analytics/intents`,
        {
          headers: this.getAuthHeaders(),
          params: { limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des top intents:', error);
      throw error;
    }
  }

  /**
   * Récupère la liste des intents disponibles
   */
  async getIntents(): Promise<string[]> {
    try {
      const response = await axios.get<string[]>(
        `${API_URL}/rasa/intents`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des intents:', error);
      throw error;
    }
  }

  /**
   * Entraîne le modèle Rasa
   */
  async trainModel(): Promise<any> {
    try {
      const response = await axios.post(
        `${API_URL}/rasa/train`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'entraînement du modèle:', error);
      throw error;
    }
  }

  /**
   * Health check du service Rasa
   */
  async healthCheck(): Promise<{ status: string; rasaConnected: boolean }> {
    try {
      const response = await axios.get(
        `${API_URL}/rasa/health`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors du health check:', error);
      throw error;
    }
  }
}

export const rasaApi = new RasaApi();
