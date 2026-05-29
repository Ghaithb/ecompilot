import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Logger, BadRequestException } from '@nestjs/common';
import { MlClient } from '../../common/clients/ml.client';

describe('AiService', () => {
  let service: AiService;
  let productModel: any;
  let orderModel: any;
  let configService: any;
  let mlClient: any;

  beforeEach(async () => {
    productModel = {};
    orderModel = {};
    configService = { get: jest.fn((key) => {
      if (key === 'openai.apiKey') return '';
      if (key === 'gemini.apiKey') return '';
      return undefined;
    }) };
    mlClient = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: getModelToken('Product'), useValue: productModel },
        { provide: getModelToken('Order'), useValue: orderModel },
        { provide: ConfigService, useValue: configService },
        { provide: MlClient, useValue: mlClient },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('chatWithCopilot', () => {
    it('should return simulated response if no AI configured', async () => {
      jest.spyOn(service as any, 'getBusinessContext').mockResolvedValue({});
      const result = await service.chatWithCopilot('tenantId', 'Bonjour IA !');
      expect(result.response).toContain('[MODE SIMULATION]');
    });
    it('should throw BadRequestException on error', async () => {
      jest.spyOn(service as any, 'getBusinessContext').mockRejectedValue(new Error('fail'));
      await expect(service.chatWithCopilot('tenantId', 'test')).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateProductContent', () => {
    it('should return simulated product content if no AI configured', async () => {
      const result = await (service as any).getSimulatedResponse('content', { productName: 'Test', category: 'Cat', features: ['A', 'B'] });
      expect(result.title).toContain('Test');
      expect(result.description).toContain('Cat');
      expect(result.seoOptimized).toBe(true);
    });
  });

  describe('callAI', () => {
    it('should return simulated string if no AI configured', async () => {
      const result = await (service as any).callAI('test prompt');
      expect(result).toContain('Réponse simulée');
    });
    it('should throw BadRequestException on error', async () => {
      // Mock gemini property
      Object.defineProperty(service, 'isGeminiConfigured', { get: () => true });
      Object.defineProperty(service, 'gemini', { 
        value: {
          getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: jest.fn().mockRejectedValue(new Error('AI Error'))
          })
        }
      });
      
      await expect((service as any).callAI('prompt')).rejects.toThrow(BadRequestException);
    });
  });
});
