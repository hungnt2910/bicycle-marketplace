import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

export enum TransactionType {
  DEPOSIT = 'deposit',
  FULL_PAYMENT = 'full_payment',
  FEE = 'fee',
  REFUND = 'refund',
  DISPUTE_REFUND = 'dispute_refund',
  COMMISSION = 'commission',
  PENALTY = 'penalty',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  E_WALLET = 'e_wallet',
  CREDIT_CARD = 'credit_card',
  CASH = 'cash',
}

export enum TransactionStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAYMENT_RECEIVED = 'payment_received',
  HELD_IN_ESCROW = 'held_in_escrow',
  AWAITING_DELIVERY = 'awaiting_delivery',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

class Escrow {
  @Prop()
  heldAmount?: number;

  @Prop()
  releaseDate?: Date;

  @Prop()
  autoReleaseDeadline?: Date;
}

class Payment {
  @Prop({ enum: PaymentMethod })
  method?: PaymentMethod;

  @Prop()
  transactionId?: string;

  @Prop()
  paidAt?: Date;
}

class Fees {
  @Prop()
  platformFee?: number;

  @Prop()
  commissionRate?: number;

  @Prop()
  commissionAmount?: number;

  @Prop()
  shippingFee?: number;
}

class Shipping {
  @Prop()
  provider?: string;

  @Prop()
  trackingNumber?: string;

  @Prop()
  shippedAt?: Date;

  @Prop()
  deliveredAt?: Date;
}

class Dispute {
  @Prop({ default: false })
  isDisputed?: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Dispute' })
  disputeId?: Types.ObjectId;

  @Prop()
  reason?: string;

  @Prop()
  filedAt?: Date;
}

class BuyerConfirmation {
  @Prop({ default: false })
  confirmed?: boolean;

  @Prop()
  confirmedAt?: Date;

  @Prop()
  notes?: string;
}

@Schema({ timestamps: true })
export class Transaction {
  readonly _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  buyerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  sellerId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Bicycle' })
  bicycleId: Types.ObjectId;

  @Prop({ enum: TransactionType })
  type?: TransactionType;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ type: Escrow })
  escrow?: Escrow;

  @Prop({ type: Payment })
  payment?: Payment;

  @Prop({ type: Fees })
  fees?: Fees;

  @Prop({ required: true, enum: TransactionStatus })
  status: TransactionStatus;

  @Prop({ type: Shipping })
  shipping?: Shipping;

  @Prop({ type: Dispute })
  dispute?: Dispute;

  @Prop({ type: BuyerConfirmation })
  buyerConfirmation?: BuyerConfirmation;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  completedAt?: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Indexes
TransactionSchema.index({ buyerId: 1 });
TransactionSchema.index({ sellerId: 1 });
TransactionSchema.index({ bicycleId: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ 'escrow.autoReleaseDeadline': 1 });