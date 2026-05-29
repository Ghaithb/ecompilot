import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;
export type AccountDocument = Account & Document;

export enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense',
    TRANSFER = 'transfer',
}

export enum TransactionCategory {
    // Income
    PRODUCT_SALE = 'product_sale',
    SERVICE_SALE = 'service_sale',
    BOOKING_PAYMENT = 'booking_payment',
    SUBSCRIPTION = 'subscription',
    OTHER_INCOME = 'other_income',
    // Expense
    INVENTORY_PURCHASE = 'inventory_purchase',
    SALARY = 'salary',
    RENT = 'rent',
    UTILITIES = 'utilities',
    MARKETING = 'marketing',
    SOFTWARE = 'software',
    BANK_FEES = 'bank_fees',
    TAX = 'tax',
    REFUND = 'refund',
    OTHER_EXPENSE = 'other_expense',
}

export enum AccountType {
    BANK = 'bank',
    CASH = 'cash',
    CREDIT_CARD = 'credit_card',
    PAYPAL = 'paypal',
    STRIPE = 'stripe',
    OTHER = 'other',
}

@Schema({ timestamps: true })
export class Account {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    tenantId: Types.ObjectId;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, enum: AccountType, required: true })
    type: AccountType;

    @Prop({ type: Number, default: 0 })
    balance: number;

    @Prop({ type: String, default: 'EUR' })
    currency: string;

    @Prop({ type: String })
    description?: string;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: String })
    bankName?: string;

    @Prop({ type: String })
    accountNumber?: string;

    @Prop({ type: String })
    iban?: string;

    @Prop({ type: Object, default: {} })
    metadata: Record<string, any>;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

@Schema({ timestamps: true })
export class Transaction {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    tenantId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
    accountId: Types.ObjectId;

    @Prop({ type: String, enum: TransactionType, required: true })
    type: TransactionType;

    @Prop({ type: String, enum: TransactionCategory, required: true })
    category: TransactionCategory;

    @Prop({ type: Number, required: true })
    amount: number;

    @Prop({ type: String, default: 'EUR' })
    currency: string;

    @Prop({ type: String, required: true })
    description: string;

    @Prop({ type: Date, required: true, index: true })
    date: Date;

    // Reference to source document
    @Prop({ type: Types.ObjectId, ref: 'Order' })
    orderId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Invoice' })
    invoiceId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Booking' })
    bookingId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Expense' })
    expenseId?: Types.ObjectId;

    @Prop({ type: String })
    reference?: string;

    @Prop({ type: String })
    notes?: string;

    @Prop({ type: Boolean, default: false })
    isReconciled: boolean;

    @Prop({ type: String })
    attachmentUrl?: string;

    @Prop({ type: Object, default: {} })
    metadata: Record<string, any>;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Indexes
AccountSchema.index({ tenantId: 1, type: 1 });
TransactionSchema.index({ tenantId: 1, date: 1 });
TransactionSchema.index({ tenantId: 1, accountId: 1, date: 1 });
TransactionSchema.index({ tenantId: 1, category: 1 });
