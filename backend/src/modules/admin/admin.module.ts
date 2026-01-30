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
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
