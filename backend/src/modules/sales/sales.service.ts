import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    Quote,
    QuoteDocument,
    QuoteStatus,
    Invoice,
    InvoiceDocument,
    InvoiceStatus,
} from './schemas/sales.schema';
import {
    CreateQuoteDto,
    UpdateQuoteDto,
    CreateInvoiceDto,
    UpdateInvoiceDto,
    RecordPaymentDto,
    LineItemDto,
} from './dto/sales.dto';

@Injectable()
export class SalesService {
    constructor(
        @InjectModel(Quote.name) private quoteModel: Model<QuoteDocument>,
        @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    ) { }

    // ========== QUOTE MANAGEMENT ==========

    private generateQuoteNumber(tenantId: string): string {
        const timestamp = Date.now().toString(36).toUpperCase();
        return `DEV-${timestamp}`;
    }

    private generateInvoiceNumber(tenantId: string): string {
        const timestamp = Date.now().toString(36).toUpperCase();
        return `FAC-${timestamp}`;
    }

    private calculateTotals(lineItems: LineItemDto[]) {
        let subtotal = 0;
        let totalTax = 0;
        let totalDiscount = 0;

        for (const item of lineItems) {
            const lineTotal = item.quantity * item.unitPrice;
            const discount = item.discount || 0;
            const tax = ((lineTotal - discount) * (item.taxRate || 0)) / 100;

            subtotal += lineTotal;
            totalDiscount += discount;
            totalTax += tax;
        }

        const total = subtotal - totalDiscount + totalTax;

        return { subtotal, totalTax, totalDiscount, total };
    }

    async createQuote(tenantId: string, dto: CreateQuoteDto): Promise<QuoteDocument> {
        const totals = this.calculateTotals(dto.lineItems);

        const quote = new this.quoteModel({
            tenantId: new Types.ObjectId(tenantId),
            quoteNumber: this.generateQuoteNumber(tenantId),
            customerId: dto.customerId ? new Types.ObjectId(dto.customerId) : undefined,
            client: dto.client,
            lineItems: dto.lineItems,
            ...totals,
            issueDate: new Date(dto.issueDate),
            validUntil: new Date(dto.validUntil),
            notes: dto.notes,
            termsAndConditions: dto.termsAndConditions,
            status: QuoteStatus.DRAFT,
        });

        return quote.save();
    }

    async getQuotes(
        tenantId: string,
        filters: { status?: QuoteStatus; customerId?: string } = {},
    ): Promise<QuoteDocument[]> {
        const query: any = { tenantId: new Types.ObjectId(tenantId) };
        if (filters.status) query.status = filters.status;
        if (filters.customerId) query.customerId = new Types.ObjectId(filters.customerId);

        return this.quoteModel.find(query).sort({ createdAt: -1 }).exec();
    }

    async getQuoteById(tenantId: string, quoteId: string): Promise<QuoteDocument> {
        const quote = await this.quoteModel.findOne({
            _id: new Types.ObjectId(quoteId),
            tenantId: new Types.ObjectId(tenantId),
        });
        if (!quote) throw new NotFoundException('Quote not found');
        return quote;
    }

    async updateQuote(tenantId: string, quoteId: string, dto: UpdateQuoteDto): Promise<QuoteDocument> {
        const quote = await this.getQuoteById(tenantId, quoteId);

        if (quote.status === QuoteStatus.CONVERTED) {
            throw new BadRequestException('Cannot update a converted quote');
        }

        const updateData: any = { ...dto };

        if (dto.lineItems) {
            const totals = this.calculateTotals(dto.lineItems);
            Object.assign(updateData, totals);
        }

        const updatedQuote = await this.quoteModel.findByIdAndUpdate(
            quoteId,
            { $set: updateData },
            { new: true },
        );

        return updatedQuote!;
    }

    async sendQuote(tenantId: string, quoteId: string): Promise<QuoteDocument> {
        return this.updateQuote(tenantId, quoteId, { status: QuoteStatus.SENT });
    }

    async acceptQuote(tenantId: string, quoteId: string): Promise<QuoteDocument> {
        return this.updateQuote(tenantId, quoteId, { status: QuoteStatus.ACCEPTED });
    }

    async rejectQuote(tenantId: string, quoteId: string): Promise<QuoteDocument> {
        return this.updateQuote(tenantId, quoteId, { status: QuoteStatus.REJECTED });
    }

    async convertQuoteToInvoice(tenantId: string, quoteId: string): Promise<InvoiceDocument> {
        const quote = await this.getQuoteById(tenantId, quoteId);

        if (quote.status !== QuoteStatus.ACCEPTED) {
            throw new BadRequestException('Only accepted quotes can be converted to invoices');
        }

        // Create invoice from quote
        const invoice = await this.createInvoice(tenantId, {
            client: quote.client as any,
            customerId: quote.customerId?.toString(),
            fromQuoteId: quoteId,
            lineItems: quote.lineItems as any,
            issueDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            notes: quote.notes,
            termsAndConditions: quote.termsAndConditions,
        });

        // Mark quote as converted
        await this.quoteModel.findByIdAndUpdate(quoteId, {
            $set: {
                status: QuoteStatus.CONVERTED,
                convertedToInvoiceId: invoice._id,
            },
        });

        return invoice;
    }

    async deleteQuote(tenantId: string, quoteId: string): Promise<void> {
        const result = await this.quoteModel.deleteOne({
            _id: new Types.ObjectId(quoteId),
            tenantId: new Types.ObjectId(tenantId),
        });
        if (result.deletedCount === 0) throw new NotFoundException('Quote not found');
    }

    // ========== INVOICE MANAGEMENT ==========

    async createInvoice(tenantId: string, dto: CreateInvoiceDto): Promise<InvoiceDocument> {
        const totals = this.calculateTotals(dto.lineItems);

        const invoice = new this.invoiceModel({
            tenantId: new Types.ObjectId(tenantId),
            invoiceNumber: this.generateInvoiceNumber(tenantId),
            fromQuoteId: dto.fromQuoteId ? new Types.ObjectId(dto.fromQuoteId) : undefined,
            fromOrderId: dto.fromOrderId ? new Types.ObjectId(dto.fromOrderId) : undefined,
            customerId: dto.customerId ? new Types.ObjectId(dto.customerId) : undefined,
            client: dto.client,
            lineItems: dto.lineItems,
            ...totals,
            amountPaid: 0,
            amountDue: totals.total,
            issueDate: new Date(dto.issueDate),
            dueDate: new Date(dto.dueDate),
            notes: dto.notes,
            termsAndConditions: dto.termsAndConditions,
            status: InvoiceStatus.DRAFT,
        });

        return invoice.save();
    }

    async getInvoices(
        tenantId: string,
        filters: { status?: InvoiceStatus; customerId?: string } = {},
    ): Promise<InvoiceDocument[]> {
        const query: any = { tenantId: new Types.ObjectId(tenantId) };
        if (filters.status) query.status = filters.status;
        if (filters.customerId) query.customerId = new Types.ObjectId(filters.customerId);

        return this.invoiceModel.find(query).sort({ createdAt: -1 }).exec();
    }

    async getInvoiceById(tenantId: string, invoiceId: string): Promise<InvoiceDocument> {
        const invoice = await this.invoiceModel.findOne({
            _id: new Types.ObjectId(invoiceId),
            tenantId: new Types.ObjectId(tenantId),
        });
        if (!invoice) throw new NotFoundException('Invoice not found');
        return invoice;
    }

    async sendInvoice(tenantId: string, invoiceId: string): Promise<InvoiceDocument> {
        const invoice = await this.invoiceModel.findOneAndUpdate(
            { _id: new Types.ObjectId(invoiceId), tenantId: new Types.ObjectId(tenantId) },
            { $set: { status: InvoiceStatus.SENT } },
            { new: true },
        );
        if (!invoice) throw new NotFoundException('Invoice not found');
        return invoice;
    }

    async recordPayment(tenantId: string, invoiceId: string, dto: RecordPaymentDto): Promise<InvoiceDocument> {
        const invoice = await this.getInvoiceById(tenantId, invoiceId);

        const newAmountPaid = invoice.amountPaid + dto.amount;
        const newAmountDue = invoice.total - newAmountPaid;

        let newStatus: InvoiceStatus;
        if (newAmountDue <= 0) {
            newStatus = InvoiceStatus.PAID;
        } else if (newAmountPaid > 0) {
            newStatus = InvoiceStatus.PARTIALLY_PAID;
        } else {
            newStatus = invoice.status;
        }

        const updatedInvoice = await this.invoiceModel.findByIdAndUpdate(
            invoiceId,
            {
                $set: {
                    amountPaid: newAmountPaid,
                    amountDue: Math.max(0, newAmountDue),
                    status: newStatus,
                    paymentMethod: dto.paymentMethod,
                    paidAt: newStatus === InvoiceStatus.PAID ? (dto.paidAt ? new Date(dto.paidAt) : new Date()) : undefined,
                },
            },
            { new: true },
        );

        return updatedInvoice!;
    }

    async cancelInvoice(tenantId: string, invoiceId: string): Promise<InvoiceDocument> {
        const invoice = await this.invoiceModel.findOneAndUpdate(
            { _id: new Types.ObjectId(invoiceId), tenantId: new Types.ObjectId(tenantId) },
            { $set: { status: InvoiceStatus.CANCELLED } },
            { new: true },
        );
        if (!invoice) throw new NotFoundException('Invoice not found');
        return invoice;
    }

    // ========== STATS ==========

    async getSalesStats(tenantId: string, startDate: Date, endDate: Date) {
        const quotes = await this.quoteModel.find({
            tenantId: new Types.ObjectId(tenantId),
            createdAt: { $gte: startDate, $lte: endDate },
        });

        const invoices = await this.invoiceModel.find({
            tenantId: new Types.ObjectId(tenantId),
            createdAt: { $gte: startDate, $lte: endDate },
        });

        return {
            quotes: {
                total: quotes.length,
                draft: quotes.filter(q => q.status === QuoteStatus.DRAFT).length,
                sent: quotes.filter(q => q.status === QuoteStatus.SENT).length,
                accepted: quotes.filter(q => q.status === QuoteStatus.ACCEPTED).length,
                rejected: quotes.filter(q => q.status === QuoteStatus.REJECTED).length,
                converted: quotes.filter(q => q.status === QuoteStatus.CONVERTED).length,
                totalValue: quotes.reduce((sum, q) => sum + q.total, 0),
            },
            invoices: {
                total: invoices.length,
                draft: invoices.filter(i => i.status === InvoiceStatus.DRAFT).length,
                sent: invoices.filter(i => i.status === InvoiceStatus.SENT).length,
                paid: invoices.filter(i => i.status === InvoiceStatus.PAID).length,
                overdue: invoices.filter(i => i.status === InvoiceStatus.OVERDUE).length,
                totalBilled: invoices.reduce((sum, i) => sum + i.total, 0),
                totalCollected: invoices.reduce((sum, i) => sum + i.amountPaid, 0),
                totalOutstanding: invoices.reduce((sum, i) => sum + i.amountDue, 0),
            },
        };
    }
}
