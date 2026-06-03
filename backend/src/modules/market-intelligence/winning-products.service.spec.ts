import { Test, TestingModule } from '@nestjs/testing';
import { WinningProductsService } from './winning-products.service';
import { DeliveryIntelligenceService } from './delivery-intelligence.service';
import { getModelToken } from '@nestjs/mongoose';
import { Order } from '../orders/schemas/order.schema';
import { Product } from '../products/schemas/product.schema';
import { ConversionDailyMetric } from '../conversion-intelligence/schemas/conversion-daily-metric.schema';

describe('WinningProductsService', () => {
  let service: WinningProductsService;
  let orderModel: any;

  beforeEach(async () => {
    const mockOrderModel = {
      aggregate: jest.fn().mockResolvedValue([]),
    };

    const mockDeliveryIntelligence = {
      getCarrierPerformanceForProduct: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WinningProductsService,
        { provide: DeliveryIntelligenceService, useValue: mockDeliveryIntelligence },
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: getModelToken(Product.name), useValue: {} },
        { provide: getModelToken(ConversionDailyMetric.name), useValue: {} },
      ],
    }).compile();

    service = module.get<WinningProductsService>(WinningProductsService);
    orderModel = module.get(getModelToken(Order.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch top products and process trending categories', async () => {
    orderModel.aggregate.mockResolvedValue([
      {
        _id: 'Test Product 1',
        salesCount: 15,
        revenue: 1500,
        deliveredCount: 14,
        provinces: ['Tunis', 'Ariana', 'Sousse', 'Tunis']
      }
    ]);

    const dashboard = await service.getDashboard();
    
    expect(dashboard.topProducts).toHaveLength(1);
    expect(dashboard.topProducts[0].title).toBe('Test Product 1');
    expect(dashboard.trendingCategories).toBeDefined();
  });
});
