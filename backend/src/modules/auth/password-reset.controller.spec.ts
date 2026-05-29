import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PasswordResetController } from './password-reset.controller';
import { RequestPasswordResetDto, ConfirmPasswordResetDto } from './dto/reset-password.dto';

describe('PasswordResetController', () => {
  let controller: PasswordResetController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PasswordResetController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            requestPasswordReset: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PasswordResetController>(PasswordResetController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('requestPasswordReset', () => {
    it('should handle password reset request', async () => {
      const dto: RequestPasswordResetDto = { email: 'test@example.com' };
      
      const result = await controller.requestPasswordReset(dto);
      
      expect(authService.requestPasswordReset).toHaveBeenCalledWith(dto.email);
      expect(result.message).toBeDefined();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const dto: ConfirmPasswordResetDto = {
        token: 'valid-token',
        newPassword: 'NewPassword123',
      };
      
      const result = await controller.resetPassword(dto);
      
      expect(authService.resetPassword).toHaveBeenCalledWith(dto.token, dto.newPassword);
      expect(result.message).toBeDefined();
    });
  });
});