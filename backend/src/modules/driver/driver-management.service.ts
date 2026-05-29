import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { InviteDriverDto } from './dto/invite-driver.dto';
import { AppRole } from '../../common/enums/app-role.enum';
import { normalizeTunisianPhone } from '../../common/utils/phone.util';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class DriverManagementService {
  private readonly logger = new Logger(DriverManagementService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  async getDriversByTenant(tenantId: string) {
    const drivers = await this.userModel
      .find({ tenantId, roles: { $in: [AppRole.DRIVER] } })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return drivers.map((d) => ({
      ...d,
      fullName: `${d.firstName} ${d.lastName}`.trim(),
    }));
  }

  async inviteDriver(tenantId: string, invitedBy: string, dto: InviteDriverDto) {
    const phone = normalizeTunisianPhone(dto.phone);
    const existing = await this.userModel.findOne({
      tenantId,
      $or: [{ phone }, ...(dto.email ? [{ email: dto.email.toLowerCase() }] : [])],
    });
    if (existing) {
      throw new ConflictException('Un livreur avec ce numéro ou cet email existe déjà');
    }

    const parts = dto.fullName.trim().split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || 'Livreur';
    const email =
      dto.email?.toLowerCase() ||
      `driver.${phone.replace(/\D/g, '')}@drivers.ecompilot.local`;

    const tempPassword = `Ep${randomBytes(3).toString('hex')}!`;

    const user = await this.userModel.create({
      email,
      password: await bcrypt.hash(tempPassword, 12),
      firstName,
      lastName,
      phone,
      country: 'TN',
      tenantId: new Types.ObjectId(tenantId),
      roles: [AppRole.DRIVER],
      isActive: true,
      isEmailVerified: true,
      driverProfile: {
        vehicleType: dto.vehicleType || 'moto',
        invitedAt: new Date(),
        invitedBy,
      },
    });

    const loginHint = `${process.env.FRONTEND_URL || 'http://127.0.0.1:5175'}/login`;
    const message =
      `🚚 EcomPilot — Compte livreur créé\n\n` +
      `Bonjour ${firstName},\n` +
      `Connectez-vous sur : ${loginHint}\n` +
      `Email : ${email}\n` +
      `Mot de passe temporaire : ${tempPassword}\n\n` +
      `Changez votre mot de passe après la première connexion.`;

    try {
      await this.whatsAppService.sendTextMessage(tenantId, { to: phone, message });
    } catch (e) {
      this.logger.warn(`Invitation WhatsApp non envoyée: ${(e as Error).message}`);
    }

    const obj = user.toObject();
    delete obj.password;

    return {
      driver: {
        ...obj,
        fullName: `${firstName} ${lastName}`,
      },
      tempPassword,
      whatsappSent: true,
    };
  }

  async toggleDriverActive(tenantId: string, driverId: string, isActive: boolean) {
    const driver = await this.userModel.findOne({
      _id: driverId,
      tenantId,
      roles: { $in: [AppRole.DRIVER] },
    });
    if (!driver) throw new ConflictException('Livreur introuvable');
    driver.isActive = isActive;
    await driver.save();
    const obj = driver.toObject();
    delete obj.password;
    return obj;
  }
}
