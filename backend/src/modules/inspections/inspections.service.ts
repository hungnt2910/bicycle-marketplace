import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InspectionReport, InspectionReportDocument, InspectionVerdict } from '../../entities/inspection-report.entity';
import { Bicycle, BicycleDocument, BicycleStatus } from '../../entities/bicycle.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InspectionsService {
  constructor(
    @InjectModel(InspectionReport.name) 
    private inspectionModel: Model<InspectionReportDocument>,
    @InjectModel(Bicycle.name) 
    private bicycleModel: Model<BicycleDocument>,
    private configService: ConfigService,
  ) {}

  /**
   * Request inspection for a bicycle
   */
  async requestInspection(
    bicycleId: string,
    inspectionType: 'onsite' | 'online'
  ): Promise<InspectionReport> {
    const bicycle = await this.bicycleModel.findById(bicycleId);

    if (!bicycle) {
      throw new BadRequestException('Bicycle not found');
    }

    // Calculate inspection fee
    const feeKey = inspectionType === 'onsite' 
      ? 'inspection_fee_onsite' 
      : 'inspection_fee_online';
    const inspectionFee = this.configService.get<number>(feeKey);

    // Create inspection request
    const inspection = await this.inspectionModel.create({
      bicycleId,
      inspectionType,
      inspectionFee,
      isPaid: false,
      verdict: InspectionVerdict.PENDING, // Pending
    });

    // Update bicycle status
    bicycle.status = BicycleStatus.PENDING_REVIEW;
    await bicycle.save();

    return inspection;
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