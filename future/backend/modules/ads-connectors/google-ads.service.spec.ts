import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { GoogleAdsService } from './google-ads.service';
import { AdAccount } from './schemas/ad-account.schema';
import { AdCampaign } from './schemas/ad-campaign.schema';

describe('GoogleAdsService', () => {
  let service: GoogleAdsService;
  let mockAdAccountModel: any;
  let mockAdCampaignModel: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockAdAccountModel = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    };

    mockAdCampaignModel = {
      find: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteMany: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        const config: any = {
          GOOGLE_ADS_CLIENT_ID: 'test_client_id',
          GOOGLE_ADS_CLIENT_SECRET: 'test_client_secret',
          GOOGLE_ADS_REDIRECT_URI: 'http://localhost:3000/callback',
          GOOGLE_ADS_DEVELOPER_TOKEN: 'test_dev_token',
          ADS_TOKENS_KEY: '12345678901234567890123456789012',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleAdsService,
        {
          provide: getModelToken(AdAccount.name),
          useValue: mockAdAccountModel,
        },
        {
          provide: getModelToken(AdCampaign.name),
          useValue: mockAdCampaignModel,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<GoogleAdsService>(GoogleAdsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authorize', () => {
    it('should generate OAuth URL', async () => {
      const result = await service.authorize('tenant123');
      
      expect(result).toHaveProperty('redirectUrl');
      expect(result.redirectUrl).toContain('accounts.google.com');
      expect(result.redirectUrl).toContain('client_id=test_client_id');
    });

    it('should return simulation mode when credentials not configured', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      
      const result = await service.authorize('tenant123');
      
      expect(result.mode).toBe('simulation');
    });
  });

  describe('getCampaigns', () => {
    it('should return campaigns for a tenant', async () => {
      const mockCampaigns = [
        {
          tenantId: 'tenant123',
          platform: 'google_ads',
          campaignId: 'campaign1',
          campaignName: 'Test Campaign',
        },
      ];

      mockAdCampaignModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCampaigns),
        }),
      });

      const result = await service.getCampaigns('tenant123');
      
      expect(result).toEqual(mockCampaigns);
      expect(mockAdCampaignModel.find).toHaveBeenCalledWith({
        tenantId: 'tenant123',
        platform: 'google_ads',
      });
    });

    it('should filter by accountId', async () => {
      mockAdCampaignModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      await service.getCampaigns('tenant123', 'account123');
      
      expect(mockAdCampaignModel.find).toHaveBeenCalledWith({
        tenantId: 'tenant123',
        platform: 'google_ads',
        accountId: 'account123',
      });
    });
  });

  describe('disconnect', () => {
    it('should disconnect account and delete campaigns', async () => {
      mockAdAccountModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });
      mockAdCampaignModel.deleteMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 5 }),
      });

      const result = await service.disconnect('tenant123', 'account123');
      
      expect(result.success).toBe(true);
      expect(mockAdAccountModel.deleteOne).toHaveBeenCalled();
      expect(mockAdCampaignModel.deleteMany).toHaveBeenCalled();
    });
  });
});
