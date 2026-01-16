import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument, TransactionStatus } from '../../entities/transaction.entity';
import { Bicycle, BicycleDocument, BicycleStatus } from '../../entities/bicycle.entity';
import { EscrowService } from '../escrow/escrow.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Bicycle.name) private bicycleModel: Model<BicycleDocument>,
    private escrowService: EscrowService,
    private notificationsService: NotificationsService,
    private configService: ConfigService,
  ) {}

  /**
   * Step 1: Create transaction and hold money in escrow
   */
  async createTransaction(
    buyerId: string,
    createDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const { bicycleId, amount, type, paymentMethod } = createDto;

    // 1. Verify bicycle exists and is available
    const bicycle = await this.bicycleModel.findById(bicycleId);
    
    if (!bicycle) {
      throw new BadRequestException('Bicycle not found');
    }

    if (bicycle.status !== 'active') {
      throw new BadRequestException('Bicycle is not available for sale');
    }

    // 2. CRITICAL: Check if bicycle has valid inspection
    if (!bicycle.inspection?.isInspected) {
      throw new BadRequestException(
        'This bicycle must be inspected before purchase. Please request inspection from seller.'
      );
    }

    // Check if inspection is still valid
    const now = new Date();
    if (bicycle.inspection.expiryDate && bicycle.inspection.expiryDate < now) {
      throw new BadRequestException(
        'Inspection report has expired. A new inspection is required.'
      );
    }

    // 3. Check if bicycle is already reserved
    const existingTransaction = await this.transactionModel.findOne({
      bicycleId,
      status: { 
        $in: ['payment_received', 'held_in_escrow', 'awaiting_delivery', 'delivered'] 
      }
    });

    if (existingTransaction) {
      throw new BadRequestException('This bicycle is already reserved or sold');
    }

    // 4. Calculate fees
    const commissionRate = this.configService.get<number>('COMMISSION_RATE') || 0.05;
    const commissionAmount = amount * commissionRate;

    // 5. Create transaction with escrow
    const autoReleaseDeadline = new Date();
    autoReleaseDeadline.setDate(
      autoReleaseDeadline.getDate() + 
      this.configService.get<number>('ESCROW_AUTO_RELEASE_DAYS', 7)
    );

    const transaction = await this.transactionModel.create({
      buyerId,
      sellerId: bicycle.sellerId,
      bicycleId,
      type,
      amount,
      status: TransactionStatus.PENDING_PAYMENT,
      escrow: {
        heldAmount: amount,
        autoReleaseDeadline,
      },
      payment: {
        method: paymentMethod,
      },
      fees: {
        commissionRate,
        commissionAmount,
        platformFee: 0,
      },
      buyerConfirmation: {
        confirmed: false,
      },
    });

    // 6. Reserve bicycle
    bicycle.status = BicycleStatus.RESERVED;
    await bicycle.save();

    // 7. Send notifications
    // await this.notificationsService.create({
    //   userId: bicycle.sellerId,
    //   type: 'payment_received',
    //   title: 'New Order Received',
    //   message: `Your bicycle "${bicycle.title}" has been ordered. Please prepare for shipping.`,
    //   relatedEntity: {
    //     entityType: 'transaction',
    //     entityId: transaction._id,
    //   },
    // });

    return transaction;
  }

  /**
   * Step 2: Confirm payment and move to escrow
   */
  async confirmPayment(
    transactionId: string,
    paymentData: { transactionId: string }
  ): Promise<Transaction> {
    const transaction : any = await this.transactionModel.findById(transactionId);

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Invalid transaction status');
    }

    // Update transaction status
    transaction.status = TransactionStatus.HELD_IN_ESCROW;
    transaction.payment.transactionId = paymentData.transactionId;
    transaction.payment.paidAt = new Date();

    await transaction.save();

    // Notify seller to ship
    // await this.notificationsService.create({
    //   userId: transaction.sellerId,
    //   type: 'payment_received',
    //   title: 'Payment Received in Escrow',
    //   message: 'Payment has been secured. Please ship the bicycle within 3 days.',
    //   relatedEntity: {
    //     entityType: 'transaction',
    //     entityId: transaction._id,
    //   },
    // });

    return transaction;
  }

  /**
   * Step 3: Seller updates shipping information
   */
  async updateShipping(
    transactionId: string,
    sellerId: string,
    shippingData: { provider: string; trackingNumber: string }
  ): Promise<Transaction> {
    const transaction = await this.transactionModel.findById(transactionId);

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.sellerId.toString() !== sellerId) {
      throw new ForbiddenException('Only the seller can update shipping');
    }

    if (transaction.status !== TransactionStatus.HELD_IN_ESCROW) {
      throw new BadRequestException('Invalid transaction status');
    }

    // Update shipping details
    transaction.shipping = {
      provider: shippingData.provider,
      trackingNumber: shippingData.trackingNumber,
      shippedAt: new Date(),
    };
    transaction.status = TransactionStatus.AWAITING_DELIVERY;

    await transaction.save();

    // Notify buyer
    // await this.notificationsService.create({
    //   userId: transaction.buyerId,
    //   type: 'item_shipped',
    //   title: 'Your Bicycle Has Been Shipped',
    //   message: `Tracking number: ${shippingData.trackingNumber}`,
    //   relatedEntity: {
    //     entityType: 'transaction',
    //     entityId: transaction._id,
    //   },
    // });

    return transaction;
  }

  /**
   * Step 4: Mark as delivered (by logistics or manual)
   */
  async markAsDelivered(transactionId: string): Promise<Transaction> {
    const transaction : any = await this.transactionModel.findById(transactionId);

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.AWAITING_DELIVERY) {
      throw new BadRequestException('Invalid transaction status');
    }

    transaction.shipping.deliveredAt = new Date();
    transaction.status = TransactionStatus.DELIVERED;

    // Set auto-confirm deadline (7 days from delivery)
    const autoConfirmDeadline = new Date();
    autoConfirmDeadline.setDate(autoConfirmDeadline.getDate() + 7);
    transaction.escrow.releaseDate = autoConfirmDeadline;

    await transaction.save();

    // Notify buyer to confirm
    // await this.notificationsService.create({
    //   userId: transaction.buyerId,
    //   type: 'item_delivered',
    //   title: 'Bicycle Delivered',
    //   message: 'Please confirm receipt and verify the bicycle matches the inspection report.',
    //   relatedEntity: {
    //     entityType: 'transaction',
    //     entityId: transaction._id,
    //   },
    // });

    return transaction;
  }

  /**
   * Step 5: Buyer confirms receipt and matches inspection report
   */
  async confirmDelivery(
    transactionId: string,
    buyerId: string,
    confirmationData: { matchesReport: boolean; notes?: string }
  ): Promise<Transaction> {
    const transaction = await this.transactionModel.findById(transactionId);

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.buyerId.toString() !== buyerId) {
      throw new ForbiddenException('Only the buyer can confirm delivery');
    }

    if (transaction.status !== TransactionStatus.DELIVERED) {
      throw new BadRequestException('Transaction must be in delivered status');
    }

    if (!confirmationData.matchesReport) {
      // Buyer reports bicycle doesn't match inspection - auto-create dispute
      throw new BadRequestException(
        'Please file a dispute if the bicycle does not match the inspection report'
      );
    }

    // Update confirmation
    transaction.buyerConfirmation = {
      confirmed: true,
      confirmedAt: new Date(),
      notes: confirmationData.notes,
    };

    // Release escrow to seller
    await this.escrowService.releaseFunds(transaction);

    transaction.status = TransactionStatus.COMPLETED;
    transaction.completedAt = new Date();

    await transaction.save();

    // Update bicycle status
    await this.bicycleModel.findByIdAndUpdate(transaction.bicycleId, {
      status: 'sold',
      soldAt: new Date(),
    });

    // Notify seller
    // await this.notificationsService.create({
    //   userId: transaction.sellerId,
    //   type: 'payment_received',
    //   title: 'Payment Released',
    //   message: 'Buyer confirmed delivery. Funds have been released to your account.',
    //   relatedEntity: {
    //     entityType: 'transaction',
    //     entityId: transaction._id,
    //   },
    // });

    return transaction;
  }

  /**
   * Auto-refund if seller doesn't ship within deadline
   */
  async autoRefundNoShipment(transactionId: string): Promise<Transaction> {
    const transaction : any = await this.transactionModel.findById(transactionId);

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    // Check if seller hasn't shipped within 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    if (
      transaction.status === TransactionStatus.HELD_IN_ESCROW &&
      transaction.payment.paidAt < threeDaysAgo &&
      !transaction.shipping?.shippedAt
    ) {
      // Auto-refund to buyer
      await this.escrowService.refundFunds(transaction);

      transaction.status = TransactionStatus.REFUNDED;
      await transaction.save();

      // Release bicycle back to market
      await this.bicycleModel.findByIdAndUpdate(transaction.bicycleId, {
        status: 'active',
      });

      // Notify both parties
    //   await this.notificationsService.create({
    //     userId: transaction.buyerId,
    //     type: 'dispute_resolved',
    //     title: 'Transaction Refunded',
    //     message: 'Seller did not ship within deadline. Your payment has been refunded.',
    //     relatedEntity: {
    //       entityType: 'transaction',
    //       entityId: transaction._id,
    //     },
    //   });

    //   await this.notificationsService.create({
    //     userId: transaction.sellerId,
    //     type: 'dispute_resolved',
    //     title: 'Transaction Cancelled',
    //     message: 'Failed to ship within deadline. Transaction has been refunded to buyer.',
    //     relatedEntity: {
    //       entityType: 'transaction',
    //       entityId: transaction._id,
    //     },
    //   });

      return transaction;
    }

    return transaction;
  }

  /**
   * Auto-confirm and release if buyer doesn't confirm within 7 days
   */
  async autoConfirmDelivery(transactionId: string): Promise<Transaction> {
    const transaction : any = await this.transactionModel.findById(transactionId);

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    const now = new Date();

    if (
      transaction.status === TransactionStatus.DELIVERED &&
      transaction.escrow.releaseDate &&
      transaction.escrow.releaseDate < now &&
      !transaction.buyerConfirmation.confirmed
    ) {
      // Auto-confirm and release funds
      transaction.buyerConfirmation.confirmed = true;
      transaction.buyerConfirmation.confirmedAt = new Date();
      transaction.buyerConfirmation.notes = 'Auto-confirmed after 7 days';

      await this.escrowService.releaseFunds(transaction);

      transaction.status = TransactionStatus.COMPLETED;
      transaction.completedAt = new Date();

      await transaction.save();

      // Update bicycle
      await this.bicycleModel.findByIdAndUpdate(transaction.bicycleId, {
        status: 'sold',
        soldAt: new Date(),
      });

      // Notify seller
    //   await this.notificationsService.create({
    //     userId: transaction.sellerId,
    //     type: 'payment_received',
    //     title: 'Payment Released (Auto-confirmed)',
    //     message: 'Transaction auto-confirmed after 7 days. Funds released.',
    //     relatedEntity: {
    //       entityType: 'transaction',
    //       entityId: transaction._id,
    //     },
    //   });

      return transaction;
    }

    return transaction;
  }
}