import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

export enum AttachmentType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  LINK = 'link',
}

class Attachment {
  @Prop({ enum: AttachmentType })
  type: AttachmentType;

  @Prop()
  url: string;

  @Prop()
  name?: string;
}

class Content {
  @Prop()
  text?: string;

  @Prop({ type: [Attachment] })
  attachments?: Attachment[];
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Conversation' })
  conversationId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  senderId: Types.ObjectId;

  @Prop({ required: true, type: Content })
  content: Content;

  @Prop({ default: false })
  isRead?: boolean;

  @Prop()
  readAt?: Date;

  @Prop()
  createdAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes
MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ senderId: 1 });