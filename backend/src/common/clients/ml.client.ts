import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MlClient {
  private readonly logger = new Logger(MlClient.name);
  private baseUrl: string;
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('ML_SERVICE_URL') || 'http://localhost:8000';
    this.apiKey = this.configService.get<string>('ML_API_KEY') || 'dev-ml-api-key-12345';
    this.logger.log(`ML Service configured at: ${this.baseUrl}`);
  }

  async makeRequest(endpoint: string, payload: any) {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(`ML Service error (${res.status}): ${error}`);
      }

      return res.json();
    } catch (error: any) {
      this.logger.error(`ML Service request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Forecast future sales based on historical data
   */
  async forecastSales(tenantId: string, historicalData: Array<{ date: string; sales: number }>, days: number = 30) {
    this.logger.log(`Forecasting sales for tenant ${tenantId}, ${days} days`);
    
    return this.makeRequest('/forecast/sales', {
      tenant_id: tenantId,
      historical_data: historicalData,
      forecast_days: days,
    });
  }

  /**
   * Optimize product pricing
   */
  async optimizePrice(
    tenantId: string,
    productId: string,
    currentPrice: number,
    cost: number,
    competitorPrices: number[] = [],
    elasticity: number = -1.5
  ) {
    this.logger.log(`Optimizing price for product ${productId}`);
    
    return this.makeRequest('/optimize/price', {
      tenant_id: tenantId,
      product_id: productId,
      current_price: currentPrice,
      cost,
      competitor_prices: competitorPrices,
      demand_elasticity: elasticity,
    });
  }

  /**
   * Get product recommendations
   */
  async recommendProducts(
    tenantId: string,
    userId?: string,
    productId?: string,
    nRecommendations: number = 10
  ) {
    this.logger.log(`Getting recommendations for tenant ${tenantId}`);
    
    return this.makeRequest('/recommend/products', {
      tenant_id: tenantId,
      user_id: userId,
      product_id: productId,
      n_recommendations: nRecommendations,
    });
  }

  /**
   * Predict customer churn
   */
  async predictChurn(tenantId: string, customerId: string, features: any) {
    this.logger.log(`Predicting churn for customer ${customerId}`);
    
    return this.makeRequest('/predict/churn', {
      tenant_id: tenantId,
      customer_id: customerId,
      features,
    });
  }

  /**
   * Optimize inventory levels
   */
  async optimizeInventory(
    tenantId: string,
    productId: string,
    currentStock: number,
    dailySales: number[],
    leadTimeDays: number = 7
  ) {
    this.logger.log(`Optimizing inventory for product ${productId}`);
    
    return this.makeRequest('/optimize/inventory', {
      tenant_id: tenantId,
      product_id: productId,
      current_stock: currentStock,
      daily_sales: dailySales,
      lead_time_days: leadTimeDays,
    });
  }

  /**
   * Detect anomalies in data
   */
  async detectAnomalies(tenantId: string, data: Array<{ timestamp: string; value: number }>, sensitivity: number = 0.95) {
    this.logger.log(`Detecting anomalies for tenant ${tenantId}`);
    
    return this.makeRequest('/detect/anomalies', {
      tenant_id: tenantId,
      data,
      sensitivity,
    });
  }

  /**
   * Health check for ML service
   */
  async healthCheck() {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }
}
