import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

export interface Message {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  text: string;
  timestamp: Date;
  intent?: string;
  entities?: Record<string, any>;
  confidence?: number;
  buttons?: Array<{
    title: string;
    payload: string;
  }>;
  quickReplies?: string[];
  metadata?: Record<string, any>;
}

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ 
    type: String, 
    enum: ['web', 'whatsapp', 'facebook', 'instagram', 'telegram'],
    default: 'web'
  })
  channel: string;

  @Prop({ 
    type: String, 
    enum: ['active', 'closed', 'resolved', 'escalated', 'abandoned'],
    default: 'active'
  })
  status: string;

  @Prop({ required: true, default: Date.now })
  startedAt: Date;

  @Prop()
  endedAt?: Date;

  @Prop({ type: [Object], default: [] })
  messages: Message[];

  @Prop()
  currentIntent?: string;

  @Prop({ type: Number, min: 0, max: 1 })
  averageConfidence?: number;

  @Prop({ type: Boolean, default: false })
  resolved: boolean;

  @Prop({ type: Number, min: 1, max: 5 })
  satisfaction?: number;

  @Prop({ type: String })
  satisfactionFeedback?: string;

  @Prop({ type: Object, default: {} })
  metadata: {
    userAgent?: string;
    location?: string;
    referrer?: string;
    ipAddress?: string;
    deviceType?: string;
    language?: string;
  };

  @Prop({ type: Object, default: {} })
  context: Record<string, any>;

  @Prop()
  escalatedToAgent?: string;

  @Prop()
  escalationReason?: string;

  @Prop({ type: Date })
  escalatedAt?: Date;

  @Prop({ type: Number, default: 0 })
  messageCount: number;

  @Prop({ type: Number })
  duration?: number; // En secondes

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Boolean, default: false })
  isTest: boolean;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Indexes pour performance
ConversationSchema.index({ userId: 1, tenantId: 1 });
ConversationSchema.index({ status: 1, createdAt: -1 });
ConversationSchema.index({ channel: 1 });
ConversationSchema.index({ 'messages.timestamp': -1 });
