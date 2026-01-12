import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InspectionReportDocument = InspectionReport & Document;

export enum InspectionType {
  ONSITE = 'onsite',
  ONLINE = 'online',
}

export enum ComponentCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  NA = 'n/a',
}

export enum InspectionVerdict {
  APPROVED = 'approved',
  APPROVED_WITH_CONDITIONS = 'approved_with_conditions',
  REJECTED = 'rejected',
}

class ComponentCheck {
  @Prop({ enum: ComponentCondition })
  condition?: ComponentCondition;

  @Prop({ type: [String] })
  issues?: string[];

  @Prop()
  notes?: string;
}

class TechnicalChecks {
  @Prop({ type: ComponentCheck })
  frame?: ComponentCheck;

  @Prop({ type: ComponentCheck })
  brakes?: ComponentCheck;

  @Prop({ type: ComponentCheck })
  drivetrain?: ComponentCheck;

  @Prop({ type: ComponentCheck })
  wheels?: ComponentCheck;

  @Prop({ type: ComponentCheck })
  suspension?: ComponentCheck;
}

class InspectionMedia {
  @Prop({ type: [String] })
  photos?: string[];

  @Prop({ type: [String] })
  videos?: string[];
}

@Schema({ timestamps: true })
export class InspectionReport {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  inspectorId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Bicycle' })
  bicycleId: Types.ObjectId;

  @Prop({ enum: InspectionType })
  inspectionType?: InspectionType;

  @Prop({ type: TechnicalChecks })
  technicalChecks?: TechnicalChecks;

  @Prop({ min: 1, max: 10 })
  overallRating?: number;

  @Prop({ enum: InspectionVerdict })
  verdict?: InspectionVerdict;

  @Prop()
  recommendations?: string;

  @Prop({ type: InspectionMedia })
  media?: InspectionMedia;

  @Prop()
  inspectionFee?: number;

  @Prop({ default: false })
  isPaid?: boolean;

  @Prop()
  validUntil?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const InspectionReportSchema = SchemaFactory.createForClass(InspectionReport);

// Indexes
InspectionReportSchema.index({ inspectorId: 1 });
InspectionReportSchema.index({ bicycleId: 1 });
InspectionReportSchema.index({ verdict: 1 });
InspectionReportSchema.index({ createdAt: -1 });
InspectionReportSchema.index({ validUntil: 1 });