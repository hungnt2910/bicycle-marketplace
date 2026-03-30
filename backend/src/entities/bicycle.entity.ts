import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BicycleDocument = Bicycle & Document;

export enum FrameMaterial {
  ALUMINUM = 'aluminum',
  CARBON = 'carbon',
  STEEL = 'steel',
  TITANIUM = 'titanium',
  ALLOY = 'alloy',
}

export enum BrakeType {
  DISC = 'disc',
  RIM = 'rim',
  HYDRAULIC = 'hydraulic',
  MECHANICAL = 'mechanical',
}

export enum Suspension {
  NONE = 'none',
  FRONT = 'front',
  FULL = 'full',
  REAR = 'rear',
}

export enum ConditionOverall {
  NEW = 'new',
  LIKE_NEW = 'like-new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

export enum BicycleStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  ACTIVE = 'active',
  SOLD = 'sold',
  RESERVED = 'reserved',
  HIDDEN = 'hidden',
  REJECTED = 'rejected',
}

class Specifications {
  @Prop()
  type?: string;

  @Prop()
  brand?: string;

  @Prop()
  model?: string;

  @Prop()
  frameSize?: string;

  @Prop({ enum: FrameMaterial })
  frameMaterial?: FrameMaterial;

  @Prop()
  year?: number;

  @Prop()
  color?: string;

  @Prop()
  weight?: number;

  @Prop()
  wheelSize?: string;

  @Prop()
  gears?: number;

  @Prop({ enum: BrakeType })
  brakeType?: BrakeType;

  @Prop({ enum: Suspension })
  suspension?: Suspension;
}

class Condition {
  @Prop({ enum: ConditionOverall })
  overall?: ConditionOverall;

  @Prop()
  usageHistory?: string;

  @Prop()
  mileage?: number;

  @Prop()
  lastServiceDate?: Date;
}

class MediaItem {
  @Prop()
  url: string;

  @Prop()
  publicId: string;
}

class VideoItem {
  @Prop()
  url: string;

  @Prop()
  publicId: string;

  @Prop()
  duration?: number;

  @Prop()
  thumbnail?: string;
}

class Media {
  @Prop({ type: [MediaItem] })
  images?: MediaItem[];

  @Prop({ type: [VideoItem] })
  videos?: VideoItem[];

  @Prop()
  mainImage?: MediaItem;
}

class Inspection {
  @Prop({ default: false })
  isInspected?: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  inspectorId?: Types.ObjectId;

  @Prop()
  inspectionDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'InspectionReport' })
  reportId?: Types.ObjectId;

  @Prop()
  expiryDate?: Date;

  @Prop()
  label?: string;
}

class Location {
  @Prop()
  city?: string;

  @Prop()
  district?: string;

  @Prop()
  address?: string;
}

class Pricing {
  @Prop({ default: 0 })
  listingFee?: number;

  @Prop()
  commissionRate?: number;

  @Prop({ default: false })
  isPaid?: boolean;
}

@Schema({ timestamps: true })
export class Bicycle {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  sellerId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ type: Specifications })
  specifications?: Specifications;

  @Prop({ type: Condition })
  condition?: Condition;

  @Prop({ type: Media })
  media?: Media;

  @Prop({ type: Inspection })
  inspection?: Inspection;

  @Prop({ required: true, enum: BicycleStatus, default: BicycleStatus.DRAFT })
  status: BicycleStatus;

  @Prop({ type: Location })
  location?: Location;

  @Prop({ default: 0 })
  views?: number;

  @Prop({ default: 0 })
  favoriteCount?: number;

  @Prop({ type: Pricing })
  pricing?: Pricing;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  soldAt?: Date;
}

export const BicycleSchema = SchemaFactory.createForClass(Bicycle);

// Indexes
BicycleSchema.index({ sellerId: 1 });
BicycleSchema.index({ status: 1 });
BicycleSchema.index({ 'specifications.type': 1 });
BicycleSchema.index({ 'specifications.brand': 1 });
BicycleSchema.index({ price: 1 });
BicycleSchema.index({ 'inspection.isInspected': 1 });
BicycleSchema.index({ createdAt: -1 });
BicycleSchema.index({
  title: 'text',
  description: 'text',
  'specifications.brand': 'text',
});
