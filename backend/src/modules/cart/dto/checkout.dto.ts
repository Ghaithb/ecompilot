import { IsArray, IsEmail, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutAddressDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  address: string;

  @IsString()
  governorate: string;

  @IsOptional()
  @IsString()
  delegation?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class CheckoutQuoteDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CheckoutAddressDto)
  address?: CheckoutAddressDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number;
}

export class CheckoutSubmitDto {
  @ValidateNested()
  @Type(() => CheckoutAddressDto)
  address: CheckoutAddressDto;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  preferredProvider?: string;
}

export class CheckoutTrackStepDto {
  @IsNumber()
  @Min(0)
  step: number;

  @IsOptional()
  @IsString()
  deviceType?: 'mobile' | 'desktop' | 'unknown';

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CheckoutAddressDto)
  address?: CheckoutAddressDto;
}

export class PublicCartSyncDto {
  @IsString()
  sessionId: string;

  @IsArray()
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;
}

export class UpsellQueryDto {
  @IsString()
  productIds: string;
}
