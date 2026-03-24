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
  User,
  UserSchema,
} from 'src/entities';
import { TransactionsService } from '../transactions/transactions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WalletService } from '../wallet/wallet.service';
import { Wallet, WalletSchema } from 'src/entities/wallet.entity';
import {
  WalletTransaction,
  WalletTransactionSchema,
} from 'src/entities/wallet-transaction.entity';
import { PaymentService } from '../payment/payment.service';
import { ZaloPayService } from '../payment/zalopay/zalopay.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Bicycle.name, schema: BicycleSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
      {name: User.name, schema: UserSchema}
      // { name: Dispute.name, schema: DisputeSchema },
    ]),
  ],
  providers: [
    EscrowService,
    TransactionsService,
    NotificationsService,
    WalletService,
    PaymentService,
    ZaloPayService,
    
  ],
  controllers: [EscrowController],
})
export class EscrowModule {}
