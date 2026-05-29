import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import {
    CreateQuoteDto,
    UpdateQuoteDto,
    CreateInvoiceDto,
    RecordPaymentDto,
} from './dto/sales.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { QuoteStatus, InvoiceStatus } from './schemas/sales.schema';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    // ========== QUOTES ==========

    @Post('quotes')
    async createQuote(@Req() req, @Body() dto: CreateQuoteDto) {
        const tenantId = req.user.tenantId;
        return this.salesService.createQuote(tenantId, dto);
    }

    @Get('quotes')
    async getQuotes(
        @Req() req,
        @Query('status') status?: QuoteStatus,
        @Query('customerId') customerId?: string,
    ) {
        const tenantId = req.user.tenantId;
        return this.salesService.getQuotes(tenantId, { status, customerId });
    }

    @Get('quotes/:id')
    async getQuote(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.salesService.getQuoteById(tenantId, id);
    }

    @Patch('quotes/:id')
    async updateQuote(@Req() req, @Param('id') id: string, @Body() dto: UpdateQuoteDto) {
        const tenantId = req.user.tenantId;
        return this.salesService.updateQuote(tenantId, id, dto);
    }

    @Post('quotes/:id/send')
    async sendQuote(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.salesService.sendQuote(tenantId, id);
    }

    @Post('quotes/:id/accept')
    async acceptQuote(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.salesService.acceptQuote(tenantId, id);
    }

    @Post('quotes/:id/reject')
    async rejectQuote(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.salesService.rejectQuote(tenantId, id);
    }

    @Post('quotes/:id/convert')
    async convertToInvoice(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.salesService.convertQuoteToInvoice(tenantId, id);
    }

    @Delete('quotes/:id')
    async deleteQuote(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        await this.salesService.deleteQuote(tenantId, id);
        return { message: 'Quote deleted successfully' };
    }

    // ========== INVOICES ==========

    @Post('invoices')
    async createInvoice(@Req() req, @Body() dto: CreateInvoiceDto) {
        const tenantId = req.user.tenantId;
        return this.salesService.createInvoice(tenantId, dto);
    }

    @Get('invoices')
    async getInvoices(
        @Req() req,
        @Query('status') status?: InvoiceStatus,
        @Query('customerId') customerId?: string,
    ) {
        const tenantId = req.user.tenantId;
        return this.salesService.getInvoices(tenantId, { status, customerId });
    }

    @Get('invoices/:id')
    async getInvoice(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.salesService.getInvoiceById(tenantId, id);
    }

    @Post('invoices/:id/send')
    async sendInvoice(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.salesService.sendInvoice(tenantId, id);
    }

    @Post('invoices/:id/payment')
    async recordPayment(@Req() req, @Param('id') id: string, @Body() dto: RecordPaymentDto) {
        const tenantId = req.user.tenantId;
        return this.salesService.recordPayment(tenantId, id, dto);
    }

    @Post('invoices/:id/cancel')
    async cancelInvoice(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.salesService.cancelInvoice(tenantId, id);
    }

    // ========== STATS ==========

    @Get('stats')
    async getSalesStats(
        @Req() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const tenantId = req.user.tenantId;
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate
            ? new Date(startDate)
            : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        return this.salesService.getSalesStats(tenantId, start, end);
    }
}
