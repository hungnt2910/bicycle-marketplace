import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review, ReviewSchema } from 'src/entities/review.entity';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';

import {
  Transaction,
  TransactionSchema,
} from 'src/entities/transaction.entity';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  providers: [ReviewsService],
  controllers: [ReviewsController],
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    TransactionsModule,
  ],
})
export class ReviewsModule {}
