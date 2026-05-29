const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export interface Budget {
  _id: string;
  tenantId: string;
  name: string;
  campaignId?: string;
  platform: 'google_ads' | 'meta_ads' | 'tiktok_ads' | 'linkedin_ads' | 'twitter_ads' | 'other';
  totalBudget: number;
  spent: number;
  remaining: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'completed' | 'exceeded';
  alertThreshold: number;
  metrics?: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    ctr?: number;
    cpc?: number;
    cpa?: number;
    roas?: number;
  };
  alertsSent: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetRecommendation {
  budgetId: string;
  budgetName: string;
  type: 'increase_spending' | 'reduce_spending' | 'increase_budget' | 'pause_or_optimize';
  priority: 'high' | 'medium' | 'low';
  message: string;
  suggestedDailyBudget?: string;
  currentDailySpend?: string;
  currentROAS?: number;
}

export const budgetsApi = {
  /**
   * Get all budgets with optional filters
   */
  getAll: async (filters?: { status?: string; platform?: string }): Promise<Budget[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.platform) params.append('platform', filters.platform);
    
    const url = params.toString() ? `${API_URL}/budgets?${params}` : `${API_URL}/budgets`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch budgets');
    }
    
    return response.json();
  },

  /**
   * Create a new budget
   */
  create: async (budgetData: Partial<Budget>): Promise<Budget> => {
    const response = await fetch(`${API_URL}/budgets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(budgetData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create budget');
    }
    
    return response.json();
  },

  /**
   * Get budget by ID
   */
  getById: async (id: string): Promise<Budget> => {
    const response = await fetch(`${API_URL}/budgets/${id}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch budget');
    }
    
    return response.json();
  },

  /**
   * Update budget
   */
  update: async (id: string, data: Partial<Budget>): Promise<Budget> => {
    const response = await fetch(`${API_URL}/budgets/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update budget');
    }
    
    return response.json();
  },

  /**
   * Delete budget
   */
  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete budget');
    }
    
    return response.json();
  },

  /**
   * Record spending on a budget
   */
  recordSpending: async (id: string, amount: number, metrics?: any): Promise<Budget> => {
    const response = await fetch(`${API_URL}/budgets/${id}/spending`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, metrics }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to record spending');
    }
    
    return response.json();
  },

  /**
   * Get AI recommendations for budget optimization
   */
  getRecommendations: async (): Promise<{
    totalBudgets: number;
    recommendations: BudgetRecommendation[];
    summary: {
      totalAllocated: number;
      totalSpent: number;
      totalRemaining: number;
    };
  }> => {
    const response = await fetch(`${API_URL}/budgets/recommendations`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch recommendations');
    }
    
    return response.json();
  },

  /**
   * Simulate budget reallocation
   */
  simulateReallocation: async (plan: {
    fromBudgetId: string;
    toBudgetId: string;
    amount: number;
  }): Promise<any> => {
    const response = await fetch(`${API_URL}/budgets/simulate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(plan),
    });
    
    if (!response.ok) {
      throw new Error('Failed to simulate reallocation');
    }
    
    return response.json();
  },
};
