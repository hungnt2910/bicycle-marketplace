import { Module } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { DisputesController } from './disputes.controller';
import { EscrowService } from '../escrow/escrow.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  AuditLog,
  AuditLogSchema,
  Dispute,
  DisputeSchema,
  InspectionReport,
  InspectionReportSchema,
  Transaction,
  TransactionSchema,
} from 'src/entities';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Dispute.name, schema: DisputeSchema },
      { name: InspectionReport.name, schema: InspectionReportSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  providers: [DisputesService, EscrowService, NotificationsService],
  controllers: [DisputesController],
})
export class DisputesModule {}
