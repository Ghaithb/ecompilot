import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    Account,
    AccountDocument,
    Transaction,
    TransactionDocument,
    TransactionType,
    TransactionCategory,
} from './schemas/accounting.schema';
import {
    CreateAccountDto,
    UpdateAccountDto,
    CreateTransactionDto,
    UpdateTransactionDto,
} from './dto/accounting.dto';

@Injectable()
export class AccountingService {
    constructor(
        @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
        @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    ) { }

    // ========== ACCOUNTS ==========

    async createAccount(tenantId: string, dto: CreateAccountDto): Promise<AccountDocument> {
        const account = new this.accountModel({
            tenantId: new Types.ObjectId(tenantId),
            ...dto,
            balance: dto.balance || 0,
            currency: dto.currency || 'EUR',
        });
        return account.save();
    }

    async getAccounts(tenantId: string, activeOnly = true): Promise<AccountDocument[]> {
        const query: any = { tenantId: new Types.ObjectId(tenantId) };
        if (activeOnly) query.isActive = true;

        return this.accountModel.find(query).sort({ name: 1 }).exec();
    }

    async getAccountById(tenantId: string, accountId: string): Promise<AccountDocument> {
        const account = await this.accountModel.findOne({
            _id: new Types.ObjectId(accountId),
            tenantId: new Types.ObjectId(tenantId),
        });
        if (!account) throw new NotFoundException('Account not found');
        return account;
    }

    async updateAccount(tenantId: string, accountId: string, dto: UpdateAccountDto): Promise<AccountDocument> {
        const account = await this.accountModel.findOneAndUpdate(
            { _id: new Types.ObjectId(accountId), tenantId: new Types.ObjectId(tenantId) },
            { $set: dto },
            { new: true },
        );
        if (!account) throw new NotFoundException('Account not found');
        return account;
    }

    async deleteAccount(tenantId: string, accountId: string): Promise<void> {
        // Check if there are transactions
        const transactionCount = await this.transactionModel.countDocuments({
            tenantId: new Types.ObjectId(tenantId),
            accountId: new Types.ObjectId(accountId),
        });

        if (transactionCount > 0) {
            // Soft delete instead
            await this.updateAccount(tenantId, accountId, { isActive: false });
        } else {
            await this.accountModel.deleteOne({
                _id: new Types.ObjectId(accountId),
                tenantId: new Types.ObjectId(tenantId),
            });
        }
    }

    // ========== TRANSACTIONS ==========

    async createTransaction(tenantId: string, dto: CreateTransactionDto): Promise<TransactionDocument> {
        const transaction = new this.transactionModel({
            tenantId: new Types.ObjectId(tenantId),
            accountId: new Types.ObjectId(dto.accountId),
            type: dto.type,
            category: dto.category,
            amount: dto.amount,
            currency: dto.currency || 'EUR',
            description: dto.description,
            date: new Date(dto.date),
            orderId: dto.orderId ? new Types.ObjectId(dto.orderId) : undefined,
            invoiceId: dto.invoiceId ? new Types.ObjectId(dto.invoiceId) : undefined,
            bookingId: dto.bookingId ? new Types.ObjectId(dto.bookingId) : undefined,
            expenseId: dto.expenseId ? new Types.ObjectId(dto.expenseId) : undefined,
            reference: dto.reference,
            notes: dto.notes,
            attachmentUrl: dto.attachmentUrl,
        });

        const saved = await transaction.save();

        // Update account balance
        const balanceChange = dto.type === TransactionType.INCOME ? dto.amount : -dto.amount;
        await this.accountModel.updateOne(
            { _id: new Types.ObjectId(dto.accountId) },
            { $inc: { balance: balanceChange } },
        );

        return saved;
    }

    async getTransactions(
        tenantId: string,
        filters: { accountId?: string; startDate?: Date; endDate?: Date; type?: TransactionType; category?: TransactionCategory } = {},
    ): Promise<TransactionDocument[]> {
        const query: any = { tenantId: new Types.ObjectId(tenantId) };

        if (filters.accountId) query.accountId = new Types.ObjectId(filters.accountId);
        if (filters.type) query.type = filters.type;
        if (filters.category) query.category = filters.category;
        if (filters.startDate || filters.endDate) {
            query.date = {};
            if (filters.startDate) query.date.$gte = filters.startDate;
            if (filters.endDate) query.date.$lte = filters.endDate;
        }

        return this.transactionModel
            .find(query)
            .populate('accountId', 'name type')
            .sort({ date: -1 })
            .exec();
    }

    async getTransactionById(tenantId: string, transactionId: string): Promise<TransactionDocument> {
        const transaction = await this.transactionModel.findOne({
            _id: new Types.ObjectId(transactionId),
            tenantId: new Types.ObjectId(tenantId),
        }).populate('accountId');

        if (!transaction) throw new NotFoundException('Transaction not found');
        return transaction;
    }

    async updateTransaction(tenantId: string, transactionId: string, dto: UpdateTransactionDto): Promise<TransactionDocument> {
        const transaction = await this.transactionModel.findOneAndUpdate(
            { _id: new Types.ObjectId(transactionId), tenantId: new Types.ObjectId(tenantId) },
            { $set: dto },
            { new: true },
        );
        if (!transaction) throw new NotFoundException('Transaction not found');
        return transaction;
    }

    async deleteTransaction(tenantId: string, transactionId: string): Promise<void> {
        const transaction = await this.getTransactionById(tenantId, transactionId);

        // Reverse the balance change
        const balanceChange = transaction.type === TransactionType.INCOME ? -transaction.amount : transaction.amount;
        await this.accountModel.updateOne(
            { _id: transaction.accountId },
            { $inc: { balance: balanceChange } },
        );

        await this.transactionModel.deleteOne({ _id: new Types.ObjectId(transactionId) });
    }

    // ========== REPORTS ==========

    async getFinancialSummary(tenantId: string, startDate: Date, endDate: Date) {
        const transactions = await this.transactionModel.find({
            tenantId: new Types.ObjectId(tenantId),
            date: { $gte: startDate, $lte: endDate },
        });

        const income = transactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);

        const netProfit = income - expenses;

        // Group by category
        const incomeByCategory: Record<string, number> = {};
        const expensesByCategory: Record<string, number> = {};

        transactions.forEach(t => {
            if (t.type === TransactionType.INCOME) {
                incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
            } else {
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            }
        });

        return {
            period: { start: startDate.toISOString(), end: endDate.toISOString() },
            summary: {
                totalIncome: income,
                totalExpenses: expenses,
                netProfit,
                profitMargin: income > 0 ? Math.round((netProfit / income) * 100) : 0,
            },
            incomeByCategory,
            expensesByCategory,
            transactionCount: transactions.length,
        };
    }

    async getCashFlowReport(tenantId: string, startDate: Date, endDate: Date) {
        const accounts = await this.getAccounts(tenantId);

        const cashFlow = await Promise.all(
            accounts.map(async (account) => {
                const transactions = await this.transactionModel.find({
                    tenantId: new Types.ObjectId(tenantId),
                    accountId: account._id,
                    date: { $gte: startDate, $lte: endDate },
                });

                const inflow = transactions
                    .filter(t => t.type === TransactionType.INCOME)
                    .reduce((sum, t) => sum + t.amount, 0);

                const outflow = transactions
                    .filter(t => t.type === TransactionType.EXPENSE)
                    .reduce((sum, t) => sum + t.amount, 0);

                return {
                    accountId: account._id,
                    accountName: account.name,
                    accountType: account.type,
                    currentBalance: account.balance,
                    inflow,
                    outflow,
                    netFlow: inflow - outflow,
                };
            }),
        );

        return {
            period: { start: startDate.toISOString(), end: endDate.toISOString() },
            accounts: cashFlow,
            totals: {
                totalBalance: cashFlow.reduce((sum, a) => sum + a.currentBalance, 0),
                totalInflow: cashFlow.reduce((sum, a) => sum + a.inflow, 0),
                totalOutflow: cashFlow.reduce((sum, a) => sum + a.outflow, 0),
            },
        };
    }

    async getAccountBalances(tenantId: string) {
        const accounts = await this.getAccounts(tenantId);

        return {
            accounts: accounts.map(a => ({
                id: a._id,
                name: a.name,
                type: a.type,
                balance: a.balance,
                currency: a.currency,
            })),
            totalBalance: accounts.reduce((sum, a) => sum + a.balance, 0),
        };
    }
}
