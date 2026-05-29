import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';
import { getModelToken } from '@nestjs/mongoose';
import { Tenant } from '../../modules/tenants/schemas/tenant.schema';

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let tenantModel: any;

  const mockTenant = {
    _id: 'tenant123',
    name: 'Test Tenant',
  };

  beforeEach(async () => {
    const mockTenantModel = {
      findById: jest.fn().mockResolvedValue({
        ...mockTenant,
        status: 'active',
        subscription: { status: 'active' }
      })
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantGuard,
        {
          provide: getModelToken(Tenant.name),
          useValue: mockTenantModel
        },
      ],
    }).compile();

    guard = module.get<TenantGuard>(TenantGuard);
    tenantModel = module.get(getModelToken(Tenant.name));
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw ForbiddenException if no user', async () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({
        headers: {},
        user: null
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow('Accès refusé - Authentification requise');
  });

  it('should allow request if valid user and tenant', async () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({
        user: {
          tenantId: 'tenant123',
          roles: ['user']
        }
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });
});
