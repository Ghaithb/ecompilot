import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import {
  ConversionDailyMetric,
  ConversionDailyMetricDocument,
} from '../conversion-intelligence/schemas/conversion-daily-metric.schema';
import { WinningProductDto, MarketIntelligenceDashboardDto } from './dto/winning-product.dto';
import { DeliveryIntelligenceService } from './delivery-intelligence.service';

@Injectable()
export class WinningProductsService {
  private readonly logger = new Logger(WinningProductsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(ConversionDailyMetric.name)
    private metricModel: Model<ConversionDailyMetricDocument>,
    private readonly deliveryIntelligence: DeliveryIntelligenceService,
  ) {}

  async getDashboard(): Promise<MarketIntelligenceDashboardDto> {
    const topProducts = await this.getTopProducts();
    const categories = this.extractCategories(topProducts);

    return {
      topProducts,
      trendingCategories: categories,
    };
  }

  private async getTopProducts(): Promise<WinningProductDto[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 1. Aggréger les ventes et livraison par titre de produit
    const salesStats = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: '$lineItems' },
      {
        $group: {
          _id: '$lineItems.title',
          salesCount: { $sum: '$lineItems.quantity' },
          revenue: { $sum: '$lineItems.total' },
          deliveredCount: {
            $sum: {
              $cond: [{ $in: ['$status', ['delivered', 'paid']] }, '$lineItems.quantity', 0],
            },
          },
          provinces: { $push: '$shippingAddress.province' },
        },
      },
    ]);

    // 2. Aggréger les vues (simplifié pour V1)
    // Note: Dans une application réelle, on utiliserait ConversionDailyMetric
    // Pour le MVP V1, on simule ou on utilise une pondération basée sur les ventes si vues non dispos
    
    const productsPromise = salesStats
      .map(async (s) => {
        const deliveryRate = s.salesCount > 0 ? (s.deliveredCount / s.salesCount) * 100 : 0;
        const trendScore = this.calculateTrendScore(s.salesCount, s.revenue);
        
        // Fetch specific carrier performance for this product
        const carrierStats = await this.deliveryIntelligence.getCarrierPerformanceForProduct(s._id);
        const bestCarrier = carrierStats[0]?.provider || 'À déterminer';
        
        return {
          title: s._id,
          category: 'Sourcing Direct',
          trendScore,
          deliveryScore: Math.round(deliveryRate),
          salesCount: s.salesCount,
          viewCount: s.salesCount * 12,
          averagePrice: Math.round(s.revenue / s.salesCount),
          topRegions: this.extractTopRegions(s.provinces),
          metadata: {
            bestCarrier,
            bestCarrierRate: carrierStats[0]?.deliveryRate || 0,
          }
        };
      });

    const products = await Promise.all(productsPromise);
    return products
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, 20);
  }

  private calculateTrendScore(count: number, revenue: number): number {
    // Logique simplifiée : croissance et volume
    const base = Math.min(count / 10, 50); // Volume (max 50 points)
    const revBonus = Math.min(revenue / 500, 50); // Revenu (max 50 points)
    return Math.round(base + revBonus);
  }

  private extractTopRegions(provinces: string[]): Array<{ name: string; count: number }> {
    const counts = provinces.reduce((acc, p) => {
      if (!p) return acc;
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  private extractCategories(products: WinningProductDto[]) {
    // Fréquence des catégories
    const cats = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(cats).map(([name, count]) => ({
      name,
      score: (count as number) * 10,
    }));
  }
}
