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
    userEmail: string,
    depositAmount?: number,
  ): Promise<{ order_url: string; app_trans_id: string }> {
    // Get transaction
    const transaction = await this.transactionModel.findById(transactionId);

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.PENDING_PAYMENT && transaction.status !== TransactionStatus.DEPOSIT_PAID) {
      throw new BadRequestException('Transaction is not pending payment');
    }

    // Build items for ZaloPay
    const items = [
      {
        itemid: transaction.bicycleId.toString(),
        itemname: 'Bicycle Purchase',
        itemprice: transaction.amount,
        itemquantity: 1,
      },
    ];

    // Create ZaloPay order
    const zaloPayResponse = await this.zaloPayService.createPaymentOrder(
      depositAmount || transaction.amount,
      userEmail,
      transactionId,
      items,
      {
        bicycleId: transaction.bicycleId.toString(),
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

    // Store ZaloPay transaction ID
    transaction.payment = {
      ...(transaction.payment || {}),
      transactionId: zaloPayResponse.zp_trans_token,
    };

    await transaction.save();

    this.logger.log(`Created ZaloPay payment for transaction ${transactionId}`);

    return {
      order_url: zaloPayResponse.order_url,
      app_trans_id: zaloPayResponse.zp_trans_token,
    };
  }

  /**
   * Handle ZaloPay callback
   */
  async handleZaloPayCallback(
    dataStr: string,
    mac: string,
  ): Promise<{
    return_code: number;
    return_message: string;
  }> {
    // Verify callback
    const verification = this.zaloPayService.verifyCallback(dataStr, mac);

    if (!verification.isValid) {
      return {
        return_code: -1,
        return_message: 'mac not equal',
      };
    }

    const callbackData = verification.data;
    const embedData = JSON.parse(callbackData.embed_data);
    const transactionId = embedData.transactionId;

    this.logger.log(
      `Processing ZaloPay callback for transaction ${transactionId}`,
    );

    try {
      // Get transaction
      const transaction = await this.transactionModel.findById(transactionId);

      if (!transaction) {
        return {
          return_code: -2,
          return_message: 'Transaction not found',
        };
      }

      if (
        transaction.type !== TransactionType.FEE &&
        transaction.type !== TransactionType.INSPECTION_FEE
      ) {
        const bicycle = await this.bicycleModel.findById(transaction.bicycleId);
        if (!bicycle) {
          throw new Error('Bicycle not found');
        }
        bicycle.status = BicycleStatus.RESERVED;
        await bicycle.save();
      }

      if (
        transaction.type === TransactionType.FEE ||
        transaction.type === TransactionType.INSPECTION_FEE
      ) {
        transaction.status = TransactionStatus.COMPLETED;

        await transaction.save();

        this.logger.log(
          `ZaloPay fee transaction ${transactionId} marked as completed`,
        );
      } else if (transaction.type === TransactionType.DEPOSIT && transaction.status === TransactionStatus.PENDING_PAYMENT) {
        // Hold in escrow
        this.transactionsService.confirmDepositPayment(transactionId, {
          transactionId: transactionId,
        });
      } else if (transaction.status === TransactionStatus.DEPOSIT_PAID) {
        this.transactionsService.confirmFullPayment(transactionId, {
          transactionId: transactionId,
        });
      } else if (transaction.type === TransactionType.FULL_PAYMENT) {
        transaction.status = TransactionStatus.PAYMENT_RECEIVED;
        await transaction.save();
      }

      await this.walletService.credit(
        transaction.buyerId.toString(),
        transaction.amount,
        WalletTransactionType.PURCHASE,
        `Payment for bicycle: ${transaction.bicycleId}`,
        {
          transactionId: transaction._id.toString(),
          bicycleId: transaction.bicycleId.toString(),
        },
      );

      await this.walletService.debit(
        transaction.buyerId.toString(),
        transaction.amount,
        WalletTransactionType.PURCHASE,
        `Payment for bicycle: ${transaction.bicycleId}`,
        {
          transactionId: transaction._id.toString(),
          bicycleId: transaction.bicycleId.toString(),
        },
      );

      this.logger.log(
        `ZaloPay payment confirmed for transaction ${transactionId}`,
      );

      return {
        return_code: 1,
        return_message: 'success',
      };
    } catch (error) {
      this.logger.error(`ZaloPay callback processing failed: ${error.message}`);
      return {
        return_code: 0,
        return_message: error.message,
      };
    }
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
