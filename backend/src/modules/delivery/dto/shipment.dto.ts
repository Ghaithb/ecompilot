import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DeliveryProviderId } from '../enums/delivery-provider.enum';

/** POST /shipments/create — création via couche d'intégration */
export class CreateShipmentDto {
  @IsEnum(DeliveryProviderId)
  provider: DeliveryProviderId;

  @IsString()
  orderId: string;

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
