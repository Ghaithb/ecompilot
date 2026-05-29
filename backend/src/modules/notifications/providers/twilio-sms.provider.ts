import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Twilio from 'twilio';

@Injectable()
export class TwilioSmsProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);
  private client: Twilio.Twilio | null = null;

  constructor(private readonly configService: ConfigService) {
    const sid = this.configService.get<string>('messaging.twilio.accountSid');
    const token = this.configService.get<string>('messaging.twilio.authToken');
    if (sid && token) {
      this.client = Twilio(sid, token);
    }
  }

  isConfigured(): boolean {
    return !!(
      this.client &&
      this.configService.get<string>('messaging.twilio.phoneNumber')
    );
  }

  async sendSms(to: string, body: string): Promise<boolean> {
    if (!this.isConfigured()) {
      this.logger.warn(`[DEV] SMS simulé → ${to}: ${body}`);
      return true;
    }

    try {
      const from = this.configService.get<string>('messaging.twilio.phoneNumber')!;
      const result = await this.client!.messages.create({
        body,
        from,
        to: this.formatE164(to),
      });
      this.logger.log(`SMS Twilio envoyé (${result.sid}) → ${to}`);
      return result.status !== 'failed';
    } catch (error: any) {
      this.logger.error(`Erreur Twilio SMS → ${to}: ${error.message}`);
      return false;
    }
  }

  private formatE164(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('216')) return `+${digits}`;
    if (digits.length === 8) return `+216${digits}`;
    if (phone.startsWith('+')) return phone;
    return `+${digits}`;
  }
}
