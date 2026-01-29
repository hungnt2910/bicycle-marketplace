import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  SystemSetting,
  SystemSettingDocument,
} from 'src/entities/system-setting.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(SystemSetting.name)
    private systemSettingModel: Model<SystemSettingDocument>,
  ) {}

  async getSystemConfig(): Promise<SystemSetting | null> {
    let config = await this.systemSettingModel.findOne();
    return config;
  }

  // thêm được key và value
  async createSetting(
    data: Pick<SystemSetting, 'key' | 'value' | 'category' | 'description'>,
  ): Promise<SystemSetting> {
    const exists = await this.systemSettingModel.findOne({ key: data.key });
    if (exists) {
      throw new Error(`Setting with key "${data.key}" already exists`);
    }

    const setting = new this.systemSettingModel(data);
    return setting.save();
  }

  async updateSettingByKey(
    key: string,
    value: any,
    updatedBy?: Types.ObjectId,
  ): Promise<SystemSetting | null> {
    return this.systemSettingModel.findOneAndUpdate(
      { key },
      {
        value,
        updatedBy,
      },
      { new: true },
    );
  }

  async deleteSettingByKey(key: string): Promise<SystemSetting | null> {
    return this.systemSettingModel.findOneAndDelete({ key });
  }
}
