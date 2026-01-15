import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  INSPECTOR = 'inspector',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

class Reputation {
  @Prop({ default: 0, min: 0, max: 5 })
  rating?: number;

  @Prop({ default: 0 })
  totalReviews?: number;

  @Prop({ default: 0 })
  totalSales?: number;

  @Prop({ default: 0 })
  totalInspections?: number;
}

@Schema({ timestamps: true })
export class User {
  readonly _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ sparse: true })
  phone?: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

   @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  avatar?: string;

  @Prop()
  address?: string;

  @Prop()
  city?: string;

  @Prop()
  district?: string;

  @Prop({ type: Reputation })
  reputation?: Reputation;

  @Prop({ default: UserStatus.ACTIVE, enum: UserStatus })
  status: UserStatus;

  @Prop({ default: false })
  verifiedPhone?: boolean;

  @Prop({ default: false })
  verifiedEmail?: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ 'reputation.rating': -1 });