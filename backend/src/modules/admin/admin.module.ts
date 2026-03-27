import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import {
  SystemSetting,
  SystemSettingSchema,
} from 'src/entities/system-setting.entity';
import {
  SettingCategory,
  SettingCategorySchema,
} from 'src/entities/category-systemField-entity';
import { User, UserSchema } from 'src/entities/user.entity';
import { Transaction, TransactionSchema } from 'src/entities';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemSetting.name, schema: SystemSettingSchema },
    ]),
    MongooseModule.forFeature([
      {
        name: SettingCategory.name,
        schema: SettingCategorySchema,
      },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
