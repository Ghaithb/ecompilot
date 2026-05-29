import {
    IsString,
    IsNumber,
    IsOptional,
    IsDateString,
    IsEmail,
    IsEnum,
    IsArray,
    ValidateNested,
    IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuoteStatus, InvoiceStatus } from '../schemas/sales.schema';

export class LineItemDto {
    @IsString()
    description: string;

    @IsNumber()
    quantity: number;

    @IsNumber()
    unitPrice: number;

    @IsOptional()
    @IsNumber()
    taxRate?: number;

    @IsOptional()
    @IsNumber()
    discount?: number;

    @IsOptional()
    @IsString()
    unit?: string;
}

export class ClientInfoDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    postalCode?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    taxId?: string;
}

export class CreateQuoteDto {
    @ValidateNested()
    @Type(() => ClientInfoDto)
    client: ClientInfoDto;

    @IsOptional()
    @IsMongoId()
    customerId?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LineItemDto)
    lineItems: LineItemDto[];

    @IsDateString()
    issueDate: string;

    @IsDateString()
    validUntil: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    termsAndConditions?: string;
}

export class UpdateQuoteDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => ClientInfoDto)
    client?: ClientInfoDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LineItemDto)
    lineItems?: LineItemDto[];

    @IsOptional()
    @IsDateString()
    validUntil?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsEnum(QuoteStatus)
    status?: QuoteStatus;
}

export class CreateInvoiceDto {
    @ValidateNested()
    @Type(() => ClientInfoDto)
    client: ClientInfoDto;

    @IsOptional()
    @IsMongoId()
    customerId?: string;

    @IsOptional()
    @IsMongoId()
    fromQuoteId?: string;

    @IsOptional()
    @IsMongoId()
    fromOrderId?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LineItemDto)
    lineItems: LineItemDto[];

    @IsDateString()
    issueDate: string;

    @IsDateString()
    dueDate: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    termsAndConditions?: string;
}

export class UpdateInvoiceDto {
    @IsOptional()
    @IsEnum(InvoiceStatus)
    status?: InvoiceStatus;

    @IsOptional()
    @IsNumber()
    amountPaid?: number;

    @IsOptional()
    @IsString()
    paymentMethod?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class RecordPaymentDto {
    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    paymentMethod?: string;

    @IsOptional()
    @IsDateString()
    paidAt?: string;
}
