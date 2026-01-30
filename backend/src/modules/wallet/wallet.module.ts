import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from 'src/entities/wallet.entity';
import { WalletTransaction, WalletTransactionSchema } from 'src/entities/wallet-transaction.entity';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: Wallet.name, schema: WalletSchema },
        { name: WalletTransaction.name, schema: WalletTransactionSchema },
      ]),
    ],
  controllers: [WalletController],
  providers: [WalletService]
})
export class WalletModule {}
