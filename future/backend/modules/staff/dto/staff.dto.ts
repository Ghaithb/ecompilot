import {
    IsString,
    IsNumber,
    IsOptional,
    IsDateString,
    IsEmail,
    IsEnum,
    IsBoolean,
    IsArray,
    IsMongoId,
} from 'class-validator';
import { StaffRole, StaffStatus, ExpenseStatus } from '../schemas/staff.schema';

export class CreateStaffDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEnum(StaffRole)
    role?: StaffRole;

    @IsOptional()
    @IsString()
    position?: string;

    @IsOptional()
    @IsString()
    department?: string;

    @IsOptional()
    @IsDateString()
    hireDate?: string;

    @IsOptional()
    @IsNumber()
    hourlyRate?: number;

    @IsOptional()
    @IsNumber()
    monthlySalary?: number;

    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @IsOptional()
    @IsArray()
    permissions?: string[];
}

export class UpdateStaffDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEnum(StaffRole)
    role?: StaffRole;

    @IsOptional()
    @IsEnum(StaffStatus)
    status?: StaffStatus;

    @IsOptional()
    @IsString()
    position?: string;

    @IsOptional()
    @IsString()
    department?: string;

    @IsOptional()
    @IsNumber()
    hourlyRate?: number;

    @IsOptional()
    @IsNumber()
    monthlySalary?: number;

    @IsOptional()
    @IsArray()
    permissions?: string[];

    @IsOptional()
    @IsArray()
    workingDays?: number[];

    @IsOptional()
    @IsString()
    workStartTime?: string;

    @IsOptional()
    @IsString()
    workEndTime?: string;
}

export class CreateTimeEntryDto {
    @IsMongoId()
    staffId: string;

    @IsDateString()
    date: string;

    @IsDateString()
    startTime: string;

    @IsOptional()
    @IsDateString()
    endTime?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsMongoId()
    bookingId?: string;

    @IsOptional()
    @IsString()
    projectName?: string;

    @IsOptional()
    @IsBoolean()
    isBillable?: boolean;

    @IsOptional()
    @IsNumber()
    billableRate?: number;
}

export class UpdateTimeEntryDto {
    @IsOptional()
    @IsDateString()
    endTime?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isBillable?: boolean;
}

export class CreateExpenseDto {
    @IsMongoId()
    staffId: string;

    @IsString()
    category: string;

    @IsString()
    description: string;

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsDateString()
    date: string;

    @IsOptional()
    @IsString()
    receiptUrl?: string;
}

export class ApproveExpenseDto {
    @IsEnum(ExpenseStatus)
    status: ExpenseStatus;

    @IsOptional()
    @IsString()
    rejectionReason?: string;
}
