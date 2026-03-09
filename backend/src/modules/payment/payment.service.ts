import {
  Injectable,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
  TransactionStatus,
  TransactionType,
} from '../../entities/transaction.entity';
import { ZaloPayService } from './zalopay/zalopay.service';
import { TransactionsService } from '../transactions/transactions.service';
import { WalletTransactionType } from 'src/entities/wallet-transaction.entity';
import { WalletService } from '../wallet/wallet.service';
import { Bicycle, BicycleDocument, BicycleStatus } from 'src/entities';
import { BicyclesService } from '../bicycles/bicycles.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private zaloPayService: ZaloPayService,
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService,
    private readonly walletService: WalletService,
    @InjectModel(Bicycle.name) private bicycleModel: Model<BicycleDocument>,
  ) {}

  /**
   * Create ZaloPay payment URL
   */
  async createZaloPayPayment(
    transactionId: string,
    userId: string,
    userEmail: string,
    amount: number,
  ): Promise<{ order_url: string; app_trans_id: string }> {
    // Get transaction
    // const transaction = await this.transactionModel.findById(transactionId);

    // if (!transaction) {
    //   throw new BadRequestException('Transaction not found');
    // }

    // Build items for ZaloPay
    const items = [
      {
        itemid: userId,
        itemname: 'Bicycle Purchase',
        itemprice: amount,
        itemquantity: 1,
      },
    ];

    // Create ZaloPay order
    const zaloPayResponse = await this.zaloPayService.createPaymentOrder(
      amount,
      userEmail,
      transactionId,
      items,
      {
        bicycleId: userId,
        userId
      },
    );

    if (zaloPayResponse.return_code !== 1) {
      throw new BadRequestException(
        `ZaloPay error: ${zaloPayResponse.return_message}`,
      );
    }

    // Ensure required fields exist
    if (!zaloPayResponse.order_url || !zaloPayResponse.zp_trans_token) {
      throw new BadRequestException(
        'ZaloPay response missing order_url or transaction token',
      );
    }

    this.logger.log(`Created ZaloPay payment for transaction ${transactionId}`);

    return {
      order_url: zaloPayResponse.order_url,
      app_trans_id: zaloPayResponse.zp_trans_token,
    };
  }

  // ─── handleZaloPayCallback — credit wallet only, no business logic ────────────

  async handleZaloPayCallback(
    dataStr: string,
    mac: string,
  ): Promise<{ return_code: number; return_message: string }> {
    // ── 1. Verify MAC ──────────────────────────────────────────────────────
    const verification = this.zaloPayService.verifyCallback(dataStr, mac);
    if (!verification.isValid) {
      return { return_code: -1, return_message: 'mac not equal' };
    }

    const callbackData = verification.data;
    const embedData    = JSON.parse(callbackData.embed_data);

    const userId              = embedData.userId;
    const amount: number      = callbackData.amount;
    // const walletType: string  = embedData.walletType; // caller stamps this when creating the order

    this.logger.log(
      `Processing ZaloPay callback — user ${userId}, amount ${amount}`,
    );


    try {
      // ── 3. Credit wallet — sole job of this callback ───────────────────
      await this.walletService.credit(
        userId,
        amount,
        WalletTransactionType.SALE_PAYMENT,
        embedData.description ,
        { appTransId: callbackData.app_trans_id, ...embedData },
      );

      this.logger.log(
        `Credited ${amount} to wallet of user ${userId}`,
      );

      return { return_code: 1, return_message: 'success' };
    } catch (error) {
      this.logger.error(
        `ZaloPay callback credit failed for user ${userId}: ${error.message}`,
        error.stack,
      );
      return { return_code: 0, return_message: error.message };
    }
  }
  // async handleZaloPayCallback(
  //   dataStr: string,
  //   mac: string,
  // ): Promise<{
  //   return_code: number;
  //   return_message: string;
  // }> {
  //   // ── 1. Verify MAC ────────────────────────────────────────────────────────
  //   const verification = this.zaloPayService.verifyCallback(dataStr, mac);

  //   if (!verification.isValid) {
  //     return { return_code: -1, return_message: 'mac not equal' };
  //   }

  //   const callbackData = verification.data;
  //   const embedData = JSON.parse(callbackData.embed_data);
  //   const transactionId = embedData.transactionId;

  //   this.logger.log(
  //     `Processing ZaloPay callback for transaction ${transactionId}`,
  //   );

  //   try {
  //     // ── 2. Load transaction ───────────────────────────────────────────────
  //     const transaction = await this.transactionModel.findById(transactionId);

  //     if (!transaction) {
  //       return { return_code: -2, return_message: 'Transaction not found' };
  //     }

  //     const buyerId = transaction.buyerId.toString();
  //     const sellerId = transaction.sellerId.toString()
  //     const bicycleId = transaction.bicycleId.toString();
  //     const txId = transaction._id.toString();
  //     const amount = transaction.amount;

  //     // ── 3. Route by transaction type ─────────────────────────────────────
  //     switch (transaction.type) {
  //       // ── 3a. Platform fees (listing fee / inspection fee) ───────────────
  //       // Buyer pays a flat fee to the platform — debit buyer wallet, no escrow.
  //       case TransactionType.FEE:
  //       case TransactionType.INSPECTION_FEE: {
  //         transaction.status = TransactionStatus.COMPLETED;
  //         await transaction.save();

  //         await this.walletService.debit(
  //           sellerId,
  //           amount,
  //           transaction.type === TransactionType.FEE
  //             ? WalletTransactionType.FEE
  //             : WalletTransactionType.INSPECTION_FEE,
  //           `${transaction.type === TransactionType.FEE ? 'Listing' : 'Inspection'} fee for bicycle ${bicycleId}`,
  //           { transactionId: txId, bicycleId },
  //         );

  //         this.logger.log(
  //           `Fee transaction ${transactionId} completed (type: ${transaction.type})`,
  //         );
  //         break;
  //       }

  //       // ── 3b. Deposit payment (first instalment) ─────────────────────────
  //       // Buyer pays a deposit → hold in escrow, mark bicycle reserved.
  //       case TransactionType.DEPOSIT: {
  //         if (transaction.status === TransactionStatus.DEPOSIT_PAID) {
  //           await this.reserveBicycle(bicycleId);

  //           await this.transactionsService.confirmFullPayment(transactionId, {
  //             transactionId: txId,
  //           });

  //           this.logger.log(
  //             `Full payment (post-deposit) held in escrow for transaction ${transactionId}`,
  //           );

  //           break;
  //         }

  //         await this.reserveBicycle(transaction.bicycleId.toString());

  //         // Delegate status update + escrow hold to the service layer
  //         await this.transactionsService.confirmDepositPayment(transactionId, {
  //           transactionId: txId,
  //         });

  //         this.logger.log(
  //           `Deposit held in escrow for transaction ${transactionId}`,
  //         );
  //         break;
  //       }

  //       // ── 3c. Full payment after deposit (remaining balance) ─────────────
  //       // Buyer clears the remaining balance → move full amount to escrow.
  //       case TransactionType.FULL_PAYMENT: {
  //         transaction.status = TransactionStatus.PAYMENT_RECEIVED;
  //         await transaction.save();
  //         break;
  //       }

  //       default: {
  //         this.logger.warn(
  //           `Unhandled transaction type "${transaction.type}" for transaction ${transactionId}`,
  //         );
  //       }
  //     }

  //     this.logger.log(
  //       `ZaloPay callback processed successfully for transaction ${transactionId}`,
  //     );

  //     return { return_code: 1, return_message: 'success' };
  //   } catch (error) {
  //     this.logger.error(
  //       `ZaloPay callback processing failed for transaction ${transactionId}: ${error.message}`,
  //       error.stack,
  //     );
  //     return { return_code: 0, return_message: error.message };
  //   }
  // }

  // ── Private helper ──────────────────────────────────────────────────────────

  /**
   * Mark a bicycle as RESERVED. Throws if the bicycle is not found.
   */
  private async reserveBicycle(bicycleId: string): Promise<void> {
    const bicycle = await this.bicycleModel.findById(bicycleId);
    if (!bicycle) {
      throw new Error(`Bicycle ${bicycleId} not found`);
    }
    bicycle.status = BicycleStatus.RESERVED;
    await bicycle.save();
  }

  /**
   * Check payment status
   */
  async checkZaloPayStatus(transactionId: string): Promise<any> {
    const transaction = await this.transactionModel
      .findById(transactionId)
      .populate('buyerId', 'email profile.fullName')
      .populate('bicycleId', 'title price')
      .exec();

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    return {
      success: true,
      status: transaction.status,
      transactionId: transaction._id,
      amount: transaction.amount,
      timestamp: transaction.createdAt,
      buyerEmail: transaction.buyerId['email'],
      bicycleTitle: transaction.bicycleId['title'],
    };
  }
}
