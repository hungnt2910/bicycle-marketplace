import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemSetting, SystemSettingDocument, SettingCategory } from '../entities/system-setting.entity';
import { Category, CategoryDocument, CategoryType } from '../entities/category.entity';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectModel(SystemSetting.name)
    private systemSettingModel: Model<SystemSettingDocument>,
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  async onModuleInit() {
    this.logger.log('🌱 Starting database seeding...');
    await this.seedSystemSettings();
    await this.seedCategories();
    this.logger.log('✅ Database seeding completed!');
  }

  private async seedSystemSettings() {
    const count = await this.systemSettingModel.countDocuments();
    
    if (count > 0) {
      this.logger.log('⏭️  System settings already exist, skipping...');
      return;
    }

    const defaultSettings = [
      {
        key: 'listing_fee',
        value: 0,
        description: 'Fee for posting a listing (0 = free posting)',
        category: SettingCategory.FEES,
      },
      {
        key: 'commission_rate',
        value: 0.05,
        description: 'Platform commission rate (5%)',
        category: SettingCategory.FEES,
      },
      {
        key: 'inspection_fee_onsite',
        value: 200000,
        description: 'Fee for onsite inspection (VND)',
        category: SettingCategory.FEES,
      },
      {
        key: 'inspection_fee_online',
        value: 100000,
        description: 'Fee for online inspection (VND)',
        category: SettingCategory.FEES,
      },
      {
        key: 'inspection_validity_days',
        value: 30,
        description: 'Number of days an inspection report is valid',
        category: SettingCategory.LIMITS,
      },
      {
        key: 'auto_release_escrow_days',
        value: 7,
        description: 'Days to auto-release escrow after delivery',
        category: SettingCategory.LIMITS,
      },
      {
        key: 'chatbot_enabled',
        value: true,
        description: 'Enable 24/7 chatbot support',
        category: SettingCategory.FEATURES,
      },
      {
        key: 'logistics_integration_enabled',
        value: true,
        description: 'Enable logistics provider integration',
        category: SettingCategory.FEATURES,
      },
    ];

    await this.systemSettingModel.insertMany(defaultSettings);
    this.logger.log('✅ System settings seeded successfully!');
  }

  private async seedCategories() {
    const count = await this.categoryModel.countDocuments();
    
    if (count > 0) {
      this.logger.log('⏭️  Categories already exist, skipping...');
      return;
    }

    const bicycleTypes = [
      { name: 'Mountain Bike', slug: 'mountain', type: CategoryType.BICYCLE_TYPE, description: 'Off-road bicycles designed for rough terrain' },
      { name: 'Road Bike', slug: 'road', type: CategoryType.BICYCLE_TYPE, description: 'Lightweight bikes for paved roads' },
      { name: 'Hybrid Bike', slug: 'hybrid', type: CategoryType.BICYCLE_TYPE, description: 'Versatile bikes for various terrains' },
      { name: 'Electric Bike', slug: 'electric', type: CategoryType.BICYCLE_TYPE, description: 'Bikes with electric motor assistance' },
      { name: 'Folding Bike', slug: 'folding', type: CategoryType.BICYCLE_TYPE, description: 'Compact foldable bicycles' },
      { name: 'BMX', slug: 'bmx', type: CategoryType.BICYCLE_TYPE, description: 'Bikes for tricks and stunts' },
      { name: 'Cruiser', slug: 'cruiser', type: CategoryType.BICYCLE_TYPE, description: 'Comfortable bikes for casual riding' },
    ];

    const brands = [
      { name: 'Giant', slug: 'giant', type: CategoryType.BRAND, description: 'Leading bicycle manufacturer' },
      { name: 'Trek', slug: 'trek', type: CategoryType.BRAND, description: 'Premium bicycle brand' },
      { name: 'Specialized', slug: 'specialized', type: CategoryType.BRAND, description: 'High-performance bikes' },
      { name: 'Cannondale', slug: 'cannondale', type: CategoryType.BRAND, description: 'Innovative bicycle designs' },
      { name: 'Scott', slug: 'scott', type: CategoryType.BRAND, description: 'Swiss bicycle manufacturer' },
      { name: 'Merida', slug: 'merida', type: CategoryType.BRAND, description: 'Taiwanese bicycle brand' },
    ];

    await this.categoryModel.insertMany([...bicycleTypes, ...brands]);
    this.logger.log('✅ Categories seeded successfully!');
  }
}