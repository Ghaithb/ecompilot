import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { PipelineStage } from 'mongoose';

export interface TopProductMetric {
  productId: string;
  title: string;
  quantitySold: number;
  revenue: number;
  salesPercentage: number;
  revenuePercentage: number;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  topSellingProducts: TopProductMetric[];
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    orders: number;
  }>;
  customerMetrics: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    averageCustomerValue: number;
  };
  salesByCategory: Array<{
    category: string;
    revenue: number;
    orders: number;
    percentage: number;
  }>;
}

export interface CodDeliveryMetrics {
  totalCodOrders: number;
  totalItems: number;
  verifiedOrders: number;
  pendingVerification: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  inProgress: number;
  deliverySuccessRate: number;
  deliveryFailureRate: number;
  codRevenue: number;
  codRevenueCollected: number;
  codRevenuePending: number;
  averageItemsPerOrder: number;
  otpVerificationRate: number;
}

export interface ProductAnalytics {
  totalArticlesSold: number;
  uniqueProductsSold: number;
  winningProduct: TopProductMetric | null;
  products: TopProductMetric[];
}

export interface OrderFunnel {
  totalOrders: number;
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  codOrders: number;
  onlinePaidOrders: number;
  conversionToDelivered: number;
  conversionToConfirmed: number;
}

export interface InventoryMetrics {
  totalProducts: number;
  totalVariants: number;
  totalInventoryValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  turnoverRate: number;
  topCategories: Array<{
    category: string;
    products: number;
    revenue: number;
  }>;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /** Commandes comptabilisées en CA : payées en ligne ou COD livré */
  private buildRevenueFilter(tenantId: string, startDate?: Date, endDate?: Date): Record<string, unknown> {
    const filter = this.buildBaseFilter(tenantId, startDate, endDate);
    return {
      ...filter,
      status: { $ne: 'cancelled' },
      $or: [
        { paymentStatus: 'paid' },
        { paymentMethod: 'cod', status: 'delivered' },
      ],
    };
  }

  private buildBaseFilter(tenantId: string, startDate?: Date, endDate?: Date): Record<string, unknown> {
    const filter: Record<string, unknown> = { tenantId };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) (filter.createdAt as Record<string, Date>).$gte = startDate;
      if (endDate) (filter.createdAt as Record<string, Date>).$lte = endDate;
    }
    return filter;
  }

  private countLineItems(orders: OrderDocument[]): number {
    return orders.reduce(
      (sum, order) => sum + order.lineItems.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );
  }

  private buildProductMetricsFromOrders(orders: OrderDocument[]): TopProductMetric[] {
    const productSales = new Map<string, { title: string; quantity: number; revenue: number }>();

    orders.forEach((order) => {
      order.lineItems.forEach((item) => {
        const key = item.productId.toString();
        const existing = productSales.get(key) || { title: item.title, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.total;
        productSales.set(key, existing);
      });
    });

    const totalQuantity = Array.from(productSales.values()).reduce((sum, p) => sum + p.quantity, 0);
    const totalRevenue = Array.from(productSales.values()).reduce((sum, p) => sum + p.revenue, 0);

    return Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        title: data.title,
        quantitySold: data.quantity,
        revenue: data.revenue,
        salesPercentage: totalQuantity > 0 ? (data.quantity / totalQuantity) * 100 : 0,
        revenuePercentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  async getSalesMetrics(tenantId: string, startDate?: Date, endDate?: Date): Promise<SalesMetrics> {
    const filter = this.buildRevenueFilter(tenantId, startDate, endDate);
    const orders = await this.orderModel.find(filter).exec();

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const productMetrics = this.buildProductMetricsFromOrders(orders);
    const topSellingProducts = productMetrics.slice(0, 10);
    const salesByCategory = await this.getSalesByCategory(tenantId, orders);

    const revenueByPeriod = await this.getRevenueByPeriod(tenantId, startDate, endDate);
    const customerMetrics = await this.getCustomerMetrics(tenantId, startDate, endDate);

    const uniqueCustomersCount = new Set(orders.map((o) => o.customerEmail)).size;
    const conversionRate = uniqueCustomersCount > 0 ? (totalOrders / uniqueCustomersCount) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      conversionRate,
      topSellingProducts,
      revenueByPeriod,
      customerMetrics,
      salesByCategory,
    };
  }

  async getCodDeliveryMetrics(tenantId: string, startDate?: Date, endDate?: Date): Promise<CodDeliveryMetrics> {
    const filter = {
      ...this.buildBaseFilter(tenantId, startDate, endDate),
      paymentMethod: 'cod',
    };
    const codOrders = await this.orderModel.find(filter).exec();

    const delivered = codOrders.filter((o) => o.status === 'delivered');
    const cancelled = codOrders.filter((o) => o.status === 'cancelled');
    const shipped = codOrders.filter((o) => o.status === 'shipped');
    const confirmed = codOrders.filter((o) => o.status === 'confirmed');
    const pending = codOrders.filter((o) => o.status === 'pending');
    const verifiedOrders = codOrders.filter((o) => o.isVerified);
    const pendingVerification = codOrders.filter((o) => !o.isVerified && o.status !== 'cancelled');
    const inProgress = codOrders.filter((o) => ['pending', 'confirmed', 'shipped'].includes(o.status));

    const completedAttempts = delivered.length + cancelled.length;
    const totalItems = this.countLineItems(codOrders);
    const codRevenueCollected = delivered.reduce((sum, o) => sum + o.total, 0);
    const codRevenuePending = inProgress.reduce((sum, o) => sum + o.total, 0);

    return {
      totalCodOrders: codOrders.length,
      totalItems,
      verifiedOrders: verifiedOrders.length,
      pendingVerification: pendingVerification.length,
      confirmed: confirmed.length,
      shipped: shipped.length,
      delivered: delivered.length,
      cancelled: cancelled.length,
      inProgress: inProgress.length,
      deliverySuccessRate: completedAttempts > 0 ? (delivered.length / completedAttempts) * 100 : 0,
      deliveryFailureRate: completedAttempts > 0 ? (cancelled.length / completedAttempts) * 100 : 0,
      codRevenue: codRevenueCollected + codRevenuePending,
      codRevenueCollected,
      codRevenuePending,
      averageItemsPerOrder: codOrders.length > 0 ? totalItems / codOrders.length : 0,
      otpVerificationRate: codOrders.length > 0 ? (verifiedOrders.length / codOrders.length) * 100 : 0,
    };
  }

  async getProductAnalytics(tenantId: string, startDate?: Date, endDate?: Date): Promise<ProductAnalytics> {
    const filter = this.buildRevenueFilter(tenantId, startDate, endDate);
    const orders = await this.orderModel.find(filter).exec();
    const products = this.buildProductMetricsFromOrders(orders);
    const totalArticlesSold = this.countLineItems(orders);

    return {
      totalArticlesSold,
      uniqueProductsSold: products.length,
      winningProduct: products[0] ?? null,
      products: products.slice(0, 20),
    };
  }

  async getOrderFunnel(tenantId: string, startDate?: Date, endDate?: Date): Promise<OrderFunnel> {
    const filter = this.buildBaseFilter(tenantId, startDate, endDate);
    const orders = await this.orderModel.find(filter).exec();

    const pending = orders.filter((o) => o.status === 'pending').length;
    const confirmed = orders.filter((o) => o.status === 'confirmed').length;
    const shipped = orders.filter((o) => o.status === 'shipped').length;
    const delivered = orders.filter((o) => o.status === 'delivered').length;
    const cancelled = orders.filter((o) => o.status === 'cancelled').length;
    const codOrders = orders.filter((o) => o.paymentMethod === 'cod').length;
    const onlinePaidOrders = orders.filter(
      (o) => o.paymentMethod !== 'cod' && o.paymentStatus === 'paid',
    ).length;

    const activeOrders = orders.filter((o) => o.status !== 'cancelled').length;

    return {
      totalOrders: orders.length,
      pending,
      confirmed,
      shipped,
      delivered,
      cancelled,
      codOrders,
      onlinePaidOrders,
      conversionToDelivered: activeOrders > 0 ? (delivered / activeOrders) * 100 : 0,
      conversionToConfirmed: orders.length > 0
        ? (orders.filter((o) => o.isVerified || o.status !== 'pending').length / orders.length) * 100
        : 0,
    };
  }

  private async getSalesByCategory(tenantId: string, orders: OrderDocument[]) {
    const categoryMap = new Map<string, { revenue: number; orders: number }>();
    const productIds = new Set<string>();

    for (const order of orders) {
      for (const item of order.lineItems) {
        productIds.add(item.productId.toString());
      }
    }

    const products = await this.productModel
      .find({ tenantId, _id: { $in: Array.from(productIds) } })
      .select('_id category')
      .exec();
    const productCategory = new Map(products.map((p) => [p._id.toString(), p.category || 'Sans catégorie']));

    for (const order of orders) {
      const categoriesInOrder = new Set<string>();
      for (const item of order.lineItems) {
        const category = productCategory.get(item.productId.toString()) || 'Sans catégorie';
        categoriesInOrder.add(category);
        const existing = categoryMap.get(category) || { revenue: 0, orders: 0 };
        existing.revenue += item.total;
        categoryMap.set(category, existing);
      }
      categoriesInOrder.forEach((category) => {
        const existing = categoryMap.get(category)!;
        existing.orders += 1;
      });
    }

    const totalRevenue = Array.from(categoryMap.values()).reduce((sum, c) => sum + c.revenue, 0);

    return Array.from(categoryMap.entries())
      .map(([category, stats]) => ({
        category,
        revenue: stats.revenue,
        orders: stats.orders,
        percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  async getInventoryMetrics(tenantId: string): Promise<InventoryMetrics> {
    const products = await this.productModel.find({ tenantId, status: 'active' }).exec();
    
    let totalProducts = 0;
    let totalVariants = 0;
    let totalInventoryValue = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;
    const categoryStats = new Map<string, { products: number; revenue: number }>();

    for (const product of products) {
      totalProducts++;
      
      if (product.category) {
        const existing = categoryStats.get(product.category) || { products: 0, revenue: 0 };
        existing.products++;
        categoryStats.set(product.category, existing);
      }

      for (const variant of product.variants) {
        if (!variant.isActive) continue;
        
        totalVariants++;
        totalInventoryValue += variant.inventory * variant.price;
        
        if (variant.inventory === 0) {
          outOfStockItems++;
        } else if (variant.inventory <= 10) { // Seuil configurable
          lowStockItems++;
        }
      }
    }

    // Calculate turnover rate (simplified)
    const turnoverRate = await this.calculateTurnoverRate(tenantId);

    // Get category revenue
    const categoryRevenue = await this.getCategoryRevenue(tenantId, categoryStats);

    const topCategories = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({
        category,
        products: stats.products,
        revenue: categoryRevenue.get(category) || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalProducts,
      totalVariants,
      totalInventoryValue,
      lowStockItems,
      outOfStockItems,
      turnoverRate,
      topCategories,
    };
  }

  async getDashboardInsights(tenantId: string) {
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30);

    const [salesMetrics, inventoryMetrics, codDelivery, productAnalytics, funnel] = await Promise.all([
      this.getSalesMetrics(tenantId, periodStart),
      this.getInventoryMetrics(tenantId),
      this.getCodDeliveryMetrics(tenantId, periodStart),
      this.getProductAnalytics(tenantId, periodStart),
      this.getOrderFunnel(tenantId, periodStart),
    ]);

    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - 60);
    const previousEndDate = new Date();
    previousEndDate.setDate(previousEndDate.getDate() - 30);

    const previousSales = await this.getSalesMetrics(tenantId, previousStartDate, previousEndDate);

    const revenueGrowth = salesMetrics.totalRevenue - previousSales.totalRevenue;
    const ordersGrowth = salesMetrics.totalOrders - previousSales.totalOrders;

    const insights = this.generateInsights(salesMetrics, inventoryMetrics, codDelivery, productAnalytics, {
      revenueGrowthPercentage: previousSales.totalRevenue > 0
        ? (revenueGrowth / previousSales.totalRevenue) * 100
        : 0,
      ordersGrowthPercentage: previousSales.totalOrders > 0
        ? (ordersGrowth / previousSales.totalOrders) * 100
        : 0,
    });

    return {
      sales: salesMetrics,
      inventory: inventoryMetrics,
      codDelivery,
      productAnalytics,
      funnel,
      trends: {
        revenueGrowth,
        ordersGrowth,
        revenueGrowthPercentage: previousSales.totalRevenue > 0
          ? (revenueGrowth / previousSales.totalRevenue) * 100
          : 0,
        ordersGrowthPercentage: previousSales.totalOrders > 0
          ? (ordersGrowth / previousSales.totalOrders) * 100
          : 0,
      },
      insights,
      lastUpdated: new Date(),
    };
  }

  async exportData(tenantId: string, type: 'sales' | 'inventory' | 'all', format: 'csv' | 'json') {
    const data: any = {};

    if (type === 'sales' || type === 'all') {
      data.sales = await this.getSalesMetrics(tenantId);
    }

    if (type === 'inventory' || type === 'all') {
      data.inventory = await this.getInventoryMetrics(tenantId);
    }

    if (format === 'csv') {
      return this.convertToCSV(data);
    }

    return data;
  }

  private async getRevenueByPeriod(tenantId: string, startDate?: Date, endDate?: Date) {
    const defaultStartDate = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate || new Date();

    const pipeline: PipelineStage[] = [
      {
        $match: {
          ...this.buildRevenueFilter(tenantId, defaultStartDate, defaultEndDate),
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ];

    const result = await this.orderModel.aggregate(pipeline).exec();

    return result.map((item) => ({
      period: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      revenue: item.revenue,
      orders: item.orders,
    }));
  }

  private async getCustomerMetrics(tenantId: string, startDate?: Date, endDate?: Date) {
    const filter = this.buildRevenueFilter(tenantId, startDate, endDate);
    const orders = await this.orderModel.find(filter).exec();
    const uniqueCustomers = new Set(orders.map((order) => order.customerEmail));

    const previousPeriodFilter = { ...filter };
    const previousStartDate = startDate && endDate
      ? new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()))
      : new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const previousEndDate = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    previousPeriodFilter.createdAt = { $gte: previousStartDate, $lt: previousEndDate };

    const previousOrders = await this.orderModel.find(previousPeriodFilter).exec();
    const previousCustomers = new Set(previousOrders.map((order) => order.customerEmail));

    const newCustomers = Array.from(uniqueCustomers).filter((email) => !previousCustomers.has(email)).length;
    const returningCustomers = uniqueCustomers.size - newCustomers;

    return {
      totalCustomers: uniqueCustomers.size,
      newCustomers,
      returningCustomers,
      averageCustomerValue: uniqueCustomers.size > 0
        ? orders.reduce((sum, order) => sum + order.total, 0) / uniqueCustomers.size
        : 0,
    };
  }

  private async calculateTurnoverRate(tenantId: string): Promise<number> {
    const periodStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const orders = await this.orderModel.find(this.buildRevenueFilter(tenantId, periodStart)).exec();

    const totalSold = this.countLineItems(orders);

    const products = await this.productModel.find({ tenantId, status: 'active' }).exec();
    const totalInventory = products.reduce(
      (sum, product) => sum + product.variants.reduce((variantSum, variant) => variantSum + variant.inventory, 0),
      0,
    );

    return totalInventory > 0 ? (totalSold / totalInventory) * 100 : 0;
  }

  private async getCategoryRevenue(tenantId: string, categoryStats: Map<string, { products: number; revenue: number }>) {
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30);
    const orders = await this.orderModel.find(this.buildRevenueFilter(tenantId, periodStart)).exec();
    const categoryRevenue = new Map<string, number>();

    for (const order of orders) {
      for (const item of order.lineItems) {
        const product = await this.productModel.findById(item.productId).exec();
        if (product?.category) {
          const existing = categoryRevenue.get(product.category) || 0;
          categoryRevenue.set(product.category, existing + item.total);
        }
      }
    }

    return categoryRevenue;
  }

  private generateInsights(
    salesMetrics: SalesMetrics,
    inventoryMetrics: InventoryMetrics,
    codDelivery: CodDeliveryMetrics,
    productAnalytics: ProductAnalytics,
    trends: { revenueGrowthPercentage: number; ordersGrowthPercentage: number },
  ): string[] {
    const insights: string[] = [];

    if (trends.revenueGrowthPercentage > 10) {
      insights.push(`Excellent ! Vos ventes ont augmenté de ${trends.revenueGrowthPercentage.toFixed(1)}% sur 30 jours.`);
    } else if (trends.revenueGrowthPercentage < -10) {
      insights.push(`Attention : baisse des ventes de ${Math.abs(trends.revenueGrowthPercentage).toFixed(1)}%. Envisagez des promotions.`);
    }

    if (codDelivery.totalCodOrders > 0) {
      insights.push(
        `COD : ${codDelivery.delivered} livraisons réussies sur ${codDelivery.delivered + codDelivery.cancelled} tentatives (${codDelivery.deliverySuccessRate.toFixed(0)}% de succès).`,
      );
      if (codDelivery.pendingVerification > 0) {
        insights.push(`${codDelivery.pendingVerification} commande(s) COD en attente de vérification OTP.`);
      }
    }

    if (inventoryMetrics.lowStockItems > 0) {
      insights.push(`${inventoryMetrics.lowStockItems} produit(s) en stock faible — pensez au réapprovisionnement.`);
    }

    if (inventoryMetrics.outOfStockItems > 0) {
      insights.push(`${inventoryMetrics.outOfStockItems} produit(s) en rupture de stock !`);
    }

    if (productAnalytics.winningProduct) {
      const winner = productAnalytics.winningProduct;
      insights.push(
        `Produit gagnant : "${winner.title}" — ${winner.quantitySold} unités (${winner.salesPercentage.toFixed(1)}% des ventes).`,
      );
    }

    if (salesMetrics.customerMetrics.returningCustomers > salesMetrics.customerMetrics.newCustomers) {
      insights.push(
        `Bonne fidélisation : ${salesMetrics.customerMetrics.returningCustomers} clients récurrents vs ${salesMetrics.customerMetrics.newCustomers} nouveaux.`,
      );
    }

    return insights;
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion for analytics data
    let csv = 'Type,Metric,Value\n';
    
    if (data.sales) {
      csv += `Sales,Total Revenue,${data.sales.totalRevenue}\n`;
      csv += `Sales,Total Orders,${data.sales.totalOrders}\n`;
      csv += `Sales,Average Order Value,${data.sales.averageOrderValue}\n`;
    }
    
    if (data.inventory) {
      csv += `Inventory,Total Products,${data.inventory.totalProducts}\n`;
      csv += `Inventory,Total Variants,${data.inventory.totalVariants}\n`;
      csv += `Inventory,Total Value,${data.inventory.totalInventoryValue}\n`;
    }
    
    return csv;
  }
}

