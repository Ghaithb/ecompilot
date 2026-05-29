import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../products/schemas/product.schema';
import { Order } from '../orders/schemas/order.schema';
import { CsvUtility } from '../../common/utils/csv.utility';

@Injectable()
export class ExportService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly csvUtility: CsvUtility,
  ) {}

  // Exporter les produits
  async exportProducts(tenantId: string, format: 'csv' | 'json' = 'csv') {
    const products = await this.productModel
      .find({ tenantId })
      .select('-__v -tenantId')
      .lean()
      .exec();

    if (format === 'json') {
      return {
        data: products,
        count: products.length,
        format: 'json',
      };
    }

    // Format CSV
    const headers = [
      '_id',
      'name',
      'description',
      'price',
      'sku',
      'stock',
      'category',
      'tags',
      'imageUrl',
      'isActive',
      'createdAt',
      'updatedAt',
    ];

    const csv = this.csvUtility.convertToCSV(products, headers);
    
    return {
      data: csv,
      count: products.length,
      format: 'csv',
      filename: this.csvUtility.generateFilename('products'),
    };
  }

  // Exporter les commandes
  async exportOrders(tenantId: string, format: 'csv' | 'json' = 'csv') {
    const orders = await this.orderModel
      .find({ tenantId })
      .select('-__v -tenantId')
      .lean()
      .exec();

    if (format === 'json') {
      return {
        data: orders,
        count: orders.length,
        format: 'json',
      };
    }

    // Format CSV
    const headers = [
      '_id',
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
      'createdAt',
      'updatedAt',
    ];

    const csv = this.csvUtility.convertToCSV(orders, headers);
    
    return {
      data: csv,
      count: orders.length,
      format: 'csv',
      filename: this.csvUtility.generateFilename('orders'),
    };
  }

  // Exporter les clients (dédupliqués depuis les commandes)
  async exportCustomers(tenantId: string, format: 'csv' | 'json' = 'csv') {
    const orders = await this.orderModel
      .find({ tenantId })
      .select('customer')
      .lean()
      .exec();

    // Dédupliquer les clients par email
    const customersMap = new Map();
    orders.forEach((order) => {
      if (order.customerEmail) {
        customersMap.set(order.customerEmail, {
          email: order.customerEmail,
          name: (order as any).customerName || order.customerEmail,
        });
      }
    });

    const customers = Array.from(customersMap.values());

    if (format === 'json') {
      return {
        data: customers,
        count: customers.length,
        format: 'json',
      };
    }

    // Format CSV
    const headers = ['name', 'email', 'phone', 'address.street', 'address.city', 'address.postalCode', 'address.country'];
    const csv = this.csvUtility.convertToCSV(customers, headers);
    
    return {
      data: csv,
      count: customers.length,
      format: 'csv',
      filename: this.csvUtility.generateFilename('customers'),
    };
  }

  // Statistiques d'export
  async getExportStats(tenantId: string) {
    const [productsCount, ordersCount] = await Promise.all([
      this.productModel.countDocuments({ tenantId }),
      this.orderModel.countDocuments({ tenantId }),
    ]);

    return {
      products: productsCount,
      orders: ordersCount,
      lastExport: new Date(),
    };
  }
}
