import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import {
  Wallet,
  WalletDocument,
  WalletStatus,
} from '../../entities/wallet.entity';
import {
  WalletTransaction,
  WalletTransactionDocument,
  WalletTransactionType,
  WalletTransactionStatus,
} from '../../entities/wallet-transaction.entity';
import {
  Transaction,
  TransactionDocument,
  TransactionStatus,
} from '../../entities/transaction.entity';

export type EscrowRole = 'buyer' | 'seller';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(WalletTransaction.name)
    private walletTransactionModel: Model<WalletTransactionDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  /**
   * Create wallet for new user
   */
  async createWallet(userId: string): Promise<WalletDocument> {
    const existingWallet = await this.walletModel.findOne({ userId });

    if (existingWallet) {
      return existingWallet;
    }

    const wallet = await this.walletModel.create({
      userId,
      balance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalEarned: 0,
      totalSpent: 0,
      pendingBalance: 0,
      status: WalletStatus.ACTIVE,
    });

    return wallet;
  }

  /**
   * Get user's wallet
   */
  async getWallet(userId: string): Promise<WalletDocument> {
    let wallet = await this.walletModel.findOne({ userId });

    if (!wallet) {
      return await this.createWallet(userId);
    }

    return wallet;
  }

  /**
   * Get wallet totals and funds currently held in escrow from the Transaction
   * collection.
   *
   * @param userId - The user whose totals to fetch.
   * @param role   - Whether to look up the user as 'buyer' or 'seller'.
   *                 A buyer's escrow is money they paid that hasn't been
   *                 released yet. A seller's escrow is money owed to them
   *                 that is still being held.
   *
   * Escrow source of truth: Transaction documents whose status is
   * HELD_IN_ESCROW, summing `escrow.heldAmount` (falling back to `amount`
   * when heldAmount is not set).
   */
  async getEscrowAndWalletTotals(
    userId: string,
    role: EscrowRole,
  ): Promise<{
    walletBalance: number;
    pendingBalance: number;
    availableBalance: number;
    escrowHeld: number;
    role: EscrowRole;
  }> {
    // const objectId = new Types.ObjectId(userId);

    // Match on the correct side of the transaction depending on role
    const roleFilter =
      role === 'buyer' ? { buyerId: userId } : { sellerId: userId };

    const [wallet, escrowAgg] = await Promise.all([
      this.getWallet(userId),
      this.transactionModel.aggregate([
        {
          $match: {
            ...roleFilter,
            status: TransactionStatus.HELD_IN_ESCROW,
          },
        },
        {
          $group: {
            _id: null,
            // Prefer escrow.heldAmount; fall back to the top-level amount
            total: {
              $sum: {
                $ifNull: ['$escrow.heldAmount', '$amount'],
              },
            },
          },
        },
      ]),
    ]);

    const escrowHeld = escrowAgg[0]?.total ?? 0;

    return {
      walletBalance: wallet.balance,
      pendingBalance: wallet.pendingBalance,
      availableBalance: wallet.balance - wallet.pendingBalance,
      escrowHeld,
      role,
    };
  }

  /**
   * Credit wallet (add money)
   */
  async credit(
    userId: string,
    amount: number,
    type: WalletTransactionType,
    description: string,
    metadata?: {
      transactionId?: string;
      bicycleId?: string;
      disputeId?: string;
    },
    session?: ClientSession,
  ): Promise<WalletTransactionDocument> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const wallet = await this.getWallet(userId);

    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException(`Wallet is ${wallet.status}`);
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    wallet.balance = balanceAfter;
    wallet.totalDeposited += amount;
    wallet.lastTransactionAt = new Date();

    if (type === WalletTransactionType.SALE_PAYMENT) {
      wallet.totalEarned += amount;
    }

    await wallet.save({ session });

    const walletTransaction = await this.walletTransactionModel.create(
      [
        {
          walletId: wallet._id,
          userId,
          type,
          amount,
          balanceBefore,
          balanceAfter,
          status: WalletTransactionStatus.COMPLETED,
          description,
          transactionId: metadata?.transactionId,
          bicycleId: metadata?.bicycleId,
          disputeId: metadata?.disputeId,
        },
      ],
      { session },
    );

    return walletTransaction[0];
  }

  /**
   * Debit wallet (subtract money)
   */
  async debit(
    userId: string,
    amount: number,
    type: WalletTransactionType,
    description: string,
    metadata?: {
      transactionId?: string;
      bicycleId?: string;
      disputeId?: string;
    },
    session?: ClientSession,
  ): Promise<WalletTransactionDocument> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const wallet = await this.getWallet(userId);

    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException(`Wallet is ${wallet.status}`);
    }

    if (wallet.balance < amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${wallet.balance} VND, Required: ${amount} VND`,
      );
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amount;

    wallet.balance = balanceAfter;
    wallet.totalWithdrawn += amount;
    wallet.lastTransactionAt = new Date();

    if (type === WalletTransactionType.PURCHASE) {
      wallet.totalSpent += amount;
    }

    await wallet.save({ session });

    const walletTransaction = await this.walletTransactionModel.create(
      [
        {
          walletId: wallet._id,
          userId,
          type,
          amount: -amount,
          balanceBefore,
          balanceAfter,
          status: WalletTransactionStatus.COMPLETED,
          description,
          transactionId: metadata?.transactionId,
          bicycleId: metadata?.bicycleId,
          disputeId: metadata?.disputeId,
        },
      ],
      { session },
    );

    return walletTransaction[0];
  }

  /**
   * Transfer between wallets (atomic)
   */
  async transfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    type: WalletTransactionType,
    description: string,
    metadata?: any,
  ): Promise<{
    from: WalletTransactionDocument;
    to: WalletTransactionDocument;
  }> {
    const session = await this.walletModel.db.startSession();
    session.startTransaction();

    try {
      const fromTransaction = await this.debit(
        fromUserId,
        amount,
        type,
        description,
        metadata,
        session,
      );

      const toTransaction = await this.credit(
        toUserId,
        amount,
        type,
        description,
        metadata,
        session,
      );

      await session.commitTransaction();

      return { from: fromTransaction, to: toTransaction };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Hold money in escrow
   */
  async holdInEscrow(
    userId: string,
    amount: number,
    transactionId: string,
  ): Promise<WalletTransactionDocument> {
    const wallet = await this.getWallet(userId);

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    wallet.pendingBalance += amount;
    await wallet.save();

    return await this.debit(
      userId,
      amount,
      WalletTransactionType.ESCROW_HOLD,
      `Payment held in escrow for transaction ${transactionId}`,
      { transactionId },
    );
  }

  /**
   * Release money from escrow
   */
  async releaseFromEscrow(
    toUserId: string,
    amount: number,
    transactionId: string,
  ): Promise<WalletTransactionDocument> {
    return await this.credit(
      toUserId,
      amount,
      WalletTransactionType.ESCROW_RELEASE,
      `Payment released from escrow for transaction ${transactionId}`,
      { transactionId },
    );
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    userId: string,
    filters?: {
      type?: WalletTransactionType;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    },
  ): Promise<{
    transactions: WalletTransactionDocument[];
    total: number;
    page: number;
    pages: number;
  }> {
    const query: any = { userId };

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.walletTransactionModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('transactionId', 'status')
        .populate('bicycleId', 'title')
        .exec(),
      this.walletTransactionModel.countDocuments(query),
    ]);

    return {
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get wallet summary
   */
  async getWalletSummary(userId: string): Promise<any> {
    const wallet = await this.getWallet(userId);

    const recentTransactions = await this.walletTransactionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyStats = await this.walletTransactionModel.aggregate([
      {
        $match: {
          userId: wallet.userId,
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalIn: {
            $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] },
          },
          totalOut: {
            $sum: {
              $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0],
            },
          },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    return {
      wallet: {
        balance: wallet.balance,
        pendingBalance: wallet.pendingBalance,
        availableBalance: wallet.balance - wallet.pendingBalance,
        totalDeposited: wallet.totalDeposited,
        totalWithdrawn: wallet.totalWithdrawn,
        totalEarned: wallet.totalEarned,
        totalSpent: wallet.totalSpent,
        status: wallet.status,
      },
      recentTransactions,
      last30Days: monthlyStats[0] || {
        totalIn: 0,
        totalOut: 0,
        transactionCount: 0,
      },
    };
  }

  /**
   * Request withdrawal to bank account
   */
  async requestWithdrawal(
    userId: string,
    amount: number,
    bankDetails: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    },
  ): Promise<WalletTransactionDocument> {
    const wallet = await this.getWallet(userId);
    const availableBalance = wallet.balance - wallet.pendingBalance;

    if (availableBalance < amount) {
      throw new BadRequestException(
        `Insufficient available balance. Available: ${availableBalance} VND`,
      );
    }

    if (amount < 100000) {
      throw new BadRequestException('Minimum withdrawal amount is 100,000 VND');
    }

    const session = await this.walletModel.db.startSession();
    session.startTransaction();

    try {
      const walletTransaction = await this.debit(
        userId,
        amount,
        WalletTransactionType.WITHDRAWAL,
        `Withdrawal to ${bankDetails.bankName} - ${bankDetails.accountNumber}`,
        undefined,
        session,
      );

      walletTransaction.withdrawalDetails = { ...bankDetails };
      walletTransaction.status = WalletTransactionStatus.PENDING;
      await walletTransaction.save({ session });

      await session.commitTransaction();

      return walletTransaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Admin accepts a pending withdrawal request (marks as completed)
   */
  async acceptWithdrawal(
    transactionId: string,
  ): Promise<WalletTransactionDocument> {
    const walletTransaction = await this.walletTransactionModel.findById(
      transactionId,
    );

    if (!walletTransaction) {
      throw new NotFoundException('Withdrawal transaction not found');
    }

    if (walletTransaction.type !== WalletTransactionType.WITHDRAWAL) {
      throw new BadRequestException('Transaction is not a withdrawal');
    }

    if (walletTransaction.status !== WalletTransactionStatus.PENDING) {
      throw new BadRequestException('Withdrawal is not pending');
    }

    walletTransaction.status = WalletTransactionStatus.COMPLETED;
    walletTransaction.withdrawalDetails = {
      ...(walletTransaction.withdrawalDetails || {}),
      processedAt: new Date(),
    };

    await walletTransaction.save();

    return walletTransaction;
  }

  /**
   * List withdrawal requests (admin)
   */
  async getWithdrawalRequests(filters?: {
    status?: WalletTransactionStatus;
    page?: number;
    limit?: number;
  }): Promise<{
    transactions: WalletTransactionDocument[];
    total: number;
    page: number;
    pages: number;
  }> {
    const query: any = { type: WalletTransactionType.WITHDRAWAL };

    if (filters?.status) {
      query.status = filters.status;
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.walletTransactionModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.walletTransactionModel.countDocuments(query),
    ]);

    return {
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Charge seller a listing fee when posting a bicycle
   */
  // async chargeListingFee(
  //   sellerId: string,
  //   bicycleId: string,
  //   listingFee: number = 20000,
  // ): Promise<WalletTransactionDocument> {
  //   const wallet = await this.getWallet(sellerId);
  //   const availableBalance = wallet.balance - wallet.pendingBalance;

  //   if (availableBalance < listingFee) {
  //     throw new BadRequestException(
  //       `Insufficient balance to post bicycle. Required: ${listingFee} VND, Available: ${availableBalance} VND. Please top up your wallet.`,
  //     );
  //   }

  //   return await this.debit(
  //     sellerId,
  //     listingFee,
  //     WalletTransactionType.LISTING_FEE,
  //     `Listing fee for bicycle ${bicycleId}`,
  //     { bicycleId },
  //   );
  // }
}