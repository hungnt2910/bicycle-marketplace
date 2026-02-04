import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SystemSetting,
  SystemSettingDocument,
} from '../entities/system-setting.entity';
import {
  Category,
  CategoryDocument,
  CategoryType,
} from '../entities/category.entity';
import { User, UserDocument } from 'src/entities';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectModel(SystemSetting.name)
    private systemSettingModel: Model<SystemSettingDocument>,
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    this.logger.log('🌱 Starting database seeding...');

    await this.seedCategories();

    this.logger.log('✅ Database seeding completed!');
  }

  private async seedCategories() {
    const count = await this.categoryModel.countDocuments();

    if (count > 0) {
      this.logger.log('⏭️  Categories already exist, skipping...');
      return;
    }

    const bicycleTypes = [
      {
        name: 'Mountain Bike',
        slug: 'mountain',
        type: CategoryType.BICYCLE_TYPE,
        description: 'Off-road bicycles designed for rough terrain',
      },
      {
        name: 'Road Bike',
        slug: 'road',
        type: CategoryType.BICYCLE_TYPE,
        description: 'Lightweight bikes for paved roads',
      },
      {
        name: 'Hybrid Bike',
        slug: 'hybrid',
        type: CategoryType.BICYCLE_TYPE,
        description: 'Versatile bikes for various terrains',
      },
      {
        name: 'Electric Bike',
        slug: 'electric',
        type: CategoryType.BICYCLE_TYPE,
        description: 'Bikes with electric motor assistance',
      },
      {
        name: 'Folding Bike',
        slug: 'folding',
        type: CategoryType.BICYCLE_TYPE,
        description: 'Compact foldable bicycles',
      },
      {
        name: 'BMX',
        slug: 'bmx',
        type: CategoryType.BICYCLE_TYPE,
        description: 'Bikes for tricks and stunts',
      },
      {
        name: 'Cruiser',
        slug: 'cruiser',
        type: CategoryType.BICYCLE_TYPE,
        description: 'Comfortable bikes for casual riding',
      },
    ];

    const brands = [
      {
        name: 'Giant',
        slug: 'giant',
        type: CategoryType.BRAND,
        description: 'Leading bicycle manufacturer',
      },
      {
        name: 'Trek',
        slug: 'trek',
        type: CategoryType.BRAND,
        description: 'Premium bicycle brand',
      },
      {
        name: 'Specialized',
        slug: 'specialized',
        type: CategoryType.BRAND,
        description: 'High-performance bikes',
      },
      {
        name: 'Cannondale',
        slug: 'cannondale',
        type: CategoryType.BRAND,
        description: 'Innovative bicycle designs',
      },
      {
        name: 'Scott',
        slug: 'scott',
        type: CategoryType.BRAND,
        description: 'Swiss bicycle manufacturer',
      },
      {
        name: 'Merida',
        slug: 'merida',
        type: CategoryType.BRAND,
        description: 'Taiwanese bicycle brand',
      },
    ];

    await this.categoryModel.insertMany([...bicycleTypes, ...brands]);
    this.logger.log('✅ Categories seeded successfully!');
  }
}
