import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
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
import {
  Bicycle,
  BicycleDocument,
  BicycleStatus,
} from '../../entities/bicycle.entity';
import { EscrowService } from '../escrow/escrow.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { WalletService } from '../wallet/wallet.service';
import { WalletTransactionType } from 'src/entities/wallet-transaction.entity';
import { PaymentService } from '../payment/payment.service';
import { CreateDepositDto } from './dto/create-deposit.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(Bicycle.name) private bicycleModel: Model<BicycleDocument>,
    private escrowService: EscrowService,
    private walletService: WalletService,
    private notificationsService: NotificationsService,
    private configService: ConfigService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
  ) {}

  /**
   * Step 1: Create transaction and hold money in escrow
   */
  async createTransaction(
    buyerId: string,
    createDto: CreateTransactionDto,
  ): Promise<any> {
    const { bicycleId, amount, type, paymentMethod } = createDto;

    // 1. Verify bicycle exists and is available
    const bicycle = await this.bicycleModel.findById(bicycleId);

    if (!bicycle) {
      throw new BadRequestException('Bicycle not found');
    }

    if (bicycle.status !== 'active' && type !== TransactionType.FEE) {
      throw new BadRequestException('Bicycle is not available for sale');
    }

    // 2. CRITICAL: Check if bicycle has valid inspection
    if (bicycle.inspection?.isInspected && type !== TransactionType.FEE) {
      // Check if inspection is still valid
      const now = new Date();
      if (
        bicycle.inspection.expiryDate &&
        bicycle.inspection.expiryDate < now
      ) {
        throw new BadRequestException(
          'Inspection report has expired. A new inspection is required.',
        );
      }
      // throw new BadRequestException(
      //   'This bicycle must be inspected before purchase. Please request inspection from seller.',
      // );
    }

    // 3. Check if bicycle is already reserved
    const existingTransaction = await this.transactionModel.findOne({
      bicycleId,
      status: {
        $in: [
          'payment_received',
          'held_in_escrow',
          'awaiting_delivery',
          'delivered',
        ],
      },
    });

    if (existingTransaction) {
      throw new BadRequestException('This bicycle is already reserved or sold');
    }

    // 4. Calculate fees
    const commissionRate =
      this.configService.get<number>('COMMISSION_RATE') || 0.05;
    const commissionAmount = amount * commissionRate;

    // 5. Create transaction with escrow
    const autoReleaseDeadline = new Date();
    autoReleaseDeadline.setDate(
      autoReleaseDeadline.getDate() +
        this.configService.get<number>('ESCROW_AUTO_RELEASE_DAYS', 7),
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
      // fees: {
      //   commissionRate,
      //   commissionAmount,
      //   platformFee: 0,
      // },
      buyerConfirmation: {
        confirmed: false,
      },
    });

    // 6. Reserve bicycle

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

    return this.paymentService.createZaloPayPayment(
      transaction._id.toString(),
      buyerId,
    );

    // return transaction;
  }

  /**
   * Step 2: Confirm payment and move to escrow
   */
  async confirmPayment(
    transactionId: string,
    paymentData: { transactionId: string },
  ): Promise<Transaction> {
    const transaction: any =
      await this.transactionModel.findById(transactionId);

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
    shippingData: { provider: string; trackingNumber: string },
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
   * Step 3: Seller updates shipping information and marks as delivered
   */
  async updateShippingAndMarkDelivered(
    transactionId: string,
    sellerId: string,
    shippingData: { provider: string; trackingNumber: string },
  ): Promise<Transaction> {
    const transaction: any =
      await this.transactionModel.findById(transactionId);

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.sellerId.toString() !== sellerId) {
      throw new ForbiddenException('Only the seller can update shipping');
    }

    // if (transaction.status !== TransactionStatus.HELD_IN_ESCROW) {
    //   throw new BadRequestException('Invalid transaction status');
    // }

    const now = new Date();

    // Set shipping details
    transaction.shipping = {
      provider: shippingData.provider,
      trackingNumber: shippingData.trackingNumber,
      shippedAt: now,
      deliveredAt: now,
    };

    // Set auto-confirm deadline (7 days from delivery)
    const autoConfirmDeadline = new Date();
    autoConfirmDeadline.setDate(autoConfirmDeadline.getDate() + 7);
    transaction.escrow.releaseDate = autoConfirmDeadline;

    transaction.status = TransactionStatus.DELIVERED;

    await transaction.save();

    return transaction;
  }

  /**
   * Step 4: Mark as delivered (by logistics or manual)
   */
  // async markAsDelivered(transactionId: string): Promise<Transaction> {
  //   const transaction: any =
  //     await this.transactionModel.findById(transactionId);

  //   if (!transaction) {
  //     throw new BadRequestException('Transaction not found');
  //   }

  //   // if (transaction.status !== TransactionStatus.AWAITING_DELIVERY) {
  //   //   throw new BadRequestException('Invalid transaction status');
  //   // }

  //   transaction.shipping.deliveredAt = new Date();
  //   transaction.status = TransactionStatus.DELIVERED;

  //   // Set auto-confirm deadline (7 days from delivery)
  //   const autoConfirmDeadline = new Date();
  //   autoConfirmDeadline.setDate(autoConfirmDeadline.getDate() + 7);
  //   transaction.escrow.releaseDate = autoConfirmDeadline;

  //   await transaction.save();

  //   // Notify buyer to confirm
  //   // await this.notificationsService.create({
  //   //   userId: transaction.buyerId,
  //   //   type: 'item_delivered',
  //   //   title: 'Bicycle Delivered',
  //   //   message: 'Please confirm receipt and verify the bicycle matches the inspection report.',
  //   //   relatedEntity: {
  //   //     entityType: 'transaction',
  //   //     entityId: transaction._id,
  //   //   },
  //   // });

  //   return transaction;
  // }

  /**
   * Step 5: Buyer confirms receipt and matches inspection report
   */
  async confirmDelivery(
    transactionId: string,
    buyerId: string,
    confirmationData: { matchesReport: boolean; notes?: string },
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
        'Please file a dispute if the bicycle does not match the inspection report',
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

    const commissionAmount = transaction.fees?.commissionAmount || 0;
    const sellerAmount = transaction.amount - commissionAmount;

    // Credit seller's wallet
    await this.walletService.releaseFromEscrow(
      transaction.sellerId.toString(),
      sellerAmount,
      transactionId,
    );

    // Credit platform wallet (commission)
    // await this.walletService.credit(
    //   'PLATFORM_USER_ID',
    //   commissionAmount,
    //   WalletTransactionType.COMMISSION,
    //   `Commission from transaction ${transactionId}`,
    //   { transactionId },
    // );

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
    const transaction: any =
      await this.transactionModel.findById(transactionId);

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
    const transaction: any =
      await this.transactionModel.findById(transactionId);

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

  /**
   * Get all transactions for a user (as buyer or seller)
   */
  async getMyTransactions(
    userId: string,
    role?: 'buyer' | 'seller',
    status?: string,
  ): Promise<Transaction[]> {
    const query: any = {};

    // Filter by role
    if (role === 'buyer') {
      query.buyerId = userId;
    } else if (role === 'seller') {
      query.sellerId = userId;
    } else {
      // Get all transactions where user is either buyer or seller
      query.$or = [{ buyerId: userId }, { sellerId: userId }];
    }

    // Filter by status if provided
    if (status) {
      if (TransactionStatus[status as keyof typeof TransactionStatus])
        query.status = status;
    }

    console.log(query);
    const transactions = await this.transactionModel
      .find(query)
      .populate('buyerId', 'email profile.fullName')
      .populate('sellerId', 'email profile.fullName')
      .populate(
        'bicycleId',
        'title price specifications.brand specifications.type media.mainImage',
      )
      .sort({ createdAt: -1 })
      .exec();

    return transactions;
  }

  /**
   * Get transaction by ID with access control
   */
  async getTransactionById(
    transactionId: string,
    userId: string,
  ): Promise<TransactionDocument> {
    const transaction = await this.transactionModel
      .findById(transactionId)
      .populate('buyerId', 'email profile.fullName phone')
      .populate('sellerId', 'email profile.fullName phone')
      .populate('bicycleId')
      .exec();

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Check if user has access to this transaction
    const isBuyer = transaction.buyerId._id.toString() === userId;
    const isSeller = transaction.sellerId._id.toString() === userId;

    if (!isBuyer && !isSeller) {
      throw new ForbiddenException(
        'You do not have access to this transaction',
      );
    }

    return transaction;
  }

  /**
   * Cancel transaction
   */
  async cancelTransaction(
    transactionId: string,
    userId: string,
    reason?: string,
  ): Promise<Transaction> {
    const transaction = await this.transactionModel.findById(transactionId);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Check authorization
    const isBuyer = transaction.buyerId.toString() === userId;
    const isSeller = transaction.sellerId.toString() === userId;

    if (!isBuyer && !isSeller) {
      throw new ForbiddenException(
        'You are not authorized to cancel this transaction',
      );
    }

    // Check if transaction can be cancelled
    const cancellableStatuses = [
      TransactionStatus.PENDING_PAYMENT,
      TransactionStatus.PAYMENT_RECEIVED,
      TransactionStatus.HELD_IN_ESCROW,
    ];

    if (!cancellableStatuses.includes(transaction.status)) {
      throw new BadRequestException(
        `Cannot cancel transaction with status: ${transaction.status}`,
      );
    }

    // Buyer can only cancel before payment or within 1 hour after payment
    if (isBuyer && transaction.status !== TransactionStatus.PENDING_PAYMENT) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (
        !transaction.payment?.paidAt ||
        transaction.payment.paidAt < oneHourAgo
      ) {
        throw new BadRequestException(
          'Buyer can only cancel within 1 hour after payment',
        );
      }
    }

    // Seller can cancel before shipping
    if (isSeller && transaction.shipping?.shippedAt) {
      throw new BadRequestException('Cannot cancel after shipping');
    }

    // Update transaction status
    transaction.status = TransactionStatus.CANCELLED;
    await transaction.save();

    // Release bicycle back to market
    await this.bicycleModel.findByIdAndUpdate(transaction.bicycleId, {
      status: BicycleStatus.ACTIVE,
    });

    // Refund if payment was made
    if (transaction.payment?.paidAt) {
      // TODO: Implement refund logic via payment gateway
      // await this.escrowService.refundFunds(transaction);
    }

    return transaction;
  }

  /**
   * Get transaction statistics (Admin)
   */
  async getStatistics(): Promise<any> {
    // Total transactions
    const totalTransactions = await this.transactionModel.countDocuments();

    // Transactions by status
    const transactionsByStatus = await this.transactionModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Total amount in escrow
    const escrowResult = await this.transactionModel.aggregate([
      {
        $match: {
          status: {
            $in: [
              TransactionStatus.HELD_IN_ESCROW,
              TransactionStatus.AWAITING_DELIVERY,
              TransactionStatus.DELIVERED,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalInEscrow =
      escrowResult.length > 0 ? escrowResult[0].totalAmount : 0;
    const transactionsInEscrow =
      escrowResult.length > 0 ? escrowResult[0].count : 0;

    // Completed transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completedLast30Days = await this.transactionModel.countDocuments({
      status: TransactionStatus.COMPLETED,
      completedAt: { $gte: thirtyDaysAgo },
    });

    // Total revenue (platform commission)
    const revenueResult = await this.transactionModel.aggregate([
      {
        $match: {
          status: TransactionStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$fees.commissionAmount' },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Average transaction value
    const avgTransactionResult = await this.transactionModel.aggregate([
      {
        $group: {
          _id: null,
          averageAmount: { $avg: '$amount' },
        },
      },
    ]);

    const averageTransactionValue =
      avgTransactionResult.length > 0
        ? avgTransactionResult[0].averageAmount
        : 0;

    // Transactions requiring attention (auto-release soon)
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const requiresAttention = await this.transactionModel.countDocuments({
      status: TransactionStatus.DELIVERED,
      'escrow.releaseDate': { $lte: twoDaysFromNow },
      'buyerConfirmation.confirmed': false,
    });

    // Pending shipments (seller hasn't shipped yet)
    const pendingShipments = await this.transactionModel.countDocuments({
      status: TransactionStatus.HELD_IN_ESCROW,
      'shipping.shippedAt': { $exists: false },
    });

    // Monthly breakdown (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyData = await this.transactionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', TransactionStatus.COMPLETED] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1,
          totalAmount: 1,
          completedCount: 1,
        },
      },
    ]);

    // Dispute rate
    const totalDisputed = await this.transactionModel.countDocuments({
      'dispute.isDisputed': true,
    });
    const disputeRate: any =
      totalTransactions > 0
        ? ((totalDisputed / totalTransactions) * 100).toFixed(2)
        : 0;

    return {
      overview: {
        totalTransactions,
        completedLast30Days,
        totalInEscrow,
        transactionsInEscrow,
        totalRevenue,
        averageTransactionValue: Math.round(averageTransactionValue),
      },
      byStatus: transactionsByStatus,
      alerts: {
        requiresAttention,
        pendingShipments,
      },
      performance: {
        disputeRate: parseFloat(disputeRate),
        totalDisputed,
      },
      monthlyBreakdown: monthlyData,
    };
  }

  /**
   * Get transactions held in escrow (Admin)
   */
  async getHeldInEscrow(): Promise<Transaction[]> {
    return await this.transactionModel
      .find({
        status: {
          $in: [
            TransactionStatus.HELD_IN_ESCROW,
            TransactionStatus.AWAITING_DELIVERY,
            TransactionStatus.DELIVERED,
          ],
        },
      })
      .populate('buyerId', 'email profile.fullName')
      .populate('sellerId', 'email profile.fullName')
      .populate('bicycleId', 'title price')
      .sort({ 'escrow.autoReleaseDeadline': 1 })
      .exec();
  }

  /**
   * Get escrow statistics (Admin)
   */
  async getEscrowStatistics(): Promise<any> {
    const escrowTransactions = await this.transactionModel.aggregate([
      {
        $match: {
          status: {
            $in: [
              TransactionStatus.HELD_IN_ESCROW,
              TransactionStatus.AWAITING_DELIVERY,
              TransactionStatus.DELIVERED,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    // Transactions expiring soon (within 2 days)
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const expiringSoon = await this.transactionModel.countDocuments({
      status: TransactionStatus.DELIVERED,
      'escrow.releaseDate': { $lte: twoDaysFromNow },
      'buyerConfirmation.confirmed': false,
    });

    // Total held amount
    const totalHeldResult = await this.transactionModel.aggregate([
      {
        $match: {
          status: {
            $in: [
              TransactionStatus.HELD_IN_ESCROW,
              TransactionStatus.AWAITING_DELIVERY,
              TransactionStatus.DELIVERED,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalHeld: { $sum: '$escrow.heldAmount' },
        },
      },
    ]);

    const totalHeld =
      totalHeldResult.length > 0 ? totalHeldResult[0].totalHeld : 0;

    // Average hold time (for completed transactions)
    const avgHoldTimeResult = await this.transactionModel.aggregate([
      {
        $match: {
          status: TransactionStatus.COMPLETED,
          'payment.paidAt': { $exists: true },
          completedAt: { $exists: true },
        },
      },
      {
        $project: {
          holdTime: {
            $subtract: ['$completedAt', '$payment.paidAt'],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageHoldTime: { $avg: '$holdTime' },
        },
      },
    ]);

    const averageHoldTimeMs =
      avgHoldTimeResult.length > 0 ? avgHoldTimeResult[0].averageHoldTime : 0;
    const averageHoldTimeDays = Math.round(
      averageHoldTimeMs / (1000 * 60 * 60 * 24),
    );

    return {
      totalHeld,
      byStatus: escrowTransactions,
      expiringSoon,
      averageHoldTimeDays,
    };
  }

  /**
   * DEPOSIT STEP 1: Buyer pays deposit to reserve bicycle
   * - Calculates deposit amount (default 20% of bike price)
   * - Creates a DEPOSIT transaction
   * - Sets a 3-day deadline for full payment
   * - Reserves the bicycle
   */
  async createDepositTransaction(
    buyerId: string,
    dto: CreateDepositDto,
  ): Promise<any> {
    const { bicycleId, depositRate = 0.2, paymentMethod } = dto;

    // 1. Verify bicycle
    const bicycle = await this.bicycleModel.findById(bicycleId);
    if (!bicycle) throw new BadRequestException('Bicycle not found');
    if (bicycle.status !== 'active') {
      throw new BadRequestException('Bicycle is not available');
    }

    // 2. Check no existing active transaction
    const existing = await this.transactionModel.findOne({
      bicycleId,
      status: {
        $in: [
          'deposit_paid',
          'payment_received',
          'held_in_escrow',
          'awaiting_delivery',
          'delivered',
        ],
      },
    });
    if (existing) {
      throw new BadRequestException('Bicycle is already reserved or sold');
    }

    // 3. Calculate amounts
    const bicyclePrice = bicycle.price; // or however price is stored
    const depositAmount = Math.round(bicyclePrice * depositRate);
    const remainingAmount = bicyclePrice - depositAmount;

    // 4. Set 3-day deadline
    const paymentDeadline = new Date();
    paymentDeadline.setDate(paymentDeadline.getDate() + 3);

    // 5. Create transaction
    const transaction = await this.transactionModel.create({
      buyerId,
      sellerId: bicycle.sellerId,
      bicycleId,
      type: TransactionType.DEPOSIT,
      amount: bicyclePrice, // total price of bike
      status: TransactionStatus.PENDING_PAYMENT,
      deposit: {
        amount: depositAmount,
        rate: depositRate,
        paymentDeadline,
        forfeited: false,
        remainingAmount,
      },
      payment: {
        method: paymentMethod,
      },
      escrow: {
        heldAmount: depositAmount, // only deposit in escrow initially
        autoReleaseDeadline: paymentDeadline,
      },
      buyerConfirmation: { confirmed: false },
    });

    // 7. Initiate payment for deposit amount only
    return this.paymentService.createZaloPayPayment(
      transaction._id.toString(),
      buyerId,
      depositAmount, // pass the deposit amount, not full price
    );
  }

  /**
   * DEPOSIT STEP 2: Confirm deposit payment received
   */
  async confirmDepositPayment(
    transactionId: string,
    paymentData: { transactionId: string },
  ): Promise<Transaction> {
    const transaction: any =
      await this.transactionModel.findById(transactionId);
    if (!transaction) throw new BadRequestException('Transaction not found');
    if (transaction.status !== TransactionStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Invalid transaction status');
    }

    transaction.status = TransactionStatus.DEPOSIT_PAID;
    transaction.deposit.paidAt = new Date();
    transaction.payment.transactionId = paymentData.transactionId;
    transaction.payment.paidAt = new Date();

    transaction.markModified('deposit');
    transaction.markModified('payment');

    await transaction.save();

    // Hold deposit in buyer's escrow
    await this.walletService.holdInEscrow(
      transaction.buyerId.toString(),
      transaction.deposit.amount,
      transactionId,
    );

    // Notify buyer of 3-day deadline
    // await this.notificationsService.create({ ... });

    return transaction;
  }

  /**
   * DEPOSIT STEP 3: Buyer pays remaining balance within 3 days
   */
  async payRemainingBalance(
    transactionId: string,
    buyerId: string,
  ): Promise<any> {
    const transaction = await this.transactionModel.findById(transactionId);
    if (!transaction) throw new BadRequestException('Transaction not found');

    if (transaction.buyerId.toString() !== buyerId) {
      throw new ForbiddenException('Only the buyer can pay remaining balance');
    }

    if (transaction.status !== TransactionStatus.DEPOSIT_PAID) {
      throw new BadRequestException(
        'Transaction must be in deposit_paid status',
      );
    }

    // Check deadline hasn't passed
    const now = new Date();
    if (
      transaction.deposit?.paymentDeadline &&
      transaction.deposit.paymentDeadline < now
    ) {
      // Trigger forfeiture if not already done
      await this.forfeitDeposit(transactionId);
      throw new BadRequestException(
        'Payment deadline has passed. Your deposit has been forfeited.',
      );
    }

    // Initiate payment for remaining amount
    return this.paymentService.createZaloPayPayment(
      transactionId,
      buyerId,
      transaction.deposit!.remainingAmount,
    );
  }

  /**
   * DEPOSIT STEP 4: Confirm full payment - moves to standard escrow flow
   */
  async confirmFullPayment(
    transactionId: string,
    paymentData: { transactionId: string },
  ): Promise<Transaction> {
    const transaction: any =
      await this.transactionModel.findById(transactionId);
    if (!transaction) throw new BadRequestException('Transaction not found');
    if (transaction.status !== TransactionStatus.DEPOSIT_PAID) {
      throw new BadRequestException('Invalid transaction status');
    }

    // Update to full escrow (deposit + remaining)
    transaction.status = TransactionStatus.HELD_IN_ESCROW;
    transaction.escrow.heldAmount = transaction.amount; // now full amount in escrow
    transaction.payment.fullPaymentTransactionId = paymentData.transactionId;
    transaction.payment.fullPaidAt = new Date();

    transaction.markModified('escrow');
    transaction.markModified('payment');

    await transaction.save();

    // Notify seller to ship
    // await this.notificationsService.create({ ... });

    return transaction;
  }

  /**
   * FORFEIT: Buyer didn't pay full amount within 3 days
   * - Deposit goes to seller
   * - Bicycle released back to market
   */
  async forfeitDeposit(transactionId: string): Promise<Transaction> {
    const transaction: any =
      await this.transactionModel.findById(transactionId);
    if (!transaction) throw new BadRequestException('Transaction not found');

    if (transaction.status !== TransactionStatus.DEPOSIT_PAID) {
      throw new BadRequestException(
        'Only deposit_paid transactions can be forfeited',
      );
    }

    // Check deadline actually passed
    const now = new Date();
    if (
      transaction.deposit?.paymentDeadline &&
      transaction.deposit.paymentDeadline > now
    ) {
      throw new BadRequestException('Payment deadline has not passed yet');
    }

    // Mark deposit as forfeited
    transaction.status = TransactionStatus.DEPOSIT_FORFEITED;
    transaction.deposit.forfeited = true;
    transaction.deposit.forfeitedAt = new Date();

    transaction.markModified('deposit');

    await transaction.save();

    // Release deposit TO SELLER (not buyer)
    await this.walletService.releaseFromEscrow(
      transaction.sellerId.toString(),
      transaction.deposit.amount,
      transactionId,
      // mark as forfeited deposit income
    );

    // Release bicycle back to market
    await this.bicycleModel.findByIdAndUpdate(transaction.bicycleId, {
      status: BicycleStatus.ACTIVE,
    });

    // Notify both parties
    // await this.notificationsService.create({ userId: buyerId, ... 'Deposit Forfeited' });
    // await this.notificationsService.create({ userId: sellerId, ... 'Deposit Received' });

    return transaction;
  }

  /**
   * SCHEDULER: Auto-forfeit expired deposits (run every hour via cron)
   */
  async autoForfeitExpiredDeposits(): Promise<void> {
    const now = new Date();

    const expiredDeposits = await this.transactionModel.find({
      status: TransactionStatus.DEPOSIT_PAID,
      'deposit.paymentDeadline': { $lt: now },
      'deposit.forfeited': false,
    });

    for (const transaction of expiredDeposits) {
      try {
        await this.forfeitDeposit(transaction._id.toString());
        console.log(
          `Auto-forfeited deposit for transaction ${transaction._id}`,
        );
      } catch (err) {
        console.error(`Failed to forfeit transaction ${transaction._id}:`, err);
      }
    }
  }
}
