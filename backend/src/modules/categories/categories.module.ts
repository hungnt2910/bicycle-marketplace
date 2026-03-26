import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { SystemSetting, SystemSettingSchema } from 'src/entities';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SystemSetting.name,
        schema: SystemSettingSchema,
      },
    ]),
  ],
  providers: [CategoriesService], // Không cần declare SystemSetting ở providers
  controllers: [CategoriesController],
})
export class CategoriesModule {}
