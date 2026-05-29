import { IsEmail, IsString, IsOptional, IsBoolean, IsEnum, IsObject } from 'class-validator';

export class CreateCustomerDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsObject()
  @IsOptional()
  defaultAddress?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string;
  };

  @IsBoolean()
  @IsOptional()
  acceptsMarketing?: boolean;

  @IsString()
  @IsOptional()
  note?: string;

  @IsOptional()
  tags?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateCustomerDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsObject()
  @IsOptional()
  defaultAddress?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string;
  };

  @IsOptional()
  addresses?: Array<{
    id?: string;
    label?: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string;
    isDefault?: boolean;
  }>;

  @IsOptional()
  tags?: string[];

  @IsEnum(['active', 'inactive', 'blocked'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'blocked';

  @IsBoolean()
  @IsOptional()
  acceptsMarketing?: boolean;

  @IsString()
  @IsOptional()
  note?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
