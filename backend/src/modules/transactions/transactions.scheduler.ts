// transactions.scheduler.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TransactionsService } from './transactions.service';

@Injectable()
export class TransactionsScheduler {
  private readonly logger = new Logger(TransactionsScheduler.name);

  constructor(private readonly transactionsService: TransactionsService) {}

  // Run every hour to auto-forfeit expired deposits
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredDeposits() {
    await this.transactionsService.autoForfeitExpiredDeposits();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleDisputeWindowRelease() {
    this.logger.log('Running dispute window release check...');
    await this.transactionsService.autoReleaseAfterDisputeWindow();
  }
}