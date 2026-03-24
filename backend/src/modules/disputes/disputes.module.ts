import { Module } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { DisputesController } from './disputes.controller';
import { EscrowService } from '../escrow/escrow.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  AuditLog,
  AuditLogSchema,
  Bicycle,
  BicycleSchema,
  Dispute,
  DisputeSchema,
  InspectionReport,
  InspectionReportSchema,
  Transaction,
  TransactionSchema,
  User,
  UserSchema,
} from 'src/entities';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from 'src/entities/wallet.entity';
import {
  WalletTransaction,
  WalletTransactionSchema,
} from 'src/entities/wallet-transaction.entity';
import { WalletService } from '../wallet/wallet.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Dispute.name, schema: DisputeSchema },
      { name: InspectionReport.name, schema: InspectionReportSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
      {name : Bicycle.name, schema: BicycleSchema},
      {name: User.name, schema: UserSchema}
    ]),
  ],
  providers: [DisputesService, EscrowService, NotificationsService, WalletService],
  controllers: [DisputesController],
})
export class DisputesModule {}
