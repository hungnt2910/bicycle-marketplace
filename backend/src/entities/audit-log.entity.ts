import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: false })
export class AuditLog {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', nullable: true })
  adminId: Types.ObjectId;

  @Prop({ required: true })
  action: string;

  @Prop()
  entityType?: string;

  @Prop({ type: Types.ObjectId })
  entityId?: Types.ObjectId;

  @Prop({ type: Object })
  changes?: any;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ required: true })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes
AuditLogSchema.index({ adminId: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });