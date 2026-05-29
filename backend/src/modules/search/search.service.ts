import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../products/schemas/product.schema';
import { Order } from '../orders/schemas/order.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  async globalSearch(tenantId: string, query: string, type?: string) {
    const searchRegex = new RegExp(query, 'i');
    const results: any = {};

    // Recherche dans les produits
    if (!type || type === 'products') {
      results.products = await this.productModel
        .find({
          tenantId,
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { sku: searchRegex },
            { tags: searchRegex },
          ],
        })
        .limit(10)
        .select('name description price sku imageUrl')
        .exec();
    }

    // Recherche dans les commandes
    if (!type || type === 'orders') {
      results.orders = await this.orderModel
        .find({
          tenantId,
          $or: [
            { orderNumber: searchRegex },
            { 'customer.email': searchRegex },
            { 'customer.name': searchRegex },
            { status: searchRegex },
          ],
        })
        .limit(10)
        .select('orderNumber customer status totalAmount createdAt')
        .exec();
    }

    // Recherche dans les clients (via les commandes)
    if (!type || type === 'customers') {
      const customerOrders = await this.orderModel
        .find({
          tenantId,
          $or: [
            { 'customer.email': searchRegex },
            { 'customer.name': searchRegex },
            { 'customer.phone': searchRegex },
          ],
        })
        .limit(10)
        .select('customer')
        .exec();

      // Dédupliquer les clients
      const uniqueCustomers = new Map();
      customerOrders.forEach((order) => {
        if (order.customerEmail) {
          uniqueCustomers.set(order.customerEmail, {
            email: order.customerEmail,
            name: (order as any).customerName || order.customerEmail,
          });
        }
      });

      results.customers = Array.from(uniqueCustomers.values());
    }

    return {
      query,
      results,
      totalResults:
        (results.products?.length || 0) +
        (results.orders?.length || 0) +
        (results.customers?.length || 0),
    };
  }

  async searchProducts(tenantId: string, query: string) {
    const searchRegex = new RegExp(query, 'i');
    return this.productModel
      .find({
        tenantId,
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { sku: searchRegex },
          { tags: searchRegex },
        ],
      })
      .limit(20)
      .exec();
  }

  async searchOrders(tenantId: string, query: string) {
    const searchRegex = new RegExp(query, 'i');
    return this.orderModel
      .find({
        tenantId,
        $or: [
          { orderNumber: searchRegex },
          { 'customer.email': searchRegex },
          { 'customer.name': searchRegex },
        ],
      })
      .limit(20)
      .exec();
  }
}
