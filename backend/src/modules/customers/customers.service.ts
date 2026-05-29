import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(tenantId: string, createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Vérifier si le client existe déjà
    const existing = await this.customerModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
      email: createCustomerDto.email,
    });

    if (existing) {
      throw new ConflictException('A customer with this email already exists');
    }

    const customer = new this.customerModel({
      ...createCustomerDto,
      tenantId: new Types.ObjectId(tenantId),
      stats: {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
      },
    });

    return customer.save();
  }

  async findAll(
    tenantId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      tags?: string[];
    },
  ): Promise<{ customers: Customer[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = { tenantId: new Types.ObjectId(tenantId) };

    if (options?.search) {
      filter.$or = [
        { email: { $regex: options.search, $options: 'i' } },
        { firstName: { $regex: options.search, $options: 'i' } },
        { lastName: { $regex: options.search, $options: 'i' } },
        { company: { $regex: options.search, $options: 'i' } },
      ];
    }

    if (options?.status) {
      filter.status = options.status;
    }

    if (options?.tags && options.tags.length > 0) {
      filter.tags = { $in: options.tags };
    }

    const [customers, total] = await Promise.all([
      this.customerModel
        .find(filter)
        .sort({ 'stats.lastOrderAt': -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.customerModel.countDocuments(filter).exec(),
    ]);

    return {
      customers,
      total,
      page,
      limit,
    };
  }

  async findOne(tenantId: string, id: string): Promise<Customer> {
    const customer = await this.customerModel
      .findOne({
        _id: new Types.ObjectId(id),
        tenantId: new Types.ObjectId(tenantId),
      })
      .lean()
      .exec();

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(tenantId: string, id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    // Si l'email est modifié, vérifier qu'il n'existe pas déjà
    if (updateCustomerDto.email) {
      const existing = await this.customerModel.findOne({
        tenantId: new Types.ObjectId(tenantId),
        email: updateCustomerDto.email,
        _id: { $ne: new Types.ObjectId(id) },
      });

      if (existing) {
        throw new ConflictException('A customer with this email already exists');
      }
    }

    const customer = await this.customerModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          tenantId: new Types.ObjectId(tenantId),
        },
        { $set: updateCustomerDto },
        { new: true },
      )
      .lean()
      .exec();

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async remove(tenantId: string, id: string): Promise<{ success: boolean; message: string }> {
    const result = await this.customerModel
      .deleteOne({
        _id: new Types.ObjectId(id),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Customer not found');
    }

    return {
      success: true,
      message: 'Customer deleted successfully',
    };
  }

  async getCustomerOrders(
    tenantId: string,
    customerId: string,
    options?: { page?: number; limit?: number },
  ): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
    // Récupérer le client pour avoir son email
    const customer = await this.findOne(tenantId, customerId);

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const filter = {
      tenantId: new Types.ObjectId(tenantId),
      customerEmail: customer.email,
    };

    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);

    return {
      orders,
      total,
      page,
      limit,
    };
  }

  async updateCustomerStats(tenantId: string, customerEmail: string): Promise<void> {
    const orders = await this.orderModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        customerEmail,
        status: { $in: ['confirmed', 'shipped', 'delivered'] },
      })
      .lean()
      .exec();

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const firstOrder = orders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
    const lastOrder = orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    await this.customerModel
      .updateOne(
        {
          tenantId: new Types.ObjectId(tenantId),
          email: customerEmail,
        },
        {
          $set: {
            'stats.totalOrders': totalOrders,
            'stats.totalSpent': totalSpent,
            'stats.averageOrderValue': averageOrderValue,
            'stats.firstOrderAt': firstOrder?.createdAt,
            'stats.lastOrderAt': lastOrder?.createdAt,
          },
        },
      )
      .exec();
  }

  async findOrCreateByEmail(tenantId: string, email: string, data?: Partial<CreateCustomerDto>): Promise<Customer> {
    let customer = await this.customerModel
      .findOne({
        tenantId: new Types.ObjectId(tenantId),
        email,
      })
      .exec();

    if (!customer) {
      customer = new this.customerModel({
        tenantId: new Types.ObjectId(tenantId),
        email,
        firstName: data?.firstName || email.split('@')[0],
        lastName: data?.lastName || '',
        phone: data?.phone,
        company: data?.company,
        defaultAddress: data?.defaultAddress,
        acceptsMarketing: data?.acceptsMarketing ?? false,
        stats: { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 },
        codTrust: { score: 70, level: 'normal', deliveryRefusals: 0, cancelledOrders: 0, verifiedOrders: 0 },
      });
      await customer.save();
    }

    return customer;
  }

  async findOrCreateByPhone(
    tenantId: string,
    phone: string,
    data?: { firstName?: string; lastName?: string; email?: string; defaultAddress?: Customer['defaultAddress'] },
  ): Promise<Customer> {
    let customer = await this.customerModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
      phone,
    }).exec();

    if (!customer) {
      const email = data?.email || `${phone.replace('+', '')}@guest.ecompilot.local`;
      customer = new this.customerModel({
        tenantId: new Types.ObjectId(tenantId),
        email,
        firstName: data?.firstName || 'Client',
        lastName: data?.lastName || '',
        phone,
        defaultAddress: data?.defaultAddress,
        acceptsMarketing: false,
        stats: { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 },
        codTrust: { score: 70, level: 'normal', deliveryRefusals: 0, cancelledOrders: 0, verifiedOrders: 0 },
      });
      await customer.save();
    }

    return customer;
  }

  async getStats(tenantId: string): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    newThisMonth: number;
    topCustomers: Array<{
      id: string;
      name: string;
      email: string;
      totalSpent: number;
      totalOrders: number;
    }>;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalCustomers, activeCustomers, newThisMonth, topCustomers] = await Promise.all([
      this.customerModel.countDocuments({ tenantId: new Types.ObjectId(tenantId) }).exec(),
      this.customerModel.countDocuments({ tenantId: new Types.ObjectId(tenantId), status: 'active' }).exec(),
      this.customerModel.countDocuments({ tenantId: new Types.ObjectId(tenantId), createdAt: { $gte: startOfMonth } }).exec(),
      this.customerModel
        .find({ tenantId: new Types.ObjectId(tenantId) })
        .sort({ 'stats.totalSpent': -1 })
        .limit(10)
        .select('_id firstName lastName email stats.totalSpent stats.totalOrders')
        .lean()
        .exec(),
    ]);

    return {
      totalCustomers,
      activeCustomers,
      newThisMonth,
      topCustomers: topCustomers.map((c: any) => ({
        id: c._id.toString(),
        name: `${c.firstName} ${c.lastName}`.trim(),
        email: c.email,
        totalSpent: c.stats?.totalSpent || 0,
        totalOrders: c.stats?.totalOrders || 0,
      })),
    };
  }
}
