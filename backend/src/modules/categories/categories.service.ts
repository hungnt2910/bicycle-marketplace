import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemSetting, SystemSettingDocument } from 'src/entities';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(SystemSetting.name)
    private readonly systemSettingModel: Model<SystemSettingDocument>,
  ) {}

  // ================== CORE ==================

  async getConfigByKey(key: string) {
    return await this.systemSettingModel
      .findOne({ 'name_value.key': key })
      .exec();
  }

  async getValueByKey(key: string) {
    try {
      const config = await this.systemSettingModel
        .findOne({ 'name_value.key': key })
        .exec();
      return config?.value;
    } catch (error) {
      return null;
    }
  }

  async getMultipleConfigs(keys: string[]) {
    return await this.systemSettingModel
      .find({
        'name_value.key': { $in: keys },
      })
      .exec();
  }

  // ================== FEES ==================

  async getPostingFee() {
    return this.getValueByKey('post_fee');
  }

  async getInspectionFee() {
    return this.getValueByKey('inspection_fee');
  }

  async getPlatformFeePercent() {
    return this.getValueByKey('platform_fee_percent');
  }

  async getDepositPercent() {
    return this.getValueByKey('deposit_percent');
  }

  // ================== WALLET ==================

  async getMinWithdrawalAmount() {
    return this.getValueByKey('min_withdrawal_amount');
  }

  // ================== ORDER ==================

  async getAutoCancelUnpaidHours() {
    return this.getValueByKey('auto_cancel_unpaid_hours');
  }

  async getDisputeTimeLimitDays() {
    return this.getValueByKey('dispute_time_limit_days');
  }

  // ================== INSPECTION ==================

  async getInspectionDeadlineDays() {
    return this.getValueByKey('inspection_deadline_days');
  }

  // ================== LISTING ==================

  async getMaxImagesPerListing() {
    return this.getValueByKey('max_images_per_listing');
  }

  async getMaxActiveListingsPerUser() {
    return this.getValueByKey('max_active_listings_per_user');
  }
}
