import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InspectionReport, InspectionReportDocument, InspectionType, InspectionVerdict } from '../../entities/inspection-report.entity';
import { Bicycle, BicycleDocument, BicycleStatus } from '../../entities/bicycle.entity';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument, UserRole } from 'src/entities';

@Injectable()
export class InspectionsService {
  constructor(
    @InjectModel(InspectionReport.name) 
    private inspectionModel: Model<InspectionReportDocument>,
    @InjectModel(Bicycle.name) 
    private bicycleModel: Model<BicycleDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  /**
   * Request inspection for a bicycle
   */
  async requestInspection(
    bicycleId: string,
    inspectionType: InspectionType,
    sellerId: string, // The seller requesting inspection
  ): Promise<InspectionReportDocument> {
    // 1. Verify bicycle exists and belongs to seller
    const bicycle = await this.bicycleModel.findById(bicycleId);

    if (!bicycle) {
      throw new BadRequestException('Bicycle not found');
    }

    if (bicycle.sellerId.toString() !== sellerId) {
      throw new BadRequestException('You can only request inspection for your own bicycles');
    }

    // Check if bicycle already has pending/active inspection
    const existingInspection = await this.inspectionModel.findOne({
      bicycleId,
      verdict: { $in: [null, InspectionVerdict.PENDING] },
    });

    if (existingInspection) {
      throw new BadRequestException('This bicycle already has a pending inspection');
    }

    // 2. Auto-assign inspector
    const assignedInspector = await this.autoAssignInspector(bicycle, inspectionType);

    if (!assignedInspector) {
      throw new BadRequestException('No available inspectors at the moment. Please try again later.');
    }

    // 3. Calculate inspection fee
    const feeKey = inspectionType === InspectionType.ONSITE 
      ? 'inspection_fee_onsite' 
      : 'inspection_fee_online';
    const inspectionFee = this.configService.get<number>(feeKey);

    // 4. Create inspection request
    const inspection = await this.inspectionModel.create({
      inspectorId: assignedInspector._id, // ✅ AUTO-ASSIGNED inspector
      bicycleId,
      inspectionType,
      inspectionFee,
      isPaid: false,
      verdict: "pending", // null = pending
    });

    // 5. Update bicycle status
    bicycle.status = BicycleStatus.PENDING_REVIEW;
    await bicycle.save();

    // 6. TODO: Send notification to assigned inspector
    // await this.notificationsService.notifyInspectorAssigned(
    //   assignedInspector._id.toString(),
    //   inspection._id.toString(),
    // );

    return inspection;
  }

  /**
   * Auto-assign inspector based on workload and location
   */
  private async autoAssignInspector(
    bicycle: BicycleDocument,
    inspectionType: InspectionType,
  ): Promise<UserDocument | null> {
    // Strategy 1: Find inspectors with least workload in same city
    const inspector = await this.findLeastBusyInspector(
      bicycle.location?.city,
      inspectionType,
    );

    if (inspector) {
      return inspector;
    }

    // Strategy 2: Find any available inspector (fallback)
    return await this.findAnyAvailableInspector();
  }

  /**
   * Find inspector with least pending inspections in same city
   */
  private async findLeastBusyInspector(
    city?: string,
    inspectionType?: InspectionType,
  ): Promise<UserDocument | null> {
    // Get all active inspectors
    const inspectors = await this.userModel
      .find({
        role: UserRole.INSPECTOR,
        status: 'active',
        ...(city && { 'profile.city': city }), // Prefer same city
      })
      .exec();

    if (inspectors.length === 0) {
      return null;
    }

    // Count pending inspections for each inspector
    const inspectorWorkloads = await Promise.all(
      inspectors.map(async (inspector) => {
        const pendingCount = await this.inspectionModel.countDocuments({
          inspectorId: inspector._id,
          verdict: null, // Pending inspections
        });

        return {
          inspector,
          pendingCount,
        };
      }),
    );

    // Sort by workload (least busy first)
    inspectorWorkloads.sort((a, b) => a.pendingCount - b.pendingCount);

    // Return inspector with least workload
    return inspectorWorkloads[0].inspector;
  }

  /**
   * Find any available inspector (fallback)
   */
  private async findAnyAvailableInspector(): Promise<UserDocument | null> {
    const inspector = await this.userModel.findOne({
      role: UserRole.INSPECTOR,
      status: 'active',
    });

    return inspector;
  }

  /**
   * Get inspector workload statistics
   */
  async getInspectorWorkload(inspectorId: string): Promise<{
    pending: number;
    completed: number;
    total: number;
    averageRating: number;
  }> {
    const [pending, completed, ratingResult] = await Promise.all([
      // Count pending inspections
      this.inspectionModel.countDocuments({
        inspectorId,
        verdict: null,
      }),

      // Count completed inspections
      this.inspectionModel.countDocuments({
        inspectorId,
        verdict: { $ne: null },
      }),

      // Calculate average rating
      this.inspectionModel.aggregate([
        {
          $match: {
            inspectorId: inspectorId,
            overallRating: { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$overallRating' },
          },
        },
      ]),
    ]);

    const total = pending + completed;
    const averageRating = ratingResult.length > 0 ? ratingResult[0].averageRating : 0;

    return {
      pending,
      completed,
      total,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    };
  }

  /**
   * Reassign inspection to different inspector
   */
  async reassignInspection(
    inspectionId: string,
    newInspectorId: string,
    adminId: string,
  ): Promise<InspectionReportDocument> {
    const inspection = await this.inspectionModel.findById(inspectionId);

    if (!inspection) {
      throw new BadRequestException('Inspection not found');
    }

    if (inspection.verdict !== null) {
      throw new BadRequestException('Cannot reassign completed inspection');
    }

    // Verify new inspector exists and is active
    const newInspector = await this.userModel.findOne({
      _id: newInspectorId,
      role: UserRole.INSPECTOR,
      status: 'active',
    });

    if (!newInspector) {
      throw new BadRequestException('Inspector not found or inactive');
    }

    const oldInspectorId = inspection.inspectorId;
    inspection.inspectorId = newInspectorId as any;
    await inspection.save();

    // TODO: Create audit log
    // await this.auditLogService.log({
    //   adminId,
    //   action: 'reassign_inspection',
    //   entityType: 'InspectionReport',
    //   entityId: inspectionId,
    //   changes: {
    //     from: oldInspectorId,
    //     to: newInspectorId,
    //   },
    // });

    // TODO: Notify both inspectors
    // await this.notificationsService.notifyInspectorReassigned(...)

    return inspection;
  }

  /**
   * Get all inspectors with their current workload
   */
  async getAllInspectorsWithWorkload(): Promise<any[]> {
    const inspectors = await this.userModel
      .find({
        role: UserRole.INSPECTOR,
        status: 'active',
      })
      .select('email profile.fullName profile.city profile.district reputation')
      .exec();

    const inspectorsWithWorkload = await Promise.all(
      inspectors.map(async (inspector) => {
        const workload = await this.getInspectorWorkload(inspector._id.toString());
        const profile = (inspector as any).profile || {};
        
        return {
          _id: inspector._id,
          email: inspector.email,
          fullName: profile.fullName,
          city: profile.city,
          district: profile.district,
          reputation: inspector.reputation,
          workload,
        };
      }),
    );

    // Sort by pending workload (least busy first)
    inspectorsWithWorkload.sort((a, b) => a.workload.pending - b.workload.pending);

    return inspectorsWithWorkload;
  }

  /**
   * Inspector completes inspection
   */
  async completeInspection(
    inspectionId: string,
    inspectorId: string,
    inspectionData: any
  ): Promise<InspectionReport> {
    const inspection = await this.inspectionModel.findById(inspectionId);

    if (!inspection) {
      throw new BadRequestException('Inspection not found');
    }

    // Calculate validity period (30 days default)
    const validityDays = this.configService.get<number>('INSPECTION_VALIDITY_DAYS', 30);
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);

    // Update inspection report
    inspection.inspectorId = inspectorId as any;
    inspection.technicalChecks = inspectionData.technicalChecks;
    inspection.overallRating = inspectionData.overallRating;
    inspection.verdict = inspectionData.verdict;
    inspection.recommendations = inspectionData.recommendations;
    inspection.media = inspectionData.media;
    inspection.validUntil = validUntil;

    await inspection.save();

    // Update bicycle with inspection results
    const bicycle = await this.bicycleModel.findById(inspection.bicycleId);

    if(!bicycle) {
      throw new BadRequestException('Bicycle not found');
    }

    if (inspectionData.verdict === 'approved' || inspectionData.verdict === 'approved_with_conditions') {
      bicycle.inspection = {
        isInspected: true,
        inspectorId: inspectorId as any,
        inspectionDate: new Date(),
        reportId: inspection._id as any,
        expiryDate: validUntil,
        label: 'Xe đã kiểm định',
      };
      bicycle.status = BicycleStatus.ACTIVE; // Now available for sale
    } else {
      bicycle.status = BicycleStatus.REJECTED; // Cannot be sold
    }

    await bicycle.save();

    return inspection;
  }

  /**
   * Get inspection report (for dispute resolution)
   */
  async getInspectionReport(bicycleId: string): Promise<InspectionReport> {
    const report = await this.inspectionModel
      .findOne({ bicycleId })
      .sort({ createdAt: -1 })
      .exec();

    if (!report) {
      throw new BadRequestException('No inspection report found for this bicycle');
    }

    return report;
  }

  async getPendingInspections(): Promise<InspectionReport[]> {
    return this.inspectionModel.find({ verdict: InspectionVerdict.PENDING }).exec();
  }

  async getInspectionById(inspectionId: string): Promise<InspectionReport> {
    const inspection = await this.inspectionModel.findById(inspectionId);
    if (!inspection) {
      throw new BadRequestException('Inspection not found');
    }
    return inspection;
  }

  async getAllInspections(
    verdict?: InspectionVerdict,
    page = 1,
    limit = 10,
  ): Promise<{ inspections: InspectionReport[]; total: number }> {
    const query: any = {};
    if (verdict) {
      query.verdict = verdict;
    }
    const skip = (page - 1) * limit;

    const [inspections, total] = await Promise.all([
      this.inspectionModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.inspectionModel.countDocuments(query).exec(),
    ]);
    return { inspections, total };
  }

  async getInspectorInspections(
    inspectorId: string,
  ): Promise<InspectionReport[]> {
    return this.inspectionModel
      .find({ inspectorId })
      .sort({ createdAt: -1 })
      .exec();
  }
}