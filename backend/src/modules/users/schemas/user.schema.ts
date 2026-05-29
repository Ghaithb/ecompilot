import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  @Prop({ type: Object, default: {} })
  permissions: Record<string, boolean>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  companyName?: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  avatar?: string;

  @Prop({ type: Object, default: { emailNotifications: true, pushNotifications: true, darkMode: false, language: 'fr' } })
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    darkMode: boolean;
    language: string;
  };

  @Prop()
  lastLoginAt: Date;

  // Email verification
  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  emailVerificationExpires?: Date;

  @Prop()
  emailVerificationCode?: string;

  @Prop()
  emailVerificationCodeExpires?: Date;

  // Password reset
  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index pour optimiser les requêtes
UserSchema.index({ email: 1, tenantId: 1 }, { unique: true });
// Note: Pas besoin d'index séparé sur tenantId, l'index composé suffit

