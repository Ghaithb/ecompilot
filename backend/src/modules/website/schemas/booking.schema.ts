import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop({ required: true })
  time: string; // HH:MM

  @Prop({ required: true })
  guests: number;

  @Prop({ type: Object, required: true })
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };

  @Prop({ default: 'pending' })
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';

  @Prop()
  notes?: string;

  @Prop({ default: 'website' })
  source: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Index pour recherches rapides
BookingSchema.index({ tenantId: 1, date: 1, time: 1 });
BookingSchema.index({ tenantId: 1, status: 1 });
BookingSchema.index({ 'customer.email': 1 });
