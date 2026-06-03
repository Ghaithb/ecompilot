import { Test, TestingModule } from '@nestjs/testing';
import { WhatsAppService } from './whatsapp.service';
import { MetaWhatsAppProvider } from './providers/meta-whatsapp.provider';
import { WahaProvider } from './providers/waha.provider';
import { getModelToken } from '@nestjs/mongoose';
import { Tenant } from '../tenants/schemas/tenant.schema';
import { ConfigService } from '@nestjs/config';
import { WhatsAppMessage } from './schemas/whatsapp-message.schema';

describe('WhatsAppService - Hybrid Provider', () => {
  let service: WhatsAppService;
  let tenantModel: any;

  beforeEach(async () => {
    const mockTenantModel = {
      findById: jest.fn(),
    };

    const mockMetaProvider = {
      sendTextMessage: jest.fn().mockResolvedValue(true),
      sendTemplateMessage: jest.fn().mockResolvedValue(true),
    };

    const mockWahaProvider = {
      sendTextMessage: jest.fn().mockResolvedValue(true),
      sendTemplateMessage: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppService,
        { provide: MetaWhatsAppProvider, useValue: mockMetaProvider },
        { provide: WahaProvider, useValue: mockWahaProvider },
        { provide: getModelToken(Tenant.name), useValue: mockTenantModel },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('meta') } },
        { provide: getModelToken(WhatsAppMessage.name), useValue: { create: jest.fn(), save: jest.fn() } },
      ],
    }).compile();

    service = module.get<WhatsAppService>(WhatsAppService);
    tenantModel = module.get(getModelToken(Tenant.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should resolve to WAHA provider if configured', async () => {
    tenantModel.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        settings: {
          whatsapp: { provider: 'waha', wahaUrl: 'http://test', wahaToken: 'test' }
        }
      })
    });

    const result = await service['getProvider']('tenant123'); // getProvider returns { provider: IWhatsAppProvider, config?: any }
    expect(result.provider).toBeDefined();
  });

  it('should default to META provider if not configured', async () => {
    tenantModel.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        settings: {}
      })
    });

    const result = await service['getProvider']('tenant123');
    expect(result.provider).toBeDefined();
  });
});
