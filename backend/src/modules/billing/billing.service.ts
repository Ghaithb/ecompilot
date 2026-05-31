import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

export const BILLING_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    priceTnd: 49,
    maxOrdersPerMonth: 100,
    maxCarriers: 1,
    maxUsers: 2,
    features: ['Dashboard', '1 transporteur', 'Support email'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceTnd: 95,
    maxOrdersPerMonth: -1,
    maxCarriers: 3,
    maxUsers: 5,
    features: ['Commandes illimitées', '3 transporteurs', 'WhatsApp auto', 'Support prioritaire'],
  },
  business: {
    id: 'business',
    name: 'Business',
    priceTnd: 149,
    maxOrdersPerMonth: -1,
    maxCarriers: 6,
    maxUsers: 15,
    features: ['6 transporteurs', 'API marchand', 'Segments CRM', 'Analytics v2'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceTnd: 0,
    maxOrdersPerMonth: -1,
    maxCarriers: -1,
    maxUsers: -1,
    features: ['SLA dédié', 'Onboarding sur site', 'Intégrations custom'],
    customPricing: true,
  },
} as const;

export type BillingPlanId = keyof typeof BILLING_PLANS;

@Injectable()
export class BillingService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  listPlans() {
    return Object.values(BILLING_PLANS);
  }

  async getSubscription(tenantId: string) {
    const tenant = await this.tenantModel.findById(tenantId).lean();
    if (!tenant) throw new BadRequestException('Tenant introuvable');

    const planId = (tenant.subscription?.plan || tenant.plan || 'starter') as BillingPlanId;
    const plan = BILLING_PLANS[planId] ?? BILLING_PLANS.starter;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const tenantQ = Types.ObjectId.isValid(tenantId)
      ? { tenantId: { $in: [tenantId, new Types.ObjectId(tenantId)] } }
      : { tenantId };

    const ordersThisMonth = await this.orderModel.countDocuments({
      ...tenantQ,
      createdAt: { $gte: monthStart },
    });

    const usage = {
      ordersThisMonth,
      ordersLimit: plan.maxOrdersPerMonth,
      ordersRemaining:
        plan.maxOrdersPerMonth < 0
          ? -1
          : Math.max(0, plan.maxOrdersPerMonth - ordersThisMonth),
      withinQuota: plan.maxOrdersPerMonth < 0 || ordersThisMonth <= plan.maxOrdersPerMonth,
    };

    return {
      planId,
      plan,
      subscription: tenant.subscription,
      usage,
      paymentMethods: {
        konnect: !!tenant.integrations?.konnect?.walletId,
        flouci: !!tenant.integrations?.flouci?.publicKeyEnc,
        cod: tenant.integrations?.cod?.enabled ?? true,
      },
    };
  }

  async changePlan(tenantId: string, planId: BillingPlanId) {
    if (!BILLING_PLANS[planId]) {
      throw new BadRequestException('Plan invalide');
    }
    if (planId === 'enterprise') {
      throw new BadRequestException('Contactez-nous pour Enterprise');
    }

    return this.tenantModel.findByIdAndUpdate(
      tenantId,
      {
        plan: planId,
        subscription: {
          status: 'active',
          plan: planId,
          startDate: new Date(),
        },
      },
      { new: true },
    );
  }
}
