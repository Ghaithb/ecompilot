import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';
import { User } from '../users/schemas/user.schema';
import { ProductStockService } from '../products/product-stock.service';
import { ProductsService } from '../products/products.service';
import { CodTrustService } from '../cod-trust/cod-trust.service';
import { OtpService } from '../notifications/otp.service';
import { RealtimeService } from '../../core/stubs/realtime.stub';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { OrderStatusService } from './order-status.service';
import { WhatsappOrderNotificationService } from '../whatsapp/whatsapp-order-notification.service';
import { PrismaMirrorService } from '../../prisma/prisma-mirror.service';
import { EventBusService } from '../../core/events/event-bus.service';

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
      save: mockSave,
    }));

    const mockProductStockService = {
      checkAvailability: jest.fn().mockResolvedValue({
        allAvailable: true,
        unavailableItems: [],
      }),
      bulkUpdateStock: jest.fn().mockResolvedValue(undefined),
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
              exec: jest.fn().mockResolvedValue([mockOrder]),
            }),
            findOne: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOrder),
            }),
            findOneAndUpdate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOrder),
            }),
            findByIdAndUpdate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOrder),
            }),
            findByIdAndDelete: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOrder),
            }),
          }),
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: ProductStockService,
          useValue: mockProductStockService,
        },
        {
          provide: ProductsService,
          useValue: {
            resolveVariantRef: jest.fn(),
          },
        },
        {
          provide: OtpService,
          useValue: mockOtpService,
        },
        {
          provide: CodTrustService,
          useValue: {
            validatePhone: jest.fn().mockReturnValue(true),
            checkOrderAllowed: jest.fn().mockResolvedValue({ allowed: true, score: 100 }),
            recordVerifiedOrder: jest.fn(),
          },
        },
        {
          provide: RealtimeService,
          useValue: {
            suspectCustomer: jest.fn(),
            newOrder: jest.fn(),
            otpVerified: jest.fn(),
          },
        },
        {
          provide: WhatsAppService,
          useValue: {
            sendTextMessage: jest.fn(),
          },
        },
        {
          provide: OrderStatusService,
          useValue: {
            assertTransition: jest.fn().mockImplementation((_, next) => next),
            listNextStatuses: jest.fn().mockReturnValue([]),
          },
        },
        {
          provide: WhatsappOrderNotificationService,
          useValue: {
            notifyStatusChange: jest.fn(),
          },
        },
        {
          provide: PrismaMirrorService,
          useValue: {
            mirrorMongoOrder: jest.fn(),
          },
        },
        {
          provide: EventBusService,
          useValue: {
            publishSync: jest.fn(),
          },
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
