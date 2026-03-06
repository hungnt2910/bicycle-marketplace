import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from 'src/entities/wallet.entity';
import { WalletTransaction, WalletTransactionSchema } from 'src/entities/wallet-transaction.entity';
import { Transaction, TransactionSchema } from 'src/entities';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: Wallet.name, schema: WalletSchema },
        { name: WalletTransaction.name, schema: WalletTransactionSchema },
        {name: Transaction.name, schema: TransactionSchema}
      ]),
    ],
  controllers: [WalletController],
  providers: [WalletService]
})
export class WalletModule {}
