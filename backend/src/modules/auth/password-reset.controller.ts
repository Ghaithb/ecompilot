import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestPasswordResetDto, ConfirmPasswordResetDto } from './dto/reset-password.dto';

@Controller('auth')
export class PasswordResetController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    await this.authService.requestPasswordReset(dto.email);
    return { message: 'Si votre email existe dans notre base, vous recevrez un lien de réinitialisation' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ConfirmPasswordResetDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { message: 'Votre mot de passe a été réinitialisé avec succès' };
  }
}