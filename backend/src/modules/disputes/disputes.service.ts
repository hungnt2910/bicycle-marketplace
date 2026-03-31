import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Dispute,
  DisputeDocument,
  DisputeStatus,
} from '../../entities/dispute.entity';
import {
  Transaction,
  TransactionDocument,
  TransactionStatus,
} from '../../entities/transaction.entity';
import {
  InspectionReport,
  InspectionReportDocument,
} from '../../entities/inspection-report.entity';
import {
  Bicycle,
  BicycleDocument,
  BicycleStatus,
} from '../../entities/bicycle.entity';
import { EscrowService } from '../escrow/escrow.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';

@Injectable()
export class DisputesService {
  constructor(
    @InjectModel(Dispute.name) private disputeModel: Model<DisputeDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(InspectionReport.name)
    private inspectionModel: Model<InspectionReportDocument>,
    @InjectModel(Bicycle.name) private bicycleModel: Model<BicycleDocument>,
    private escrowService: EscrowService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Step 1: Buyer creates dispute
   */
  async createDispute(
    reporterId: string,
    createDto: CreateDisputeDto,
  ): Promise<Dispute> {
    const { transactionId, reason, description, evidence } = createDto;

    // Verify transaction
    const transaction = await this.transactionModel.findById(transactionId);

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.buyerId.toString() !== reporterId) {
      throw new ForbiddenException('Only the buyer can create a dispute');
    }

    // Freeze transaction
    transaction.status = TransactionStatus.DISPUTED;
    await transaction.save();

    await this.escrowService.freezeTransaction(transaction);

    // Create dispute
    const dispute = await this.disputeModel.create({
      transactionId,
      reporterId,
      reportedUserId: transaction.sellerId,
      reason,
      description,
      evidence,
      status: DisputeStatus.OPEN,
      timeline: [
        {
          action: 'Dispute opened',
          performedBy: reporterId as any,
          notes: description,
          timestamp: new Date(),
        },
      ],
    });

    // Update transaction
    transaction.dispute = {
      isDisputed: true,
      disputeId: dispute._id as any,
      reason,
      filedAt: new Date(),
    };
    await transaction.save();

    // Notify seller
    // await this.notificationsService.create({
    //   userId: transaction.sellerId,
    //   type: 'dispute_opened',
    //   title: 'Dispute Opened',
    //   message: `Buyer has opened a dispute: ${reason}`,
    //   relatedEntity: {
    //     entityType: 'dispute',
    //     entityId: dispute._id,
    //   },
    // });

    return dispute;
  }

  /**
   * Step 2: Admin assigns dispute to themselves
   */
  async assignDispute(disputeId: string, adminId: string): Promise<Dispute> {
    const dispute = await this.disputeModel.findById(disputeId);
    const disputeTimeline = dispute?.timeline || [];

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    dispute.assignedAdminId = adminId as any;
    dispute.status = DisputeStatus.UNDER_REVIEW;

    disputeTimeline.push({
      action: 'Assigned to admin',
      performedBy: adminId as any,
      notes: 'Admin reviewing dispute',
      timestamp: new Date(),
    } as any);
    await dispute.save();

    return dispute;
  }

  //  Inspector provides comparison evidence
  async addInspectorEvidence(
    disputeId: string,
    inspectorId: string,
    comparisonNotes: string,
  ): Promise<Dispute> {
    const dispute = await this.disputeModel.findById(disputeId);
    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }
    const disputeTimeline = dispute?.timeline || [];

    // Get original inspection report
    const transaction = await this.transactionModel.findById(
      dispute.transactionId,
    );
    const inspection = await this.inspectionModel.findOne({
      bicycleId: transaction?.bicycleId,
    });

    dispute.inspectorReport = {
      inspectorId: inspectorId as any,
      reportId: inspection?._id as any,
      comparisonNotes,
    };

    disputeTimeline.push({
      action: 'Inspector evidence added',
      performedBy: inspectorId as any,
      notes: comparisonNotes,
      timestamp: new Date(),
    } as any);

    await dispute.save();

    return dispute;
  }

  // Step 3: Admin resolves dispute
  async resolveDispute(
    disputeId: string,
    adminId: string,
    resolveDto: ResolveDisputeDto,
  ): Promise<Dispute> {
    const dispute = await this.disputeModel.findById(disputeId);

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }
    const disputeTimeline = dispute?.timeline || [];

    const transaction = await this.transactionModel.findById(
      dispute.transactionId,
    );

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    const {
      decision,
      refundAmount,
      penaltyToSeller,
      penaltyToBuyer,
      notes,
      requireReturn,
    } = resolveDto;

    // Update dispute resolution
    dispute.resolution = {
      decision,
      refundAmount: refundAmount || 0,
      penaltyToSeller: penaltyToSeller || 0,
      penaltyToBuyer: penaltyToBuyer || 0,
      notes,
      resolvedAt: new Date(),
    };

    // Update status based on decision
    if (decision === 'buyer_favor') {
      // If admin requires the buyer to return the bicycle first,
      // set the dispute to a return-requested state and wait for the
      // buyer to ship and seller to confirm before refunding.
      dispute.status = DisputeStatus.RETURN_REQUESTED;
      // if (!dispute.resolution) dispute.resolution = {} as any;
      dispute.resolution.requireReturn = true;
      const bicycle = await this.bicycleModel.findById(transaction.bicycleId);
      if (bicycle) {
        bicycle.status = BicycleStatus.DRAFT;
        bicycle.updatedAt = new Date();
        console.log("Update date at", bicycle.updatedAt)
        await bicycle.save();
      }

      disputeTimeline.push({
        action: 'Return requested by admin',
        performedBy: adminId as any,
        notes: 'Buyer must return bicycle to seller before refund',
        timestamp: new Date(),
      } as any);
    } else if (decision === 'seller_favor') {
      dispute.status = DisputeStatus.RESOLVED_SELLER_FAVOR;

      // Release funds to seller
      await this.escrowService.releaseFunds(transaction._id.toString());
      transaction.status = TransactionStatus.COMPLETED;

      const bicycle = await this.bicycleModel.findById(transaction.bicycleId);
      if (bicycle) {
        bicycle.status = BicycleStatus.SOLD;
        bicycle.updatedAt = new Date();
        console.log("Update date at", bicycle.updatedAt)
        await bicycle.save();
      }
    } else if (decision === 'partial_refund') {
      dispute.status = DisputeStatus.RESOLVED_PARTIAL_REFUND;

      // Partial refund logic
      // Split funds between buyer and seller based on refundAmount
    }

    dispute.resolvedAt = new Date();
    disputeTimeline.push({
      action: `Dispute resolved: ${decision}`,
      performedBy: adminId as any,
      notes,
      timestamp: new Date(),
    } as any);

    await dispute.save();
    await transaction.save();

    // Notify both parties
    // await this.notificationsService.create({
    //   userId: transaction.buyerId,
    //   type: 'dispute_resolved',
    //   title: 'Dispute Resolved',
    //   message: `Admin decision: ${decision}. ${notes}`,
    //   relatedEntity: {
    //     entityType: 'dispute',
    //     entityId: dispute._id,
    //   },
    // });

    // await this.notificationsService.create({
    //   userId: transaction.sellerId,
    //   type: 'dispute_resolved',
    //   title: 'Dispute Resolved',
    //   message: `Admin decision: ${decision}. ${notes}`,
    //   relatedEntity: {
    //     entityType: 'dispute',
    //     entityId: dispute._id,
    //   },
    // });

    return dispute;
  }

  // Buyer marks bicycle as sent back to seller (with optional tracking info)
  async markReturnSent(
    disputeId: string,
    buyerId: string,
    trackingInfo?: string,
  ): Promise<Dispute> {
    const dispute = await this.disputeModel.findById(disputeId);
    if (!dispute) throw new BadRequestException('Dispute not found');

    if (dispute.status !== DisputeStatus.RETURN_REQUESTED) {
      throw new BadRequestException('Return not requested for this dispute');
    }

    if (dispute.reporterId.toString() !== buyerId) {
      throw new ForbiddenException('Only reporting buyer can mark return sent');
    }

    dispute.returnInfo = {
      sentByBuyerId: buyerId as any,
      trackingInfo,
      sentAt: new Date(),
    } as any;

    dispute.status = DisputeStatus.AWAITING_SELLER_CONFIRMATION;
    dispute.timeline = dispute.timeline || [];
    dispute.timeline.push({
      action: 'Buyer marked return sent',
      performedBy: buyerId as any,
      notes: trackingInfo,
      timestamp: new Date(),
    } as any);

    await dispute.save();
    return dispute;
  }

  // Seller confirms they have received the returned bicycle — release refund
  async sellerConfirmReceived(
    disputeId: string,
    sellerId: string,
  ): Promise<Dispute> {
    const dispute = await this.disputeModel.findById(disputeId);
    if (!dispute) throw new BadRequestException('Dispute not found');

    if (dispute.status !== DisputeStatus.AWAITING_SELLER_CONFIRMATION) {
      throw new BadRequestException('Return not awaiting seller confirmation');
    }

    if (
      !dispute.reportedUserId ||
      dispute.reportedUserId.toString() !== sellerId
    ) {
      throw new ForbiddenException('Only the seller can confirm receipt');
    }

    dispute.returnInfo = dispute.returnInfo || ({} as any);
    (dispute.returnInfo as any).sellerConfirmedAt = new Date();
    dispute.status = DisputeStatus.RETURN_RECEIVED;

    const transaction = await this.transactionModel.findById(
      dispute.transactionId,
    );
    if (!transaction) throw new BadRequestException('Transaction not found');

    // Refund buyer now that seller confirmed receipt
    await this.escrowService.refundFunds(transaction);
    transaction.status = TransactionStatus.REFUNDED;

    // Reset bicycle to DRAFT so seller can refurbish and re-list
    const bicycle = await this.bicycleModel.findById(transaction.bicycleId);
    if (bicycle) {
      bicycle.status = BicycleStatus.ACTIVE;
      bicycle.inspection = undefined;
      bicycle.updatedAt = new Date();
        console.log("Update date at", bicycle.updatedAt)

      await bicycle.save();
    }

    dispute.timeline = dispute.timeline || [];
    dispute.timeline.push({
      action: 'Seller confirmed return received',
      performedBy: sellerId as any,
      notes: 'Refund issued to buyer',
      timestamp: new Date(),
    } as any);

    await dispute.save();
    await transaction.save();

    return dispute;
  }

  async getDisputeById(disputeId: string): Promise<Dispute> {
    const dispute = await this.disputeModel.findById(disputeId);
    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }
    return dispute;
  }

  async getMyDisputes(userId: string, status?: string): Promise<Dispute[]> {
    const query: any = {
      $or: [{ reporterId: userId }, { reportedUserId: userId }],
    };
    if (status) {
      query.status = status;
    }
    return this.disputeModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async getAllDisputes(
    status?: string,
    page = 1,
    limit = 20,
  ): Promise<{ disputes: Dispute[]; total: number }> {
    const query: any = {};
    if (status) {
      query.status = status;
    }
    const skip = (page - 1) * limit;
    const [disputes, total] = await Promise.all([
      this.disputeModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.disputeModel.countDocuments(query).exec(),
    ]);
    return { disputes, total };
  }
}
