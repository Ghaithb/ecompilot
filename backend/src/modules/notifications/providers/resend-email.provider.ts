import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface ResendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class ResendEmailProvider {
  private readonly logger = new Logger(ResendEmailProvider.name);

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return !!this.configService.get<string>('messaging.resend.apiKey');
  }

  async sendEmail(payload: ResendEmailPayload): Promise<boolean> {
    const from = this.configService.get<string>('messaging.resend.fromEmail') || 'EcomPilot <onboarding@resend.dev>';

    if (!this.isConfigured()) {
      this.logger.warn(`[DEV] Email simulé → ${payload.to}: ${payload.subject}`);
      return true;
    }

    try {
      await axios.post(
        'https://api.resend.com/emails',
        {
          from,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        },
        {
          headers: {
            Authorization: `Bearer ${this.configService.get('messaging.resend.apiKey')}`,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`Email Resend envoyé → ${payload.to}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Erreur Resend → ${payload.to}: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }
}
