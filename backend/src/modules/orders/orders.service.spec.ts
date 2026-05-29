import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';
import { ProductStockService } from '../products/product-stock.service';
import { InventoryService } from '../inventory/inventory.service';
import { OtpService } from '../notifications/otp.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderModel: any;

  const mockOrder = {
    _id: 'order123',
    tenantId: 'tenant123',
    status: 'pending',
    save: jest.fn(),
  };

  beforeEach(async () => {
    const mockSave = jest.fn().mockResolvedValue(mockOrder);
    const mockModel = jest.fn().mockImplementation((data) => ({
      ...mockOrder,
      ...data,
      save: mockSave
    }));

    // Mocks pour les services dépendants
    const mockProductStockService = {
      checkAvailability: jest.fn().mockResolvedValue({
        allAvailable: true,
        unavailableItems: []
      }),
      bulkUpdateStock: jest.fn().mockResolvedValue(undefined),
    };

    const mockInventoryService = {
      updateStock: jest.fn().mockResolvedValue({}),
      checkLowStock: jest.fn().mockResolvedValue([]),
    };

    const mockOtpService = {
      generateAndSendOtp: jest.fn().mockResolvedValue(true),
      verifyOtp: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: Object.assign(mockModel, {
            find: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([mockOrder])
            }),
            findOne: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOrder)
            }),
            findOneAndUpdate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOrder)
            }),
            findByIdAndUpdate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOrder)
            }),
            findByIdAndDelete: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOrder)
            })
          })
        },
        {
          provide: ProductStockService,
          useValue: mockProductStockService
        },
        {
          provide: InventoryService,
          useValue: mockInventoryService
        },
        {
          provide: OtpService,
          useValue: mockOtpService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderModel = module.get(getModelToken(Order.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an order', async () => {
  const dto = { items: [], total: 100 };
  const saveMock = jest.fn().mockResolvedValue({ ...mockOrder, ...dto });
  orderModel.mockImplementation((data) => ({ ...mockOrder, ...data, save: saveMock }));
  const result = await service.create(dto, 'tenant123');
  expect(result).toBeDefined();
  expect(result.save).toBeDefined();
  expect(saveMock).toHaveBeenCalled();
  });

  it('should find all orders', async () => {
    const result = await service.findAll('tenant123');
    expect(result).toBeInstanceOf(Array);
  });

  it('should find one order', async () => {
    const result = await service.findOne('order123', 'tenant123');
    expect(result).toBeDefined();
  });
});
