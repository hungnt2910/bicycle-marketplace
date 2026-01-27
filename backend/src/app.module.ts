import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { getDatabaseConfig } from './config/database.config';
import { UsersModule } from './modules/users/users.module';
import { BicyclesModule } from './modules/bicycles/bicycles.module';
import { InspectionsModule } from './modules/inspections/inspections.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { MessagesModule } from './modules/messages/messages.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { User, UserSchema } from './entities/user.entity';
import { Bicycle, BicycleSchema } from './entities/bicycle.entity';
import {
  InspectionReport,
  InspectionReportSchema,
} from './entities/inspection-report.entity';
import { Transaction, TransactionSchema } from './entities/transaction.entity';
import { Dispute, DisputeSchema } from './entities/dispute.entity';
import { Review, ReviewSchema } from './entities/review.entity';
import { Message, MessageSchema } from './entities/message.entity';
import {
  Conversation,
  ConversationSchema,
} from './entities/conversation.entity';
import { Wishlist, WishlistSchema } from './entities/wishlist.entity';
import {
  Notification,
  NotificationSchema,
} from './entities/notification.entity';
import { Category, CategorySchema } from './entities/category.entity';
import {
  SystemSetting,
  SystemSettingSchema,
} from './entities/system-setting.entity';
import { AuditLog, AuditLogSchema } from './entities/audit-log.entity';
import { DatabaseModule } from './database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { EscrowModule } from './modules/escrow/escrow.module';
import { WalletModule } from './modules/wallet/wallet.module';

@Module({
  imports: [
    // Environment Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Bicycle.name, schema: BicycleSchema },
      { name: InspectionReport.name, schema: InspectionReportSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Dispute.name, schema: DisputeSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Wishlist.name, schema: WishlistSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SystemSetting.name, schema: SystemSettingSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),

    // Schedule Jobs (for auto-release escrow)
    ScheduleModule.forRoot(),

    DatabaseModule,

    UsersModule,

    BicyclesModule,

    InspectionsModule,

    TransactionsModule,

    DisputesModule,

    ReviewsModule,

    MessagesModule,

    NotificationsModule,

    CategoriesModule,

    AuthModule,

    AdminModule,

    EscrowModule,

    WalletModule,

    // Your feature modules will go here
    // UsersModule,
    // BicyclesModule,
    // etc...
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Apply Roles guard globally
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
