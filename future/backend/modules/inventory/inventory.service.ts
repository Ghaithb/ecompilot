import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { ProductsService } from '../products/products.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  private readonly LOW_STOCK_THRESHOLD = 5;

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly productsService: ProductsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async checkLowStock(tenantId: string): Promise<void> {
    const products = await this.productModel
      .find({
        tenantId,
        'variants.inventory': { $lte: this.LOW_STOCK_THRESHOLD },
        'variants.isActive': true,
      })
      .exec();

    for (const product of products) {
      const lowStockVariants = product.variants.filter(
        v => v.isActive && v.inventory <= this.LOW_STOCK_THRESHOLD
      );

      for (const variant of lowStockVariants) {
        await this.notificationsService.create(tenantId, {
          type: 'stock',
          title: 'Stock bas',
          message: `Le produit "${product.title}" (variante: ${variant.name || 'Standard'}) n'a plus que ${variant.inventory} unités en stock.`,
          priority: variant.inventory <= 2 ? 'urgent' : 'high',
          link: `/products/${product._id}`,
          metadata: {
            productId: product._id,
            variantId: variant._id,
            currentStock: variant.inventory,
          },
        });

        this.logger.warn(
          `Stock bas détecté pour ${product.title} (${variant.name || 'Standard'}): ${variant.inventory} unités`,
        );
      }
    }
  }

  async getSummary(tenantId: string) {
    const products = await this.productModel.find({ tenantId, status: 'active' }).lean();

    let totalProducts = 0;
    let totalVariants = 0;
    let totalInventory = 0;
    let totalInventoryValue = 0;

    const items: Array<{ sku: string; stock: number; price: number; productTitle: string; variantName: string; platform: 'Local' | 'Shopify' }> = [];

    for (const p of products) {
      totalProducts++;
      for (const v of p.variants) {
        if (!v.isActive) continue;
        totalVariants++;
        totalInventory += v.inventory;
        totalInventoryValue += v.inventory * v.price;
        const platform: 'Local' | 'Shopify' = p.metadata && p.metadata.shopifyId ? 'Shopify' : 'Local';
        items.push({ sku: v.sku, stock: v.inventory, price: v.price, productTitle: p.title, variantName: v.name, platform });
      }
    }

    const bySku: Record<string, { total: number; platforms: { Local: number; Shopify: number } }> = {};
    for (const i of items) {
      if (!bySku[i.sku]) {
        bySku[i.sku] = { total: 0, platforms: { Local: 0, Shopify: 0 } };
      }
      bySku[i.sku].total += i.stock;
      bySku[i.sku].platforms[i.platform] += i.stock;
    }

    const local = Object.entries(bySku).map(([sku, data]) => ({ sku, stock: data.platforms.Local }));
    const shopify = Object.entries(bySku).map(([sku, data]) => ({ sku, stock: data.platforms.Shopify }));

    return {
      tenantId,
      totals: {
        products: totalProducts,
        variants: totalVariants,
        inventory: totalInventory,
        inventoryValue: totalInventoryValue,
      },
      platforms: [
        { name: 'Local', products: local },
        { name: 'Shopify', products: shopify },
      ],
      lastUpdated: new Date(),
    };
  }

  async getItems(tenantId: string, query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    stockStatus?: 'all' | 'ok' | 'low' | 'out';
    lowThreshold?: number;
  }) {
    const {
      page = 1,
      limit = 20,
      search = '',
      category,
      stockStatus = 'all',
      lowThreshold = 5,
    } = query || {} as any;

    const filter: any = { tenantId };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'variants.sku': { $regex: search, $options: 'i' } },
      ];
    }

    const products = await this.productModel
      .find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Flatten variants to inventory items
    const items = [] as Array<{
      productId: string;
      title: string;
      category?: string;
      image?: string;
      sku: string;
      variantName: string;
      price: number;
      inventory: number;
      status: 'ok' | 'low' | 'out';
    }>;

    for (const p of products) {
      for (const v of p.variants) {
        const status: 'ok' | 'low' | 'out' = v.inventory <= 0 ? 'out' : (v.inventory <= lowThreshold ? 'low' : 'ok');
        items.push({
          productId: String(p._id),
          title: p.title,
          category: p.category,
          image: p.images?.[0],
          sku: v.sku,
          variantName: v.name,
          price: v.price,
          inventory: v.inventory,
          status,
        });
      }
    }

    const filtered = stockStatus === 'all' ? items : items.filter(i => i.status === stockStatus);

    const total = await this.productModel.countDocuments(filter);
    return {
      items: filtered,
      total,
      page,
      limit,
      lowThreshold,
    };
  }

  async adjustStock(tenantId: string, productId: string, sku: string, quantity: number) {
    return this.productsService.updateInventory(tenantId, productId, sku, quantity);
  }
}
