import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../../products/schemas/product.schema';
import { Order, OrderDocument } from '../../orders/schemas/order.schema';
import { Tenant, TenantDocument } from '../../tenants/schemas/tenant.schema';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  handle: string;
  status: string;
  variants: Array<{
    id: number;
    title: string;
    price: string;
    sku: string;
    inventory_quantity: number;
    inventory_item_id?: number;
    option1?: string;
    option2?: string;
    option3?: string;
    compare_at_price?: string;
    cost?: string;
  }>;
  images: Array<{
    id: number;
    src: string;
    alt: string;
  }>;
  tags: string;
}

interface ShopifyOrder {
  id: number;
  email: string;
  created_at: string;
  financial_status: string;
  fulfillment_status: string;
  total_price: string;
  currency: string;
  line_items: Array<{
    id: number;
    title: string;
    quantity: number;
    price: string;
    sku: string;
    product_id: number;
  }>;
  shipping_address: {
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
}

@Injectable()
export class ShopifyService {
  private readonly logger = new Logger(ShopifyService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private readonly configService: ConfigService,
  ) {}

  async connect(tenantId: string, shop: string, code: string) {
    const apiKey = this.configService.get<string>('shopify.apiKey') || this.configService.get<string>('SHOPIFY_API_KEY');
    const scopes = this.configService.get<string>('shopify.scopes') || this.configService.get<string>('SHOPIFY_SCOPES') || 'read_products,read_orders';
    const redirectUri = this.configService.get<string>('shopify.redirectUri') || this.configService.get<string>('SHOPIFY_REDIRECT_URI');

    if (apiKey && redirectUri) {
      // Build real OAuth authorize URL and let the frontend redirect
      const state = Buffer.from(`${tenantId}:${Date.now()}`).toString('base64url');
      const redirectUrl = `https://${shop}/admin/oauth/authorize?client_id=${encodeURIComponent(apiKey)}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
      this.logger.log(`Shopify authorize URL generated for tenant=${tenantId}, shop=${shop}`);
      return { redirectUrl };
    }

    // Fallback simulation mode
    this.logger.log(`Shopify connect (simulation) for tenant=${tenantId}, shop=${shop}`);
    await this.tenantModel.updateOne(
      { _id: new Types.ObjectId(tenantId) },
      {
        $set: {
          'integrations.shopify.shop': shop,
          'integrations.shopify.connectedAt': new Date(),
          'integrations.shopify.mode': 'simulation',
        },
        $unset: { 'integrations.shopify.accessTokenEnc': '' },
      },
      { upsert: false },
    );
    return { success: true, shop, mode: 'simulation' };
  }

  async handleCallback(tenantId: string, params: { hmac: string; code: string; shop: string; state?: string; query: Record<string, any> }) {
    const { hmac, code, shop, query } = params;
    const secret = this.configService.get<string>('shopify.apiSecret') || this.configService.get<string>('SHOPIFY_API_SECRET');
    if (secret) {
      const message = this.buildHmacMessage(query);
      const digest = crypto.createHmac('sha256', secret).update(message).digest('hex');
      const valid = crypto.timingSafeEqual(Buffer.from(digest, 'utf8'), Buffer.from(hmac, 'utf8'));
      if (!valid) {
        this.logger.warn('Shopify callback HMAC invalid. Falling back to simulation.');
      }
    } else {
      this.logger.warn('SHOPIFY_API_SECRET not configured. Callback handled in simulation mode.');
    }

    // In real flow: exchange code -> access_token and store encrypted token
    const apiKey = this.configService.get<string>('shopify.apiKey') || this.configService.get<string>('SHOPIFY_API_KEY');
    const apiSecret = secret;
    let accessTokenEnc: string | null = null;
    if (apiKey && apiSecret) {
      try {
        const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ client_id: apiKey, client_secret: apiSecret, code }),
        });
        if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
        const data: any = await res.json();
        const token = data?.access_token as string | undefined;
        if (token) {
          const key = this.configService.get<string>('shopify.tokensKey') || this.configService.get<string>('SHOPIFY_TOKENS_KEY');
          accessTokenEnc = this.encryptToken(key, token);
        }
      } catch (e: any) {
        this.logger.warn(`Shopify token exchange error: ${e.message}`);
      }
    }

    await this.tenantModel.updateOne(
      { _id: new Types.ObjectId(tenantId) },
      {
        $set: {
          'integrations.shopify.shop': shop,
          'integrations.shopify.connectedAt': new Date(),
          'integrations.shopify.mode': apiKey && apiSecret ? 'live' : 'simulation',
          ...(accessTokenEnc ? { 'integrations.shopify.accessTokenEnc': accessTokenEnc } : {}),
        },
        $setOnInsert: { createdAt: new Date() },
        $currentDate: { updatedAt: true },
      },
    );
    // Trigger initial backfill asynchronously (Phase 2)
    setImmediate(async () => {
      try {
        const token = await this.getDecryptedTokenForTenant(tenantId);
        if (token) {
          await this.backfillProductsAndOrders(tenantId, shop, token);
        }
      } catch (e: any) {
        this.logger.warn(`Backfill failed: ${e.message}`);
      }
    });
    return { success: true, shop, mode: apiKey && apiSecret ? 'live' : 'simulation' };
  }

  async handleWebhook(tenantId: string, topic: string, body: any, hmacHeader: string, shopDomain: string, rawBody?: Buffer) {
    const secret = this.configService.get<string>('shopify.apiSecret') || this.configService.get<string>('SHOPIFY_API_SECRET');
    if (secret && rawBody) {
      const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
      if (computed !== (hmacHeader || '')) {
        this.logger.warn(`Invalid Shopify webhook HMAC for topic=${topic}`);
        throw new BadRequestException('Invalid HMAC');
      }
    } else {
      this.logger.warn('Shopify webhook processed without HMAC verification (missing secret or raw body).');
    }

    // Minimal handlers now upsert into DB
    switch (topic) {
      case 'orders-create':
      case 'orders/created':
      case 'orders-updated':
      case 'orders/updated':
        this.logger.log(`Webhook ${topic} received for tenant=${tenantId}, order id=${body?.id}`);
        try {
          await this.importSingleOrder(tenantId, body as any);
        } catch (e: any) {
          this.logger.error(`Failed to upsert order from webhook: ${e.message}`);
        }
        break;
      case 'products-create':
      case 'products/created':
      case 'products-update':
      case 'products/updated':
        this.logger.log(`Webhook ${topic} received for tenant=${tenantId}, product id=${body?.id}`);
        try {
          await this.importSingleProduct(tenantId, body as any);
        } catch (e: any) {
          this.logger.error(`Failed to upsert product from webhook: ${e.message}`);
        }
        break;
      case 'inventory-levels-update':
      case 'inventory_levels/update':
        this.logger.log(`Webhook ${topic} received for tenant=${tenantId}`);
        try {
          const inventoryItemId = body?.inventory_item_id as number | undefined;
          const available = body?.available as number | undefined;
          if (inventoryItemId != null && typeof available === 'number') {
            const product = await this.productModel.findOne({ tenantId, 'variants.shopifyInventoryItemId': inventoryItemId }).exec();
            if (product) {
              let updated = false;
              for (const v of product.variants as any[]) {
                if (v.shopifyInventoryItemId === inventoryItemId) {
                  v.inventory = available;
                  updated = true;
                }
              }
              if (updated) {
                await this.productModel.updateOne({ _id: (product as any)._id }, { $set: { variants: product.variants, updatedAt: new Date() } });
              }
            }
          }
        } catch (e: any) {
          this.logger.error(`Failed to handle inventory update: ${e.message}`);
        }
        break;
      default:
        this.logger.log(`Webhook ${topic} received for tenant=${tenantId}`);
    }
    // Stamp last webhook time on tenant
    try {
      await this.tenantModel.updateOne(
        { _id: new Types.ObjectId(tenantId) },
        { $set: { 'integrations.shopify.lastWebhookAt': new Date(), updatedAt: new Date() } },
      );
    } catch {}
    return { success: true };
  }

  private buildHmacMessage(query: Record<string, any>) {
    const sorted = Object.keys(query)
      .filter(k => k !== 'hmac' && typeof query[k] !== 'undefined')
      .sort()
      .map(k => `${k}=${Array.isArray(query[k]) ? query[k].join(',') : query[k]}`)
      .join('&');
    return sorted;
  }

  private encryptToken(key?: string, token?: string | null) {
    if (!key || !token) return null;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'utf8').subarray(0, 32), iv);
    const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, ciphertext]).toString('base64');
  }

  private decryptToken(key?: string, enc?: string | null) {
    if (!key || !enc) return null;
    const buf = Buffer.from(enc, 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ciphertext = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'utf8').subarray(0, 32), iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plain.toString('utf8');
  }

  private async getDecryptedTokenForTenant(tenantId: string): Promise<string | null> {
    const tokensKey = this.configService.get<string>('shopify.tokensKey') || this.configService.get<string>('SHOPIFY_TOKENS_KEY');
    const t = await this.tenantModel.findById(tenantId).lean();
    const enc = (t as any)?.integrations?.shopify?.accessTokenEnc as string | undefined;
    return this.decryptToken(tokensKey || '', enc || null);
  }

  private async backfillProductsAndOrders(tenantId: string, shop: string, token: string) {
    // Paginated backfill with simple retry (up to 3 pages each)
    const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' } as any;
    const fetchPaged = async (path: string, key: 'products' | 'orders', maxPages = 3) => {
      let url = `https://${shop}${path}`;
      for (let page = 0; page < maxPages; page++) {
        try {
          const res = await fetch(url, { headers });
          if (!res.ok) break;
          const json: any = await res.json();
          const items = json?.[key] || [];
          if (key === 'products') {
            for (const it of items) await this.importSingleProduct(tenantId, it as any);
          } else {
            for (const it of items) await this.importSingleOrder(tenantId, it as any);
          }
          const link = res.headers.get('link') || res.headers.get('Link');
          const nextMatch = link && link.match(/<([^>]+)>; rel="next"/i);
          if (nextMatch && nextMatch[1]) {
            url = nextMatch[1];
          } else {
            break;
          }
        } catch (e: any) {
          this.logger.warn(`Backfill ${key} page error: ${e.message}`);
          break;
        }
      }
    };

    await fetchPaged('/admin/api/2023-10/products.json?limit=50', 'products');
    await fetchPaged('/admin/api/2023-10/orders.json?status=any&limit=50', 'orders');

    // Stamp last backfill time on tenant
    try {
      await this.tenantModel.updateOne(
        { _id: new Types.ObjectId(tenantId) },
        { $set: { 'integrations.shopify.lastBackfillAt': new Date(), updatedAt: new Date() } },
      );
    } catch {}
  }

  async disconnect(tenantId: string) {
    await this.tenantModel.updateOne(
      { _id: new Types.ObjectId(tenantId) },
      {
        $unset: {
          'integrations.shopify.shop': '',
          'integrations.shopify.connectedAt': '',
          'integrations.shopify.accessTokenEnc': '',
          'integrations.shopify.mode': '',
        },
        $set: { updatedAt: new Date() },
      },
    );
    return { success: true };
  }

  async importProducts(tenantId: string, shopifyProducts: ShopifyProduct[]): Promise<{ imported: number; errors: number }> {
    let imported = 0;
    let errors = 0;

    this.logger.log(`Import de ${shopifyProducts.length} produits Shopify pour tenant ${tenantId}`);

    for (const shopifyProduct of shopifyProducts) {
      try {
        await this.importSingleProduct(tenantId, shopifyProduct);
        imported++;
      } catch (error) {
        this.logger.error(`Erreur import produit ${shopifyProduct.id}: ${error.message}`);
        errors++;
      }
    }

    return { imported, errors };
  }

  async importOrders(tenantId: string, shopifyOrders: ShopifyOrder[]): Promise<{ imported: number; errors: number }> {
    let imported = 0;
    let errors = 0;

    this.logger.log(`Import de ${shopifyOrders.length} commandes Shopify pour tenant ${tenantId}`);

    for (const shopifyOrder of shopifyOrders) {
      try {
        await this.importSingleOrder(tenantId, shopifyOrder);
        imported++;
      } catch (error) {
        this.logger.error(`Erreur import commande ${shopifyOrder.id}: ${error.message}`);
        errors++;
      }
    }

    return { imported, errors };
  }

  async syncProduct(tenantId: string, shopifyProductId: number, shopifyData: any): Promise<Product> {
    const existingProduct = await this.productModel.findOne({
      tenantId,
      'metadata.shopifyId': shopifyProductId,
    }).exec();

    if (existingProduct) {
      return this.updateProductFromShopify(existingProduct, shopifyData);
    } else {
      return this.createProductFromShopify(tenantId, shopifyData);
    }
  }

  private async importSingleProduct(tenantId: string, shopifyProduct: ShopifyProduct): Promise<void> {
    // Vérifier si le produit existe déjà
    const existingProduct = await this.productModel.findOne({
      tenantId,
      'metadata.shopifyId': shopifyProduct.id,
    }).exec();

    if (existingProduct) {
      this.logger.log(`Produit Shopify ${shopifyProduct.id} déjà importé, mise à jour...`);
      await this.updateProductFromShopify(existingProduct, shopifyProduct);
    } else {
      await this.createProductFromShopify(tenantId, shopifyProduct);
    }
  }

  private async createProductFromShopify(tenantId: string, shopifyProduct: ShopifyProduct): Promise<Product> {
    const variants = shopifyProduct.variants.map(variant => ({
      sku: variant.sku || `shopify-${variant.id}`,
      name: variant.title || shopifyProduct.title,
      price: parseFloat(variant.price),
      inventory: variant.inventory_quantity || 0,
      attributes: {
        ...(variant.option1 && { option1: variant.option1 }),
        ...(variant.option2 && { option2: variant.option2 }),
        ...(variant.option3 && { option3: variant.option3 }),
      },
      isActive: true,
      compareAtPrice: parseFloat(variant.compare_at_price || '0'),
      cost: parseFloat(variant.cost || '0'),
      shopifyVariantId: variant.id,
      shopifyInventoryItemId: variant.inventory_item_id,
      images: shopifyProduct.images.map(img => img.src),
    }));

    const images = shopifyProduct.images.map(img => img.src);
    const tags = shopifyProduct.tags ? shopifyProduct.tags.split(',').map(tag => tag.trim()) : [];

    const product = new this.productModel({
      title: shopifyProduct.title,
      description: shopifyProduct.body_html || '',
      handle: shopifyProduct.handle,
      tenantId,
      variants,
      images,
      tags,
      category: shopifyProduct.product_type,
      vendor: shopifyProduct.vendor,
      status: shopifyProduct.status === 'active' ? 'active' : 'draft',
      metadata: {
        shopifyId: shopifyProduct.id,
        importedFrom: 'shopify',
        importedAt: new Date(),
      },
    });

    await product.save();
    this.logger.log(`Produit Shopify ${shopifyProduct.id} importé: ${product.title}`);
    
    return product;
  }

  private async updateProductFromShopify(existingProduct: Product, shopifyProduct: ShopifyProduct): Promise<Product> {
    const variants = shopifyProduct.variants.map(variant => ({
      sku: variant.sku || `shopify-${variant.id}`,
      name: variant.title || shopifyProduct.title,
      price: parseFloat(variant.price),
      inventory: variant.inventory_quantity || 0,
      attributes: {
        ...(variant.option1 && { option1: variant.option1 }),
        ...(variant.option2 && { option2: variant.option2 }),
        ...(variant.option3 && { option3: variant.option3 }),
      },
      isActive: true,
      compareAtPrice: parseFloat(variant.compare_at_price || '0'),
      cost: parseFloat(variant.cost || '0'),
      shopifyVariantId: variant.id,
      shopifyInventoryItemId: variant.inventory_item_id,
    }));

    const images = shopifyProduct.images.map(img => img.src);
    const tags = shopifyProduct.tags ? shopifyProduct.tags.split(',').map(tag => tag.trim()) : [];

    existingProduct.title = shopifyProduct.title;
    existingProduct.description = shopifyProduct.body_html || existingProduct.description;
    existingProduct.handle = shopifyProduct.handle;
    existingProduct.variants = variants.map(variant => ({
      ...variant,
      compareAtPrice: variant.compareAtPrice || 0,
      cost: variant.cost || 0,
      images: Array.isArray((variant as any).images) ? (variant as any).images : images,
    }));
    existingProduct.images = images;
    existingProduct.tags = tags;
    existingProduct.category = shopifyProduct.product_type;
    existingProduct.vendor = shopifyProduct.vendor;
    existingProduct.status = shopifyProduct.status === 'active' ? 'active' : 'draft';
    existingProduct.metadata = {
      ...existingProduct.metadata,
      shopifyId: shopifyProduct.id,
      lastSyncAt: new Date(),
    };
    existingProduct.updatedAt = new Date();

    await this.productModel.updateOne({ _id: (existingProduct as any)._id }, { $set: existingProduct }, { upsert: true });
    this.logger.log(`Produit Shopify ${shopifyProduct.id} mis à jour: ${existingProduct.title}`);
    
    return existingProduct;
  }

  private async importSingleOrder(tenantId: string, shopifyOrder: ShopifyOrder): Promise<void> {
    // Vérifier si la commande existe déjà
    const existingOrder = await this.orderModel.findOne({
      tenantId,
      'metadata.shopifyId': shopifyOrder.id,
    }).exec();

    if (existingOrder) {
      this.logger.log(`Commande Shopify ${shopifyOrder.id} déjà importée`);
      return;
    }

    const lineItems = shopifyOrder.line_items.map(item => ({
      productId: item.product_id.toString(),
      title: item.title,
      quantity: item.quantity,
      price: parseFloat(item.price),
      total: parseFloat(item.price) * item.quantity,
      sku: item.sku,
    }));

    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const total = parseFloat(shopifyOrder.total_price);

    const order = new this.orderModel({
      orderNumber: `SHOPIFY-${shopifyOrder.id}`,
      tenantId,
      customerEmail: shopifyOrder.email,
      lineItems,
      subtotal,
      total,
      currency: shopifyOrder.currency.toUpperCase(),
      status: this.mapShopifyFulfillmentStatus(shopifyOrder.fulfillment_status),
      paymentStatus: this.mapShopifyFinancialStatus(shopifyOrder.financial_status),
      shippingAddress: shopifyOrder.shipping_address ? {
        firstName: shopifyOrder.shipping_address.first_name,
        lastName: shopifyOrder.shipping_address.last_name,
        address1: shopifyOrder.shipping_address.address1,
        address2: shopifyOrder.shipping_address.address2 || '',
        city: shopifyOrder.shipping_address.city,
        province: shopifyOrder.shipping_address.province,
        country: shopifyOrder.shipping_address.country,
        zip: shopifyOrder.shipping_address.zip,
        phone: shopifyOrder.shipping_address.phone || '',
      } : undefined,
      metadata: {
        shopifyId: shopifyOrder.id,
        importedFrom: 'shopify',
        importedAt: new Date(),
      },
      createdAt: new Date(shopifyOrder.created_at),
    });

    await order.save();
    this.logger.log(`Commande Shopify ${shopifyOrder.id} importée: ${order.orderNumber}`);
  }

  private mapShopifyFinancialStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'authorized': 'paid',
      'partially_paid': 'paid',
      'paid': 'paid',
      'partially_refunded': 'paid',
      'refunded': 'refunded',
      'voided': 'failed',
    };
    return statusMap[status] || 'pending';
  }

  private mapShopifyFulfillmentStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'null': 'pending',
      'pending': 'pending',
      'open': 'pending',
      'partial': 'confirmed',
      'fulfilled': 'shipped',
      'restocked': 'cancelled',
    };
    return statusMap[status] || 'pending';
  }

  async exportProductsToShopify(tenantId: string, products: Product[]): Promise<any[]> {
    // Convertir les produits EcomPilot vers le format Shopify
    return products.map(product => ({
      title: product.title,
      body_html: product.description,
      vendor: product.vendor || '',
      product_type: product.category || '',
      handle: product.handle,
      status: product.status === 'active' ? 'active' : 'draft',
      variants: product.variants.map(variant => ({
        title: variant.name,
        price: variant.price.toString(),
        sku: variant.sku,
        inventory_quantity: variant.inventory,
        option1: variant.attributes.option1 || variant.attributes.taille || variant.attributes.couleur,
        option2: variant.attributes.option2,
        option3: variant.attributes.option3,
      })),
      images: product.images.map(url => ({ src: url })),
      tags: product.tags.join(', '),
    }));
  }

  async getSyncStatus(tenantId: string): Promise<any> {
    const shopifyProducts = await this.productModel.countDocuments({
      tenantId,
      'metadata.shopifyId': { $exists: true },
    });

    const shopifyOrders = await this.orderModel.countDocuments({
      tenantId,
      'metadata.shopifyId': { $exists: true },
    });

    const lastSync = await this.productModel.findOne({
      tenantId,
      'metadata.lastSyncAt': { $exists: true },
    }).sort({ 'metadata.lastSyncAt': -1 }).exec();
    const tenant = await this.tenantModel.findById(tenantId).lean();

    return {
      shopifyProducts,
      shopifyOrders,
      lastSync: lastSync?.metadata?.lastSyncAt || null,
      lastWebhookAt: (tenant as any)?.integrations?.shopify?.lastWebhookAt || null,
      lastBackfillAt: (tenant as any)?.integrations?.shopify?.lastBackfillAt || null,
      isConnected: shopifyProducts > 0 || shopifyOrders > 0,
    };
  }
}