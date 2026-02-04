import { forwardRef, Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import {
  AuditLog,
  AuditLogSchema,
  Bicycle,
  BicycleSchema,
  Transaction,
  TransactionSchema,
} from 'src/entities';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsService } from '../transactions/transactions.service';
import { ZaloPayService } from './zalopay/zalopay.service';
import { EscrowService } from '../escrow/escrow.service';
import { WalletService } from '../wallet/wallet.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Wallet, WalletSchema } from 'src/entities/wallet.entity';
import { WalletTransaction, WalletTransactionSchema } from 'src/entities/wallet-transaction.entity';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    forwardRef(() => TransactionsModule),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Bicycle.name, schema: BicycleSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    TransactionsService,
    ZaloPayService,
    EscrowService,
    WalletService,
    NotificationsService,
  ],
})
export class PaymentModule {}
