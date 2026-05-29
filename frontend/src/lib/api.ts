import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies for refresh token
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 and attempt refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        // Call refresh endpoint (cookie-based)
        const res = await api.post('/auth/refresh-token');
        const newToken = res.data.access_token;
        localStorage.setItem('auth_token', newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

const authApi = {
  async login(email: string, password: string) {
    console.log('🔑 Tentative de connexion pour:', email);
    try {
      console.log('📡 Envoi requête vers:', API_BASE_URL + '/auth/login');
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ Connexion réussie');
      // Persist access token if returned
      if (response?.data?.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error.response?.data || error.message);
      throw error;
    }
  },

  async register(userData: any) {
    const response = await api.post('/auth/register', userData);
    if (response?.data?.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
    }
    return response.data;
  },

  async profile() {
    const response = await api.get('/auth/profile');
    // Backend returns { message, user } — return only the user for consumers
    return response.data.user ?? response.data;
  },

  async refreshToken() {
    // Use cookie-based refresh endpoint
    const response = await api.post('/auth/refresh-token');
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore network/backend logout errors, still clear client state
    }
    localStorage.removeItem('auth_token');
  },

  async updateProfile(data: { email?: string; firstName?: string; lastName?: string; companyName?: string }) {
    const response = await api.post('/auth/profile/update', data);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.post('/auth/profile/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  async updatePreferences(preferences: { emailNotifications?: boolean; pushNotifications?: boolean; darkMode?: boolean; language?: string }) {
    const response = await api.post('/auth/profile/preferences', preferences);
    return response.data;
  },

  async updateAvatar(avatarUrl: string) {
    const response = await api.post('/auth/profile/avatar', { avatarUrl });
    return response.data;
  },

  async requestEmailVerification() {
    const response = await api.post('/auth/email/request-verification');
    return response.data;
  },

  async verifyEmailCode(code: string) {
    const response = await api.post('/auth/email/verify-code', { code });
    return response.data;
  }
};

const productsApi = {
  create: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  importCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as { success: boolean; created: number; errors: Array<{ line: number; error: string }> };
  },

  importFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as { success: boolean; created: number; errors: Array<{ line: number; error: string }> };
  },

  getAll: async () => {
    const response = await api.get('/products');
    // Backend returns { products, total, page, limit }
    return Array.isArray(response.data) ? response.data : (response.data?.products ?? []);
  },

  getById: async (productId: string) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  getTags: async () => {
    const response = await api.get('/products/tags');
    return response.data;
  },
  addCategory: async (category: string) => {
    const response = await api.post('/products/categories', { name: category });
    return response.data;
  },
  addTag: async (tag: string) => {
    const response = await api.post('/products/tags', { name: tag });
    return response.data;
  },

  update: async (productId: string, productData: any) => {
    const response = await api.patch(`/products/${productId}`, productData);
    return response.data;
  },

  delete: async (productId: string) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  }
};

const ordersApi = {
  create: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getById: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  update: async (orderId: string, orderData: any) => {
    const response = await api.patch(`/orders/${orderId}`, orderData);
    return response.data;
  },

  updateStatus: async ({ orderId, status, paymentStatus }: { orderId: string; status?: string; paymentStatus?: string }) => {
    const response = await api.patch(`/orders/${orderId}/status`, { status, paymentStatus });
    return response.data;
  },

  delete: async (orderId: string) => {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  }
};

const aiApi = {
  chat: async (chatData: any) => {
    // Delegate to chatWithCopilot for single source of truth
    return aiApi.chatWithCopilot(chatData?.message ?? chatData?.text ?? '', chatData?.context);
  },

  generateProductContent: async (contentData: any) => {
    const response = await api.post('/ai/content/product', contentData);
    return response.data;
  },

  chatWithCopilot: async (message: string, context?: any) => {
    const response = await api.post('/ai/copilot/chat', { message, context });
    return response.data;
  },

  getDashboardInsights: async () => {
    const response = await api.get('/ai/dashboard/insights');
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get('/ai/recommendations');
    return response.data;
  },

  getSalesForecasts: async (period = '30d') => {
    const response = await api.get(`/ai/forecasts/sales?period=${period}`);
    return response.data;
  },

  getFinancialAnalysis: async () => {
    const response = await api.get('/ai/analytics/financial');
    return response.data;
  },

  getInventoryAnalysis: async () => {
    const response = await api.get('/ai/inventory/analysis');
    return response.data;
  },

  getSecurityAnomalies: async () => {
    const response = await api.get('/ai/security/anomalies');
    return response.data;
  },

  optimizePricing: async (productId: string, pricingData: any) => {
    const response = await api.post(`/ai/pricing/optimize/${productId}`, pricingData);
    return response.data;
  },

  generateMarketingStrategy: async (strategyData: any) => {
    const response = await api.post('/ai/marketing/strategy', strategyData);
    return response.data;
  },

  getMlRecommendations: async (userKey?: string) => {
    const q = userKey ? `?userKey=${encodeURIComponent(userKey)}` : '';
    const response = await api.get(`/ai/recommendations/ml${q}`);
    return response.data;
  }
};

// Export the base API instance and all APIs
export {
  api,
  authApi,
  productsApi,
  ordersApi,
  aiApi
};
