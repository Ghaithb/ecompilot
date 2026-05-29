import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/schemas/user.schema';
import { Tenant } from '../tenants/schemas/tenant.schema';
import { NotificationService } from '../notifications/notification.service';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly userModel: Model<User>;
  private readonly tenantModel: Model<Tenant>;
  private readonly jwtService: JwtService;
  private readonly notificationService: NotificationService;
  // In-memory revoked refresh token JTIs (ephemeral, for dev standards)
  private readonly revokedJtis = new Set<string>();

  constructor(
    @InjectModel(User.name) userModel: Model<User>,
    @InjectModel(Tenant.name) tenantModel: Model<Tenant>,
    jwtService: JwtService,
    notificationService: NotificationService,
  ) {
    this.userModel = userModel;
    this.tenantModel = tenantModel;
    this.jwtService = jwtService;
    this.notificationService = notificationService;
  }

  // Generate a refresh token (long lived) with a JWT ID (jti) for rotation/revocation
  generateRefreshToken(payload: Record<string, any>) {
    // Use JwtService config to sign the refresh token
    let expiresIn: string | number = 7 * 24 * 60 * 60; // 7 days in seconds
    if (process.env.JWT_REFRESH_EXPIRES_IN) {
      const envValue = process.env.JWT_REFRESH_EXPIRES_IN;
      expiresIn = isNaN(Number(envValue)) ? envValue : Number(envValue);
    }
    const jti = crypto.randomUUID();
    const refreshToken = this.jwtService.sign(
      { ...payload, jti },
      { expiresIn: expiresIn as number }
    );
    return refreshToken;
  }
  
  // Validate a refresh token
  validateRefreshToken(token: string): any {
    try {
      const decoded = this.jwtService.verify(token);
      
      // Check if token has been revoked
      if (decoded.jti && this.revokedJtis.has(decoded.jti)) {
        throw new UnauthorizedException('Token has been revoked');
      }

      return decoded;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Refresh token validation error: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Revoke a refresh token by its JTI
  revokeRefreshToken(jti: string): void {
    if (!jti) {
      throw new BadRequestException('JTI is required');
    }
    this.revokedJtis.add(jti);
  }

  verifyRefreshToken<T extends (Record<string, unknown> & { jti?: string }) = Record<string, unknown> & { jti?: string }>(
    token: string,
  ): T {
    try {
      const payload = this.jwtService.verify<T>(token);
      // Reject revoked refresh tokens
      const jti = (payload as any)?.jti as string | undefined;
      if (jti && this.revokedJtis.has(jti)) {
        throw new UnauthorizedException('Refresh token révoqué');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Refresh token invalide');
    }
  }

  revokeRefreshJtiFromToken(token: string) {
    try {
      const decoded: any = this.jwtService.decode(token);
      const jti = decoded?.jti as string | undefined;
      if (jti) this.revokedJtis.add(jti);
    } catch {
      // ignore invalid tokens here
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      this.logger.log(`Tentative d'inscription pour l'email: ${registerDto.email}`);
      const startAll = Date.now();

      // Vérifier si l'utilisateur existe déjà
      const tFindUser0 = Date.now();
      const existingUser = await this.userModel
        .findOne({ email: registerDto.email })
        .exec();
      this.logger.debug(`register: find existing user duration=${Date.now() - tFindUser0}ms`);
      
      if (existingUser) {
        this.logger.warn(`Tentative d'inscription avec un email déjà existant: ${registerDto.email}`);
        throw new ConflictException('Un utilisateur avec cet email existe déjà');
      }

      // Générer un nom de tenant (entreprise ou prénom+nom)
      const tenantName = registerDto.companyName || `${registerDto.firstName} ${registerDto.lastName}`;
      
      // Générer un subdomain unique basé sur le nom du tenant
      const baseSubdomain = tenantName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
      
      let subdomain = baseSubdomain;
      let counter = 1;
      
      // Vérifier l'unicité du subdomain
      while (await this.tenantModel.findOne({ subdomain }).exec()) {
        subdomain = `${baseSubdomain}${counter}`;
        counter++;
      }

      // Créer le tenant
      const newTenant = new this.tenantModel({
        name: tenantName,
        subdomain: subdomain,
        plan: 'trial',
        isActive: true,
      });
      const tSaveTenant0 = Date.now();
      const tenant = await newTenant.save();
      this.logger.debug(`register: save tenant duration=${Date.now() - tSaveTenant0}ms id=${tenant._id}`);
      this.logger.log(`Tenant créé avec l'ID: ${tenant._id}`);

      // Hasher le mot de passe
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

      // Créer l'utilisateur
      const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      const isAdmin = adminEmails.includes(registerDto.email.toLowerCase());

      // Générer un code de vérification à 6 chiffres
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      const newUser = new this.userModel({
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        country: registerDto.country,
        phone: registerDto.phone,
        companyName: registerDto.companyName,
        roles: isAdmin ? ['admin'] : ['user'],
        tenantId: tenant._id,
        isActive: true,
        isEmailVerified: false,
        emailVerificationCode: verificationCode,
        emailVerificationCodeExpires: verificationCodeExpires,
      });
      const tSaveUser0 = Date.now();
      const user = await newUser.save();
      this.logger.debug(`register: save user duration=${Date.now() - tSaveUser0}ms id=${user._id}`);
      this.logger.log(`Utilisateur créé avec l'ID: ${user._id}`);

      // Envoyer le code de vérification par email
      try {
        await this.notificationService.sendEmailVerificationCode(
          user.email,
          user.firstName,
          verificationCode
        );
        this.logger.log(`Code de vérification envoyé à ${user.email}`);
      } catch (error) {
        this.logger.error(`Erreur lors de l'envoi du code de vérification: ${error.message}`);
        // Ne pas bloquer l'inscription si l'email échoue
      }

      // Générer le token JWT avec tenantId en string
      const payload = {
        email: user.email,
        sub: user._id.toString(),
        tenantId: tenant._id.toString(),
        roles: user.roles,
      };

      const token = this.jwtService.sign(payload);
      this.logger.log(`Token JWT généré pour l'utilisateur: ${user._id}`);
      this.logger.debug(`register: total duration=${Date.now() - startAll}ms`);
      return {
        access_token: token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          tenant: {
            id: tenant._id,
            name: tenant.name,
            plan: tenant.plan,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Erreur lors de l'inscription: ${error.message}`, error.stack);
      
      if (error instanceof ConflictException) {
        throw error;
      }
      
      throw new BadRequestException('Erreur lors de la création du compte');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      this.logger.log(`Tentative de connexion pour l'email: ${loginDto.email}`);
      const startAll = Date.now();

      const tFindUser0 = Date.now();
      const user = await this.userModel
        .findOne({ email: loginDto.email })
        .populate('tenantId')
        .exec();
      this.logger.debug(`login: find user duration=${Date.now() - tFindUser0}ms`);

      if (!user) {
        this.logger.warn(`Tentative de connexion avec un email inexistant: ${loginDto.email}`);
        throw new UnauthorizedException('Email ou mot de passe invalide');
      }

      // Optionnel: forcer email vérifié avant connexion si activé via ENV
      if (String(process.env.ENFORCE_EMAIL_VERIFICATION).toLowerCase() === 'true') {
        if (!user.isEmailVerified) {
          throw new UnauthorizedException('Email non vérifié');
        }
      }

      if (!user.isActive) {
        this.logger.warn(`Tentative de connexion avec un compte inactif: ${loginDto.email}`);
        throw new UnauthorizedException('Compte désactivé');
      }

      const tPw0 = Date.now();
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      this.logger.debug(`login: password compare duration=${Date.now() - tPw0}ms`);
      if (!isPasswordValid) {
        this.logger.warn(`Tentative de connexion avec un mot de passe invalide: ${loginDto.email}`);
        throw new UnauthorizedException('Email ou mot de passe invalide');
      }

      // Extraire l'ID du tenant de manière cohérente
      const tenantId = user.tenantId._id ? user.tenantId._id.toString() : user.tenantId.toString();

      const payload = {
        email: user.email,
        sub: user._id.toString(),
        tenantId: tenantId,
        roles: user.roles,
      };

      const token = this.jwtService.sign(payload);
      this.logger.log(`Connexion réussie pour l'utilisateur: ${user._id}`);
      this.logger.debug(`login: total duration=${Date.now() - startAll}ms`);

      return {
        access_token: token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          tenant: {
            id: user.tenantId._id || user.tenantId,
            name: (user.tenantId as any).name || 'N/A',
            plan: (user.tenantId as any).plan || 'trial',
          },
        },
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la connexion: ${error.message}`, error.stack);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new BadRequestException('Erreur lors de la connexion');
    }
  }

  async refreshToken(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('tenantId')
      .exec();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
    }

    const tenantId = user.tenantId._id ? user.tenantId._id.toString() : user.tenantId.toString();

    const payload = {
      email: user.email,
      sub: user._id.toString(),
      tenantId: tenantId,
      roles: user.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('tenantId')
      .exec();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
    }

    const tenant = user.tenantId as any;

    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      avatar: user.avatar,
      roles: user.roles,
      preferences: user.preferences || { emailNotifications: true, pushNotifications: true, darkMode: false, language: 'fr' },
      tenant: {
        id: tenant?._id || tenant || null,
        name: tenant?.name || 'N/A',
        plan: tenant?.plan || 'trial',
      },
    };
  }

  async updateProfile(userId: string, updateData: { email?: string; firstName?: string; lastName?: string; companyName?: string }) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
    }

    // Vérifier si l'email est déjà utilisé
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userModel.findOne({ email: updateData.email, tenantId: user.tenantId }).exec();
      if (existingUser) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    // Mettre à jour les champs
    if (updateData.email) user.email = updateData.email;
    if (updateData.firstName) user.firstName = updateData.firstName;
    if (updateData.lastName) user.lastName = updateData.lastName;
    if (updateData.companyName !== undefined) user.companyName = updateData.companyName;

    await user.save();
    this.logger.log(`✅ Profile updated for user: ${userId}`);
    return this.getProfile(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    // Mettre à jour le mot de passe
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    return { success: true, message: 'Mot de passe changé avec succès' };
  }

  async updatePreferences(userId: string, preferences: { emailNotifications?: boolean; pushNotifications?: boolean; darkMode?: boolean; language?: string }) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
    }

    // Mettre à jour les préférences
    user.preferences = {
      ...user.preferences,
      ...preferences,
    };

    await user.save();
    this.logger.log(`✅ Preferences saved: ${JSON.stringify(user.preferences)}`);
    return { success: true, preferences: user.preferences };
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
    }

    user.avatar = avatarUrl;
    await user.save();
    return { success: true, avatar: avatarUrl };
  }

  // === Email Verification ===
  async requestEmailVerification(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    if (user.isEmailVerified) {
      return { success: true, message: 'Email déjà vérifié' };
    }

    // Générer un code à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.emailVerificationToken = verificationCode;
    user.emailVerificationExpires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
    await user.save();

    this.logger.log(`📧 Sending verification code to ${user.email}: ${verificationCode}`);

    // Envoyer l'email avec le code
    try {
      await this.notificationService.sendEmail(
        user.email,
        'email_verification_code',
        {
          firstName: user.firstName,
          verificationCode,
        }
      );
      this.logger.log(`✅ Verification email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send verification email: ${error.message}`);
      // Ne pas bloquer si l'email échoue
    }

    return { 
      success: true,
      message: 'Code de vérification envoyé'
    };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email déjà vérifié');
    }

    if (!user.emailVerificationCode || !user.emailVerificationCodeExpires) {
      throw new BadRequestException('Aucune demande de vérification en cours');
    }

    if (user.emailVerificationCodeExpires < new Date()) {
      throw new BadRequestException('Code expiré');
    }

    if (user.emailVerificationCode !== code) {
      throw new BadRequestException('Code incorrect');
    }

    // Code valide
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;
    await user.save();

    this.logger.log(`✅ Email verified for user: ${user.email}`);

    return { 
      success: true, 
      message: 'Email vérifié avec succès' 
    };
  }

  async resendVerificationCode(email: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email déjà vérifié');
    }

    // Générer un nouveau code de vérification
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.emailVerificationCode = verificationCode;
    user.emailVerificationCodeExpires = verificationCodeExpires;
    await user.save();

    // Envoyer le nouveau code par email
    try {
      await this.notificationService.sendEmailVerificationCode(
        user.email,
        user.firstName,
        verificationCode
      );
      this.logger.log(`Nouveau code de vérification envoyé à ${user.email}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi du code de vérification: ${error.message}`);
      throw new BadRequestException('Erreur lors de l\'envoi du code de vérification');
    }

    return {
      success: true,
      message: 'Un nouveau code de vérification a été envoyé'
    };
  }

  // === Password Reset ===
  async requestPasswordReset(email: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) return { success: true };
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    await user.save();
    // Ici: envoyer email avec lien contenant le token
    return { success: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).exec();
    if (!user) throw new BadRequestException('Token invalide ou expiré');
    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return { success: true };
  }
}