import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WebsiteService } from './website.service';
import { SmartWebsiteGeneratorService } from './services/smart-website-generator.service';
import { OrdersService } from '../orders/orders.service';
import { TunisiaPaymentService } from '../payment/tunisia-payment.service';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import { CartAbandonmentService } from '../cart/cart-abandonment.service';


describe('WebsiteService', () => {
  let service: WebsiteService;

  let mockWebsiteModel: any;
  let mockPageModel: any;
  let mockSmartWebsiteGenerator: any;
  let mockBookingModel: any;
  let mockContactMessageModel: any;
  let mockNewsletterModel: any;

  beforeEach(async () => {
    mockWebsiteModel = jest.fn().mockImplementation((data) => {
      const instance = {
        ...data,
        _id: data?._id || 'website-id',
        save: jest.fn().mockResolvedValue(null),
        deleteOne: jest.fn().mockResolvedValue(null),
      };
      return instance;
    });
    mockWebsiteModel.findOne = jest.fn();
    mockWebsiteModel.deleteMany = jest.fn();
    mockWebsiteModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 0 });

    mockPageModel = jest.fn().mockImplementation((data) => {
      const instance = {
        ...data,
        _id: 'page-id',
        save: jest.fn().mockResolvedValue(null),
      };
      return instance;
    });
    mockPageModel.deleteMany = jest.fn().mockResolvedValue(null);
    mockPageModel.find = jest.fn();

    mockBookingModel = {};
    mockContactMessageModel = {};
    mockNewsletterModel = {};

    mockSmartWebsiteGenerator = {
      generateSmartWebsite: jest.fn().mockResolvedValue('<html></html>'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsiteService,
        {
          provide: getModelToken('Website'),
          useValue: mockWebsiteModel,
        },
        {
          provide: getModelToken('Page'),
          useValue: mockPageModel,
        },
        {
          provide: getModelToken('Booking'),
          useValue: mockBookingModel,
        },
        {
          provide: getModelToken('ContactMessage'),
          useValue: mockContactMessageModel,
        },
        {
          provide: getModelToken('NewsletterSubscriber'),
          useValue: mockNewsletterModel,
        },
        {
          provide: SmartWebsiteGeneratorService,
          useValue: mockSmartWebsiteGenerator,
        },
        {
          provide: OrdersService,
          useValue: {
            create: jest.fn(),
            verifyOtp: jest.fn(),
          },
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
          useValue: {
            findOrCreateByPhone: jest.fn(),
          },
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
          useValue: {
            recordPublicAbandonedCart: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WebsiteService>(WebsiteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateWebsite', () => {
    const mockWizardData = {
      companyName: 'Test Company',
      business: {
        industry: 'parfum',
        primaryGoal: 'Augmenter les ventes',
        description: 'Description test',
        targetAudience: 'Femmes',
        keyFeatures: 'Livraison rapide;Service premium',
      },
      contact: {
        email: 'test@example.com',
        phone: '0123456789',
        city: 'Paris',
        country: 'France',
      },
      branding: {
        slogan: 'Senteurs uniques',
        brandVoice: 'Chic',
        primaryColor: '#112233',
        secondaryColor: '#334455',
      },
      contentStrategy: {
        hasExistingContent: 'no' as const,
        contentNotes: 'Prévoir une séance photo',
        launchTimeline: 'Q3 2024',
      },
    };

    beforeEach(() => {
      mockWebsiteModel.findOne.mockImplementation((filter: Record<string, unknown>) => {
        if (filter?.isActive === false) {
          return { sort: jest.fn().mockResolvedValue(null) } as unknown as Promise<null>;
        }
        if (filter?.slug) return Promise.resolve(null);
        return Promise.resolve(null);
      });
    });

    it('should call smart generator with normalized data', async () => {
      await service.generateWebsite('tenant-123', mockWizardData as any);

      expect(mockSmartWebsiteGenerator.generateSmartWebsite).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-123',
          companyName: mockWizardData.companyName,
          industry: mockWizardData.business.industry,
        }),
      );

      const websiteInstance = mockWebsiteModel.mock.results[0]?.value;
      expect(websiteInstance?.slug).toBe('test-company');
    });

    it('should update existing boutique instead of creating a duplicate', async () => {
      const existing = {
        _id: 'website-existing',
        tenantId: 'tenant-123',
        slug: 'test-company',
        name: 'Old Name',
        theme: {},
        businessConfig: {},
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockWebsiteModel.findOne.mockImplementation((filter: Record<string, unknown>) => {
        if (filter?.isActive === true) return Promise.resolve(existing);
        if (filter?.isActive === false) {
          return { sort: jest.fn().mockResolvedValue(null) } as unknown as Promise<null>;
        }
        return Promise.resolve(null);
      });

      mockPageModel.findOne = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue({ _id: 'page-1' }),
      });

      const result = await service.generateWebsite('tenant-123', mockWizardData as any);

      expect(existing.save).toHaveBeenCalled();
      expect(result.slug).toBe('test-company');
      expect(result.message).toContain('mise à jour');
      expect(mockWebsiteModel.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('findByTenant', () => {
    it('should find website by tenant id', async () => {
      const mockWebsite = {
        _id: 'website-123',
        tenantId: 'tenant-123',
        name: 'Test Website',
      };

      mockWebsiteModel.findOne.mockResolvedValue(mockWebsite);

      const result = await service.findByTenant('tenant-123');

      expect(result).toEqual(mockWebsite);
      expect(mockWebsiteModel.findOne).toHaveBeenCalledWith({ tenantId: 'tenant-123', isActive: true });
    });

    it('should throw NotFoundException when website not found', async () => {
      mockWebsiteModel.findOne.mockImplementation((filter: Record<string, unknown>) => {
        if (filter?.isActive === true) return Promise.resolve(null);
        return { sort: jest.fn().mockResolvedValue(null) };
      });

      await expect(service.findByTenant('non-existent')).rejects.toThrow();
    });
  });
});
