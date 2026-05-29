const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';
const ML_API_KEY = import.meta.env.VITE_ML_API_KEY || 'dev-ml-api-key-12345';

const getTenantId = (): string => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.tenantId || 'default-tenant';
  }
  return 'default-tenant';
};

const getMLHeaders = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': ML_API_KEY,
});

export interface SalesForecast {
  tenant_id: string;
  predictions: Array<{
    date: string;
    value: number;
  }>;
  confidence_interval: {
    lower: number[];
    upper: number[];
  };
  metrics: {
    mape: number;
    trend: string;
  };
}

export interface PriceOptimization {
  product_id: string;
  current_price: number;
  optimal_price: number;
  expected_revenue_increase: number;
  expected_profit_increase: number;
  confidence: number;
}

export interface ProductRecommendation {
  recommendations: Array<{
    product_id: string;
    score: number;
    reason: string;
  }>;
  algorithm: string;
  confidence: number;
}

export interface ChurnPrediction {
  customer_id: string;
  churn_probability: number;
  risk_level: 'low' | 'medium' | 'high';
  factors: Array<{
    factor: string;
    impact: string;
    value: string;
  }>;
  recommendations: string[];
}

export interface InventoryOptimization {
  product_id: string;
  current_stock: number;
  recommended_order_quantity: number;
  reorder_point: number;
  safety_stock: number;
  days_until_stockout: number;
}

export interface AnomalyDetection {
  anomalies: Array<{
    index: number;
    value: number;
    z_score: number;
    deviation: number;
    timestamp?: string;
    severity: 'high' | 'medium';
  }>;
  total_points: number;
  anomaly_count: number;
  anomaly_percentage: number;
}

export const mlApi = {
  /**
   * Forecast future sales based on historical data
   */
  forecastSales: async (
    historicalData: Array<{ date: string; sales: number }>,
    days: number = 30
  ): Promise<SalesForecast> => {
    const response = await fetch(`${ML_API_URL}/forecast/sales`, {
      method: 'POST',
      headers: getMLHeaders(),
      body: JSON.stringify({
        tenant_id: getTenantId(),
        historical_data: historicalData,
        forecast_days: days,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ML Service error: ${error}`);
    }

    return response.json();
  },

  /**
   * Optimize product pricing for maximum profit
   */
  optimizePrice: async (
    productId: string,
    currentPrice: number,
    cost: number,
    competitorPrices: number[] = [],
    elasticity: number = -1.5
  ): Promise<PriceOptimization> => {
    const response = await fetch(`${ML_API_URL}/optimize/price`, {
      method: 'POST',
      headers: getMLHeaders(),
      body: JSON.stringify({
        tenant_id: getTenantId(),
        product_id: productId,
        current_price: currentPrice,
        cost,
        competitor_prices: competitorPrices,
        demand_elasticity: elasticity,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ML Service error: ${error}`);
    }

    return response.json();
  },

  /**
   * Get product recommendations
   */
  recommendProducts: async (
    userId?: string,
    productId?: string,
    nRecommendations: number = 10
  ): Promise<ProductRecommendation> => {
    const response = await fetch(`${ML_API_URL}/recommend/products`, {
      method: 'POST',
      headers: getMLHeaders(),
      body: JSON.stringify({
        tenant_id: getTenantId(),
        user_id: userId,
        product_id: productId,
        n_recommendations: nRecommendations,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ML Service error: ${error}`);
    }

    return response.json();
  },

  /**
   * Predict customer churn probability
   */
  predictChurn: async (
    customerId: string,
    features: {
      days_since_last_order: number;
      total_orders: number;
      avg_order_value: number;
    }
  ): Promise<ChurnPrediction> => {
    const response = await fetch(`${ML_API_URL}/predict/churn`, {
      method: 'POST',
      headers: getMLHeaders(),
      body: JSON.stringify({
        tenant_id: getTenantId(),
        customer_id: customerId,
        features,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ML Service error: ${error}`);
    }

    return response.json();
  },

  /**
   * Optimize inventory levels
   */
  optimizeInventory: async (
    productId: string,
    currentStock: number,
    dailySales: number[],
    leadTimeDays: number = 7
  ): Promise<InventoryOptimization> => {
    const response = await fetch(`${ML_API_URL}/optimize/inventory`, {
      method: 'POST',
      headers: getMLHeaders(),
      body: JSON.stringify({
        tenant_id: getTenantId(),
        product_id: productId,
        current_stock: currentStock,
        daily_sales: dailySales,
        lead_time_days: leadTimeDays,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ML Service error: ${error}`);
    }

    return response.json();
  },

  /**
   * Detect anomalies in data
   */
  detectAnomalies: async (
    data: Array<{ timestamp: string; value: number }>,
    sensitivity: number = 0.95
  ): Promise<AnomalyDetection> => {
    const response = await fetch(`${ML_API_URL}/detect/anomalies`, {
      method: 'POST',
      headers: getMLHeaders(),
      body: JSON.stringify({
        tenant_id: getTenantId(),
        data,
        sensitivity,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ML Service error: ${error}`);
    }

    return response.json();
  },

  /**
   * Health check for ML service
   */
  healthCheck: async (): Promise<{
    status: string;
    models_loaded: number;
    timestamp: string;
  }> => {
    const response = await fetch(`${ML_API_URL}/health`);

    if (!response.ok) {
      throw new Error('ML Service is not available');
    }

    return response.json();
  },

  /**
   * Get ML service info
   */
  getInfo: async (): Promise<{
    service: string;
    status: string;
    version: string;
    endpoints: string[];
  }> => {
    const response = await fetch(`${ML_API_URL}/`);

    if (!response.ok) {
      throw new Error('ML Service is not available');
    }

    return response.json();
  },
};
