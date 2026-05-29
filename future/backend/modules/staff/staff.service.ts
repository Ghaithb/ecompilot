import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    Staff,
    StaffDocument,
    StaffStatus,
    TimeEntry,
    TimeEntryDocument,
    Expense,
    ExpenseDocument,
    ExpenseStatus,
} from './schemas/staff.schema';
import {
    CreateStaffDto,
    UpdateStaffDto,
    CreateTimeEntryDto,
    UpdateTimeEntryDto,
    CreateExpenseDto,
    ApproveExpenseDto,
} from './dto/staff.dto';

@Injectable()
export class StaffService {
    constructor(
        @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
        @InjectModel(TimeEntry.name) private timeEntryModel: Model<TimeEntryDocument>,
        @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    ) { }

    // ========== STAFF MANAGEMENT ==========

    async createStaff(tenantId: string, dto: CreateStaffDto): Promise<StaffDocument> {
        const staff = new this.staffModel({
            tenantId: new Types.ObjectId(tenantId),
            ...dto,
            hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
        });
        return staff.save();
    }

    async getStaffList(
        tenantId: string,
        filters: { status?: StaffStatus; department?: string } = {},
    ): Promise<StaffDocument[]> {
        const query: any = { tenantId: new Types.ObjectId(tenantId) };
        if (filters.status) query.status = filters.status;
        if (filters.department) query.department = filters.department;

        return this.staffModel.find(query).sort({ lastName: 1, firstName: 1 }).exec();
    }

    async getStaffById(tenantId: string, staffId: string): Promise<StaffDocument> {
        const staff = await this.staffModel.findOne({
            _id: new Types.ObjectId(staffId),
            tenantId: new Types.ObjectId(tenantId),
        });
        if (!staff) throw new NotFoundException('Staff member not found');
        return staff;
    }

    async updateStaff(tenantId: string, staffId: string, dto: UpdateStaffDto): Promise<StaffDocument> {
        const staff = await this.staffModel.findOneAndUpdate(
            { _id: new Types.ObjectId(staffId), tenantId: new Types.ObjectId(tenantId) },
            { $set: dto },
            { new: true },
        );
        if (!staff) throw new NotFoundException('Staff member not found');
        return staff;
    }

    async deactivateStaff(tenantId: string, staffId: string): Promise<StaffDocument> {
        return this.updateStaff(tenantId, staffId, { status: StaffStatus.INACTIVE });
    }

    async deleteStaff(tenantId: string, staffId: string): Promise<void> {
        const result = await this.staffModel.deleteOne({
            _id: new Types.ObjectId(staffId),
            tenantId: new Types.ObjectId(tenantId),
        });
        if (result.deletedCount === 0) throw new NotFoundException('Staff member not found');
    }

    // ========== TIME TRACKING ==========

    async createTimeEntry(tenantId: string, dto: CreateTimeEntryDto): Promise<TimeEntryDocument> {
        const startTime = new Date(dto.startTime);
        const endTime = dto.endTime ? new Date(dto.endTime) : undefined;

        let durationMinutes: number | undefined;
        if (endTime) {
            durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
        }

        const entry = new this.timeEntryModel({
            tenantId: new Types.ObjectId(tenantId),
            staffId: new Types.ObjectId(dto.staffId),
            date: new Date(dto.date),
            startTime,
            endTime,
            durationMinutes,
            description: dto.description,
            bookingId: dto.bookingId ? new Types.ObjectId(dto.bookingId) : undefined,
            projectName: dto.projectName,
            isBillable: dto.isBillable || false,
            billableRate: dto.billableRate,
        });

        return entry.save();
    }

    async getTimeEntries(
        tenantId: string,
        filters: { staffId?: string; startDate?: Date; endDate?: Date } = {},
    ): Promise<TimeEntryDocument[]> {
        const query: any = { tenantId: new Types.ObjectId(tenantId) };

        if (filters.staffId) query.staffId = new Types.ObjectId(filters.staffId);
        if (filters.startDate) query.date = { $gte: filters.startDate };
        if (filters.endDate) query.date = { ...query.date, $lte: filters.endDate };

        return this.timeEntryModel
            .find(query)
            .populate('staffId', 'firstName lastName')
            .sort({ date: -1, startTime: -1 })
            .exec();
    }

    async updateTimeEntry(
        tenantId: string,
        entryId: string,
        dto: UpdateTimeEntryDto,
    ): Promise<TimeEntryDocument> {
        const entry = await this.timeEntryModel.findOne({
            _id: new Types.ObjectId(entryId),
            tenantId: new Types.ObjectId(tenantId),
        });

        if (!entry) throw new NotFoundException('Time entry not found');

        const updateData: any = { ...dto };

        if (dto.endTime) {
            updateData.endTime = new Date(dto.endTime);
            updateData.durationMinutes = Math.round(
                (updateData.endTime.getTime() - entry.startTime.getTime()) / 60000,
            );
        }

        const updated = await this.timeEntryModel.findByIdAndUpdate(
            entryId,
            { $set: updateData },
            { new: true },
        );

        return updated!;
    }

    async deleteTimeEntry(tenantId: string, entryId: string): Promise<void> {
        const result = await this.timeEntryModel.deleteOne({
            _id: new Types.ObjectId(entryId),
            tenantId: new Types.ObjectId(tenantId),
        });
        if (result.deletedCount === 0) throw new NotFoundException('Time entry not found');
    }

    // ========== EXPENSE MANAGEMENT ==========

    async createExpense(tenantId: string, dto: CreateExpenseDto): Promise<ExpenseDocument> {
        const expense = new this.expenseModel({
            tenantId: new Types.ObjectId(tenantId),
            staffId: new Types.ObjectId(dto.staffId),
            category: dto.category,
            description: dto.description,
            amount: dto.amount,
            currency: dto.currency || 'EUR',
            date: new Date(dto.date),
            receiptUrl: dto.receiptUrl,
            status: ExpenseStatus.PENDING,
        });

        return expense.save();
    }

    async getExpenses(
        tenantId: string,
        filters: { staffId?: string; status?: ExpenseStatus } = {},
    ): Promise<ExpenseDocument[]> {
        const query: any = { tenantId: new Types.ObjectId(tenantId) };

        if (filters.staffId) query.staffId = new Types.ObjectId(filters.staffId);
        if (filters.status) query.status = filters.status;

        return this.expenseModel
            .find(query)
            .populate('staffId', 'firstName lastName')
            .sort({ date: -1 })
            .exec();
    }

    async approveExpense(
        tenantId: string,
        expenseId: string,
        approverId: string,
        dto: ApproveExpenseDto,
    ): Promise<ExpenseDocument> {
        const updateData: any = {
            status: dto.status,
        };

        if (dto.status === ExpenseStatus.APPROVED) {
            updateData.approvedBy = new Types.ObjectId(approverId);
            updateData.approvedAt = new Date();
        } else if (dto.status === ExpenseStatus.REJECTED) {
            updateData.rejectionReason = dto.rejectionReason;
        }

        const expense = await this.expenseModel.findOneAndUpdate(
            { _id: new Types.ObjectId(expenseId), tenantId: new Types.ObjectId(tenantId) },
            { $set: updateData },
            { new: true },
        );

        if (!expense) throw new NotFoundException('Expense not found');
        return expense;
    }

    async deleteExpense(tenantId: string, expenseId: string): Promise<void> {
        const result = await this.expenseModel.deleteOne({
            _id: new Types.ObjectId(expenseId),
            tenantId: new Types.ObjectId(tenantId),
        });
        if (result.deletedCount === 0) throw new NotFoundException('Expense not found');
    }

    // ========== STATS ==========

    async getStaffStats(tenantId: string) {
        const staff = await this.staffModel.find({ tenantId: new Types.ObjectId(tenantId) });

        return {
            total: staff.length,
            active: staff.filter(s => s.status === StaffStatus.ACTIVE).length,
            onLeave: staff.filter(s => s.status === StaffStatus.ON_LEAVE).length,
            inactive: staff.filter(s => s.status === StaffStatus.INACTIVE).length,
        };
    }

    async getTimesheetStats(tenantId: string, staffId: string, month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const entries = await this.timeEntryModel.find({
            tenantId: new Types.ObjectId(tenantId),
            staffId: new Types.ObjectId(staffId),
            date: { $gte: startDate, $lte: endDate },
        });

        const totalMinutes = entries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
        const billableMinutes = entries
            .filter(e => e.isBillable)
            .reduce((sum, e) => sum + (e.durationMinutes || 0), 0);

        return {
            totalHours: Math.round((totalMinutes / 60) * 100) / 100,
            billableHours: Math.round((billableMinutes / 60) * 100) / 100,
            entriesCount: entries.length,
        };
    }
}
