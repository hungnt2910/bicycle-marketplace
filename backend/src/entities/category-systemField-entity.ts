import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SettingCategory {
  @Prop({ required: true, unique: true })
  title: string;
}
export const SettingCategorySchema =
  SchemaFactory.createForClass(SettingCategory);
