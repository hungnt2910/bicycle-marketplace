import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SystemSettingDocument = SystemSetting & Document;

//bộ mô tả setting: mô tả 1 giá trị setting
class bo_gia_tri_setting {
  key: string;
  value: any;
  description?: string;
}

@Schema({ timestamps: true })
export class SystemSetting {
  @Prop({ required: true, unique: true })
  name_value: [bo_gia_tri_setting];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop()
  updatedAt?: Date;
}

export const SystemSettingSchema = SchemaFactory.createForClass(SystemSetting);

// Indexes
SystemSettingSchema.index({ key: 1 }, { unique: true });
