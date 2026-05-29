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
import { AccountingService } from './accounting.service';
import {
    CreateAccountDto,
    UpdateAccountDto,
    CreateTransactionDto,
    UpdateTransactionDto,
} from './dto/accounting.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TransactionType, TransactionCategory } from './schemas/accounting.schema';

@Controller('accounting')
@UseGuards(JwtAuthGuard)
export class AccountingController {
    constructor(private readonly accountingService: AccountingService) { }

    // ========== ACCOUNTS ==========

    @Post('accounts')
    async createAccount(@Req() req, @Body() dto: CreateAccountDto) {
        const tenantId = req.user.tenantId;
        return this.accountingService.createAccount(tenantId, dto);
    }

    @Get('accounts')
    async getAccounts(@Req() req, @Query('activeOnly') activeOnly?: string) {
        const tenantId = req.user.tenantId;
        return this.accountingService.getAccounts(tenantId, activeOnly !== 'false');
    }

    @Get('accounts/balances')
    async getAccountBalances(@Req() req) {
        const tenantId = req.user.tenantId;
        return this.accountingService.getAccountBalances(tenantId);
    }

    @Get('accounts/:id')
    async getAccount(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.accountingService.getAccountById(tenantId, id);
    }

    @Patch('accounts/:id')
    async updateAccount(@Req() req, @Param('id') id: string, @Body() dto: UpdateAccountDto) {
        const tenantId = req.user.tenantId;
        return this.accountingService.updateAccount(tenantId, id, dto);
    }

    @Delete('accounts/:id')
    async deleteAccount(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        await this.accountingService.deleteAccount(tenantId, id);
        return { message: 'Account deleted successfully' };
    }

    // ========== TRANSACTIONS ==========

    @Post('transactions')
    async createTransaction(@Req() req, @Body() dto: CreateTransactionDto) {
        const tenantId = req.user.tenantId;
        return this.accountingService.createTransaction(tenantId, dto);
    }

    @Get('transactions')
    async getTransactions(
        @Req() req,
        @Query('accountId') accountId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('type') type?: TransactionType,
        @Query('category') category?: TransactionCategory,
    ) {
        const tenantId = req.user.tenantId;
        return this.accountingService.getTransactions(tenantId, {
            accountId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            type,
            category,
        });
    }

    @Get('transactions/:id')
    async getTransaction(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.accountingService.getTransactionById(tenantId, id);
    }

    @Patch('transactions/:id')
    async updateTransaction(@Req() req, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
        const tenantId = req.user.tenantId;
        return this.accountingService.updateTransaction(tenantId, id, dto);
    }

    @Delete('transactions/:id')
    async deleteTransaction(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        await this.accountingService.deleteTransaction(tenantId, id);
        return { message: 'Transaction deleted successfully' };
    }

    // ========== REPORTS ==========

    @Get('reports/summary')
    async getFinancialSummary(
        @Req() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const tenantId = req.user.tenantId;
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate
            ? new Date(startDate)
            : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        return this.accountingService.getFinancialSummary(tenantId, start, end);
    }

    @Get('reports/cashflow')
    async getCashFlowReport(
        @Req() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const tenantId = req.user.tenantId;
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate
            ? new Date(startDate)
            : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        return this.accountingService.getCashFlowReport(tenantId, start, end);
    }
}
