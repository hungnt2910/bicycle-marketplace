import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { EscrowService } from '../escrow/escrow.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuditLog,
  AuditLogSchema,
  Bicycle,
  BicycleSchema,
  Transaction,
  TransactionSchema,
} from 'src/entities';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Bicycle.name, schema: BicycleSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  providers: [
    TransactionsService,
    EscrowService,
    NotificationsService,
    ConfigService,
  ],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
