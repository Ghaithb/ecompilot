import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProviderCredentialDocument = ProviderCredential & Document;

@Schema({ timestamps: true })
export class ProviderCredential {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  provider: string;

  @Prop({ required: true })
  encryptedToken: string;

  @Prop({ required: true })
  iv: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  label?: string;

  /** URL API personnalisée (BYO endpoint partenaire). */
  @Prop()
  apiUrl?: string;

  @Prop({ type: Object })
  extra?: Record<string, string>;
}

export const ProviderCredentialSchema = SchemaFactory.createForClass(ProviderCredential);
ProviderCredentialSchema.index({ tenantId: 1, provider: 1 }, { unique: true });
