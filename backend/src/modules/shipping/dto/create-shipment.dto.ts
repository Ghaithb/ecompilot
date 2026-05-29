import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ShippingProviderId } from '../enums/shipping-provider.enum';

export class CreateShipmentDto {
  @IsEnum(ShippingProviderId)
  provider: ShippingProviderId;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsNumber()
  localityId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  weightKg?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CompareRatesDto {
  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  weightKg?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class TrackShipmentDto {
  @IsEnum(ShippingProviderId)
  provider: ShippingProviderId;
}
