import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WishlistDocument = Wishlist & Document;

@Schema({ timestamps: true })
export class Wishlist {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Bicycle' })
  bicycleId: Types.ObjectId;

  @Prop()
  notes?: string;

  @Prop()
  createdAt?: Date;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

// Indexes
WishlistSchema.index({ userId: 1, bicycleId: 1 }, { unique: true });
WishlistSchema.index({ userId: 1 });
WishlistSchema.index({ bicycleId: 1 });