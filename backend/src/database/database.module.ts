import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseSeederService } from './database-seeder.service';
import { SystemSetting, SystemSettingSchema } from '../entities/system-setting.entity';
import { Category, CategorySchema } from '../entities/category.entity';
import { User, UserSchema } from 'src/entities';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemSetting.name, schema: SystemSettingSchema },
      { name: Category.name, schema: CategorySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [DatabaseSeederService],
  exports: [DatabaseSeederService],
})
export class DatabaseModule {}