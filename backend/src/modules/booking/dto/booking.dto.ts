import { IsString, IsNumber, IsOptional, IsDateString, IsEmail, IsEnum, IsMongoId } from 'class-validator';
import { BookingStatus } from '../schemas/booking.schema';

export class CreateBookingDto {
    @IsMongoId()
    serviceId: string;

    @IsOptional()
    @IsMongoId()
    staffId?: string;

    @IsOptional()
    @IsMongoId()
    customerId?: string;

    @IsOptional()
    @IsString()
    customerName?: string;

    @IsOptional()
    @IsEmail()
    customerEmail?: string;

    @IsOptional()
    @IsString()
    customerPhone?: string;

    @IsDateString()
    startTime: string;

    @IsOptional()
    @IsString()
    customerNotes?: string;
}

export class UpdateBookingDto {
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

    @IsOptional()
    @IsDateString()
    startTime?: string;

    @IsOptional()
    @IsMongoId()
    staffId?: string;

    @IsOptional()
    @IsString()
    internalNotes?: string;

    @IsOptional()
    @IsString()
    cancellationReason?: string;
}

export class GetAvailableSlotsDto {
    @IsMongoId()
    serviceId: string;

    @IsDateString()
    date: string;

    @IsOptional()
    @IsMongoId()
    staffId?: string;
}

export class CreateServiceDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    price: number;

    @IsOptional()
    @IsNumber()
    durationMinutes?: number;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsNumber()
    depositPercentage?: number;

    @IsOptional()
    @IsNumber()
    depositFixedAmount?: number;
}

export class UpdateServiceDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsNumber()
    durationMinutes?: number;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    isActive?: boolean;
}
