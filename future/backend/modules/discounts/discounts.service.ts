import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DiscountCode, DiscountCodeDocument, DiscountType } from './schemas/discount-code.schema';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectModel(DiscountCode.name) private discountModel: Model<DiscountCodeDocument>,
  ) {}

  async getDiscounts(tenantId: string) {
    const discounts = await this.discountModel.find({ tenantId }).sort({ createdAt: -1 }).lean();
    return { discounts, count: discounts.length };
  }

  async createDiscount(tenantId: string, data: any) {
    const discount = new this.discountModel({ tenantId, ...data });
    return discount.save();
  }

  async validateCode(tenantId: string, code: string, orderData: any) {
    const discount = await this.discountModel.findOne({ 
      tenantId, 
      code: code.toUpperCase(), 
      isActive: true 
    });

    if (!discount) throw new BadRequestException('Code promo invalide');

    // Check dates
    const now = new Date();
    if (discount.startDate && discount.startDate > now) {
      throw new BadRequestException('Code pas encore actif');
    }
    if (discount.endDate && discount.endDate < now) {
      throw new BadRequestException('Code expiré');
    }

    // Check usage limit
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      throw new BadRequestException('Code épuisé');
    }

    // Check min order
    if (discount.minOrderAmount && orderData.amount < discount.minOrderAmount) {
      throw new BadRequestException(`Montant minimum: ${discount.minOrderAmount}`);
    }

    // Calculate discount
    let discountAmount = 0;
    if (discount.type === DiscountType.PERCENTAGE) {
      discountAmount = (orderData.amount * discount.value) / 100;
      if (discount.maxDiscount) {
        discountAmount = Math.min(discountAmount, discount.maxDiscount);
      }
    } else if (discount.type === DiscountType.FIXED) {
      discountAmount = discount.value;
    }

    return {
      valid: true,
      discount: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount,
        finalAmount: orderData.amount - discountAmount,
      },
    };
  }

  async deleteDiscount(tenantId: string, id: string) {
    return this.discountModel.findOneAndDelete({ _id: id, tenantId });
  }
}
