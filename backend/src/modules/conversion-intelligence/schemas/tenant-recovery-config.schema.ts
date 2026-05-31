import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantRecoveryConfigDocument = TenantRecoveryConfig & Document;

@Schema({ timestamps: true })
export class TenantRecoveryConfig {
  @Prop({ required: true, unique: true, index: true })
  tenantId: string;

  @Prop({ default: true })
  discountEnabled: boolean;

  @Prop({ default: 10 })
  maxDiscountPercent: number;

  @Prop({ default: 'default' })
  experimentSalt: string;
}

export const TenantRecoveryConfigSchema = SchemaFactory.createForClass(TenantRecoveryConfig);
