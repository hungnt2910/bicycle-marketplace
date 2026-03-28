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

  /**
   * CRON JOB: Auto-refund for fake deliveries
   * Run every hour to check if seller marked as delivered but buyer didn't confirm within 7 days
   * If true, automatically refund the buyer and release the bicycle back to market
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleFakeDeliveryRefunds() {
    this.logger.log(
      'Running fake delivery detection and auto-refund check...',
    );
    await this.transactionsService.autoRefundFakeDelivery();
  }
}