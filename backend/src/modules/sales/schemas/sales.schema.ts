import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuoteDocument = Quote & Document;
export type InvoiceDocument = Invoice & Document;

export enum QuoteStatus {
    DRAFT = 'draft',
    SENT = 'sent',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    EXPIRED = 'expired',
    CONVERTED = 'converted', // Converted to invoice
}

export enum InvoiceStatus {
    DRAFT = 'draft',
    SENT = 'sent',
    PAID = 'paid',
    PARTIALLY_PAID = 'partially_paid',
    OVERDUE = 'overdue',
    CANCELLED = 'cancelled',
}

// Shared line item structure
export class LineItem {
    @Prop({ type: String, required: true })
    description: string;

    @Prop({ type: Number, required: true })
    quantity: number;

    @Prop({ type: Number, required: true })
    unitPrice: number;

    @Prop({ type: Number, default: 0 })
    taxRate: number;

    @Prop({ type: Number, default: 0 })
    discount: number;

    @Prop({ type: String })
    unit?: string; // 'hour', 'day', 'unit', etc.
}

// Client Info embedded
export class ClientInfo {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String })
    email?: string;

    @Prop({ type: String })
    phone?: string;

    @Prop({ type: String })
    address?: string;

    @Prop({ type: String })
    city?: string;

    @Prop({ type: String })
    postalCode?: string;

    @Prop({ type: String })
    country?: string;

    @Prop({ type: String })
    taxId?: string; // SIRET, VAT number, etc.
}

@Schema({ timestamps: true })
export class Quote {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    tenantId: Types.ObjectId;

    @Prop({ type: String, required: true, unique: true })
    quoteNumber: string;

    @Prop({ type: Types.ObjectId, ref: 'Customer' })
    customerId?: Types.ObjectId;

    @Prop({ type: Object, required: true })
    client: ClientInfo;

    @Prop({ type: [Object], required: true })
    lineItems: LineItem[];

    @Prop({ type: Number, required: true })
    subtotal: number;

    @Prop({ type: Number, default: 0 })
    totalTax: number;

    @Prop({ type: Number, default: 0 })
    totalDiscount: number;

    @Prop({ type: Number, required: true })
    total: number;

    @Prop({ type: String, enum: QuoteStatus, default: QuoteStatus.DRAFT })
    status: QuoteStatus;

    @Prop({ type: Date, required: true })
    issueDate: Date;

    @Prop({ type: Date, required: true })
    validUntil: Date;

    @Prop({ type: String })
    notes?: string;

    @Prop({ type: String })
    termsAndConditions?: string;

    @Prop({ type: String })
    signatureUrl?: string;

    @Prop({ type: Date })
    signedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'Invoice' })
    convertedToInvoiceId?: Types.ObjectId;

    @Prop({ type: Object, default: {} })
    metadata: Record<string, any>;
}

export const QuoteSchema = SchemaFactory.createForClass(Quote);

@Schema({ timestamps: true })
export class Invoice {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    tenantId: Types.ObjectId;

    @Prop({ type: String, required: true, unique: true })
    invoiceNumber: string;

    @Prop({ type: Types.ObjectId, ref: 'Quote' })
    fromQuoteId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Order' })
    fromOrderId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Customer' })
    customerId?: Types.ObjectId;

    @Prop({ type: Object, required: true })
    client: ClientInfo;

    @Prop({ type: [Object], required: true })
    lineItems: LineItem[];

    @Prop({ type: Number, required: true })
    subtotal: number;

    @Prop({ type: Number, default: 0 })
    totalTax: number;

    @Prop({ type: Number, default: 0 })
    totalDiscount: number;

    @Prop({ type: Number, required: true })
    total: number;

    @Prop({ type: Number, default: 0 })
    amountPaid: number;

    @Prop({ type: Number, default: 0 })
    amountDue: number;

    @Prop({ type: String, enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
    status: InvoiceStatus;

    @Prop({ type: Date, required: true })
    issueDate: Date;

    @Prop({ type: Date, required: true })
    dueDate: Date;

    @Prop({ type: Date })
    paidAt?: Date;

    @Prop({ type: String })
    paymentMethod?: string;

    @Prop({ type: String })
    notes?: string;

    @Prop({ type: String })
    termsAndConditions?: string;

    @Prop({ type: Object, default: {} })
    metadata: Record<string, any>;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// Indexes
QuoteSchema.index({ tenantId: 1, status: 1 });
QuoteSchema.index({ tenantId: 1, quoteNumber: 1 });
InvoiceSchema.index({ tenantId: 1, status: 1 });
InvoiceSchema.index({ tenantId: 1, invoiceNumber: 1 });
