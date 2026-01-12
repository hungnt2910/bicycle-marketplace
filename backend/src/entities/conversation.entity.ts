import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  BLOCKED = 'blocked',
}

class LastMessage {
  @Prop()
  text?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  senderId?: Types.ObjectId;

  @Prop()
  timestamp?: Date;
}

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, type: [{ type: Types.ObjectId, ref: 'User' }] })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Bicycle' })
  bicycleId?: Types.ObjectId;

  @Prop({ type: LastMessage })
  lastMessage?: LastMessage;

  @Prop({ type: Map, of: Number })
  unreadCount?: Map<string, number>;

  @Prop({ default: ConversationStatus.ACTIVE, enum: ConversationStatus })
  status?: ConversationStatus;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Indexes
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ bicycleId: 1 });
ConversationSchema.index({ updatedAt: -1 });