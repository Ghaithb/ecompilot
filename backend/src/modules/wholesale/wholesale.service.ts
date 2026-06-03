import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Supplier, SupplierDocument } from './schemas/supplier.schema';
import { WholesaleProduct, WholesaleProductDocument } from './schemas/wholesale-product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { QuoteRequest, QuoteRequestDocument } from './schemas/quote-request.schema';

@Injectable()
export class WholesaleService {
  private readonly logger = new Logger(WholesaleService.name);

  constructor(
    @InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
    @InjectModel(WholesaleProduct.name) private productModel: Model<WholesaleProductDocument>,
    @InjectModel(QuoteRequest.name) private quoteModel: Model<QuoteRequestDocument>,
    @InjectModel(Product.name) private merchantProductModel: Model<ProductDocument>,
  ) {}

  async submitRFQ(tenantId: string, payload: {
    supplierIds: string[];
    productTitle: string;
    quantity: number;
    notes?: string;
  }) {
    return this.quoteModel.create({
      tenantId: new Types.ObjectId(tenantId),
      supplierIds: payload.supplierIds.map(id => new Types.ObjectId(id)),
      productTitle: payload.productTitle,
      quantity: payload.quantity,
      notes: payload.notes,
      status: 'pending',
    });
  }

  async launchProduct(tenantId: string, wholesaleProductId: string) {
    const wp = await this.productModel.findById(wholesaleProductId).lean();
    if (!wp) throw new Error('Produit grossiste introuvable');

    // Créer un produit dans la boutique du marchand
    const handle = wp.title.toLowerCase().replace(/ /g, '-');
    
    return this.merchantProductModel.create({
      tenantId: new Types.ObjectId(tenantId),
      title: wp.title,
      description: wp.description || `Produit grossiste : ${wp.title}`,
      handle: `${handle}-${Date.now()}`,
      images: wp.image ? [wp.image] : [],
      status: 'draft',
      category: wp.category || 'Sourcing Direct',
      variants: [{
        sku: `WS-${Date.now()}`,
        name: 'Standard',
        price: wp.retailPriceEstimate,
        cost: wp.wholesalePrice,
        inventory: 0,
        isActive: true,
      }]
    });
  }

  async listSuppliers(filters: { category?: string; city?: string } = {}) {
    const query: any = { isActive: true };
    if (filters.category) query.category = filters.category;
    if (filters.city) query.city = filters.city;
    return this.supplierModel.find(query).sort({ rating: -1 }).lean();
  }

  async getSupplierDetails(id: string) {
    const supplier = await this.supplierModel.findById(id).lean();
    if (!supplier) return null;
    const products = await this.productModel.find({ supplierId: new Types.ObjectId(id) }).lean();
    return { ...supplier, products };
  }

  async listWholesaleProducts(filters: { category?: string } = {}) {
    const query: any = {};
    if (filters.category) query.category = filters.category;
    return this.productModel.find(query).populate('supplierId', 'name city isVerified').lean();
  }

  async findSuppliersByProductTitle(title: string) {
    // Recherche floue par titre dans les produits grossistes
    return this.productModel.find({
      title: { $regex: title, $options: 'i' }
    }).populate('supplierId').lean();
  }
}
