import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SystemSettingDocument = SystemSetting & Document;

export enum SettingCategory {
  FEES = 'fees',
  LIMITS = 'limits',
  FEATURES = 'features',
  GENERAL = 'general',
}

@Schema({ timestamps: true })
export class SystemSetting {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true, type: Object })
  value: any;

  @Prop()
  description?: string;

  @Prop({ enum: SettingCategory })
  category?: SettingCategory;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop()
  updatedAt?: Date;
}

export const SystemSettingSchema = SchemaFactory.createForClass(SystemSetting);

// Indexes
SystemSettingSchema.index({ key: 1 }, { unique: true });