import { IsString, IsEmail, IsNotEmpty, IsArray, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  governorate?: string;

  @IsString()
  @IsOptional()
  delegation?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;
}

// DTO pour un item de commande
export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  image?: string;
}

// DTO pour créer une commande depuis le site public
export class CreatePublicOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customer: CustomerInfoDto;

  @IsNumber()
  @Min(0)
  total: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string; // 'cod', 'stripe', etc.

  @IsString()
  @IsOptional()
  currency?: string;
}

export class SaveAbandonedCartDto {
  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsString()
  @IsOptional()
  customerEmail?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  @Min(0)
  total: number;
}

// DTO pour message de contact
export class ContactMessageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  subject?: string;
}

// DTO pour réservation
export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  date: string; // Format: YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  time: string; // Format: HH:MM

  @IsNumber()
  @Min(1)
  guests: number;

  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customer: CustomerInfoDto;

  @IsString()
  @IsOptional()
  notes?: string;
}

// DTO pour inscription newsletter
export class NewsletterSubscribeDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;
}
