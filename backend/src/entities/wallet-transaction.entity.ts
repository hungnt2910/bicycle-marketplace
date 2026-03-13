// src/entities/wallet-transaction.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletTransactionDocument = WalletTransaction & Document;

export enum WalletTransactionType {
  // Money IN (Credits)
  DEPOSIT = 'deposit',                    // User deposits money
  REFUND = 'refund',                      // Refund from cancelled order
  SALE_PAYMENT = 'sale_payment',          // Payment received from sale
  DISPUTE_REFUND = 'dispute_refund',      // Refund from won dispute
  
  // Money OUT (Debits)
  PURCHASE = 'purchase',                  // Payment for bicycle
  WITHDRAWAL = 'withdrawal',              // Withdraw to bank
  COMMISSION = 'commission',              // Platform commission deducted
  PENALTY = 'penalty',                    // Penalty fee
  
  // Internal transfers
  ESCROW_HOLD = 'escrow_hold',           // Money moved to escrow
  ESCROW_RELEASE = 'escrow_release',     // Money released from escrow

  FEE = 'fee',                // Fee for listing a bicycle
  INSPECTION_FEE = 'inspection_fee',                // Fee for using the service
}

export enum WalletTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class WalletTransaction {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Wallet' })
  walletId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: WalletTransactionType })
  type: WalletTransactionType;

  @Prop({ required: true })
  amount: number; // Positive for credit, negative for debit

  @Prop({ required: true })
  balanceBefore: number; // Balance before transaction

  @Prop({ required: true })
  balanceAfter: number; // Balance after transaction

  @Prop({ enum: WalletTransactionStatus, default: WalletTransactionStatus.COMPLETED })
  status: WalletTransactionStatus;

  @Prop()
  description: string;

  // Reference to related entities
  @Prop({ type: Types.ObjectId, ref: 'Transaction' })
  transactionId?: Types.ObjectId; // Related marketplace transaction

  @Prop({ type: Types.ObjectId, ref: 'Bicycle' })
  bicycleId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Dispute' })
  disputeId?: Types.ObjectId;

  // For withdrawals
  @Prop({ type: Object })
  withdrawalDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    processedAt?: Date;
  };

  // Metadata
  @Prop({ type: Object })
  metadata?: any;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const WalletTransactionSchema = SchemaFactory.createForClass(WalletTransaction);

// Indexes
WalletTransactionSchema.index({ walletId: 1, createdAt: -1 });
WalletTransactionSchema.index({ userId: 1, createdAt: -1 });
WalletTransactionSchema.index({ transactionId: 1 });
WalletTransactionSchema.index({ type: 1 });
WalletTransactionSchema.index({ status: 1 });