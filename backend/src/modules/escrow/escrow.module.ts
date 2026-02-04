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
import { WalletService } from '../wallet/wallet.service';
import { Wallet, WalletSchema } from 'src/entities/wallet.entity';
import {
  WalletTransaction,
  WalletTransactionSchema,
} from 'src/entities/wallet-transaction.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Bicycle.name, schema: BicycleSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
      // { name: Dispute.name, schema: DisputeSchema },
    ]),
  ],
  providers: [
    EscrowService,
    TransactionsService,
    NotificationsService,
    WalletService,
  ],
  controllers: [EscrowController],
})
export class EscrowModule {}
