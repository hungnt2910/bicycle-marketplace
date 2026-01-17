import { Module } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { EscrowController } from './escrow.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuditLog,
  AuditLogSchema,
  Bicycle,
  BicycleSchema,
  Transaction,
  TransactionSchema,
} from 'src/entities';
import { TransactionsService } from '../transactions/transactions.service';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Bicycle.name, schema: BicycleSchema },
      // { name: Dispute.name, schema: DisputeSchema },
    ]),
  ],
  providers: [EscrowService, TransactionsService, NotificationsService],
  controllers: [EscrowController],
})
export class EscrowModule {}
