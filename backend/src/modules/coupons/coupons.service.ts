import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async create(tenantId: string, createCouponDto: CreateCouponDto): Promise<Coupon> {
    // Vérifier si le code existe déjà
    const existing = await this.couponModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
      code: createCouponDto.code.toUpperCase(),
    });

    if (existing) {
      throw new BadRequestException('A coupon with this code already exists');
    }

    // Valider le type de réduction
    if (createCouponDto.discountType === 'percentage' && createCouponDto.discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    const coupon = new this.couponModel({
      ...createCouponDto,
      code: createCouponDto.code.toUpperCase(),
      tenantId: new Types.ObjectId(tenantId),
      usedCount: 0,
      usageHistory: [],
    });

    return coupon.save();
  }

  async findAll(
    tenantId: string,
    options?: {
      page?: number;
      limit?: number;
      status?: string;
    },
  ): Promise<{ coupons: Coupon[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = { tenantId: new Types.ObjectId(tenantId) };

    if (options?.status) {
      filter.status = options.status;
    }

    const [coupons, total] = await Promise.all([
      this.couponModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.couponModel.countDocuments(filter).exec(),
    ]);

    return {
      coupons,
      total,
      page,
      limit,
    };
  }

  async findOne(tenantId: string, id: string): Promise<Coupon> {
    const coupon = await this.couponModel
      .findOne({
        _id: new Types.ObjectId(id),
        tenantId: new Types.ObjectId(tenantId),
      })
      .lean()
      .exec();

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async update(tenantId: string, id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    // Valider le type de réduction
    if (updateCouponDto.discountType === 'percentage' && updateCouponDto.discountValue && updateCouponDto.discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    const coupon = await this.couponModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          tenantId: new Types.ObjectId(tenantId),
        },
        { $set: updateCouponDto },
        { new: true },
      )
      .lean()
      .exec();

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async remove(tenantId: string, id: string): Promise<{ success: boolean; message: string }> {
    const result = await this.couponModel
      .deleteOne({
        _id: new Types.ObjectId(id),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Coupon not found');
    }

    return {
      success: true,
      message: 'Coupon deleted successfully',
    };
  }

  async validate(
    tenantId: string,
    validateCouponDto: ValidateCouponDto,
  ): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discountAmount?: number;
    message?: string;
  }> {
    const coupon = await this.couponModel
      .findOne({
        tenantId: new Types.ObjectId(tenantId),
        code: validateCouponDto.code.toUpperCase(),
      })
      .lean()
      .exec();

    if (!coupon) {
      return { valid: false, message: 'Coupon not found' };
    }

    // Vérifier le statut
    if (coupon.status !== 'active') {
      return { valid: false, message: 'Coupon is not active' };
    }

    // Vérifier la date de validité
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return { valid: false, message: 'Coupon is not yet valid' };
    }
    if (coupon.validUntil && now > coupon.validUntil) {
      return { valid: false, message: 'Coupon has expired' };
    }

    // Vérifier la limite d'utilisation globale
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    // Vérifier la limite par client
    if (validateCouponDto.customerEmail && coupon.usageLimitPerCustomer) {
      const customerUsage = coupon.usageHistory.filter(
        (usage) => usage.customerEmail === validateCouponDto.customerEmail
      ).length;

      if (customerUsage >= coupon.usageLimitPerCustomer) {
        return { valid: false, message: 'Customer usage limit reached' };
      }
    }

    // Vérifier le montant minimum d'achat
    if (coupon.minPurchaseAmount && validateCouponDto.orderAmount < coupon.minPurchaseAmount) {
      return {
        valid: false,
        message: `Minimum purchase amount of ${coupon.minPurchaseAmount} required`,
      };
    }

    // Vérifier les produits applicables
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const hasApplicableProduct = validateCouponDto.productIds?.some((id) =>
        coupon.applicableProducts!.includes(id)
      );

      if (!hasApplicableProduct) {
        return { valid: false, message: 'Coupon not applicable to these products' };
      }
    }

    // Calculer la réduction
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (validateCouponDto.orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // S'assurer que la réduction ne dépasse pas le montant de la commande
    discountAmount = Math.min(discountAmount, validateCouponDto.orderAmount);

    return {
      valid: true,
      coupon,
      discountAmount,
      message: 'Coupon is valid',
    };
  }

  async applyCoupon(
    tenantId: string,
    code: string,
    orderId: string,
    customerEmail: string,
    discountAmount: number,
  ): Promise<Coupon> {
    const coupon = await this.couponModel.findOneAndUpdate(
      {
        tenantId: new Types.ObjectId(tenantId),
        code: code.toUpperCase(),
      },
      {
        $inc: { usedCount: 1 },
        $push: {
          usageHistory: {
            orderId,
            customerEmail,
            discountAmount,
            usedAt: new Date(),
          },
        },
      },
      { new: true },
    );

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async getStats(tenantId: string): Promise<{
    totalCoupons: number;
    activeCoupons: number;
    totalUsage: number;
    totalDiscountGiven: number;
    topCoupons: Array<{
      code: string;
      description: string;
      usedCount: number;
      totalDiscount: number;
    }>;
  }> {
    const coupons = await this.couponModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .lean()
      .exec();

    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter((c) => c.status === 'active').length;
    const totalUsage = coupons.reduce((sum, c) => sum + c.usedCount, 0);
    const totalDiscountGiven = coupons.reduce(
      (sum, c) => sum + c.usageHistory.reduce((s, h) => s + h.discountAmount, 0),
      0
    );

    const topCoupons = coupons
      .map((c) => ({
        code: c.code,
        description: c.description,
        usedCount: c.usedCount,
        totalDiscount: c.usageHistory.reduce((s, h) => s + h.discountAmount, 0),
      }))
      .sort((a, b) => b.usedCount - a.usedCount)
      .slice(0, 10);

    return {
      totalCoupons,
      activeCoupons,
      totalUsage,
      totalDiscountGiven,
      topCoupons,
    };
  }
}
