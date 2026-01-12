import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

export enum CategoryType {
  BICYCLE_TYPE = 'bicycle_type',
  BRAND = 'brand',
}

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: CategoryType })
  type: CategoryType;

  @Prop({ unique: true })
  slug?: string;

  @Prop()
  description?: string;

  @Prop()
  icon?: string;

  @Prop({ default: true })
  isActive?: boolean;

  @Prop()
  sortOrder?: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Indexes
CategorySchema.index({ type: 1, name: 1 });
CategorySchema.index({ slug: 1 }, { unique: true });