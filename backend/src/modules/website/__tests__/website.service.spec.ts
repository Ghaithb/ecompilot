import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WebsiteService } from '../website.service';
import { Website } from '../schemas/website.schema';
import { Page } from '../schemas/page.schema';
import { Booking } from '../schemas/booking.schema';
import { ContactMessage } from '../schemas/contact-message.schema';
import { NewsletterSubscriber } from '../schemas/newsletter.schema';
import { SmartWebsiteGeneratorService } from '../services/smart-website-generator.service';
import { OrdersService } from '../../orders/orders.service';
import { TunisiaPaymentService } from '../../payment/tunisia-payment.service';
import { CustomersService } from '../../customers/customers.service';
import { ProductsService } from '../../products/products.service';
import { CartAbandonmentService } from '../../cart/cart-abandonment.service';

describe('WebsiteService (__tests__)', () => {
  let service: WebsiteService;
  let mockWebsiteModel: any;

  beforeEach(async () => {
    mockWebsiteModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'website123',
      save: jest.fn().mockResolvedValue({ ...data, _id: 'website123' }),
    }));
    mockWebsiteModel.findOne = jest.fn();
    mockWebsiteModel.findByIdAndUpdate = jest.fn();
    mockWebsiteModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 0 });

    const mockPageModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(data),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsiteService,
        { provide: getModelToken(Website.name), useValue: mockWebsiteModel },
        { provide: getModelToken(Page.name), useValue: mockPageModel },
        { provide: getModelToken(Booking.name), useValue: {} },
        { provide: getModelToken(ContactMessage.name), useValue: {} },
        { provide: getModelToken(NewsletterSubscriber.name), useValue: {} },
        {
          provide: SmartWebsiteGeneratorService,
          useValue: { generateSmartWebsite: jest.fn().mockResolvedValue('<html></html>') },
        },
        {
          provide: OrdersService,
          useValue: { create: jest.fn(), verifyOtp: jest.fn() },
        },
        {
          provide: TunisiaPaymentService,
          useValue: {
            initiateOrderPayment: jest.fn(),
            getPublicPaymentMethods: jest.fn().mockResolvedValue({ methods: [] }),
          },
        },
        {
          provide: CustomersService,
          useValue: { findOrCreateByPhone: jest.fn() },
        },
        {
          provide: ProductsService,
          useValue: {
            resolveVariantRef: jest.fn(),
            findAll: jest.fn().mockResolvedValue({ total: 1 }),
          },
        },
        {
          provide: CartAbandonmentService,
          useValue: { recordPublicAbandonedCart: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<WebsiteService>(WebsiteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a website successfully', async () => {
      mockWebsiteModel.findOne.mockResolvedValue(null);

      const result = await service.create('tenant123', { name: 'Test Site', slug: 'test-site' });

      expect(result.save).toHaveBeenCalled();
      expect(mockWebsiteModel.findOne).toHaveBeenCalled();
    });

    it('should throw if website already exists for tenant', async () => {
      mockWebsiteModel.findOne.mockResolvedValueOnce({ _id: 'existing' });

      await expect(
        service.create('tenant123', { name: 'Test', slug: 'test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByTenant', () => {
    it('should find active website by tenant', async () => {
      const mockWebsite = { _id: 'website123', tenantId: 'tenant123', name: 'Test Site' };
      mockWebsiteModel.findOne.mockResolvedValue(mockWebsite);

      const result = await service.findByTenant('tenant123');

      expect(result).toEqual(mockWebsite);
      expect(mockWebsiteModel.findOne).toHaveBeenCalledWith({ tenantId: 'tenant123', isActive: true });
    });

    it('should throw NotFoundException when website not found', async () => {
      mockWebsiteModel.findOne.mockImplementation((filter: Record<string, unknown>) => {
        if (filter?.isActive === true) return Promise.resolve(null);
        return { sort: jest.fn().mockResolvedValue(null) };
      });

      await expect(service.findByTenant('tenant123')).rejects.toThrow(NotFoundException);
    });
  });
});
