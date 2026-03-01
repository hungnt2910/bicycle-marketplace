// transactions.scheduler.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TransactionsService } from './transactions.service';

@Injectable()
export class TransactionsScheduler {
  constructor(private readonly transactionsService: TransactionsService) {}

  // Run every hour to auto-forfeit expired deposits
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredDeposits() {
    await this.transactionsService.autoForfeitExpiredDeposits();
  }
}