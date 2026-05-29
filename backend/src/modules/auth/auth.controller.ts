import { Controller, Post, Body, Get, UseGuards, Request, Logger, Res, Req, UseInterceptors } from '@nestjs/common';
import type { Response, Request as ExpressRequest } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestEmailVerificationDto, VerifyEmailDto } from './dto/verify-email.dto';
import { RequestPasswordResetDto, ConfirmPasswordResetDto } from './dto/reset-password.dto';
import { UpdateProfileDto, ChangePasswordDto, UpdatePreferencesDto } from './dto/update-profile.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur', description: 'Crée un nouveau compte utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données d\'entrée invalides' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  @ApiBody({ type: RegisterDto })
  @Throttle({ short: { limit: 2, ttl: 60000 } }) // 2 inscriptions par minute
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    // Log incoming payload for diagnostic purposes (not the password in prod)
    try {
      const masked = { ...registerDto, password: registerDto.password ? '***' : undefined };
      this.logger.log('Register payload received: ' + JSON.stringify(masked));
    } catch (e) {
      this.logger.debug('Failed to stringify register payload');
    }

    const result = await this.authService.register(registerDto);
    // set refresh token as httpOnly cookie
    try {
      const refresh = this.authService.generateRefreshToken({ sub: result.user.id, tenantId: result.user.tenant.id, roles: result.user.roles });
      response.cookie('refreshToken', refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return result;
    } catch (e) {
      return result;
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur', description: 'Authentifie un utilisateur et retourne un token JWT' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives de connexion' })
  @ApiBody({ type: LoginDto })
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 tentatives de connexion par minute
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    try {
      this.logger.debug('Login attempt with:', JSON.stringify(loginDto, null, 2));
      const result = await this.authService.login(loginDto);
      // generate refresh token and set httpOnly cookie
      try {
        const refresh = this.authService.generateRefreshToken({ sub: result.user.id, tenantId: result.user.tenant.id, roles: result.user.roles });
        response.cookie('refreshToken', refresh, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return result;
      } catch (e) {
        return result;
      }
    } catch (error) {
      this.logger.error('Login error:', error.message);
      this.logger.error('Login error stack:', error.stack);
      throw error;
    }
  }

  @Post('refresh-token')
  async refreshTokenEndpoint(@Req() req: ExpressRequest, @Res() res: Response) {
    // read refresh token from cookie or body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token manquant' });
    }

    try {
      const payload = this.authService.verifyRefreshToken(refreshToken);
      const newAccess = this.jwtService.sign({ email: (payload as any).email, sub: (payload as any).sub, tenantId: (payload as any).tenantId, roles: (payload as any).roles });
      // rotate refresh token and revoke old jti
      this.authService.revokeRefreshJtiFromToken(refreshToken);
      const newRefresh = this.authService.generateRefreshToken({ sub: (payload as any).sub, tenantId: (payload as any).tenantId, roles: (payload as any).roles });
      // Set cookie (httpOnly)
      res.cookie('refreshToken', newRefresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      return res.json({ access_token: newAccess });
    } catch (err) {
      return res.status(401).json({ message: 'Refresh token invalide' });
    }
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@Request() req) {
    return this.authService.refreshToken(req.user.userId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard) // Seulement JwtAuthGuard, pas TenantGuard
  async getProfile(@Request() req) {
    // req.user contains token payload; fetch fresh profile from DB
    const user = await this.authService.getProfile(req.user.userId);
    return { user };
  }

  @Post('logout')
  async logout(@Req() req: ExpressRequest, @Res() res: Response) {
    try {
      const rt = req.cookies?.refreshToken;
      if (rt) this.authService.revokeRefreshJtiFromToken(rt);
      // Clear httpOnly refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      });
      return res.json({ message: 'Déconnecté' });
    } catch (e) {
      return res.status(200).json({ message: 'Déconnecté' });
    }
  }

  // === Email Verification (Code à 6 chiffres) ===
  @Post('email/request-verification')
  @UseGuards(JwtAuthGuard)
  @Throttle({ short: { limit: 3, ttl: 300000 } }) // 3 demandes par 5 minutes
  @ApiOperation({ summary: 'Demander un code de vérification par email' })
  @ApiResponse({ status: 200, description: 'Code envoyé par email' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async requestEmailVerificationCode(@Request() req) {
    this.logger.log(`📧 [REQUEST VERIFICATION] User: ${req.user.userId}`);
    const result = await this.authService.requestEmailVerification(req.user.userId);
    this.logger.log(`✅ [REQUEST VERIFICATION] Code sent to user: ${req.user.userId}`);
    return result;
  }

  @Post('email/verify-code')
  @Throttle({ short: { limit: 5, ttl: 300000 } }) // 5 tentatives par 5 minutes
  @ApiOperation({ summary: 'Vérifier le code de vérification email' })
  @ApiResponse({ status: 200, description: 'Email vérifié avec succès' })
  @ApiResponse({ status: 400, description: 'Code invalide ou expiré' })
  async verifyEmailCodeEndpoint(@Body('email') email: string, @Body('code') code: string) {
    this.logger.log(`🔍 [VERIFY CODE] Email: ${email}, Code: ${code}`);
    const result = await this.authService.verifyEmail(email, code);
    this.logger.log(`✅ [VERIFY CODE] Email verified for: ${email}`);
    return result;
  }

  @Post('email/resend-code')
  @Throttle({ short: { limit: 3, ttl: 300000 } }) // 3 demandes par 5 minutes
  @ApiOperation({ summary: 'Renvoyer un code de vérification email' })
  @ApiResponse({ status: 200, description: 'Nouveau code envoyé' })
  @ApiResponse({ status: 400, description: 'Email invalide ou déjà vérifié' })
  async resendVerificationCodeEndpoint(@Body('email') email: string) {
    this.logger.log(`📧 [RESEND CODE] Email: ${email}`);
    const result = await this.authService.resendVerificationCode(email);
    this.logger.log(`✅ [RESEND CODE] Code sent to: ${email}`);
    return result;
  }

  // Password reset flow
  @Post('request-password-reset')
  @Throttle({ short: { limit: 3, ttl: 300000 } }) // 3 demandes par 5 minutes
  async requestPasswordReset(@Body() body: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  @Throttle({ short: { limit: 5, ttl: 300000 } }) // 5 tentatives par 5 minutes
  async resetPassword(@Body() body: ConfirmPasswordResetDto) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Get('test-jwt')
  @UseGuards(JwtAuthGuard)
  async testJwt(@Request() req) {
    return {
      message: 'JWT fonctionne!',
      user: req.user,
      timestamp: new Date().toISOString(),
    };
  }

  // === Profile Management ===
  @Post('profile/update')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour le profil utilisateur' })
  @ApiResponse({ status: 200, description: 'Profil mis à jour avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiBody({ type: UpdateProfileDto })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    this.logger.log(`📝 [UPDATE PROFILE] User: ${req.user.userId}, Data: ${JSON.stringify(updateProfileDto)}`);
    const result = await this.authService.updateProfile(req.user.userId, updateProfileDto);
    this.logger.log(`✅ [UPDATE PROFILE] Success for user: ${req.user.userId}`);
    return result;
  }

  @Post('profile/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Changer le mot de passe' })
  @ApiResponse({ status: 200, description: 'Mot de passe changé avec succès' })
  @ApiResponse({ status: 400, description: 'Mot de passe actuel incorrect' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    this.logger.log(`🔐 [CHANGE PASSWORD] User: ${req.user.userId}`);
    const result = await this.authService.changePassword(
      req.user.userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
    this.logger.log(`✅ [CHANGE PASSWORD] Success for user: ${req.user.userId}`);
    return result;
  }

  @Post('profile/preferences')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour les préférences utilisateur' })
  @ApiResponse({ status: 200, description: 'Préférences mises à jour avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiBody({ type: UpdatePreferencesDto })
  async updatePreferences(@Request() req, @Body() updatePreferencesDto: UpdatePreferencesDto) {
    this.logger.log(`⚙️ [UPDATE PREFERENCES] User: ${req.user.userId}, Preferences: ${JSON.stringify(updatePreferencesDto)}`);
    const result = await this.authService.updatePreferences(req.user.userId, updatePreferencesDto);
    this.logger.log(`✅ [UPDATE PREFERENCES] Success for user: ${req.user.userId}, New preferences: ${JSON.stringify(result.preferences)}`);
    return result;
  }

  @Post('profile/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour l\'avatar utilisateur' })
  @ApiResponse({ status: 200, description: 'Avatar mis à jour avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async updateAvatar(@Request() req, @Body('avatarUrl') avatarUrl: string) {
    return this.authService.updateAvatar(req.user.userId, avatarUrl);
  }
}

