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
import { WalletService } from '../wallet/wallet.service';
import { Wallet, WalletSchema } from 'src/entities/wallet.entity';
import {
  WalletTransaction,
  WalletTransactionSchema,
} from 'src/entities/wallet-transaction.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Bicycle.name, schema: BicycleSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
    ]),
  ],
  providers: [
    TransactionsService,
    EscrowService,
    NotificationsService,
    ConfigService,
    WalletService,
  ],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
