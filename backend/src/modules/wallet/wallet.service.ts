import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Wallet, WalletDocument, WalletStatus } from '../../entities/wallet.entity';
import { 
  WalletTransaction, 
  WalletTransactionDocument,
  WalletTransactionType,
  WalletTransactionStatus 
} from '../../entities/wallet-transaction.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(WalletTransaction.name) 
    private walletTransactionModel: Model<WalletTransactionDocument>,
  ) {}

  /**
   * Create wallet for new user
   * ✅ Returns WalletDocument (not Wallet)
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

    return wallet; // ✅ TypeScript is happy now
  }

  /**
   * Get user's wallet
   * ✅ Returns WalletDocument
   */
  async getWallet(userId: string): Promise<WalletDocument> {
    let wallet = await this.walletModel.findOne({ userId });

    if (!wallet) {
      return await this.createWallet(userId);
    }

    return wallet;
  }

  /**
   * Credit wallet (add money)
   * ✅ Returns WalletTransactionDocument
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

    // Update wallet
    wallet.balance = balanceAfter;
    wallet.totalDeposited += amount;
    wallet.lastTransactionAt = new Date();

    // Track earnings for sellers
    if (type === WalletTransactionType.SALE_PAYMENT) {
      wallet.totalEarned += amount;
    }

    await wallet.save({ session }); // ✅ .save() works now!

    // Create transaction record
    const walletTransaction = await this.walletTransactionModel.create([{
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
    }], { session });

    return walletTransaction[0];
  }

  /**
   * Debit wallet (subtract money)
   * ✅ Returns WalletTransactionDocument
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
        `Insufficient balance. Available: ${wallet.balance} VND, Required: ${amount} VND`
      );
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amount;

    // Update wallet
    wallet.balance = balanceAfter;
    wallet.totalWithdrawn += amount;
    wallet.lastTransactionAt = new Date();

    // Track spending for buyers
    if (type === WalletTransactionType.PURCHASE) {
      wallet.totalSpent += amount;
    }

    await wallet.save({ session }); // ✅ Works!

    // Create transaction record
    const walletTransaction = await this.walletTransactionModel.create([{
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
    }], { session });

    return walletTransaction[0];
  }

  /**
   * Transfer between wallets
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

      return {
        from: fromTransaction,
        to: toTransaction,
      };
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

    // Increase pending balance
    wallet.pendingBalance += amount;
    await wallet.save(); // ✅ Works!

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

    // Get recent transactions
    const recentTransactions = await this.walletTransactionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();

    // Get monthly statistics
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
            $sum: {
              $cond: [{ $gt: ['$amount', 0] }, '$amount', 0],
            },
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
        `Insufficient available balance. Available: ${availableBalance} VND`
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

      // Update with bank details
      walletTransaction.withdrawalDetails = {
        ...bankDetails,
      };
      walletTransaction.status = WalletTransactionStatus.PENDING;
      await walletTransaction.save({ session }); // ✅ Works!

      await session.commitTransaction();

      return walletTransaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}