import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WebsiteService } from '../website/website.service';
import { ProductsService } from '../products/products.service';
import { CartCheckoutService } from '../cart/cart-checkout.service';
import { CartService } from '../cart/cart.service';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import {
  ConversionDailyMetric,
  ConversionDailyMetricDocument,
} from '../conversion-intelligence/schemas/conversion-daily-metric.schema';
import {
  DEFAULT_STORE_TEMPLATE,
  STORE_TEMPLATES,
} from '../website/constants/store-templates';
import { normalizePhone } from '../../common/utils/phone.util';

@Injectable()
export class StorefrontService {
  constructor(
    private website: WebsiteService,
    private products: ProductsService,
    private checkout: CartCheckoutService,
    private cart: CartService,
    private config: ConfigService,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(ConversionDailyMetric.name)
    private metricModel: Model<ConversionDailyMetricDocument>,
  ) {}

  private tenantQuery(tenantId: string) {
    const oid = Types.ObjectId.isValid(tenantId) ? new Types.ObjectId(tenantId) : null;
    return oid ? { tenantId: { $in: [tenantId, oid] } } : { tenantId };
  }

  private formatProduct(product: Record<string, unknown>) {
    const id = String(product._id);
    const variants = product.variants as Array<{ price?: number; inventory?: number; sku?: string }>;
    const v = variants?.[0];
    const price = Number(v?.price);
    return {
      id,
      title: product.title as string,
      description: product.description as string,
      category: (product.category as string) || 'Général',
      price: Number.isFinite(price) ? price : 0,
      image: (product.images as string[])?.[0] || '',
      images: product.images as string[],
      inStock: (v?.inventory || 0) > 0,
      sku: v?.sku || '',
      metadata: product.metadata as Record<string, unknown>,
    };
  }

  /** Ne renvoie que des produits encore présents dans le catalogue actif. */
  private resolveCatalogProduct<
    T extends { id: string; title: string; price: number; image: string; category: string; inStock: boolean; sku: string },
  >(catalog: T[], ref: { id: string; title: string }): T | undefined {
    return catalog.find((p) => p.id === ref.id || p.title === ref.title);
  }

  private pickFeatured<
    T extends { id: string; price: number },
  >(catalog: T[], ranked: T[]): T | undefined {
    const fromRanked = ranked.find((p) => catalog.some((c) => c.id === p.id));
    if (fromRanked) return fromRanked;
    return catalog.find((p) => p.price > 0) || catalog[0];
  }

  async getStore(slug: string) {
    const site = await this.website.findBySlug(slug);
    if (!site.published) throw new Error('Store not published');

    const tenantId = site.tenantId?.toString?.() || String(site.tenantId);
    const allProducts = (await this.products.findByTenant(tenantId))
      .filter((p) => p.status === 'active' && p.variants?.length)
      .map((p) => this.formatProduct(p as unknown as Record<string, unknown>));

    const intelligence = await this.getHomeIntelligence(tenantId, allProducts);
    const featured = this.pickFeatured(allProducts, intelligence.bestSellers);
    const templateId = site.storeTemplate || DEFAULT_STORE_TEMPLATE;
    const templatePreset = STORE_TEMPLATES[templateId] || STORE_TEMPLATES[DEFAULT_STORE_TEMPLATE];
    const trackingEnabled = site.analytics?.enableTracking !== false;

    return {
      store: {
        name: site.name,
        slug: site.slug,
        theme: {
          ...(templatePreset.theme || {}),
          ...(site.theme || {}),
        },
        currency: site.settings?.currency || 'TND',
      },
      storeTemplate: templateId,
      templateLayout: templatePreset.layout,
      analytics: trackingEnabled
        ? {
            googleAnalyticsId: site.analytics?.googleAnalyticsId,
            facebookPixelId: site.analytics?.facebookPixelId,
          }
        : undefined,
      trust: this.trustLayer(site),
      delivery: this.defaultDeliveryIntel(),
      commerce: {
        freeShippingThreshold: this.config.get<number>('cart.freeShippingThreshold') || 150,
        defaultShipping: this.config.get<number>('cart.defaultShippingTnd') || 7,
      },
      featured,
      catalog: allProducts,
      intelligence,
      productCount: allProducts.length,
    };
  }

  async getProduct(slug: string, productId: string) {
    const site = await this.website.findBySlug(slug);
    const tenantId = site.tenantId?.toString?.() || String(site.tenantId);
    const product = await this.products.findOne(tenantId, productId);
    if (!product || product.status !== 'active') throw new Error('Product not found');

    const formatted = this.formatProduct(product as unknown as Record<string, unknown>);
    const all = (await this.products.findByTenant(tenantId))
      .filter((p) => p.status === 'active')
      .map((p) => this.formatProduct(p as unknown as Record<string, unknown>));

    const related = all
      .filter((p) => p.id !== productId && p.category === formatted.category)
      .slice(0, 4);

    const upsells = await this.checkout.getUpsells(tenantId, [productId]);
    const urgency = this.urgencySignals(formatted);

    return {
      product: formatted,
      related: related.length ? related : all.filter((p) => p.id !== productId).slice(0, 4),
      upsells,
      delivery: this.defaultDeliveryIntel(),
      trust: this.trustLayer(site),
      urgency,
    };
  }

  async getCartPreview(slug: string, sessionId: string) {
    const site = await this.website.findBySlug(slug);
    const tenantId = site.tenantId?.toString?.() || String(site.tenantId);
    const cartDoc = await this.cart.getSessionCart(tenantId, sessionId);
    const threshold = this.config.get<number>('cart.freeShippingThreshold') || 150;
    const subtotal = cartDoc.totals?.subtotal || 0;
    const remaining = Math.max(0, threshold - subtotal);
    const progress = Math.min(100, Math.round((subtotal / threshold) * 100));

    const productIds = cartDoc.items.map((i) => i.productId.toString());
    const upsells = productIds.length ? await this.checkout.getUpsells(tenantId, productIds) : [];

    return {
      items: cartDoc.items,
      totals: cartDoc.totals,
      currency: cartDoc.currency || 'TND',
      freeShipping: {
        threshold,
        remaining: Math.round(remaining * 100) / 100,
        progress,
        unlocked: remaining <= 0,
      },
      shippingPreview: {
        estimatedCost: cartDoc.totals?.shipping ?? (this.config.get<number>('cart.defaultShippingTnd') || 7),
        estimatedDays: 2,
        provider: cartDoc.selectedShipping?.provider || 'intigo',
      },
      upsells: upsells.slice(0, 3),
      trust: this.trustLayer(site),
      delivery: this.defaultDeliveryIntel(),
    };
  }

  async trackEvent(
    slug: string,
    body: { event: string; productId?: string; deviceType?: string; sessionId?: string },
  ) {
    const site = await this.website.findBySlug(slug);
    const tenantId = site.tenantId?.toString?.() || String(site.tenantId);
    const dateKey = new Date().toISOString().slice(0, 10);
    const inc: Record<string, number> = {};

    if (body.event === 'store_view') inc['storefront.views'] = 1;
    if (body.event === 'product_view' && body.productId) {
      inc[`storefront.productViews.${body.productId}`] = 1;
    }
    if (body.event === 'add_to_cart') inc['storefront.addToCart'] = 1;
    if (body.event === 'checkout_started') inc['checkoutsStarted'] = 1;
    if (body.event === 'purchase') {
      inc['checkoutsCompleted'] = 1;
      inc['storefront.purchases'] = 1;
    }
    if (body.deviceType === 'mobile') inc['storefront.mobileViews'] = 1;
    if (body.deviceType === 'desktop') inc['storefront.desktopViews'] = 1;

    if (Object.keys(inc).length) {
      await this.metricModel.updateOne(
        { tenantId, dateKey },
        { $inc: inc, $setOnInsert: { tenantId, dateKey } },
        { upsert: true },
      );
    }

    if (body.sessionId && body.productId && body.event === 'product_view') {
      await this.cartModel.updateOne(
        { tenantId, sessionId: body.sessionId },
        { $set: { lastActivityAt: new Date(), deviceType: body.deviceType || 'unknown' } },
      );
    }

    return { ok: true };
  }

  private async getHomeIntelligence(
    tenantId: string,
    products: Array<{ id: string; title: string; price: number; image: string; category: string }>,
  ) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [orders, recoveredCarts] = await Promise.all([
      this.orderModel
        .find({ ...this.tenantQuery(tenantId), createdAt: { $gte: thirtyDaysAgo } })
        .select('lineItems createdAt')
        .lean(),
      this.cartModel
        .find({ tenantId, recoveredFromAbandonment: true })
        .select('items totals')
        .limit(50)
        .lean(),
    ]);

    const salesMap = new Map<string, { id: string; title: string; sold: number; revenue: number; image?: string }>();
    for (const order of orders) {
      for (const item of order.lineItems || []) {
        const title = item.title || item.name || 'Produit';
        const key = item.productId?.toString?.() || title;
        const prev = salesMap.get(key) || { id: key, title, sold: 0, revenue: 0 };
        prev.sold += item.quantity;
        prev.revenue += item.total || item.price * item.quantity;
        salesMap.set(key, prev);
      }
    }

    const bestSellers = [...salesMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .map((s) => this.resolveCatalogProduct(products, s))
      .filter((p): p is (typeof products)[number] => Boolean(p))
      .slice(0, 8);

    const recoveredMap = new Map<string, number>();
    for (const cart of recoveredCarts) {
      for (const item of cart.items || []) {
        const name = item.name;
        recoveredMap.set(name, (recoveredMap.get(name) || 0) + (item.subtotal || 0));
      }
    }
    const topRecovered = [...recoveredMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([title]) => this.resolveCatalogProduct(products, { id: '', title }))
      .filter((p): p is (typeof products)[number] => Boolean(p));

    const trending = products
      .slice()
      .sort((a, b) => {
        const sa = salesMap.get(a.id)?.sold || salesMap.get(a.title)?.sold || 0;
        const sb = salesMap.get(b.id)?.sold || salesMap.get(b.title)?.sold || 0;
        return sb - sa;
      })
      .slice(0, 8);

    return {
      trending: trending.length ? trending : products.slice(0, 6),
      bestSellers: bestSellers.length ? bestSellers : products.slice(0, 6),
      topRecovered: topRecovered.length ? topRecovered : products.slice(0, 4),
    };
  }

  private defaultDeliveryIntel() {
    const provider = this.config.get<string>('shipping.defaultProvider') || 'intigo';
    return {
      estimatedDays: 2,
      estimatedLabel: '24–72h',
      deliveryConfidence: 82,
      bestCarrier: provider,
      carrierLabel: provider.replace('_', ' ').toUpperCase(),
      message: 'Livraison rapide partout en Tunisie · paiement à la réception',
    };
  }

  private trustLayer(site: {
    name?: string;
    features?: Record<string, unknown>;
    businessConfig?: { customFields?: Record<string, unknown> };
  }) {
    const contact = (site.features?.contact || {}) as Record<string, unknown>;
    const cf = (site.businessConfig?.customFields || {}) as Record<string, unknown>;
    const phone = (cf.phone as string) || (contact.phone as string);
    const whatsapp =
      (contact.whatsapp as string) ||
      (phone ? `https://wa.me/${normalizePhone(phone).replace(/\D/g, '')}` : undefined);

    return {
      badges: [
        { id: 'cod', label: 'Paiement à la livraison' },
        { id: 'secure', label: 'Checkout sécurisé SMS' },
        { id: 'verified', label: 'Marchand vérifié' },
        { id: 'returns', label: 'Retour sous 7 jours' },
      ],
      codTrust: {
        headline: 'Payez à la réception — zéro risque',
        bullets: ['Confirmation SMS avant expédition', 'Pas de carte bancaire requise', 'Support WhatsApp réactif'],
      },
      whatsappSupport: whatsapp || 'https://wa.me/21600000000',
      merchantName: site.name,
    };
  }

  private urgencySignals(product: { inStock?: boolean; price: number }) {
    return {
      lowStock: !product.inStock,
      popular: product.price >= 50 && product.price <= 300,
      deliveryPromise: 'Commandez avant 14h → expédition demain',
    };
  }
}
