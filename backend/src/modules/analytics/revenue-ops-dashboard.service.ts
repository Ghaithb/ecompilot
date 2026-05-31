import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Shipment, ShipmentDocument } from '../delivery/schemas/shipment.schema';
import {
  ConversionDailyMetric,
  ConversionDailyMetricDocument,
} from '../conversion-intelligence/schemas/conversion-daily-metric.schema';

type ShipmentRow = {
  provider: string;
  status: string;
  trackingNumber: string;
  orderNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
  trackingHistory?: Array<{ status: string; occurredAt?: Date }>;
};

export type InsightSeverity = 'critical' | 'warning' | 'positive' | 'info';

export interface RevenueOpsInsight {
  id: string;
  severity: InsightSeverity;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface RevenueOpsRecommendation {
  id: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
}

@Injectable()
export class RevenueOpsDashboardService {
  constructor(
    @InjectModel(ConversionDailyMetric.name)
    private metricModel: Model<ConversionDailyMetricDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Shipment.name) private shipmentModel: Model<ShipmentDocument>,
  ) {}

  private dateKey(d = new Date()) {
    return d.toISOString().slice(0, 10);
  }

  private tenantQuery(tenantId: string) {
    const oid = Types.ObjectId.isValid(tenantId) ? new Types.ObjectId(tenantId) : null;
    return oid ? { tenantId: { $in: [tenantId, oid] } } : { tenantId };
  }

  async getDashboard(tenantId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const dateFrom = this.dateKey(thirtyDaysAgo);
    const tenantQ = this.tenantQuery(tenantId);

    const [
      metrics,
      abandonedCarts,
      recoveredCount,
      orders30d,
      ordersToday,
      codOrders,
      codVerified,
      shipments,
      recoverableCarts,
      pendingCod,
      revenue30d,
      todayMetrics,
      yesterdayMetrics,
    ] = await Promise.all([
      this.metricModel.find({ tenantId, dateKey: { $gte: dateFrom } }).lean(),
      this.cartModel
        .find({ tenantId, status: 'abandoned' })
        .select('totals customerName customerPhone conversionScore urgencyLevel abandonedAt recoveryStage')
        .lean(),
      this.cartModel.countDocuments({ tenantId, recoveredFromAbandonment: true }),
      this.orderModel.countDocuments({ ...tenantQ, createdAt: { $gte: thirtyDaysAgo } }),
      this.orderModel.countDocuments({ ...tenantQ, createdAt: { $gte: todayStart } }),
      this.orderModel.countDocuments({
        ...tenantQ,
        paymentMethod: 'cod',
        createdAt: { $gte: thirtyDaysAgo },
      }),
      this.orderModel.countDocuments({
        ...tenantQ,
        paymentMethod: 'cod',
        isVerified: true,
        createdAt: { $gte: thirtyDaysAgo },
      }),
      this.shipmentModel.find(tenantQ).sort({ createdAt: -1 }).limit(500).lean(),
      this.cartModel
        .find({
          tenantId,
          status: 'abandoned',
          recoveryStage: { $lt: 3 },
          $or: [{ conversionScore: { $lte: 80 } }, { conversionScore: { $exists: false } }],
        })
        .sort({ abandonedAt: -1 })
        .limit(8)
        .lean(),
      this.orderModel
        .find({
          ...tenantQ,
          paymentMethod: 'cod',
          isVerified: false,
          status: { $in: ['pending', 'created', 'confirmed'] },
        })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      this.orderModel
        .aggregate([
          { $match: { ...tenantQ, createdAt: { $gte: thirtyDaysAgo } } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ])
        .then((r) => r[0]?.total || 0),
      this.metricModel.findOne({ tenantId, dateKey: this.dateKey() }).lean(),
      this.metricModel
        .findOne({
          tenantId,
          dateKey: this.dateKey(new Date(Date.now() - 24 * 60 * 60 * 1000)),
        })
        .lean(),
    ]);

    const revenueRecovered = metrics.reduce((s, m) => s + (m.revenueRecovered || 0), 0);
    const recoveriesSent = metrics.reduce((s, m) => s + (m.recoveriesSent || 0), 0);
    const checkoutsStarted = metrics.reduce((s, m) => s + (m.checkoutsStarted || 0), 0);
    const checkoutsCompleted = metrics.reduce((s, m) => s + (m.checkoutsCompleted || 0), 0);
    const cartsCreated = metrics.reduce((s, m) => s + (m.cartsCreated || 0), 0);
    const cartsAbandoned = metrics.reduce((s, m) => s + (m.cartsAbandoned || 0), 0);

    const abandonedValue = abandonedCarts.reduce((s, c) => s + (c.totals?.total || 0), 0);
    const conversionRate =
      checkoutsStarted > 0 ? Math.round((checkoutsCompleted / checkoutsStarted) * 100) : 0;
    const abandonedCartRate =
      cartsCreated > 0 ? Math.round((cartsAbandoned / cartsCreated) * 100) : 0;
    const recoveryRate =
      recoveriesSent > 0 ? Math.round((recoveredCount / recoveriesSent) * 100) : 0;
    const codConfirmationRate =
      codOrders > 0 ? Math.round((codVerified / codOrders) * 100) : 100;

    const channelAgg = { email: 0, whatsapp: 0, sms: 0 };
    for (const m of metrics) {
      channelAgg.email += m.channels?.email?.sent || 0;
      channelAgg.whatsapp += m.channels?.whatsapp?.sent || 0;
      channelAgg.sms += m.channels?.sms?.sent || 0;
    }
    const bestChannel = this.bestChannel(channelAgg);

    const topProducts = await this.topConvertingProducts(tenantId, thirtyDaysAgo);
    const regional = await this.regionalPerformance(tenantId, thirtyDaysAgo);

    const deliveryIntel = this.buildDeliveryIntel(shipments, regional);
    const funnel = this.buildFunnel({
      cartsCreated,
      checkoutsStarted,
      checkoutsCompleted,
      orders30d,
      delivered: deliveryIntel.deliveredCount,
      abandonedValue,
      recoveryRate,
      revenueRecovered,
      avgOrderValue: orders30d > 0 ? revenue30d / orders30d : 85,
    });

    const failedShipments = shipments.filter((s) =>
      ['refused', 'failed', 'returned', 'cancelled'].includes(s.status),
    );

    const kpis = {
      recoveredRevenue: Math.round(revenueRecovered * 100) / 100,
      conversionRate,
      abandonedCartRate,
      deliverySuccessRate: deliveryIntel.successRate,
      codConfirmationRate,
      ordersToday,
      moneyAtRisk: Math.round(abandonedValue * 100) / 100,
    };

    const insights = this.buildInsights({
      kpis,
      recoveryRate,
      abandonedValue,
      bestChannel,
      deliveryIntel,
      topProducts,
      conversionRate,
      checkoutsStarted,
    });

    const actions = {
      cartsToRecover: recoverableCarts.map((c) => ({
        id: String((c as { _id: unknown })._id),
        customerName: c.customerName || 'Client',
        total: c.totals?.total || 0,
        urgencyLevel: c.urgencyLevel || 'medium',
        conversionScore: c.conversionScore,
      })),
      codToConfirm: pendingCod.map((o) => ({
        id: String(o._id),
        orderNumber: o.orderNumber,
        total: o.total,
        createdAt: o.createdAt,
      })),
      failedDeliveries: failedShipments.slice(0, 8).map((s) => ({
        id: String(s._id),
        trackingNumber: s.trackingNumber,
        provider: s.provider,
        orderNumber: s.orderNumber,
        status: s.status,
      })),
    };

    const recommendations = this.buildRecommendations({
      kpis,
      deliveryIntel,
      regional,
      recoveryRate,
      bestChannel,
    });

    const avgOrderValue = orders30d > 0 ? revenue30d / orders30d : 85;
    const codPendingValue = pendingCod.reduce((s, o) => s + (o.total || 0), 0);
    const deliveryLossEstimate = Math.round(
      deliveryIntel.failedDeliveries * avgOrderValue * 0.6 * 100,
    ) / 100;
    const checkoutDropCount = Math.max(0, checkoutsStarted - checkoutsCompleted);
    const checkoutLeakage =
      Math.round(checkoutDropCount * avgOrderValue * 0.35 * 100) / 100;
    const conversionGainPotential =
      Math.round(checkoutsStarted * 0.05 * avgOrderValue * 100) / 100;

    const money = {
      abandonedCartValue: Math.round(abandonedValue * 100) / 100,
      recoveredRevenue: Math.round(revenueRecovered * 100) / 100,
      deliveryLosses: deliveryLossEstimate,
      conversionGains: Math.round(revenueRecovered * 100) / 100,
      conversionGainPotential,
      codAtRisk: Math.round(codPendingValue * 100) / 100,
      totalAtRisk:
        Math.round((abandonedValue + checkoutLeakage + deliveryLossEstimate) * 100) / 100,
    };

    const moneyLeakage = this.buildMoneyLeakage({
      abandonedValue,
      checkoutLeakage,
      deliveryLossEstimate,
      checkoutDropCount,
      recoveryRate,
      revenueRecovered,
    });

    const healthScores = this.buildHealthScores({
      conversionRate,
      abandonedCartRate,
      recoveryRate,
      revenueRecovered,
      abandonedValue,
      deliveryIntel,
      codConfirmationRate,
      ordersToday,
      todayMetrics,
      yesterdayMetrics,
    });

    const todayFocus = this.buildTodayFocus({
      recoverableCarts,
      pendingCod,
      failedShipments,
      deliveryIntel,
      money,
    });

    const businessStatus = this.buildBusinessStatus({
      money,
      recoverableCarts,
      pendingCod,
      failedShipments,
      deliveryIntel,
      healthScores,
      ordersToday,
    });

    const zeroNoise = todayFocus.length === 0 && businessStatus.tone === 'healthy';

    const narrative = this.buildNarrative({
      ordersToday,
      todayMetrics,
      yesterdayMetrics,
      money,
      healthScores,
      recoveryRate,
      conversionRate,
      deliveryIntel,
      todayFocus,
      businessStatus,
      zeroNoise,
      bestChannel,
    });

    const trends = this.buildTrends(metrics);

    const recoveryPerformance = this.buildRecoveryPerformance({
      recoveryRate,
      revenueRecovered,
      recoveriesSent,
      recoveredCount,
      bestChannel,
      money,
    });

    const quickActions = this.buildQuickActions({ todayFocus, money, deliveryIntel });

    const growthOpportunities = zeroNoise
      ? this.buildGrowthOpportunities({
          regional,
          topProducts,
          conversionGainPotential,
          bestChannel,
          ordersToday,
        })
      : [];

    const revenueAtRisk = {
      total: money.totalAtRisk,
      headline:
        money.totalAtRisk > 0
          ? `${money.totalAtRisk.toFixed(0)} TND de revenu potentiellement perdu`
          : 'Aucun revenu critique à risque',
      breakdown: [
        ...(money.abandonedCartValue > 0
          ? [{ label: 'Paniers abandonnés', amount: money.abandonedCartValue }]
          : []),
        ...(checkoutLeakage > 0 ? [{ label: 'Abandon checkout', amount: checkoutLeakage }] : []),
        ...(deliveryLossEstimate > 0
          ? [{ label: 'Échecs livraison', amount: deliveryLossEstimate }]
          : []),
        ...(money.codAtRisk > 0 ? [{ label: 'COD non confirmé', amount: money.codAtRisk }] : []),
      ],
    };

    return {
      kpis,
      money,
      healthScores,
      businessStatus,
      zeroNoise,
      growthOpportunities,
      revenueAtRisk,
      narrative,
      todayFocus,
      moneyLeakage,
      trends,
      insights,
      funnel,
      delivery: deliveryIntel,
      recoveryPerformance,
      quickActions,
      channels: {
        email: { sent: channelAgg.email },
        whatsapp: { sent: channelAgg.whatsapp },
        sms: { sent: channelAgg.sms },
        best: bestChannel,
      },
      actions,
      recommendations,
      topConvertingProducts: topProducts.slice(0, 5),
      updatedAt: new Date().toISOString(),
    };
  }

  async getCarrierRegionalAnalytics(tenantId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const tenantQ = this.tenantQuery(tenantId);
    const [shipments, regional] = await Promise.all([
      this.shipmentModel.find({ ...tenantQ, createdAt: { $gte: thirtyDaysAgo } }).lean(),
      this.regionalPerformance(tenantId, thirtyDaysAgo),
    ]);
    const delivery = this.buildDeliveryIntel(shipments as ShipmentRow[], regional);
    return { delivery, regional, periodDays: 30 };
  }

  private buildHealthScores(ctx: {
    conversionRate: number;
    abandonedCartRate: number;
    recoveryRate: number;
    revenueRecovered: number;
    abandonedValue: number;
    deliveryIntel: { successRate: number; failedDeliveries: number; delayedShipments: number };
    codConfirmationRate: number;
    ordersToday: number;
    todayMetrics: { checkoutsStarted?: number; checkoutsCompleted?: number } | null;
    yesterdayMetrics: { checkoutsStarted?: number; checkoutsCompleted?: number; ordersCreated?: number } | null;
  }) {
    const trendFromDelta = (current: number, previous: number): 'up' | 'down' | 'stable' => {
      const delta = current - previous;
      if (delta >= 3) return 'up';
      if (delta <= -3) return 'down';
      return 'stable';
    };

    const yesterdayConversion =
      ctx.yesterdayMetrics?.checkoutsStarted && ctx.yesterdayMetrics.checkoutsStarted > 0
        ? Math.round(
            ((ctx.yesterdayMetrics.checkoutsCompleted || 0) /
              ctx.yesterdayMetrics.checkoutsStarted) *
              100,
          )
        : ctx.conversionRate;

    let storeScore = Math.round(
      ctx.conversionRate * 0.45 +
        (100 - Math.min(ctx.abandonedCartRate, 80)) * 0.35 +
        Math.min(ctx.ordersToday * 8, 20),
    );
    storeScore = Math.max(0, Math.min(100, storeScore));
    const storePrimaryIssue =
      ctx.abandonedCartRate >= 50
        ? `${ctx.abandonedCartRate}% des paniers abandonnés`
        : ctx.conversionRate < 35
          ? 'Friction checkout détectée'
          : 'Conversion stable';
    const storeExplanation =
      storeScore >= 70
        ? 'Checkout et conversion stables — votre boutique convertit bien.'
        : storeScore >= 45
          ? 'Friction checkout ou abandons élevés — optimisez livraison et COD.'
          : 'Perte de revenu au checkout — action prioritaire recommandée.';

    let deliveryScore = Math.round(
      ctx.deliveryIntel.successRate * 0.75 +
        Math.max(0, 15 - ctx.deliveryIntel.delayedShipments * 3) +
        Math.max(0, 10 - ctx.deliveryIntel.failedDeliveries * 2),
    );
    deliveryScore = Math.max(0, Math.min(100, deliveryScore));
    const deliveryPrimaryIssue =
      ctx.deliveryIntel.failedDeliveries > 0
        ? `${ctx.deliveryIntel.failedDeliveries} livraison(s) échouée(s)`
        : ctx.deliveryIntel.delayedShipments > 0
          ? `${ctx.deliveryIntel.delayedShipments} colis en retard`
          : 'Flux livraison stable';
    const deliveryExplanation =
      deliveryScore >= 70
        ? 'Livraisons fiables — peu de retards ou échecs.'
        : deliveryScore >= 45
          ? 'Retards ou refus détectés — vérifiez vos transporteurs.'
          : 'Problèmes livraison critiques — risque de perte client et revenu.';

    let recoveryScore = Math.round(
      Math.min(ctx.recoveryRate * 2.5, 50) +
        (ctx.revenueRecovered > 0 ? 25 : 0) +
        (ctx.abandonedValue < 300 ? 25 : ctx.abandonedValue < 800 ? 10 : 0),
    );
    recoveryScore = Math.max(0, Math.min(100, recoveryScore));
    const recoveryPrimaryIssue =
      ctx.abandonedValue >= 200
        ? `${ctx.abandonedValue.toFixed(0)} TND en paniers abandonnés`
        : ctx.recoveryRate < 15
          ? 'Taux de récupération faible'
          : 'Recovery performant';
    const recoveryExplanation =
      recoveryScore >= 70
        ? 'Smart recovery performant — paniers abandonnés bien relancés.'
        : recoveryScore >= 45
          ? 'Potentiel de récupération non exploité — activez WhatsApp sur paniers urgents.'
          : 'Revenu abandonné important — relances immédiates recommandées.';

    const overall = Math.round((storeScore + deliveryScore + recoveryScore) / 3);
    const revenueHealth = overall;

    return {
      overall,
      revenueHealth,
      revenueHealthLabel: 'Santé revenu',
      store: {
        score: storeScore,
        label: 'Boutique',
        explanation: storeExplanation,
        trend: trendFromDelta(ctx.conversionRate, yesterdayConversion),
        primaryIssue: storePrimaryIssue,
      },
      delivery: {
        score: deliveryScore,
        label: 'Livraison',
        explanation: deliveryExplanation,
        trend: trendFromDelta(
          ctx.deliveryIntel.successRate,
          Math.max(0, ctx.deliveryIntel.successRate - (ctx.deliveryIntel.failedDeliveries > 0 ? 8 : 0)),
        ),
        primaryIssue: deliveryPrimaryIssue,
      },
      recovery: {
        score: recoveryScore,
        label: 'Récupération',
        explanation: recoveryExplanation,
        trend: trendFromDelta(ctx.recoveryRate, Math.max(0, ctx.recoveryRate - 5)),
        primaryIssue: recoveryPrimaryIssue,
      },
    };
  }

  private buildBusinessStatus(ctx: {
    money: {
      abandonedCartValue: number;
      totalAtRisk: number;
      deliveryLosses: number;
      codAtRisk: number;
    };
    recoverableCarts: Array<{ totals?: { total?: number } }>;
    pendingCod: Array<{ total?: number }>;
    failedShipments: ShipmentRow[];
    deliveryIntel: {
      delayedShipments: number;
      delayedRegions: string[];
      failedDeliveries: number;
      estimatedImpact: number;
    };
    healthScores: { overall: number };
    ordersToday: number;
  }) {
    const cartCount = ctx.recoverableCarts.length;
    const codCount = ctx.pendingCod.length;

    if (ctx.money.abandonedCartValue >= 80 && cartCount > 0) {
      return {
        tone: 'critical' as const,
        message: `${ctx.money.abandonedCartValue.toFixed(0)} TND à risque — ${cartCount} panier${cartCount > 1 ? 's' : ''} abandonné${cartCount > 1 ? 's' : ''}`,
        detail: 'La récupération immédiate est votre levier le plus rentable aujourd\'hui.',
      };
    }

    if (ctx.deliveryIntel.delayedShipments > 0 && ctx.deliveryIntel.delayedRegions.length) {
      const region = ctx.deliveryIntel.delayedRegions[0];
      return {
        tone: 'warning' as const,
        message: `Retards livraison détectés à ${region} — impact conversion possible`,
        detail: `${ctx.deliveryIntel.delayedShipments} colis en transit depuis plus de 5 jours.`,
      };
    }

    if (ctx.failedShipments.length > 0 && ctx.money.deliveryLosses >= 50) {
      return {
        tone: 'warning' as const,
        message: `${ctx.failedShipments.length} livraison(s) échouée(s) — ~${ctx.money.deliveryLosses.toFixed(0)} TND à risque`,
        detail: 'Résolvez les refus et retours avant qu\'ils ne deviennent des pertes nettes.',
      };
    }

    if (codCount >= 3 && ctx.money.codAtRisk >= 100) {
      return {
        tone: 'warning' as const,
        message: `${codCount} commandes COD à confirmer — ${ctx.money.codAtRisk.toFixed(0)} TND en attente`,
        detail: 'Validez par SMS pour sécuriser le revenu et réduire les faux commandes.',
      };
    }

    if (ctx.healthScores.overall >= 65 && ctx.money.totalAtRisk < 100) {
      return {
        tone: 'healthy' as const,
        message: 'Boutique saine — concentrez-vous sur la croissance aujourd\'hui',
        detail:
          ctx.ordersToday > 0
            ? `${ctx.ordersToday} commande${ctx.ordersToday > 1 ? 's' : ''} aujourd'hui — momentum positif.`
            : 'Aucune urgence détectée — optimisez acquisition et panier moyen.',
      };
    }

    if (ctx.money.totalAtRisk >= 50) {
      return {
        tone: 'warning' as const,
        message: `${ctx.money.totalAtRisk.toFixed(0)} TND de revenu potentiellement perdu`,
        detail: 'Consultez vos 3 priorités du jour pour agir dans le bon ordre.',
      };
    }

    return {
      tone: 'healthy' as const,
      message: 'Boutique saine — concentrez-vous sur la croissance aujourd\'hui',
      detail: 'Aucun signal critique — explorez les opportunités ci-dessous.',
    };
  }

  private buildTodayFocus(ctx: {
    recoverableCarts: Array<{ totals?: { total?: number } }>;
    pendingCod: Array<{ total?: number }>;
    failedShipments: ShipmentRow[];
    deliveryIntel: { delayedShipments: number; estimatedImpact: number };
    money: { abandonedCartValue: number; codAtRisk: number; deliveryLosses: number };
  }) {
    const items: Array<{
      id: string;
      type: 'cart' | 'delivery' | 'cod' | 'delay';
      title: string;
      subtitle: string;
      moneyImpact: number;
      count: number;
      href: string;
      priority: 'critical' | 'high' | 'medium';
      urgencyLevel: 'critical' | 'high' | 'medium';
      suggestedAction: string;
    }> = [];

    if (ctx.recoverableCarts.length) {
      const value = ctx.recoverableCarts.reduce((s, c) => s + (c.totals?.total || 0), 0);
      const count = ctx.recoverableCarts.length;
      items.push({
        id: 'recover-carts',
        type: 'cart',
        title: `Récupérer ${count} panier${count > 1 ? 's' : ''}`,
        subtitle: `${value.toFixed(0)} TND récupérables via relance`,
        moneyImpact: Math.round(value * 100) / 100,
        count,
        href: '/conversion/center',
        priority: value >= 200 ? 'critical' : 'high',
        urgencyLevel: value >= 200 ? 'critical' : 'high',
        suggestedAction: 'Lancer relance WhatsApp sur paniers urgents',
      });
    }

    if (ctx.pendingCod.length) {
      const count = ctx.pendingCod.length;
      items.push({
        id: 'confirm-cod',
        type: 'cod',
        title: `Confirmer ${count} commande${count > 1 ? 's' : ''} COD`,
        subtitle: `${ctx.money.codAtRisk.toFixed(0)} TND en attente de validation`,
        moneyImpact: ctx.money.codAtRisk,
        count,
        href: '/orders',
        priority: count >= 3 ? 'critical' : 'high',
        urgencyLevel: count >= 3 ? 'critical' : 'high',
        suggestedAction: 'Valider par SMS les commandes en attente',
      });
    }

    if (ctx.failedShipments.length) {
      const count = ctx.failedShipments.length;
      items.push({
        id: 'failed-delivery',
        type: 'delivery',
        title: `Résoudre ${count} livraison${count > 1 ? 's' : ''} échouée${count > 1 ? 's' : ''}`,
        subtitle: `Impact estimé ~${ctx.money.deliveryLosses.toFixed(0)} TND`,
        moneyImpact: ctx.money.deliveryLosses,
        count,
        href: '/delivery',
        priority: count >= 2 ? 'critical' : 'high',
        urgencyLevel: count >= 2 ? 'critical' : 'high',
        suggestedAction: 'Contacter transporteur et reprogrammer livraison',
      });
    }

    if (ctx.deliveryIntel.delayedShipments > 0 && items.length < 3) {
      const count = ctx.deliveryIntel.delayedShipments;
      const impact = Math.round(count * 40 * 100) / 100;
      items.push({
        id: 'delayed-delivery',
        type: 'delay',
        title: `Traiter ${count} retard${count > 1 ? 's' : ''} livraison`,
        subtitle: `${impact.toFixed(0)} TND de revenu potentiellement bloqué`,
        moneyImpact: impact,
        count,
        href: '/delivery',
        priority: 'medium',
        urgencyLevel: 'medium',
        suggestedAction: 'Suivre colis en transit et informer clients',
      });
    }

    return items
      .sort((a, b) => {
        const p = { critical: 0, high: 1, medium: 2 };
        return p[a.priority] - p[b.priority];
      })
      .slice(0, 3);
  }

  private buildMoneyLeakage(params: {
    abandonedValue: number;
    checkoutLeakage: number;
    deliveryLossEstimate: number;
    checkoutDropCount: number;
    recoveryRate: number;
    revenueRecovered: number;
  }) {
    return [
      {
        id: 'abandon',
        label: 'Paniers abandonnés',
        lostTND: Math.round(params.abandonedValue * 100) / 100,
        recoverableTND: Math.round(params.abandonedValue * (params.recoveryRate / 100) * 100) / 100,
        severity: params.abandonedValue >= 200 ? 'critical' : 'warning',
      },
      {
        id: 'checkout',
        label: 'Abandon checkout',
        lostTND: params.checkoutLeakage,
        recoverableTND: Math.round(params.checkoutLeakage * 0.4 * 100) / 100,
        severity: params.checkoutDropCount >= 5 ? 'warning' : 'info',
      },
      {
        id: 'delivery',
        label: 'Échecs livraison',
        lostTND: params.deliveryLossEstimate,
        recoverableTND: Math.round(params.deliveryLossEstimate * 0.25 * 100) / 100,
        severity: params.deliveryLossEstimate >= 100 ? 'critical' : 'warning',
      },
      {
        id: 'recovered',
        label: 'Déjà récupéré',
        lostTND: 0,
        recoverableTND: Math.round(params.revenueRecovered * 100) / 100,
        severity: 'positive' as const,
      },
    ];
  }

  private buildNarrative(ctx: {
    ordersToday: number;
    todayMetrics: { ordersCreated?: number; revenueRecovered?: number } | null;
    yesterdayMetrics: { ordersCreated?: number } | null;
    money: { recoveredRevenue: number; abandonedCartValue: number; totalAtRisk: number };
    healthScores: { overall: number; store: { score: number }; delivery: { score: number }; recovery: { score: number } };
    recoveryRate: number;
    conversionRate: number;
    deliveryIntel: { delayedShipments: number; failedDeliveries: number; insights: string[] };
    todayFocus: Array<{ title: string; moneyImpact: number; suggestedAction: string }>;
    businessStatus: { message: string; detail?: string };
    zeroNoise: boolean;
    bestChannel: { label: string; sent: number } | null;
  }) {
    const ordersYesterday = ctx.yesterdayMetrics?.ordersCreated || 0;
    const ordersDelta = ctx.ordersToday - ordersYesterday;
    const recoveredToday = ctx.todayMetrics?.revenueRecovered || 0;
    const revenueDeltaPct =
      ordersYesterday > 0 ? Math.round((ordersDelta / ordersYesterday) * 100) : 0;

    const happened: string[] = [];
    if (ctx.ordersToday > 0) {
      happened.push(
        revenueDeltaPct !== 0
          ? `Revenu ${revenueDeltaPct > 0 ? 'en hausse' : 'en baisse'} de ${Math.abs(revenueDeltaPct)}% aujourd'hui.`
          : `${ctx.ordersToday} commande${ctx.ordersToday > 1 ? 's' : ''} enregistrée${ctx.ordersToday > 1 ? 's' : ''} aujourd'hui.`,
      );
    } else {
      happened.push('Journée calme — aucune commande pour le moment.');
    }
    if (recoveredToday > 0) {
      happened.push(`WhatsApp recovery a récupéré ${recoveredToday.toFixed(0)} TND.`);
    } else if (ctx.money.recoveredRevenue > 0) {
      happened.push(`${ctx.money.recoveredRevenue.toFixed(0)} TND récupérés ce mois via relances.`);
    }

    const improved: string[] = [];
    if (ctx.recoveryRate >= 15) improved.push(`Recovery à ${ctx.recoveryRate}% — séquence efficace.`);
    if (ctx.conversionRate >= 40) improved.push(`Checkout convertit à ${ctx.conversionRate}%.`);
    if (ctx.healthScores.overall >= 65) improved.push(`Santé revenu solide (${ctx.healthScores.overall}/100).`);

    const decreased: string[] = [];
    if (ctx.money.abandonedCartValue >= 50) {
      decreased.push(
        `${ctx.money.abandonedCartValue.toFixed(0)} TND bloqués en paniers abandonnés.`,
      );
    }
    if (ctx.deliveryIntel.failedDeliveries > 0) {
      decreased.push(
        `${ctx.deliveryIntel.failedDeliveries} échec(s) livraison — conversion impactée.`,
      );
    }
    if (ctx.deliveryIntel.delayedShipments > 0) {
      decreased.push(`${ctx.deliveryIntel.delayedShipments} livraison(s) en retard.`);
    }

    const recommended: string[] = [];
    if (ctx.todayFocus[0]) {
      recommended.push(ctx.todayFocus[0].suggestedAction);
    }
    if (ctx.deliveryIntel.insights[0] && ctx.healthScores.delivery.score < 60) {
      recommended.push(ctx.deliveryIntel.insights[0]);
    }
    if (ctx.zeroNoise) {
      recommended.push('Testez une offre panier moyen ou une campagne sur votre zone la plus rentable.');
    } else if (!recommended.length) {
      recommended.push('Traitez la priorité #1 avant toute autre tâche.');
    }

    const headline = ctx.businessStatus.message;

    return {
      headline,
      summary: ctx.businessStatus.detail || ctx.businessStatus.message,
      happened,
      improved: improved.length
        ? improved
        : ctx.zeroNoise
          ? ['Aucune urgence — conditions favorables à la croissance.']
          : ['Pas de signal positif marquant — concentrez-vous sur les priorités.'],
      decreased: decreased.length ? decreased : ['Aucune dégradation notable détectée.'],
      recommended,
    };
  }

  private buildTrends(metrics: Array<{ dateKey: string; ordersCreated?: number; revenueRecovered?: number; checkoutsStarted?: number; checkoutsCompleted?: number }>) {
    const last7 = metrics.slice(-7);
    return {
      orders: last7.map((m) => ({
        date: m.dateKey,
        value: m.ordersCreated || 0,
      })),
      recovered: last7.map((m) => ({
        date: m.dateKey,
        value: Math.round((m.revenueRecovered || 0) * 100) / 100,
      })),
      conversion: last7.map((m) => {
        const started = m.checkoutsStarted || 0;
        const completed = m.checkoutsCompleted || 0;
        return {
          date: m.dateKey,
          value: started > 0 ? Math.round((completed / started) * 100) : 0,
        };
      }),
    };
  }

  private bestChannel(channels: { email: number; whatsapp: number; sms: number }) {
    const entries = [
      { id: 'whatsapp', sent: channels.whatsapp, label: 'WhatsApp' },
      { id: 'email', sent: channels.email, label: 'Email' },
      { id: 'sms', sent: channels.sms, label: 'SMS' },
    ].filter((c) => c.sent > 0);
    if (!entries.length) return null;
    return entries.sort((a, b) => b.sent - a.sent)[0];
  }

  private buildDeliveryIntel(
    shipments: ShipmentRow[],
    regional: Array<{ region: string; orders: number; revenue: number }>,
  ) {
    const total = shipments.length;
    const delivered = shipments.filter((s) => s.status === 'delivered');
    const deliveredCount = delivered.length;
    const failedDeliveries = shipments.filter((s) =>
      ['refused', 'failed', 'returned', 'cancelled'].includes(s.status),
    ).length;

    const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
    const delayedShipments = shipments.filter(
      (s) =>
        ['in_transit', 'out_for_delivery', 'created'].includes(s.status) &&
        s.createdAt &&
        new Date(s.createdAt).getTime() < fiveDaysAgo,
    ).length;

    const providerStats = new Map<
      string,
      { total: number; delivered: number; totalDays: number; deliveredCount: number; failed: number }
    >();

    for (const s of shipments) {
      const p = s.provider || 'unknown';
      const stat = providerStats.get(p) || {
        total: 0,
        delivered: 0,
        totalDays: 0,
        deliveredCount: 0,
        failed: 0,
      };
      stat.total += 1;
      if (s.status === 'delivered') {
        stat.delivered += 1;
        const created = s.createdAt ? new Date(s.createdAt).getTime() : 0;
        const deliveredAt = this.shipmentDeliveredAt(s);
        if (created && deliveredAt > created) {
          stat.totalDays += (deliveredAt - created) / (24 * 60 * 60 * 1000);
          stat.deliveredCount += 1;
        }
      }
      if (['refused', 'failed', 'returned', 'cancelled'].includes(s.status)) {
        stat.failed += 1;
      }
      providerStats.set(p, stat);
    }

    let bestCarrier: { provider: string; successRate: number; avgDays: number } | null = null;
    let worstCarrier: { provider: string; successRate: number; failed: number } | null = null;
    for (const [provider, stat] of providerStats) {
      if (stat.total < 2) continue;
      const successRate = Math.round((stat.delivered / stat.total) * 100);
      const avgDays =
        stat.deliveredCount > 0
          ? Math.round((stat.totalDays / stat.deliveredCount) * 10) / 10
          : 0;
      if (!bestCarrier || successRate > bestCarrier.successRate) {
        bestCarrier = { provider, successRate, avgDays };
      }
      if (stat.failed > 0 && (!worstCarrier || stat.failed > worstCarrier.failed)) {
        worstCarrier = { provider, successRate, failed: stat.failed };
      }
    }

    const allDeliveredDays = delivered
      .map((s) => {
        const created = s.createdAt ? new Date(s.createdAt).getTime() : 0;
        const end = this.shipmentDeliveredAt(s);
        return created && end > created ? (end - created) / (24 * 60 * 60 * 1000) : 0;
      })
      .filter((d) => d > 0);
    const avgDeliveryDays =
      allDeliveredDays.length > 0
        ? Math.round((allDeliveredDays.reduce((a, b) => a + b, 0) / allDeliveredDays.length) * 10) / 10
        : 0;

    const successRate = total ? Math.round((deliveredCount / total) * 100) : 0;
    const estimatedImpact = Math.round(failedDeliveries * 80 * 0.6 * 100) / 100;
    const delayedRegions =
      delayedShipments > 0 && regional.length
        ? regional.slice(0, 2).map((r) => r.region)
        : [];

    const providerLabel = (p: string) =>
      ({ first_delivery: 'First Delivery', intigo: 'INTIGO', shipper: 'Shipper' })[p] || p;

    const insights: string[] = [];
    if (bestCarrier) {
      insights.push(
        `${providerLabel(bestCarrier.provider)} performe le mieux (${bestCarrier.successRate}% succès).`,
      );
    }
    if (worstCarrier && worstCarrier.failed >= 2) {
      insights.push(
        `${providerLabel(worstCarrier.provider)} : ${worstCarrier.failed} échec(s) détecté(s).`,
      );
    }
    if (delayedRegions.length) {
      insights.push(`Retards détectés — surveillez ${delayedRegions.join(' et ')}.`);
    }
    if (failedDeliveries > 0) {
      insights.push(
        `${failedDeliveries} livraison(s) échouée(s) = ~${estimatedImpact.toFixed(0)} TND à risque.`,
      );
    }
    if (!insights.length) {
      insights.push('Flux livraison stable — aucun signal opérationnel critique.');
    }

    const successTrend: 'up' | 'down' | 'stable' =
      failedDeliveries >= 2 || delayedShipments >= 3
        ? 'down'
        : successRate >= 85
          ? 'up'
          : 'stable';

    return {
      successRate,
      deliveredCount,
      failedDeliveries,
      delayedShipments,
      avgDeliveryDays,
      bestCarrier,
      worstCarrier,
      delayedRegions,
      estimatedImpact,
      insights,
      successTrend,
    };
  }

  private shipmentDeliveredAt(s: ShipmentRow): number {
    const deliveredEvent = [...(s.trackingHistory || [])]
      .reverse()
      .find((e) => e.status === 'delivered');
    if (deliveredEvent?.occurredAt) return new Date(deliveredEvent.occurredAt).getTime();
    if (s.status === 'delivered' && s.updatedAt) return new Date(s.updatedAt).getTime();
    return 0;
  }

  private buildFunnel(params: {
    cartsCreated: number;
    checkoutsStarted: number;
    checkoutsCompleted: number;
    orders30d: number;
    delivered: number;
    abandonedValue: number;
    recoveryRate: number;
    revenueRecovered: number;
    avgOrderValue: number;
  }) {
    const visitors = Math.max(
      Math.round(params.cartsCreated * 1.4),
      params.checkoutsStarted * 2,
      params.orders30d * 3,
      params.cartsCreated,
    );

    const steps = [
      { key: 'visitors', label: 'Visiteurs', count: visitors },
      { key: 'cart', label: 'Panier', count: params.cartsCreated },
      { key: 'checkout', label: 'Checkout', count: params.checkoutsStarted },
      { key: 'order', label: 'Commande', count: params.orders30d },
      { key: 'delivered', label: 'Livrée', count: params.delivered },
    ];

    const enriched = steps.map((step, i) => {
      const next = steps[i + 1];
      const loss = next && step.count > 0 ? Math.max(0, step.count - next.count) : 0;
      const dropRate =
        next && step.count > 0 ? Math.round((loss / step.count) * 100) : 0;
      const moneyLost = Math.round(loss * params.avgOrderValue * 0.35 * 100) / 100;

      const row: {
        key: string;
        label: string;
        count: number;
        loss: number;
        dropRate: number;
        moneyLost: number;
        recoveryRate?: number;
        recoveredRevenue?: number;
        moneyAtRisk?: number;
        isFrictionPoint?: boolean;
      } = { ...step, loss, dropRate, moneyLost };

      if (step.key === 'cart') {
        row.recoveryRate = params.recoveryRate;
        row.recoveredRevenue = Math.round(params.revenueRecovered * 100) / 100;
        row.moneyAtRisk = Math.round(params.abandonedValue * 100) / 100;
      }

      return row;
    });

    let maxMoneyLost = 0;
    let frictionStepKey = '';
    for (const step of enriched) {
      if (step.moneyLost > maxMoneyLost) {
        maxMoneyLost = step.moneyLost;
        frictionStepKey = step.key;
      }
    }

    return enriched.map((step) => ({
      ...step,
      isFrictionPoint: step.key === frictionStepKey && maxMoneyLost > 0,
    }));
  }

  private buildRecoveryPerformance(ctx: {
    recoveryRate: number;
    revenueRecovered: number;
    recoveriesSent: number;
    recoveredCount: number;
    bestChannel: { label: string; sent: number } | null;
    money: { abandonedCartValue: number };
  }) {
    const insight =
      ctx.recoveryRate >= 20
        ? `Recovery efficace — ${ctx.recoveryRate}% des relances convertissent.`
        : ctx.money.abandonedCartValue >= 100
          ? `${ctx.money.abandonedCartValue.toFixed(0)} TND encore récupérables — intensifiez WhatsApp.`
          : ctx.recoveriesSent === 0
            ? 'Aucune relance envoyée — activez smart recovery sur paniers abandonnés.'
            : `Taux recovery à ${ctx.recoveryRate}% — marge d'amélioration sur paniers urgents.`;

    return {
      recoveryRate: ctx.recoveryRate,
      recoveredRevenue: Math.round(ctx.revenueRecovered * 100) / 100,
      recoveriesSent: ctx.recoveriesSent,
      recoveredCount: ctx.recoveredCount,
      bestChannel: ctx.bestChannel?.label || null,
      insight,
    };
  }

  private buildQuickActions(ctx: {
    todayFocus: Array<{ href: string; title: string; suggestedAction: string; moneyImpact: number }>;
    money: { totalAtRisk: number; abandonedCartValue: number };
    deliveryIntel: { failedDeliveries: number };
  }) {
    const actions: Array<{ label: string; href: string; impact?: string }> = [];

    if (ctx.todayFocus[0]) {
      actions.push({
        label: ctx.todayFocus[0].suggestedAction,
        href: ctx.todayFocus[0].href,
        impact: `${ctx.todayFocus[0].moneyImpact.toFixed(0)} TND`,
      });
    }

    actions.push({
      label: 'Relancer paniers abandonnés',
      href: '/conversion/center',
      impact:
        ctx.money.abandonedCartValue > 0
          ? `${ctx.money.abandonedCartValue.toFixed(0)} TND`
          : undefined,
    });

    if (ctx.deliveryIntel.failedDeliveries > 0) {
      actions.push({
        label: 'Résoudre livraisons échouées',
        href: '/delivery',
      });
    }

    actions.push({ label: 'Optimiser checkout', href: '/conversion' });

    return actions.slice(0, 4);
  }

  private buildGrowthOpportunities(ctx: {
    regional: Array<{ region: string; revenue: number; orders: number }>;
    topProducts: Array<{ title: string; revenue: number }>;
    conversionGainPotential: number;
    bestChannel: { label: string } | null;
    ordersToday: number;
  }) {
    const opportunities: string[] = [];

    if (ctx.topProducts[0]) {
      opportunities.push(
        `Mettez "${ctx.topProducts[0].title}" en avant — ${ctx.topProducts[0].revenue.toFixed(0)} TND générés.`,
      );
    }
    if (ctx.regional[0]) {
      opportunities.push(
        `${ctx.regional[0].region} est votre zone la plus rentable (${ctx.regional[0].revenue.toFixed(0)} TND).`,
      );
    }
    if (ctx.conversionGainPotential > 0) {
      opportunities.push(
        `+${ctx.conversionGainPotential.toFixed(0)} TND potentiels en optimisant le checkout.`,
      );
    }
    if (ctx.bestChannel) {
      opportunities.push(`Canal recovery le plus actif : ${ctx.bestChannel.label}.`);
    }
    if (ctx.ordersToday === 0) {
      opportunities.push('Lancez une campagne WhatsApp pour relancer l\'acquisition.');
    }

    return opportunities.slice(0, 3);
  }

  private async topConvertingProducts(tenantId: string, since: Date) {
    const orders = await this.orderModel
      .find({ ...this.tenantQuery(tenantId), createdAt: { $gte: since } })
      .select('lineItems total')
      .lean();

    const map = new Map<string, { title: string; orders: number; revenue: number }>();
    for (const order of orders) {
      for (const item of order.lineItems || []) {
        const title = item.title || item.name || 'Produit';
        const prev = map.get(title) || { title, orders: 0, revenue: 0 };
        prev.orders += item.quantity;
        prev.revenue += item.total || item.price * item.quantity;
        map.set(title, prev);
      }
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }

  private async regionalPerformance(tenantId: string, since: Date) {
    const orders = await this.orderModel
      .find({ ...this.tenantQuery(tenantId), createdAt: { $gte: since } })
      .select('shippingAddress total metadata')
      .lean();

    const map = new Map<string, { region: string; orders: number; revenue: number }>();
    for (const order of orders) {
      const meta = (order.metadata || {}) as Record<string, unknown>;
      const region =
        (meta.governorate as string) ||
        order.shippingAddress?.province ||
        order.shippingAddress?.city ||
        'Autre';
      const prev = map.get(region) || { region, orders: 0, revenue: 0 };
      prev.orders += 1;
      prev.revenue += order.total || 0;
      map.set(region, prev);
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }

  private buildInsights(ctx: {
    kpis: { conversionRate: number; abandonedCartRate: number; deliverySuccessRate: number; codConfirmationRate: number; moneyAtRisk: number };
    recoveryRate: number;
    abandonedValue: number;
    bestChannel: { id: string; label: string; sent: number } | null;
    deliveryIntel: { delayedShipments: number; failedDeliveries: number; bestCarrier: { provider: string; successRate: number } | null };
    topProducts: Array<{ title: string; revenue: number }>;
    conversionRate: number;
    checkoutsStarted: number;
  }): RevenueOpsInsight[] {
    const insights: RevenueOpsInsight[] = [];

    if (ctx.kpis.moneyAtRisk >= 100) {
      insights.push({
        id: 'money-at-risk',
        severity: 'critical',
        title: 'Revenu perdu sur paniers abandonnés',
        message: `${ctx.kpis.moneyAtRisk.toFixed(0)} TND en paniers non finalisés — relances actives recommandées.`,
        actionLabel: 'Récupérer maintenant',
        actionHref: '/conversion/center',
      });
    }

    if (ctx.kpis.conversionRate < 35 && ctx.checkoutsStarted >= 5) {
      insights.push({
        id: 'conversion-drop',
        severity: 'warning',
        title: 'Conversion checkout en baisse',
        message: `Taux à ${ctx.kpis.conversionRate}% — vérifiez friction adresse et frais livraison.`,
        actionLabel: 'Voir conversion',
        actionHref: '/conversion',
      });
    }

    if (ctx.deliveryIntel.delayedShipments > 0) {
      insights.push({
        id: 'delivery-delay',
        severity: 'warning',
        title: `${ctx.deliveryIntel.delayedShipments} livraison(s) en retard`,
        message: 'Colis en transit depuis plus de 5 jours — contactez le transporteur.',
        actionLabel: 'Voir livraisons',
        actionHref: '/delivery',
      });
    }

    if (ctx.recoveryRate >= 15 && ctx.recoveryRate > 0) {
      insights.push({
        id: 'recovery-performing',
        severity: 'positive',
        title: 'Récupération paniers efficace',
        message: `${ctx.recoveryRate}% des relances convertissent — continuez la séquence smart recovery.`,
      });
    } else if (ctx.recoveryRate < 10 && ctx.kpis.moneyAtRisk > 0) {
      insights.push({
        id: 'recovery-weak',
        severity: 'warning',
        title: 'Performance recovery faible',
        message: `Seulement ${ctx.recoveryRate}% de récupération — testez WhatsApp sur paniers urgents.`,
        actionLabel: 'Centre relances',
        actionHref: '/conversion/center',
      });
    }

    if (ctx.topProducts[0]) {
      insights.push({
        id: 'top-product',
        severity: 'info',
        title: `Top produit : ${ctx.topProducts[0].title}`,
        message: `${ctx.topProducts[0].revenue.toFixed(0)} TND générés — mettez-le en avant au checkout.`,
        actionLabel: 'Produits',
        actionHref: '/products',
      });
    }

    if (ctx.deliveryIntel.bestCarrier) {
      insights.push({
        id: 'carrier-best',
        severity: 'positive',
        title: `Meilleur transporteur : ${ctx.deliveryIntel.bestCarrier.provider}`,
        message: `${ctx.deliveryIntel.bestCarrier.successRate}% de livraisons réussies sur 30 jours.`,
        actionHref: '/delivery',
      });
    }

    if (ctx.kpis.codConfirmationRate < 70) {
      insights.push({
        id: 'cod-low',
        severity: 'critical',
        title: 'Confirmations COD insuffisantes',
        message: `${ctx.kpis.codConfirmationRate}% confirmés par SMS — risque de faux commandes.`,
        actionLabel: 'Confirmer COD',
        actionHref: '/orders',
      });
    }

    if (ctx.bestChannel) {
      insights.push({
        id: 'channel-best',
        severity: 'info',
        title: `Canal recovery le plus actif : ${ctx.bestChannel.label}`,
        message: `${ctx.bestChannel.sent} relances envoyées ce mois.`,
        actionHref: '/conversion',
      });
    }

    return insights.slice(0, 5);
  }

  private buildRecommendations(ctx: {
    kpis: { conversionRate: number; abandonedCartRate: number };
    deliveryIntel: { bestCarrier: { provider: string; avgDays: number } | null; avgDeliveryDays: number };
    regional: Array<{ region: string; orders: number; revenue: number }>;
    recoveryRate: number;
    bestChannel: { id: string; label: string } | null;
  }): RevenueOpsRecommendation[] {
    const recs: RevenueOpsRecommendation[] = [];

    if (ctx.kpis.abandonedCartRate > 40) {
      recs.push({
        id: 'recovery-timing',
        title: 'Relance paniers à J+0 et J+1',
        detail:
          'Paniers urgents (score < 30) : WhatsApp + SMS sous 5 min. Score moyen : email à 45 min.',
        priority: 'high',
      });
    } else {
      recs.push({
        id: 'recovery-timing',
        title: 'Maintenir la séquence smart recovery',
        detail: 'Vos abandons sont maîtrisés — conservez 3 relances max par panier.',
        priority: 'low',
      });
    }

    if (ctx.deliveryIntel.bestCarrier) {
      recs.push({
        id: 'best-provider',
        title: `Prioriser ${ctx.deliveryIntel.bestCarrier.provider} au checkout`,
        detail: `Meilleur taux de succès · délai moyen ${ctx.deliveryIntel.bestCarrier.avgDays || ctx.deliveryIntel.avgDeliveryDays} j.`,
        priority: 'medium',
      });
    }

    if (ctx.regional[0]) {
      recs.push({
        id: 'regional',
        title: `${ctx.regional[0].region} : zone la plus rentable`,
        detail: `${ctx.regional[0].revenue.toFixed(0)} TND · ${ctx.regional[0].orders} commandes — ciblez vos campagnes ici.`,
        priority: 'medium',
      });
    }

    if (ctx.bestChannel) {
      recs.push({
        id: 'channel-recovery',
        title: `${ctx.bestChannel.label} performe le mieux en recovery`,
        detail: 'Concentrez les relances urgentes sur ce canal pour maximiser le ROI.',
        priority: 'medium',
      });
    }

    return recs.slice(0, 4);
  }
}
