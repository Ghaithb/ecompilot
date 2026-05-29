import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

export interface StockAvailability {
  allAvailable: boolean;
  unavailableItems: Array<{
    productId: string;
    productTitle: string;
    variantId: string;
    requested: number;
    available: number;
  }>;
}

export interface LineItem {
  productId: string;
  variantId: string;
  quantity: number;
  title?: string;
}

@Injectable()
export class ProductStockService {
  private readonly logger = new Logger(ProductStockService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  private normalizeTenantId(tenantId: string) {
    return Types.ObjectId.isValid(tenantId) ? new Types.ObjectId(tenantId) : tenantId;
  }

  private findVariant(variants: any[], variantRef?: string) {
    if (!variants?.length) return undefined;
    if (!variantRef) return variants[0];
    return (
      variants.find(
        (v: any) => v._id?.toString() === variantRef || v.sku === variantRef,
      ) || (variants.length === 1 ? variants[0] : undefined)
    );
  }

  private async resolveVariantObjectId(
    tenantId: string,
    productId: string,
    variantRef: string,
  ): Promise<string> {
    const product = await this.productModel
      .findOne({ _id: productId, tenantId: this.normalizeTenantId(tenantId) })
      .lean();
    if (!product) {
      throw new BadRequestException(`Produit ${productId} introuvable`);
    }
    const variant = this.findVariant(product.variants, variantRef);
    if (!variant?._id) {
      throw new BadRequestException(`Variante ${variantRef} introuvable`);
    }
    return variant._id.toString();
  }

  /**
   * Vérifie la disponibilité du stock pour une liste de produits
   */
  async checkAvailability(
    tenantId: string,
    lineItems: LineItem[],
  ): Promise<StockAvailability> {
    const unavailableItems: StockAvailability['unavailableItems'] = [];
    const tenantObjectId = this.normalizeTenantId(tenantId);

    for (const item of lineItems) {
      const product = await this.productModel
        .findOne({
          _id: item.productId,
          tenantId: tenantObjectId,
        })
        .lean();

      if (!product) {
        unavailableItems.push({
          productId: item.productId,
          productTitle: item.title || 'Produit inconnu',
          variantId: item.variantId,
          requested: item.quantity,
          available: 0,
        });
        continue;
      }

      const variant = this.findVariant(product.variants, item.variantId);

      if (!variant || !variant.isActive) {
        unavailableItems.push({
          productId: item.productId,
          productTitle: product.title,
          variantId: item.variantId,
          requested: item.quantity,
          available: 0,
        });
        continue;
      }

      if (variant.inventory < item.quantity) {
        unavailableItems.push({
          productId: item.productId,
          productTitle: product.title,
          variantId: item.variantId,
          requested: item.quantity,
          available: variant.inventory,
        });
      }
    }

    return {
      allAvailable: unavailableItems.length === 0,
      unavailableItems,
    };
  }

  /**
   * Décrémente le stock d'une variante (opération atomique)
   * Utilisé lors de la création d'une commande
   */
  async decrementStock(
    tenantId: string,
    productId: string,
    variantId: string,
    quantity: number,
  ): Promise<boolean> {
    const resolvedVariantId = await this.resolveVariantObjectId(tenantId, productId, variantId);

    this.logger.log(
      `Décrément stock: Product ${productId}, Variant ${resolvedVariantId}, Qty ${quantity}`,
    );

    const result = await this.productModel.updateOne(
      {
        _id: productId,
        tenantId: this.normalizeTenantId(tenantId),
        'variants._id': resolvedVariantId,
        'variants.inventory': { $gte: quantity },
      },
      {
        $inc: { 'variants.$.inventory': -quantity },
      },
    );

    if (result.modifiedCount === 0) {
      this.logger.error(
        `❌ Échec décrément stock: Product ${productId}, Variant ${variantId} - Stock insuffisant`,
      );
      throw new BadRequestException(
        `Stock insuffisant pour le produit ${productId} (variante ${variantId})`,
      );
    }

    this.logger.log(`✅ Stock décrémenté avec succès: -${quantity} unités`);
    return true;
  }

  /**
   * Incrémente le stock d'une variante
   * Utilisé lors de l'annulation d'une commande
   */
  async incrementStock(
    tenantId: string,
    productId: string,
    variantId: string,
    quantity: number,
  ): Promise<void> {
    const resolvedVariantId = await this.resolveVariantObjectId(tenantId, productId, variantId);

    this.logger.log(
      `Incrément stock: Product ${productId}, Variant ${resolvedVariantId}, Qty ${quantity}`,
    );

    const result = await this.productModel.updateOne(
      {
        _id: productId,
        tenantId: this.normalizeTenantId(tenantId),
        'variants._id': resolvedVariantId,
      },
      {
        $inc: { 'variants.$.inventory': quantity },
      },
    );

    if (result.modifiedCount === 0) {
      this.logger.warn(
        `⚠️ Échec incrément stock: Product ${productId}, Variant ${variantId} - Produit/variante non trouvé`,
      );
      throw new BadRequestException(
        `Impossible de restaurer le stock pour ${productId} (variante ${variantId})`,
      );
    }

    this.logger.log(`✅ Stock restauré avec succès: +${quantity} unités`);
  }

  /**
   * Mise à jour en batch du stock pour plusieurs produits
   * Utilisé pour optimiser les performances lors de commandes multi-produits
   */
  async bulkUpdateStock(
    tenantId: string,
    lineItems: LineItem[],
    operation: 'decrement' | 'increment',
  ): Promise<void> {
    this.logger.log(
      `Bulk ${operation} stock: ${lineItems.length} items pour tenant ${tenantId}`,
    );

    for (const item of lineItems) {
      if (operation === 'decrement') {
        await this.decrementStock(tenantId, item.productId, item.variantId, item.quantity);
      } else {
        await this.incrementStock(tenantId, item.productId, item.variantId, item.quantity);
      }
    }

    this.logger.log(`✅ Bulk ${operation} terminé avec succès`);
  }

  /**
   * Récupère le stock actuel d'une variante
   */
  async getCurrentStock(
    tenantId: string,
    productId: string,
    variantId: string,
  ): Promise<number> {
    const product = await this.productModel
      .findOne({
        _id: productId,
        tenantId: this.normalizeTenantId(tenantId),
      })
      .lean();

    if (!product) {
      return 0;
    }

    const variant = this.findVariant(product.variants, variantId);
    return variant?.inventory || 0;
  }

  /**
   * Réserve temporairement du stock (pour panier, avant paiement)
   * Note: Nécessite un système de réservations temporaires avec TTL
   */
  async reserveStock(
    tenantId: string,
    lineItems: LineItem[],
    reservationId: string,
    ttlMinutes: number = 15,
  ): Promise<void> {
    // TODO: Implémenter système de réservations avec MongoDB TTL
    // Pour l'instant, simple décrément
    this.logger.log(
      `Réservation stock (${ttlMinutes}min): ${lineItems.length} items, ID ${reservationId}`,
    );
    
    await this.bulkUpdateStock(tenantId, lineItems, 'decrement');
  }

  /**
   * Libère une réservation de stock
   */
  async releaseReservation(
    tenantId: string,
    lineItems: LineItem[],
    reservationId: string,
  ): Promise<void> {
    this.logger.log(`Libération réservation stock: ID ${reservationId}`);
    await this.bulkUpdateStock(tenantId, lineItems, 'increment');
  }
}
