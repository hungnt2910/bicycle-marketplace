import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  NEW_MESSAGE = 'new_message',
  LISTING_APPROVED = 'listing_approved',
  LISTING_REJECTED = 'listing_rejected',
  INSPECTION_SCHEDULED = 'inspection_scheduled',
  INSPECTION_COMPLETED = 'inspection_completed',
  PAYMENT_RECEIVED = 'payment_received',
  ITEM_SOLD = 'item_sold',
  ITEM_SHIPPED = 'item_shipped',
  ITEM_DELIVERED = 'item_delivered',
  REVIEW_RECEIVED = 'review_received',
  DISPUTE_OPENED = 'dispute_opened',
  DISPUTE_RESOLVED = 'dispute_resolved',
  PRICE_DROP = 'price_drop',
  WISHLIST_ITEM_AVAILABLE = 'wishlist_item_available',
}

export enum EntityType {
  BICYCLE = 'bicycle',
  TRANSACTION = 'transaction',
  MESSAGE = 'message',
  REVIEW = 'review',
  DISPUTE = 'dispute',
}

class RelatedEntity {
  @Prop({ enum: EntityType })
  entityType?: EntityType;

  @Prop({ type: Types.ObjectId })
  entityId?: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop()
  title?: string;

  @Prop()
  message?: string;

  @Prop({ type: RelatedEntity })
  relatedEntity?: RelatedEntity;

  @Prop({ default: false })
  isRead?: boolean;

  @Prop()
  readAt?: Date;

  @Prop()
  createdAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });