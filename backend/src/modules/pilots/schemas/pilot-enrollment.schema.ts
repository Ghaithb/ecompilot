import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PilotEnrollmentDocument = PilotEnrollment & Document;

@Schema({ timestamps: true })
export class PilotEnrollment {
  @Prop({ required: true, unique: true, type: Types.ObjectId, ref: 'Tenant' })
  tenantId: Types.ObjectId;

  @Prop({ default: 'landing' })
  source: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PilotEnrollmentSchema = SchemaFactory.createForClass(PilotEnrollment);
