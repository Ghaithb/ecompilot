import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { NotificationService } from './notification.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Génère et envoie un code OTP par SMS
   */
  async generateAndSendOtp(
    tenantId: string,
    phone: string,
    purpose: string,
    referenceId?: string,
  ): Promise<boolean> {
    // 1. Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Définir l'expiration (15 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // 3. Sauvegarder en base
    const otp = new this.otpModel({
      tenantId: new Types.ObjectId(tenantId),
      phone,
      code,
      purpose,
      referenceId: referenceId ? new Types.ObjectId(referenceId) : undefined,
      expiresAt,
    });

    await otp.save();

    // 4. Envoyer par SMS (simulé ou réel via NotificationService)
    const message = `Votre code de validation EcomPilot est : ${code}. Valable 15 minutes.`;
    const sent = await this.notificationService.sendSMS(phone, message);

    if (sent) {
      this.logger.log(`OTP envoyé à ${phone} pour ${purpose}`);
    } else {
      this.logger.error(`Échec envoi OTP à ${phone}`);
    }

    return sent;
  }

  /**
   * Vérifie un code OTP
   */
  async verifyOtp(
    tenantId: string,
    phone: string,
    code: string,
    purpose: string,
  ): Promise<boolean> {
    const otp = await this.otpModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
      phone,
      code,
      purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 }).exec();

    if (!otp) {
      this.logger.warn(`Échec vérification OTP pour ${phone}: code invalide ou expiré`);
      return false;
    }

    // Marquer comme utilisé
    otp.isUsed = true;
    await otp.save();

    this.logger.log(`OTP vérifié avec succès pour ${phone}`);
    return true;
  }
}
