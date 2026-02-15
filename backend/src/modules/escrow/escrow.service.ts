import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from '../../entities/transaction.entity';
import { AuditLog, AuditLogDocument } from '../../entities/audit-log.entity';
import { WalletService } from '../wallet/wallet.service';
import { WalletTransactionType } from 'src/entities/wallet-transaction.entity';

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>,
    private walletService: WalletService,
  ) {}

  /**
   * Hold funds in escrow (called when payment is received)
   */
  async holdFunds(transaction: TransactionDocument): Promise<void> {
    this.logger.log(
      `Holding ${transaction.amount} VND in escrow for transaction ${transaction._id}`,
    );

    // In production, this would call payment gateway API
    // For now, we just log the action

    await this.auditLogModel.create({
      adminId: new Types.ObjectId('000000000000000000000000'), // System placeholder
      action: 'escrow_hold_funds',
      entityType: 'Transaction',
      entityId: transaction._id,
      changes: {
        amount: transaction.amount,
        status: 'held_in_escrow',
      },
      timestamp: new Date(),
    });
  }

  /**
   * Release funds to seller (after buyer confirms or auto-confirm)
   */
  async releaseFunds(transaction: TransactionDocument): Promise<void> {
    // Check if fees exist and have commissionAmount
    const commissionAmount = transaction.fees?.commissionAmount || 0;
    const sellerAmount = transaction.amount;

    this.logger.log(
      `Releasing ${sellerAmount} VND to seller ${transaction.sellerId}`,
    );

    // In production, this would:
    // 1. Call payment gateway to transfer to seller
    // 2. Deduct platform commission
    // 3. Update seller's wallet/balance

    await this.auditLogModel.create({
      adminId: new Types.ObjectId('000000000000000000000000'), // System placeholder
      action: 'escrow_release_funds',
      entityType: 'Transaction',
      entityId: transaction._id,
      changes: {
        sellerAmount,
        platformCommission: commissionAmount,
        status: 'funds_released',
      },
      timestamp: new Date(),
    });
  }

  /**
   * Refund to buyer (if seller doesn't ship or dispute resolved)
   */
  async refundFunds(transaction: TransactionDocument): Promise<void> {
    this.logger.log(
      `Refunding ${transaction.amount} VND to buyer ${transaction.buyerId}`,
    );

    await this.walletService.credit(
      transaction.buyerId.toString(),
      transaction.amount,
      WalletTransactionType.REFUND,
      `Refund for transaction ${transaction._id}`,
      { transactionId: transaction._id.toString() },
    );

    // In production, this would call payment gateway refund API

    await this.auditLogModel.create({
      adminId: new Types.ObjectId('000000000000000000000000'), // System placeholder
      action: 'escrow_refund_funds',
      entityType: 'Transaction',
      entityId: transaction._id,
      changes: {
        refundAmount: transaction.amount,
        reason: 'Seller failed to ship or dispute resolved in buyer favor',
      },
      timestamp: new Date(),
    });
  }

  /**
   * Freeze transaction (when dispute is opened)
   */
  async freezeTransaction(transaction: TransactionDocument): Promise<void> {
    this.logger.log(`Freezing transaction ${transaction._id} due to dispute`);

    await this.auditLogModel.create({
      adminId: new Types.ObjectId('000000000000000000000000'), // System placeholder
      action: 'escrow_freeze_transaction',
      entityType: 'Transaction',
      entityId: transaction._id,
      changes: {
        status: 'frozen',
        reason: 'Dispute opened',
      },
      timestamp: new Date(),
    });
  }
}
