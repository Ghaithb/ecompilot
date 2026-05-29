import { Test, TestingModule } from '@nestjs/testing';
import { ShopifyService } from './shopify.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from '../../products/schemas/product.schema';
import { Order } from '../../orders/schemas/order.schema';
import { Tenant } from '../../tenants/schemas/tenant.schema';
import { ConfigService } from '@nestjs/config';

describe('ShopifyService', () => {
  let service: ShopifyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopifyService,
        {
          provide: getModelToken(Product.name),
          useValue: {}, // Mock ProductModel
        },
        {
          provide: getModelToken(Order.name),
          useValue: {}, // Mock OrderModel
        },
        {
          provide: getModelToken(Tenant.name),
          useValue: {}, // Mock TenantModel
        },
        {
          provide: ConfigService,
          useValue: {}, // Mock ConfigService
        },
      ],
    }).compile();

    service = module.get<ShopifyService>(ShopifyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should import products correctly', async () => {
    const result = await service.importProducts('tenantId', []);
    expect(result).toEqual({ imported: 0, errors: 0 });
  });
});