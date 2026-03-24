import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from '../../entities/transaction.entity';
import { AuditLog, AuditLogDocument } from '../../entities/audit-log.entity';
import { WalletService } from '../wallet/wallet.service';
import {
  WalletTransactionDocument,
  WalletTransactionType,
} from 'src/entities/wallet-transaction.entity';
import { User, UserDocument } from 'src/entities';

// Placeholder system actor used in audit logs for automated operations
const SYSTEM_ACTOR_ID = new Types.ObjectId('000000000000000000000000');

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private walletService: WalletService,
  ) {}

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Resolve a transaction by id or use an already-loaded document.
   */
  private async resolveTransaction(
    transactionOrId: TransactionDocument | string,
  ): Promise<TransactionDocument> {
    if (typeof transactionOrId === 'string') {
      const tx = await this.transactionModel.findById(transactionOrId);
      if (!tx) {
        throw new NotFoundException(
          `Transaction ${transactionOrId} not found`,
        );
      }
      return tx;
    }
    return transactionOrId;
  }

  /**
   * Write an audit log entry for escrow operations.
   */
  private async writeAuditLog(
    action: string,
    transaction: TransactionDocument,
    changes: Record<string, unknown>,
  ): Promise<void> {
    await this.auditLogModel.create({
      adminId: SYSTEM_ACTOR_ID,
      action,
      entityType: 'Transaction',
      entityId: transaction._id,
      changes,
      timestamp: new Date(),
    });
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Hold funds in escrow when a buyer's payment is received.
   *
   * Debits the buyer's wallet and marks the amount as pending so it cannot
   * be spent until the transaction is resolved.
   */
  async holdFunds(
    transaction: TransactionDocument | string,
  ): Promise<WalletTransactionDocument> {
    const tx = await this.resolveTransaction(transaction);

    this.logger.log(
      `Holding ${tx.amount} VND in escrow for transaction ${tx._id}`,
    );

    const walletTx = await this.walletService.holdInEscrow(
      tx.buyerId.toString(),
      tx.amount,
      tx._id.toString(),
    );

    await this.writeAuditLog('escrow_hold_funds', tx, {
      amount: tx.amount,
      buyerId: tx.buyerId,
      status: 'held_in_escrow',
    });

    return walletTx;
  }

  /**
   * Release funds to the seller after the buyer confirms receipt (or after
   * the auto-confirm window expires).
   *
   * Platform commission is deducted from the seller's payout automatically
   * if `fees.commissionAmount` is set on the transaction.
   */
  async releaseFunds(
    transaction: TransactionDocument | string,
  ): Promise<WalletTransactionDocument> {
    const tx = await this.resolveTransaction(transaction);

    const commissionAmount = tx.fees?.commissionAmount ?? 0;
    const sellerAmount = tx.amount - commissionAmount;

    this.logger.log(
      `Releasing ${sellerAmount} VND to seller ${tx.sellerId} ` +
        `(commission: ${commissionAmount} VND) for transaction ${tx._id}`,
    );

    const walletTx = await this.walletService.releaseFromEscrow(
      tx.sellerId.toString(),
      sellerAmount,
      tx._id.toString(),
    );

    await this.writeAuditLog('escrow_release_funds', tx, {
      sellerAmount,
      platformCommission: commissionAmount,
      status: 'funds_released',
    });

    return walletTx;
  }

  /**
   * Refund funds to the buyer when the seller fails to ship or a dispute is
   * resolved in the buyer's favour.
   */
  async refundFunds(
    transaction: TransactionDocument | string,
  ): Promise<WalletTransactionDocument> {
    const tx = await this.resolveTransaction(transaction);

    this.logger.log(
      `Refunding ${tx.amount} VND to buyer ${tx.buyerId} for transaction ${tx._id}`,
    );

    const walletTx = await this.walletService.credit(
      tx.buyerId.toString(),
      tx.amount,
      WalletTransactionType.REFUND,
      `Refund for transaction ${tx._id}`,
      { transactionId: tx._id.toString() },
    );

    await this.writeAuditLog('escrow_refund_funds', tx, {
      refundAmount: tx.amount,
      buyerId: tx.buyerId,
      reason: 'Seller failed to ship or dispute resolved in buyer favour',
    });

    return walletTx;
  }

  /**
   * Freeze escrow when a dispute is opened.
   *
   * No money moves at this point — the freeze is a logical flag recorded in
   * the audit trail so that automated release is blocked until the dispute is
   * resolved.
   */
  async freezeTransaction(
    transaction: TransactionDocument | string,
  ): Promise<void> {
    const tx = await this.resolveTransaction(transaction);

    this.logger.log(
      `Freezing transaction ${tx._id} due to dispute`,
    );

    await this.writeAuditLog('escrow_freeze_transaction', tx, {
      status: 'frozen',
      reason: 'Dispute opened',
    });
  }

  /**
   * Unfreeze escrow once a dispute is closed without a refund (e.g. resolved
   * in the seller's favour). Call `releaseFunds` afterwards to pay out.
   */
  async unfreezeTransaction(
    transaction: TransactionDocument | string,
  ): Promise<void> {
    const tx = await this.resolveTransaction(transaction);

    this.logger.log(`Unfreezing transaction ${tx._id}`);

    await this.writeAuditLog('escrow_unfreeze_transaction', tx, {
      status: 'unfrozen',
      reason: 'Dispute resolved',
    });
  }
}