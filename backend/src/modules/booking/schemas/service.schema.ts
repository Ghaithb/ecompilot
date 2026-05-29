import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({ timestamps: true })
export class Service {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    tenantId: Types.ObjectId;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String })
    description?: string;

    @Prop({ type: Number, required: true })
    price: number;

    @Prop({ type: Number, required: true, default: 60 })
    durationMinutes: number;

    @Prop({ type: String })
    category?: string;

    @Prop({ type: String })
    imageUrl?: string;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: Boolean, default: false })
    requiresDeposit: boolean;

    @Prop({ type: Number, default: 0 })
    depositPercentage: number;

    @Prop({ type: Number, default: 0 })
    depositFixedAmount: number;

    // Availability settings
    @Prop({ type: [Number], default: [1, 2, 3, 4, 5] }) // Mon-Fri by default
    availableDays: number[];

    @Prop({ type: String, default: '09:00' })
    availableFrom: string;

    @Prop({ type: String, default: '18:00' })
    availableTo: string;

    @Prop({ type: Number, default: 15 })
    slotIntervalMinutes: number;

    @Prop({ type: Number, default: 24 })
    minAdvanceBookingHours: number;

    @Prop({ type: Number, default: 30 })
    maxAdvanceBookingDays: number;

    // Staff assignment
    @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
    assignedStaffIds: Types.ObjectId[];

    @Prop({ type: Object, default: {} })
    metadata: Record<string, any>;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

ServiceSchema.index({ tenantId: 1, isActive: 1 });
