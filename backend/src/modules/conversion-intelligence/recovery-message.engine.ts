import { Injectable } from '@nestjs/common';

export type UrgencyLevel = 'low' | 'medium' | 'high';

@Injectable()
export class RecoveryMessageEngine {
  buildMessage(params: {
    customerName: string;
    total: number;
    cartUrl: string;
    variant: string;
    urgencyLevel: UrgencyLevel;
    stage: number;
    discountPercent?: number;
    items?: Array<{ name: string; quantity: number; price: number }>;
  }): { subject: string; body: string; coupon: string } {
    const discount = params.discountPercent || (params.stage >= 1 ? 10 : 5);
    const coupon = discount >= 10 ? 'RECOVERY10' : 'FINISH5';
    const name = params.customerName || 'Client';
    const topItems = (params.items || []).slice(0, 2).map((i) => i.name).join(', ');
    const itemHint = topItems ? ` (${topItems})` : '';

    const templates: Record<string, string> = {
      default: `Bonjour ${name}, votre panier${itemHint} (${params.total.toFixed(0)} DT) vous attend. ${discount > 0 ? `-${discount}% code ${coupon}. ` : ''}${params.cartUrl}`,
      urgency: `${name}, stock limité sur${itemHint} — ${params.total.toFixed(0)} DT. ${discount > 0 ? `Code ${coupon} (-${discount}%). ` : ''}${params.cartUrl}`,
      discount: `Offre -${discount}% pour finaliser${itemHint} (${params.total.toFixed(0)} DT). Code ${coupon}: ${params.cartUrl}`,
    };

    const body = templates[params.variant] || templates.default;
    const subject =
      params.urgencyLevel === 'high'
        ? `Votre panier ${params.total.toFixed(0)} DT expire bientôt`
        : `Votre panier vous attend`;

    return { subject, body, coupon };
  }
}
