// src/entities/wallet.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletDocument = Wallet & Document;

export enum WalletType {
  USER = 'user', // Individual user wallet
  ESCROW = 'escrow', // Temporary holding wallet
  PLATFORM = 'platform', // Platform commission wallet
}

export enum WalletStatus {
  ACTIVE = 'active',
  FROZEN = 'frozen', // Frozen due to dispute
  SUSPENDED = 'suspended', // Suspended by admin
}

@Schema({ timestamps: true })
export class Wallet {
  readonly _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: WalletType, default: WalletType.USER })
  type: WalletType;

  @Prop({ required: true, default: 0, min: 0 })
  balance: number; // Current balance in VND

  @Prop({ default: 0 })
  totalDeposited: number; // Lifetime deposits

  @Prop({ default: 0 })
  totalWithdrawn: number; // Lifetime withdrawals

  @Prop({ default: 0 })
  totalEarned: number; // For sellers: total earned from sales

  @Prop({ default: 0 })
  totalSpent: number; // For buyers: total spent on purchases

  @Prop({ default: 0 })
  pendingBalance: number; // Money in escrow (not yet available)

  @Prop({ enum: WalletStatus, default: WalletStatus.ACTIVE })
  status: WalletStatus;

  @Prop()
  lastTransactionAt?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

// Indexes
WalletSchema.index({ userId: 1 }, { unique: true });
WalletSchema.index({ type: 1 });
WalletSchema.index({ status: 1 });
