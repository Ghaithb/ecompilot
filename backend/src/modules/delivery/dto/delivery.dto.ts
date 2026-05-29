import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DeliveryProviderId } from '../enums/delivery-provider.enum';

export class CreateDeliveryShipmentDto {
  @IsEnum(DeliveryProviderId)
  provider: DeliveryProviderId;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  localityId?: number;

  @IsOptional()
  @IsBoolean()
  async?: boolean;
}

export class SaveProviderCredentialDto {
  @IsEnum(DeliveryProviderId)
  provider: DeliveryProviderId;

  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  apiUrl?: string;
}
