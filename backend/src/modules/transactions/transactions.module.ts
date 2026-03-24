import { forwardRef, Module } from '@nestjs/common';
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
  User,
  UserSchema,
} from 'src/entities';
import { WalletService } from '../wallet/wallet.service';
import { Wallet, WalletSchema } from 'src/entities/wallet.entity';
import {
  WalletTransaction,
  WalletTransactionSchema,
} from 'src/entities/wallet-transaction.entity';
import { PaymentService } from '../payment/payment.service';
import { ZaloPayService } from '../payment/zalopay/zalopay.service';
import { PaymentModule } from '../payment/payment.module';
import { TransactionsScheduler } from './transactions.scheduler';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    forwardRef(() => PaymentModule),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Bicycle.name, schema: BicycleSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
      {name: User.name, schema: UserSchema}
    ]),
  ],
  providers: [
    TransactionsService,
    EscrowService,
    NotificationsService,
    ConfigService,
    WalletService,
    PaymentService,
    ZaloPayService,
    TransactionsScheduler,
    UsersService
  ],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
