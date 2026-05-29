import {
    IsString,
    IsNumber,
    IsOptional,
    IsDateString,
    IsEnum,
    IsBoolean,
    IsMongoId,
} from 'class-validator';
import {
    TransactionType,
    TransactionCategory,
    AccountType,
} from '../schemas/accounting.schema';

export class CreateAccountDto {
    @IsString()
    name: string;

    @IsEnum(AccountType)
    type: AccountType;

    @IsOptional()
    @IsNumber()
    balance?: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    bankName?: string;

    @IsOptional()
    @IsString()
    accountNumber?: string;

    @IsOptional()
    @IsString()
    iban?: string;
}

export class UpdateAccountDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsNumber()
    balance?: number;
}

export class CreateTransactionDto {
    @IsMongoId()
    accountId: string;

    @IsEnum(TransactionType)
    type: TransactionType;

    @IsEnum(TransactionCategory)
    category: TransactionCategory;

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsString()
    description: string;

    @IsDateString()
    date: string;

    @IsOptional()
    @IsMongoId()
    orderId?: string;

    @IsOptional()
    @IsMongoId()
    invoiceId?: string;

    @IsOptional()
    @IsMongoId()
    bookingId?: string;

    @IsOptional()
    @IsMongoId()
    expenseId?: string;

    @IsOptional()
    @IsString()
    reference?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    attachmentUrl?: string;
}

export class UpdateTransactionDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsBoolean()
    isReconciled?: boolean;
}

export class GetFinancialReportDto {
    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsOptional()
    @IsMongoId()
    accountId?: string;
}
