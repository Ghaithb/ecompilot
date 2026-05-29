import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StaffDocument = Staff & Document;
export type TimeEntryDocument = TimeEntry & Document;
export type ExpenseDocument = Expense & Document;

export enum StaffRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    EMPLOYEE = 'employee',
    FREELANCER = 'freelancer',
}

export enum StaffStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ON_LEAVE = 'on_leave',
    TERMINATED = 'terminated',
}

export enum ExpenseStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    REIMBURSED = 'reimbursed',
}

@Schema({ timestamps: true })
export class Staff {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    tenantId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId?: Types.ObjectId;

    @Prop({ type: String, required: true })
    firstName: string;

    @Prop({ type: String, required: true })
    lastName: string;

    @Prop({ type: String, required: true })
    email: string;

    @Prop({ type: String })
    phone?: string;

    @Prop({ type: String, enum: StaffRole, default: StaffRole.EMPLOYEE })
    role: StaffRole;

    @Prop({ type: String, enum: StaffStatus, default: StaffStatus.ACTIVE })
    status: StaffStatus;

    @Prop({ type: String })
    position?: string;

    @Prop({ type: String })
    department?: string;

    @Prop({ type: Date })
    hireDate?: Date;

    @Prop({ type: Number })
    hourlyRate?: number;

    @Prop({ type: Number })
    monthlySalary?: number;

    @Prop({ type: String })
    avatarUrl?: string;

    @Prop({ type: String })
    address?: string;

    @Prop({ type: String })
    emergencyContact?: string;

    @Prop({ type: String })
    emergencyPhone?: string;

    // Schedule settings
    @Prop({ type: [Number], default: [1, 2, 3, 4, 5] }) // Mon-Fri
    workingDays: number[];

    @Prop({ type: String, default: '09:00' })
    workStartTime: string;

    @Prop({ type: String, default: '18:00' })
    workEndTime: string;

    // Permissions (RBAC)
    @Prop({ type: [String], default: [] })
    permissions: string[];

    @Prop({ type: Object, default: {} })
    metadata: Record<string, any>;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);

@Schema({ timestamps: true })
export class TimeEntry {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    tenantId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Staff', required: true })
    staffId: Types.ObjectId;

    @Prop({ type: Date, required: true })
    date: Date;

    @Prop({ type: Date, required: true })
    startTime: Date;

    @Prop({ type: Date })
    endTime?: Date;

    @Prop({ type: Number })
    durationMinutes?: number;

    @Prop({ type: String })
    description?: string;

    @Prop({ type: Types.ObjectId, ref: 'Booking' })
    bookingId?: Types.ObjectId;

    @Prop({ type: String })
    projectName?: string;

    @Prop({ type: Boolean, default: false })
    isBillable: boolean;

    @Prop({ type: Number })
    billableRate?: number;
}

export const TimeEntrySchema = SchemaFactory.createForClass(TimeEntry);

@Schema({ timestamps: true })
export class Expense {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    tenantId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Staff', required: true })
    staffId: Types.ObjectId;

    @Prop({ type: String, required: true })
    category: string;

    @Prop({ type: String, required: true })
    description: string;

    @Prop({ type: Number, required: true })
    amount: number;

    @Prop({ type: String, default: 'EUR' })
    currency: string;

    @Prop({ type: Date, required: true })
    date: Date;

    @Prop({ type: String })
    receiptUrl?: string;

    @Prop({ type: String, enum: ExpenseStatus, default: ExpenseStatus.PENDING })
    status: ExpenseStatus;

    @Prop({ type: Types.ObjectId, ref: 'Staff' })
    approvedBy?: Types.ObjectId;

    @Prop({ type: Date })
    approvedAt?: Date;

    @Prop({ type: String })
    rejectionReason?: string;

    @Prop({ type: Object, default: {} })
    metadata: Record<string, any>;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

// Indexes
StaffSchema.index({ tenantId: 1, email: 1 });
StaffSchema.index({ tenantId: 1, status: 1 });
TimeEntrySchema.index({ tenantId: 1, staffId: 1, date: 1 });
ExpenseSchema.index({ tenantId: 1, staffId: 1, status: 1 });
