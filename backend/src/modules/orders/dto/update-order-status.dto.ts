import { IsEnum, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { ReturnReason } from '../../../common/enums/return-reason.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(ReturnReason)
  refusalReason?: ReturnReason;

  @IsOptional()
  @IsNumber()
  amountCollected?: number;

  @IsOptional()
  @IsString()
  deliveryProofUrl?: string;
}

export class AssignDriverDto {
  @IsString()
  driverId: string;
}
