import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

export enum ReviewStatus {
  ACTIVE = 'active',
  HIDDEN = 'hidden',
  FLAGGED = 'flagged',
}

class Aspects {
  @Prop({ min: 1, max: 5 })
  communication?: number;

  @Prop({ min: 1, max: 5 })
  accuracy?: number;

  @Prop({ min: 1, max: 5 })
  professionalism?: number;
}

class Response {
  @Prop()
  text?: string;

  @Prop()
  respondedAt?: Date;
}

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  reviewerId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  reviewedUserId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Transaction' })
  transactionId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Bicycle' })
  bicycleId?: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  comment?: string;

  @Prop({ type: Aspects })
  aspects?: Aspects;

  @Prop({ default: false })
  isVerifiedPurchase?: boolean;

  @Prop({ type: Response })
  response?: Response;

  @Prop({ default: ReviewStatus.ACTIVE, enum: ReviewStatus })
  status: ReviewStatus;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Indexes
ReviewSchema.index({ reviewerId: 1 });
ReviewSchema.index({ reviewedUserId: 1 });
ReviewSchema.index({ transactionId: 1 });
ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ createdAt: -1 });