import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { NotificationService } from '../notifications/notification.service';

export interface StockAlert {
  productId: string;
  productTitle: string;
  variantSku: string;
  variantName: string;
  currentStock: number;
  threshold: number;
  tenantId: string;
  severity: 'low' | 'critical';
}

@Injectable()
export class StockAlertsService {
  private readonly logger = new Logger(StockAlertsService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly notificationService: NotificationService
  ) {}

    // Vérifier les stocks bas toutes les heures
    @Cron(CronExpression.EVERY_HOUR)
    async checkLowStock() {
      this.logger.log('🔍 Vérification des stocks bas...');
      try {
        const alerts = await this.generateStockAlerts();
        if (alerts.length > 0) {
          this.logger.warn(`⚠️ ${alerts.length} alertes de stock générées`);
          await this.processAlerts(alerts);
        } else {
          this.logger.log('✅ Tous les stocks sont suffisants');
        }
      } catch (error) {
        this.logger.error(`Erreur lors de la vérification des stocks: ${error.message}`);
      }
    }

    async generateStockAlerts(): Promise<StockAlert[]> {
      const alerts: StockAlert[] = [];
      // Récupérer tous les produits actifs
      const products = await this.productModel
        .find({ status: 'active' })
        .populate('tenantId')
        .exec();
      for (const product of products) {
        for (const variant of product.variants) {
          if (!variant.isActive) continue;
          const threshold = this.calculateStockThreshold(variant.inventory);
          const severity = variant.inventory <= threshold.critical ? 'critical' : 'low';
          if (variant.inventory <= threshold.low) {
            alerts.push({
              productId: (product._id as string).toString(),
              productTitle: product.title,
              variantSku: variant.sku,
              variantName: variant.name,
              currentStock: variant.inventory,
              threshold: threshold.low,
              tenantId: product.tenantId.toString(),
              severity,
            });
          }
        }
      }
      return alerts;
    }

    private calculateStockThreshold(currentStock: number): { low: number; critical: number } {
      const lowThreshold = Math.max(10, Math.floor(currentStock * 0.2));
      const criticalThreshold = Math.max(5, Math.floor(currentStock * 0.1));
      return { low: lowThreshold, critical: criticalThreshold };
    }

    private async processAlerts(alerts: StockAlert[]) {
      const alertsByTenant = alerts.reduce((acc, alert) => {
        if (!acc[alert.tenantId]) {
          acc[alert.tenantId] = [];
        }
        acc[alert.tenantId].push(alert);
        return acc;
      }, {} as Record<string, StockAlert[]>);
      for (const [tenantId, tenantAlerts] of Object.entries(alertsByTenant)) {
        await this.sendTenantAlerts(tenantId, tenantAlerts);
      }
    }

    private async sendTenantAlerts(tenantId: string, alerts: StockAlert[]) {
      const criticalAlerts = alerts.filter(a => a.severity === 'critical');
      const lowAlerts = alerts.filter(a => a.severity === 'low');
      this.logger.log(`📧 Envoi d'alertes pour tenant ${tenantId}: ${criticalAlerts.length} critiques, ${lowAlerts.length} faibles`);
      // Envoi email pour alertes critiques
      if (criticalAlerts.length > 0) {
        this.logger.error(`🚨 ALERTES CRITIQUES pour tenant ${tenantId}:`);
        criticalAlerts.forEach(alert => {
          this.logger.error(`  - ${alert.productTitle} (${alert.variantName}): ${alert.currentStock} en stock`);
        });
        // TODO: récupérer l'email du tenant ou d'un contact admin
        const adminEmail = 'admin@ecompilot.com'; // À remplacer par l'email réel du tenant
        await this.notificationService.sendLowStockAlert(adminEmail, criticalAlerts);
      }
      if (lowAlerts.length > 0) {
        this.logger.warn(`⚠️ Alertes faibles pour tenant ${tenantId}:`);
        lowAlerts.forEach(alert => {
          this.logger.warn(`  - ${alert.productTitle} (${alert.variantName}): ${alert.currentStock} en stock`);
        });
      }
    }

    async getCurrentAlerts(tenantId?: string): Promise<StockAlert[]> {
      const alerts = await this.generateStockAlerts();
      if (tenantId) {
        return alerts.filter(alert => alert.tenantId === tenantId);
      }
      return alerts;
    }

    async getStockStatistics(tenantId?: string) {
      const filter = tenantId ? { tenantId } : {};
      const products = await this.productModel.find(filter).exec();
      let totalProducts = 0;
      let totalVariants = 0;
      let lowStockVariants = 0;
      let outOfStockVariants = 0;
      let totalInventoryValue = 0;
      for (const product of products) {
        totalProducts++;
        for (const variant of product.variants) {
          if (!variant.isActive) continue;
          totalVariants++;
          totalInventoryValue += variant.inventory * variant.price;
          const threshold = this.calculateStockThreshold(variant.inventory);
          if (variant.inventory <= threshold.critical) {
            outOfStockVariants++;
          } else if (variant.inventory <= threshold.low) {
            lowStockVariants++;
          }
        }
      }
      return {
        totalProducts,
        totalVariants,
        lowStockVariants,
        outOfStockVariants,
        totalInventoryValue,
        lowStockPercentage: totalVariants > 0 ? (lowStockVariants / totalVariants) * 100 : 0,
        outOfStockPercentage: totalVariants > 0 ? (outOfStockVariants / totalVariants) * 100 : 0,
      };
    }
  }

        
