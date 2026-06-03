import { Controller, Get, Param, Patch, Post, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ConversionMetricsService } from './conversion-metrics.service';
import { CartRecoveryService } from '../cart/cart-recovery.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import {
  TenantRecoveryConfig,
  TenantRecoveryConfigDocument,
} from './schemas/tenant-recovery-config.schema';
import { WhatsAppFlowsService } from './whatsapp-flows.service';
import type { WhatsAppFlowDefinition } from './schemas/whatsapp-flow.schema';

@ApiTags('conversion')
@ApiBearerAuth()
@Controller('conversion')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('merchant', 'admin', 'user')
export class ConversionDashboardController {
  constructor(
    private metrics: ConversionMetricsService,
    private recovery: CartRecoveryService,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(TenantRecoveryConfig.name) private recoveryConfigModel: Model<TenantRecoveryConfigDocument>,
    private whatsappFlows: WhatsAppFlowsService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Revenue recovery & conversion metrics' })
  dashboard(@TenantId() tenantId: string) {
    return this.metrics.getDashboard(tenantId);
  }

  @Get('conversion-center')
  @ApiOperation({ summary: 'Alias conversion center (legacy frontend)' })
  async conversionCenter(@TenantId() tenantId: string) {
    const dash = await this.metrics.getDashboard(tenantId);
    const abandoned = await this.cartModel
      .find({ tenantId, status: 'abandoned' })
      .sort({ abandonedAt: -1 })
      .limit(10)
      .lean();

    return {
      total: dash.pendingAbandoned + dash.recoveredCount,
      recovered: dash.recoveredCount,
      pending: dash.pendingAbandoned,
      pendingRelance: abandoned.filter((c) => (c.recoveryRemindersSent ?? 0) < 3).length,
      recoveryRate: dash.recoveryRate,
      revenueLost: dash.abandonedCartsValue,
      revenueRecovered: dash.revenueRecovered,
      cartsToRelance: abandoned.filter((c) => (c.conversionScore ?? 50) <= 80).length,
      recoverableRevenue: dash.abandonedCartsValue,
      recommendations: this.buildRecommendations(dash),
      recentAbandoned: abandoned.map((c) => ({
        _id: (c as { _id: unknown })._id,
        customerName: c.customerName,
        customerPhone: c.customerPhone,
        totalAmount: c.totals?.total,
        items: (c.items || []).map((i) => ({ productName: i.name, quantity: i.quantity })),
        remindersSent: c.recoveryRemindersSent,
        conversionScore: c.conversionScore,
        urgencyLevel: c.urgencyLevel || c.riskLevel,
        riskLevel: c.riskLevel,
      })),
      funnel: dash.funnel,
      recoveryFunnel: dash.recoveryFunnel,
      experiments: dash.experiments,
    };
  }

  @Get('recovery-config')
  @ApiOperation({ summary: 'Configuration relance paniers abandonnés' })
  async getRecoveryConfig(@TenantId() tenantId: string) {
    let cfg = await this.recoveryConfigModel.findOne({ tenantId }).lean();
    if (!cfg) {
      cfg = (
        await this.recoveryConfigModel.create({
          tenantId,
          discountEnabled: true,
          maxDiscountPercent: 10,
        })
      ).toObject();
    }
    return cfg;
  }

  @Get('recovery-automation')
  @ApiOperation({ summary: 'Etat automation panier abandonne', description: 'Queues dues, relancables, bloquees et potentiel revenu' })
  async recoveryAutomation(@TenantId() tenantId: string) {
    const now = new Date();
    const [cfg, due, recoverable, blocked, abandoned] = await Promise.all([
      this.getRecoveryConfig(tenantId),
      this.cartModel.countDocuments({
        tenantId,
        status: 'abandoned',
        recoveryStage: { $lt: 3 },
        nextRecoveryAt: { $lte: now },
      }),
      this.cartModel.countDocuments({
        tenantId,
        status: 'abandoned',
        recoveryStage: { $lt: 3 },
        $or: [{ conversionScore: { $lte: 80 } }, { conversionScore: { $exists: false } }],
      }),
      this.cartModel.countDocuments({
        tenantId,
        status: 'abandoned',
        $or: [{ recoveryStage: { $gte: 3 } }, { conversionScore: { $gt: 80 } }],
      }),
      this.cartModel
        .find({ tenantId, status: 'abandoned' })
        .select('totals recoveryStage nextRecoveryAt conversionScore customerPhone customerEmail')
        .lean(),
    ]);

    return {
      enabled: true,
      config: cfg,
      queues: {
        dueNow: due,
        recoverable,
        blocked,
        totalAbandoned: abandoned.length,
      },
      revenue: {
        atRisk: Math.round(abandoned.reduce((sum, cart) => sum + (cart.totals?.total || 0), 0) * 100) / 100,
        recoverable:
          Math.round(
            abandoned
              .filter((cart) => (cart.recoveryStage ?? 0) < 3 && (cart.conversionScore ?? 50) <= 80)
              .reduce((sum, cart) => sum + (cart.totals?.total || 0), 0) * 100,
          ) / 100,
      },
      nextRuns: abandoned
        .filter((cart) => cart.nextRecoveryAt)
        .sort((a, b) => new Date(a.nextRecoveryAt!).getTime() - new Date(b.nextRecoveryAt!).getTime())
        .slice(0, 10)
        .map((cart) => ({
          cartId: (cart as { _id: unknown })._id,
          nextRecoveryAt: cart.nextRecoveryAt,
          stage: cart.recoveryStage,
          conversionScore: cart.conversionScore,
          reachable: Boolean(cart.customerPhone || cart.customerEmail),
          total: cart.totals?.total || 0,
        })),
    };
  }

  @Patch('recovery-config')
  @ApiOperation({ summary: 'Mettre à jour la config recovery' })
  async updateRecoveryConfig(
    @TenantId() tenantId: string,
    @Body() body: { discountEnabled?: boolean; maxDiscountPercent?: number },
  ) {
    return this.recoveryConfigModel.findOneAndUpdate(
      { tenantId },
      { $set: body },
      { upsert: true, new: true },
    );
  }

  @Post('recover/:cartId')
  manualRecover(@TenantId() tenantId: string, @Param('cartId') cartId: string) {
    return this.recovery.triggerManualRecovery(tenantId, cartId);
  }

  @Get('whatsapp-flows')
  @ApiOperation({ summary: 'Flows WhatsApp recovery (builder presets)' })
  listWhatsAppFlows(@TenantId() tenantId: string) {
    return this.whatsappFlows.list(tenantId);
  }

  @Patch('whatsapp-flows/:flowId')
  @ApiOperation({ summary: 'Activer/désactiver ou éditer un flow WhatsApp' })
  updateWhatsAppFlow(
    @TenantId() tenantId: string,
    @Param('flowId') flowId: string,
    @Body() body: Partial<WhatsAppFlowDefinition> & { enabled?: boolean },
  ) {
    if (typeof body.enabled === 'boolean' && Object.keys(body).length === 1) {
      return this.whatsappFlows.toggleFlow(tenantId, flowId, body.enabled);
    }
    return this.whatsappFlows.list(tenantId).then(({ flows }) => {
      const existing = flows.find((f) => f.id === flowId);
      if (!existing) throw new NotFoundException('Flow inconnu');
      return this.whatsappFlows.upsertFlow(tenantId, { ...existing, ...body, id: flowId });
    });
  }

  private buildRecommendations(dash: Awaited<ReturnType<ConversionMetricsService['getDashboard']>>) {
    const tips: string[] = [];
    if (dash.pendingAbandoned > 0) {
      tips.push(`${dash.pendingAbandoned} paniers abandonnés — relances auto actives par score de risque`);
    }
    if (dash.checkoutConversionRate < 40 && dash.funnel.checkouts > 5) {
      tips.push('Taux checkout faible — vérifiez friction (adresse, livraison)');
    }
    if (dash.recoveryRate < 15 && dash.recoveriesSent > 3) {
      tips.push('Optimisez messages WhatsApp pour paniers high-risk');
    }
    if (dash.experiments.checkoutB.conversionRate > dash.experiments.checkoutA.conversionRate) {
      tips.push('Variante checkout B performe mieux — envisagez bascule globale');
    }
    if (!tips.length) tips.push('Continuez le checkout COD express — metrics stables');
    return tips;
  }
}
