import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User } from '../users/schemas/user.schema';
import { NotificationService } from '../notifications/notification.service';
import { Tenant } from '../tenants/schemas/tenant.schema';
import { UnauthorizedException } from '@nestjs/common';
import crypto from 'crypto';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));
const bcrypt = require('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let userModel: any;
  let tenantModel: any;
  let jwtService: any;

  const mockPayload = {
    sub: 'user123',
    tenantId: 'tenant123',
    roles: ['user'],
  };

  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    tenantId: 'tenant123',
    roles: ['user'],
    isActive: true,
    save: jest.fn(),
  };

  const mockTenant = {
    _id: 'tenant123',
    name: 'Test Company',
    subdomain: 'test',
    plan: 'trial',
  };

  let mockQueryBuilder;
  let mockUserModelMethods;
  let mockTenantModelMethods;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockQueryBuilder = {
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    mockUserModelMethods = function() {
      return {
        save: jest.fn().mockResolvedValue({
          _id: 'new-user',
          email: 'new@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          roles: ['user'],
        }),
      };
    };
    mockUserModelMethods.findOne = jest.fn().mockReturnValue(mockQueryBuilder);
    mockUserModelMethods.create = jest.fn();
    mockUserModelMethods.findById = jest.fn().mockReturnValue(mockQueryBuilder);
    mockUserModelMethods.findOneAndUpdate = jest.fn();

    mockTenantModelMethods = function() {
      return {
        save: jest.fn().mockResolvedValue({
          _id: 'new-tenant',
          name: 'New Company',
          subdomain: 'newcompany',
          plan: 'trial',
        }),
      };
    };
    mockTenantModelMethods.findOne = jest.fn().mockReturnValue(mockQueryBuilder);
    mockTenantModelMethods.create = jest.fn();

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    };

    const mockNotificationService = {
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
      sendEmailVerificationCode: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModelMethods,
        },
        {
          provide: getModelToken(Tenant.name),
          useValue: mockTenantModelMethods,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    tenantModel = module.get(getModelToken(Tenant.name));
    jwtService = module.get(JwtService);

    // Setup default mocks
    bcrypt.compare.mockImplementation(() => Promise.resolve(true));
    bcrypt.hash.mockImplementation(() => Promise.resolve('hashedPassword'));
    jwtService.sign.mockReturnValue('jwt-token');
    jwtService.verify.mockReturnValue({ ...mockPayload, jti: '123' });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUserResponse = {
        ...mockUser,
        tenantId: mockTenant,
      };

      mockQueryBuilder.exec.mockResolvedValue(mockUserResponse);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token', 'jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = {
        email: 'invalid@example.com',
        password: 'password123',
      };

      userModel.findOne().exec.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow('Email ou mot de passe invalide');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUserResponse = {
        ...mockUser,
        tenantId: mockTenant,
      };

      mockQueryBuilder.exec.mockResolvedValue(mockUserResponse);
      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(service.login(loginDto)).rejects.toThrow('Email ou mot de passe invalide');
    });
  });

  describe('token management', () => {
    it('should generate a refresh token with UUID jti', () => {
      const mockJti = '4d4b7e8f-a14a-4982-a81c-b0c4e1295c51';
      jest.spyOn(crypto, 'randomUUID').mockReturnValue(mockJti);

      service.generateRefreshToken(mockPayload);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { ...mockPayload, jti: mockJti },
        { expiresIn: 604800 }
      );
    });

    it('should revoke a refresh token', () => {
      const mockJti = '123';
      jwtService.verify.mockReturnValueOnce({ ...mockPayload, jti: mockJti });
      
      const token = 'mock.refresh.token';
      service.revokeRefreshToken(mockJti);
      
      jwtService.verify.mockReturnValueOnce({ ...mockPayload, jti: mockJti });
      expect(() => service.validateRefreshToken(token)).toThrow(UnauthorizedException);
    });

    it('should validate a valid refresh token', () => {
      const mockJti = '4d4b7e8f-a14a-4982-a81c-b0c4e1295c51';
      const mockDecoded = { ...mockPayload, jti: mockJti };
      jwtService.verify.mockReturnValueOnce(mockDecoded);
      
      const token = 'mock.refresh.token';
      const result = service.validateRefreshToken(token);
      expect(result).toEqual(mockDecoded);
    });

    it('should reject an expired refresh token', () => {
      jwtService.verify.mockImplementationOnce(() => {
        throw new Error('jwt expired');
      });
      
      const token = 'mock.expired.token';
      expect(() => service.validateRefreshToken(token)).toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        country: 'FR',
        phone: '+33612345678',
        firstName: 'Jane',
        lastName: 'Smith',
        companyName: 'New Company',
      };

      // Mock user check - should return null to indicate no existing user
      mockQueryBuilder.exec.mockResolvedValueOnce(null).mockResolvedValueOnce(null); // First for user check, second for tenant check

      // Mock tenant creation
      const mockNewTenant = {
        _id: 'new-tenant',
        name: 'New Company',
        subdomain: 'newcompany',
        plan: 'trial',
        save: jest.fn().mockResolvedValue({
          _id: 'new-tenant',
          name: 'New Company',
          subdomain: 'newcompany',
          plan: 'trial',
        }),
      };

      mockTenantModelMethods.create.mockReturnValue(mockNewTenant);

      // Mock that no existing user is found
      mockQueryBuilder.exec.mockResolvedValue(null);
      
      // Mock user creation
      const mockNewUser = {
        _id: 'new-user',
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        tenantId: mockNewTenant._id,
        roles: ['user'],
        save: jest.fn().mockResolvedValue({
          _id: 'new-user',
          email: 'new@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          tenantId: mockNewTenant._id,
          roles: ['user'],
        }),
      };

      mockUserModelMethods.create.mockReturnValue(mockNewUser);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token', 'jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('new@example.com');
    });
  });
});




