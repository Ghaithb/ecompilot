import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BudgetsService } from './budgets.service';
import { Budget } from './schemas/budget.schema';
import { Types } from 'mongoose';

describe('BudgetsService', () => {
  let service: BudgetsService;
  let mockBudgetModel: any;

  const mockBudget = {
    _id: new Types.ObjectId().toHexString(),
    tenantId: 'tenant123',
    name: 'Test Campaign Budget',
    platform: 'google_ads',
    totalBudget: 5000,
    spent: 1000,
    remaining: 4000,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-31'),
    status: 'active',
    alertThreshold: 80,
    metrics: {
      impressions: 10000,
      clicks: 500,
      conversions: 25,
      roas: 3.2,
    },
    alertsSent: [],
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    const mockSave = jest.fn().mockImplementation(function() {
      return Promise.resolve(this);
    });
    
    const mockModel = function(data) {
      return {
        ...mockBudget,
        ...data,
        save: mockSave,
      };
    };

    // Ajout des méthodes statiques au constructeur
    mockModel.find = jest.fn().mockReturnThis();
    mockModel.findOne = jest.fn().mockReturnThis();
    mockModel.findOneAndUpdate = jest.fn().mockReturnThis();
    mockModel.deleteOne = jest.fn().mockReturnThis();
    mockModel.sort = jest.fn().mockReturnThis();
    mockModel.exec = jest.fn().mockResolvedValue(mockBudget);
    mockModel.save = mockSave;

    mockBudgetModel = mockModel;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        {
          provide: getModelToken(Budget.name),
          useValue: mockBudgetModel,
        },
      ],
    }).compile();

    service = module.get<BudgetsService>(BudgetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new budget', async () => {
      const createDto = {
        name: 'Test Campaign',
        platform: 'google_ads',
        totalBudget: 5000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      };

      const result = await service.create('tenant123', createDto);
      expect(result).toBeDefined();
      expect(mockBudgetModel.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all budgets for a tenant', async () => {
      const budgets = [mockBudget];
      mockBudgetModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(budgets),
        }),
      });

      const result = await service.findAll('tenant123');
      expect(result).toEqual(budgets);
      expect(mockBudgetModel.find).toHaveBeenCalledWith({ tenantId: 'tenant123' });
    });

    it('should filter by status', async () => {
      mockBudgetModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockBudget]),
        }),
      });

      await service.findAll('tenant123', { status: 'active' });
      expect(mockBudgetModel.find).toHaveBeenCalledWith({
        tenantId: 'tenant123',
        status: 'active',
      });
    });
  });

  describe('recordSpending', () => {
    it('should record spending and update budget', async () => {
      const budget = {
        ...mockBudget,
        spent: 1000,
        remaining: 4000,
        totalBudget: 5000,
        alertsSent: [],
        save: jest.fn().mockImplementation(function() {
          return Promise.resolve(this);
        }),
      };

      mockBudgetModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(budget),
      });

      const result = await service.recordSpending('tenant123', new Types.ObjectId().toHexString(), 500);
      
      expect(result.spent).toBe(1500);
      expect(result.remaining).toBe(3500);
    });

    it('should trigger alert when threshold reached', async () => {
      const budget = {
        ...mockBudget,
        spent: 3500,
        remaining: 1500,
        totalBudget: 5000,
        alertThreshold: 80,
        alertsSent: [],
        save: jest.fn().mockImplementation(function() {
          return Promise.resolve(this);
        }),
      };

      mockBudgetModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(budget),
      });

      const result = await service.recordSpending('tenant123', new Types.ObjectId().toHexString(), 500);
      
      expect(result.alertsSent).toContain('threshold');
    });
  });

  describe('getRecommendations', () => {
    it('should return recommendations for under-utilized budgets', async () => {
      const underUtilizedBudget = {
        ...mockBudget,
        spent: 1000,
        totalBudget: 5000,
        startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      };

      mockBudgetModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([underUtilizedBudget]),
        }),
      });

      const result = await service.getRecommendations('tenant123');
      
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0].type).toBe('increase_spending');
    });

    it('should recommend based on high ROAS', async () => {
      const highROASBudget = {
        ...mockBudget,
        metrics: { ...mockBudget.metrics, roas: 5.0 },
      };

      mockBudgetModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([highROASBudget]),
        }),
      });

      const result = await service.getRecommendations('tenant123');
      
      const increaseRec = result.recommendations.find(r => r.type === 'increase_budget');
      expect(increaseRec).toBeDefined();
    });
  });
});
