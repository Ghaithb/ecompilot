import { IsString, IsEnum, IsNumber, IsOptional, IsDate, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsString()
  description: string;

  @IsEnum(['percentage', 'fixed'])
  discountType: 'percentage' | 'fixed';

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validFrom?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validUntil?: Date;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minPurchaseAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimit?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  usageLimitPerCustomer?: number;

  @IsArray()
  @IsOptional()
  applicableProducts?: string[];

  @IsArray()
  @IsOptional()
  applicableCategories?: string[];

  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['percentage', 'fixed'])
  @IsOptional()
  discountType?: 'percentage' | 'fixed';

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountValue?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validFrom?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validUntil?: Date;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minPurchaseAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimit?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  usageLimitPerCustomer?: number;

  @IsArray()
  @IsOptional()
  applicableProducts?: string[];

  @IsArray()
  @IsOptional()
  applicableCategories?: string[];

  @IsEnum(['active', 'inactive', 'expired'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'expired';

  @IsOptional()
  metadata?: Record<string, any>;
}

export class ValidateCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  orderAmount: number;

  @IsString()
  @IsOptional()
  customerEmail?: string;

  @IsArray()
  @IsOptional()
  productIds?: string[];
}
