import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseSeederService } from './database-seeder.service';
import { SystemSetting, SystemSettingSchema } from '../entities/system-setting.entity';
import { Category, CategorySchema } from '../entities/category.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemSetting.name, schema: SystemSettingSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [DatabaseSeederService],
  exports: [DatabaseSeederService],
})
export class DatabaseModule {}