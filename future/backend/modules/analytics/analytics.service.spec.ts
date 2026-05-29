import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { Order } from '../orders/schemas/order.schema';
import { Product } from '../products/schemas/product.schema';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let orderModel: any;
  let productModel: any;

  const tenantId = 'tenant123';

  const paidOrder = {
    _id: 'order-paid',
    tenantId,
    paymentStatus: 'paid',
    paymentMethod: 'stripe',
    status: 'delivered',
    isVerified: true,
    total: 100,
    customerEmail: 'paid@example.com',
    lineItems: [{ productId: 'product123', title: 'Produit A', quantity: 2, price: 50, total: 100 }],
    createdAt: new Date(),
  };

  const codDelivered = {
    _id: 'order-cod-ok',
    tenantId,
    paymentStatus: 'pending',
    paymentMethod: 'cod',
    status: 'delivered',
    isVerified: true,
    total: 80,
    customerEmail: 'cod-ok@example.com',
    lineItems: [{ productId: 'product123', title: 'Produit A', quantity: 1, price: 80, total: 80 }],
    createdAt: new Date(),
  };

  const codCancelled = {
    _id: 'order-cod-ko',
    tenantId,
    paymentStatus: 'pending',
    paymentMethod: 'cod',
    status: 'cancelled',
    isVerified: true,
    total: 50,
    customerEmail: 'cod-ko@example.com',
    lineItems: [{ productId: 'product456', title: 'Produit B', quantity: 1, price: 50, total: 50 }],
    createdAt: new Date(),
  };

  const codPendingOtp = {
    _id: 'order-cod-pending',
    tenantId,
    paymentStatus: 'pending',
    paymentMethod: 'cod',
    status: 'pending',
    isVerified: false,
    total: 30,
    customerEmail: 'pending@example.com',
    lineItems: [{ productId: 'product456', title: 'Produit B', quantity: 3, price: 10, total: 30 }],
    createdAt: new Date(),
  };

  const mockProduct = {
    _id: 'product123',
    tenantId,
    title: 'Produit A',
    category: 'Electronics',
    variants: [{ inventory: 10, price: 50, isActive: true }],
    status: 'active',
  };

  const mockProductB = {
    _id: 'product456',
    tenantId,
    title: 'Produit B',
    category: 'Mode',
    variants: [{ inventory: 5, price: 10, isActive: true }],
    status: 'active',
  };

  const emptySalesMetrics = {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    topSellingProducts: [],
    revenueByPeriod: [],
    customerMetrics: { totalCustomers: 0, newCustomers: 0, returningCustomers: 0, averageCustomerValue: 0 },
    salesByCategory: [],
  };

  const emptyInventoryMetrics = {
    totalProducts: 0,
    totalVariants: 0,
    totalInventoryValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    turnoverRate: 0,
    topCategories: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getModelToken(Order.name),
          useValue: {
            find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
            aggregate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
          },
        },
        {
          provide: getModelToken(Product.name),
          useValue: {
            find: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
              }),
              exec: jest.fn().mockResolvedValue([]),
            }),
            findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    orderModel = module.get(getModelToken(Order.name));
    productModel = module.get(getModelToken(Product.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSalesMetrics', () => {
    it('should count paid orders and delivered COD orders in revenue', async () => {
      orderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([paidOrder, codDelivered]),
      });
      orderModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          { _id: { year: 2026, month: 5, day: 25 }, revenue: 180, orders: 2 },
        ]),
      });
      productModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockProduct]),
        }),
        exec: jest.fn().mockResolvedValue([mockProduct, mockProductB]),
      });

      const result = await service.getSalesMetrics(tenantId);

      expect(result.totalRevenue).toBe(180);
      expect(result.totalOrders).toBe(2);
      expect(result.topSellingProducts[0].salesPercentage).toBeGreaterThan(0);
      expect(result).toHaveProperty('salesByCategory');
    });

    it('should handle empty orders', async () => {
      orderModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      orderModel.aggregate.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

      const result = await service.getSalesMetrics(tenantId);

      expect(result.totalRevenue).toBe(0);
      expect(result.totalOrders).toBe(0);
    });
  });

  describe('getCodDeliveryMetrics', () => {
    it('should compute COD delivery success and failure rates', async () => {
      orderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([codDelivered, codCancelled, codPendingOtp]),
      });

      const result = await service.getCodDeliveryMetrics(tenantId);

      expect(result.totalCodOrders).toBe(3);
      expect(result.delivered).toBe(1);
      expect(result.cancelled).toBe(1);
      expect(result.pendingVerification).toBe(1);
      expect(result.totalItems).toBe(5);
      expect(result.deliverySuccessRate).toBe(50);
      expect(result.codRevenueCollected).toBe(80);
      expect(result.codRevenuePending).toBe(30);
    });
  });

  describe('getProductAnalytics', () => {
    it('should identify winning product with sales percentages', async () => {
      orderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([paidOrder, codDelivered]),
      });

      const result = await service.getProductAnalytics(tenantId);

      expect(result.totalArticlesSold).toBe(3);
      expect(result.winningProduct).not.toBeNull();
      expect(result.winningProduct!.title).toBe('Produit A');
      expect(result.winningProduct!.salesPercentage).toBe(100);
    });
  });

  describe('getOrderFunnel', () => {
    it('should return order pipeline counts', async () => {
      orderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([paidOrder, codDelivered, codCancelled, codPendingOtp]),
      });

      const result = await service.getOrderFunnel(tenantId);

      expect(result.totalOrders).toBe(4);
      expect(result.delivered).toBe(2);
      expect(result.cancelled).toBe(1);
      expect(result.codOrders).toBe(3);
      expect(result.onlinePaidOrders).toBe(1);
    });
  });

  describe('getInventoryMetrics', () => {
    it('should return inventory metrics', async () => {
      productModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockProduct, mockProductB]),
        }),
        exec: jest.fn().mockResolvedValue([mockProduct, mockProductB]),
      });
      orderModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([paidOrder]) });

      const result = await service.getInventoryMetrics(tenantId);

      expect(result.totalProducts).toBe(2);
      expect(result.totalVariants).toBe(2);
    });
  });

  describe('getDashboardInsights', () => {
    it('should return full dashboard with COD and product analytics', async () => {
      jest.spyOn(service, 'getSalesMetrics').mockResolvedValue({
        ...emptySalesMetrics,
        totalRevenue: 180,
        totalOrders: 2,
      });
      jest.spyOn(service, 'getInventoryMetrics').mockResolvedValue(emptyInventoryMetrics);
      jest.spyOn(service, 'getCodDeliveryMetrics').mockResolvedValue({
        totalCodOrders: 3,
        totalItems: 5,
        verifiedOrders: 2,
        pendingVerification: 1,
        confirmed: 0,
        shipped: 0,
        delivered: 1,
        cancelled: 1,
        inProgress: 1,
        deliverySuccessRate: 50,
        deliveryFailureRate: 50,
        codRevenue: 110,
        codRevenueCollected: 80,
        codRevenuePending: 30,
        averageItemsPerOrder: 1.67,
        otpVerificationRate: 66.67,
      });
      jest.spyOn(service, 'getProductAnalytics').mockResolvedValue({
        totalArticlesSold: 3,
        uniqueProductsSold: 1,
        winningProduct: {
          productId: 'product123',
          title: 'Produit A',
          quantitySold: 3,
          revenue: 180,
          salesPercentage: 100,
          revenuePercentage: 100,
        },
        products: [],
      });
      jest.spyOn(service, 'getOrderFunnel').mockResolvedValue({
        totalOrders: 4,
        pending: 1,
        confirmed: 0,
        shipped: 0,
        delivered: 2,
        cancelled: 1,
        codOrders: 3,
        onlinePaidOrders: 1,
        conversionToDelivered: 66.67,
        conversionToConfirmed: 75,
      });

      const result = await service.getDashboardInsights(tenantId);

      expect(result).toHaveProperty('sales');
      expect(result).toHaveProperty('inventory');
      expect(result).toHaveProperty('codDelivery');
      expect(result).toHaveProperty('productAnalytics');
      expect(result).toHaveProperty('funnel');
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('insights');
      expect(result.codDelivery.delivered).toBe(1);
      expect(result.productAnalytics.winningProduct?.title).toBe('Produit A');
    });
  });
});
