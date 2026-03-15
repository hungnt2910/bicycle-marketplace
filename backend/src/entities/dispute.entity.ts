import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DisputeDocument = Dispute & Document;

export enum DisputeReason {
  ITEM_NOT_RECEIVED = 'item_not_received',
  ITEM_NOT_AS_DESCRIBED = 'item_not_as_described',
  DAMAGED_ITEM = 'damaged_item',
  COUNTERFEIT_PARTS = 'counterfeit_parts',
  SELLER_UNRESPONSIVE = 'seller_unresponsive',
  BUYER_REFUSING_DELIVERY = 'buyer_refusing_delivery',
  OTHER = 'other',
}

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  AWAITING_EVIDENCE = 'awaiting_evidence',
  RESOLVED_BUYER_FAVOR = 'resolved_buyer_favor',
  RESOLVED_SELLER_FAVOR = 'resolved_seller_favor',
  RESOLVED_PARTIAL_REFUND = 'resolved_partial_refund',
  RETURN_REQUESTED = 'return_requested',
  AWAITING_SELLER_CONFIRMATION = 'awaiting_seller_confirmation',
  RETURN_RECEIVED = 'return_received',
  CLOSED = 'closed',
}

class Evidence {
  @Prop({ type: [String] })
  photos?: string[];

  @Prop({ type: [String] })
  videos?: string[];

  @Prop({ type: [String] })
  documents?: string[];
}

class InspectorReport {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  inspectorId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'InspectionReport' })
  reportId?: Types.ObjectId;

  @Prop()
  comparisonNotes?: string;
}

class Resolution {
  @Prop()
  decision?: string;

  @Prop()
  refundAmount?: number;

  @Prop()
  penaltyToSeller?: number;

  @Prop()
  penaltyToBuyer?: number;

  @Prop()
  notes?: string;

  @Prop()
  requireReturn?: boolean;

  @Prop()
  resolvedAt?: Date;
}

class ReturnInfo {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  sentByBuyerId?: Types.ObjectId;

  @Prop()
  trackingInfo?: string;

  @Prop()
  sentAt?: Date;

  @Prop()
  sellerConfirmedAt?: Date;
}

class TimelineEntry {
  @Prop()
  action: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  performedBy: Types.ObjectId;

  @Prop()
  notes?: string;

  @Prop()
  timestamp: Date;
}

@Schema({ timestamps: true })
export class Dispute {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Transaction' })
  transactionId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  reporterId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reportedUserId?: Types.ObjectId;

  @Prop({ required: true, enum: DisputeReason })
  reason: DisputeReason;

  @Prop()
  description?: string;

  @Prop({ type: Evidence })
  evidence?: Evidence;

  @Prop({ type: InspectorReport })
  inspectorReport?: InspectorReport;

  @Prop({ required: true, enum: DisputeStatus })
  status: DisputeStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedAdminId?: Types.ObjectId;

  @Prop({ type: Resolution })
  resolution?: Resolution;

  @Prop({ type: ReturnInfo })
  returnInfo?: ReturnInfo;

  @Prop({ type: [TimelineEntry], default: [] })
  timeline?: TimelineEntry[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  resolvedAt?: Date;
}

export const DisputeSchema = SchemaFactory.createForClass(Dispute);

// Indexes
DisputeSchema.index({ transactionId: 1 });
DisputeSchema.index({ reporterId: 1 });
DisputeSchema.index({ status: 1 });
DisputeSchema.index({ assignedAdminId: 1 });
DisputeSchema.index({ createdAt: -1 });