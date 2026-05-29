import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../products/schemas/product.schema';
import { Order } from '../orders/schemas/order.schema';
import { CsvUtility } from '../../common/utils/csv.utility';

@Injectable()
export class ImportService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly csvUtility: CsvUtility,
  ) {}

  // Valider les données produit
  private validateProductData(data: any): boolean {
    return !!(data.name && data.price);
  }

  // Valider les données commande
  private validateOrderData(data: any): boolean {
    return !!(data.orderNumber && data.totalAmount);
  }

  // Importer des produits
  async importProducts(tenantId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    let data: any[];

    try {
      // Parser selon le type de fichier
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        data = await this.csvUtility.parseFromBuffer(file.buffer);
      } else if (file.mimetype === 'application/json') {
        data = JSON.parse(file.buffer.toString());
      } else {
        throw new BadRequestException('Format de fichier non supporté. Utilisez CSV ou JSON.');
      }
    } catch (error) {
      throw new BadRequestException(`Erreur de parsing: ${error.message}`);
    }

    const results = {
      total: data.length,
      imported: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const [index, item] of data.entries()) {
      try {
        // Valider les données
        if (!this.validateProductData(item)) {
          results.failed++;
          results.errors.push({
            line: index + 1,
            error: 'Données invalides (nom et prix requis)',
            data: item,
          });
          continue;
        }

        // Préparer les données
        const productData = {
          tenantId,
          name: item.name,
          description: item.description || '',
          price: parseFloat(item.price) || 0,
          sku: item.sku || `SKU-${Date.now()}-${index}`,
          stock: parseInt(item.stock) || 0,
          category: item.category || 'Non catégorisé',
          tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [],
          imageUrl: item.imageUrl || '',
          isActive: item.isActive !== 'false',
        };

        // Vérifier si le produit existe déjà (par SKU)
        const existing = await this.productModel.findOne({
          tenantId,
          sku: productData.sku,
        });

        if (existing) {
          // Mettre à jour
          await this.productModel.updateOne({ _id: existing._id }, productData);
        } else {
          // Créer
          await this.productModel.create(productData);
        }

        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          line: index + 1,
          error: error.message,
          data: item,
        });
      }
    }

    return results;
  }

  // Importer des commandes
  async importOrders(tenantId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    let data: any[];

    try {
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        data = await this.csvUtility.parseFromBuffer(file.buffer);
      } else if (file.mimetype === 'application/json') {
        data = JSON.parse(file.buffer.toString());
      } else {
        throw new BadRequestException('Format de fichier non supporté. Utilisez CSV ou JSON.');
      }
    } catch (error) {
      throw new BadRequestException(`Erreur de parsing: ${error.message}`);
    }

    const results = {
      total: data.length,
      imported: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const [index, item] of data.entries()) {
      try {
        // Valider les données
        if (!this.validateOrderData(item)) {
          results.failed++;
          results.errors.push({
            line: index + 1,
            error: 'Données invalides (numéro de commande et montant requis)',
            data: item,
          });
          continue;
        }

        // Préparer les données
        const orderData = {
          tenantId,
          orderNumber: item.orderNumber || `ORD-${Date.now()}-${index}`,
          customer: {
            name: item['customer.name'] || item.customerName || 'Client',
            email: item['customer.email'] || item.customerEmail || '',
            phone: item['customer.phone'] || item.customerPhone || '',
          },
          status: item.status || 'pending',
          totalAmount: parseFloat(item.totalAmount) || 0,
          paymentStatus: item.paymentStatus || 'pending',
          shippingAddress: {
            street: item['shippingAddress.street'] || item.street || '',
            city: item['shippingAddress.city'] || item.city || '',
            postalCode: item['shippingAddress.postalCode'] || item.postalCode || '',
            country: item['shippingAddress.country'] || item.country || '',
          },
          items: [],
        };

        // Vérifier si la commande existe déjà
        const existing = await this.orderModel.findOne({
          tenantId,
          orderNumber: orderData.orderNumber,
        });

        if (existing) {
          // Mettre à jour
          await this.orderModel.updateOne({ _id: existing._id }, orderData);
        } else {
          // Créer
          await this.orderModel.create(orderData);
        }

        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          line: index + 1,
          error: error.message,
          data: item,
        });
      }
    }

    return results;
  }

  // Obtenir un template CSV pour les produits
  getProductTemplate(): string {
    const headers = [
      'name',
      'description',
      'price',
      'sku',
      'stock',
      'category',
      'tags',
      'imageUrl',
      'isActive',
    ];

    const example = [
      'Produit Exemple',
      'Description du produit',
      '29.99',
      'SKU-001',
      '100',
      'Électronique',
      'nouveau,promo',
      'https://example.com/image.jpg',
      'true',
    ];

    return `${headers.join(',')}\n${example.join(',')}`;
  }

  // Obtenir un template CSV pour les commandes
  getOrderTemplate(): string {
    const headers = [
      'orderNumber',
      'customer.name',
      'customer.email',
      'customer.phone',
      'status',
      'totalAmount',
      'paymentStatus',
      'shippingAddress.street',
      'shippingAddress.city',
      'shippingAddress.postalCode',
      'shippingAddress.country',
    ];

    const example = [
      'ORD-001',
      'Jean Dupont',
      'jean@example.com',
      '0612345678',
      'pending',
      '99.99',
      'paid',
      '123 Rue Example',
      'Paris',
      '75001',
      'France',
    ];

    return `${headers.join(',')}\n${example.join(',')}`;
  }
}
