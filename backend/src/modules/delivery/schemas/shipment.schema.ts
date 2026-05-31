import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShipmentDocument = Shipment & Document;

@Schema({ _id: false })
export class TrackingEventEntry {
  @Prop({ required: true })
  status: string;

  @Prop()
  location?: string;

  @Prop()
  description?: string;

  @Prop({ default: Date.now })
  occurredAt: Date;
}

@Schema({ timestamps: true })
export class Shipment {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId?: Types.ObjectId;

  @Prop()
  orderNumber?: string;

  @Prop({ required: true })
  provider: string;

  @Prop({ required: true, index: true })
  trackingNumber: string;

  @Prop()
  providerRef?: string;

  @Prop()
  labelUrl?: string;

  @Prop({ default: 'created' })
  status: string;

  @Prop({ type: [TrackingEventEntry], default: [] })
  trackingHistory: TrackingEventEntry[];

  @Prop()
  localityId?: number;

  @Prop({ default: false })
  mock: boolean;

  @Prop({ type: Object })
  rawResponse?: Record<string, unknown>;

  @Prop()
  lastSyncedAt?: Date;

  @Prop()
  lastWebhookAt?: Date;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;
}

export const ShipmentSchema = SchemaFactory.createForClass(Shipment);
ShipmentSchema.index({ tenantId: 1, createdAt: -1 });
ShipmentSchema.index({ tenantId: 1, provider: 1, status: 1 });
ShipmentSchema.index({ tenantId: 1, trackingNumber: 1 });
ShipmentSchema.index({ status: 1, lastWebhookAt: 1, lastSyncedAt: 1 });
