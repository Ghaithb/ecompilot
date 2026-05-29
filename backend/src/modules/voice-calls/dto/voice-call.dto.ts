import { IsString, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CallPurpose, CallStatus } from '../schemas/voice-call.schema';

class CartProductDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;
}

class CartDataDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartProductDto)
  products: CartProductDto[];

  @IsNumber()
  totalAmount: number;
}

export class CreateAbandonedCartCallDto {
  @IsString()
  customerPhone: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsString()
  abandonedCartId: string;

  @ValidateNested()
  @Type(() => CartDataDto)
  cartData: CartDataDto;

  @IsOptional()
  @IsString()
  discountCode?: string;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsDateString()
  scheduledFor?: Date;
}

export class CreateVoiceCallDto {
  @IsString()
  customerPhone: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsEnum(CallPurpose)
  purpose: CallPurpose;

  @IsOptional()
  @IsString()
  abandonedCartId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  callData?: any;

  @IsOptional()
  @IsDateString()
  scheduledFor?: Date;
}

export class GetCallsQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsEnum(CallStatus)
  status?: CallStatus;

  @IsOptional()
  @IsEnum(CallPurpose)
  purpose?: CallPurpose;
}
