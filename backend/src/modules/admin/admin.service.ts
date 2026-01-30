import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  SettingCategory,
  SettingCategoryDocument,
} from 'src/entities/category-systemField-entity';
import {
  SystemSetting,
  SystemSettingDocument,
} from 'src/entities/system-setting.entity';
import { User, UserDocument } from 'src/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(SystemSetting.name)
    private systemSettingModel: Model<SystemSettingDocument>,

    @InjectModel(SettingCategory.name)
    private settingCategoryModel: Model<SettingCategoryDocument>,

    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  //-------------------------------------------
  // CRUD category SystemSetting
  async createCategory(title: string): Promise<SettingCategory> {
    const existedField = await this.settingCategoryModel.findOne({
      title,
    });
    if (existedField) {
      throw new Error('Title already exists');
    }
    return await new this.settingCategoryModel({ title }).save();
  }

  async getAllCategories(): Promise<SettingCategory[]> {
    return await this.settingCategoryModel.find().exec();
  }

  async updateCategory(
    id: string,
    title: string,
  ): Promise<SettingCategory | null> {
    const existedField = await this.settingCategoryModel.findOne({
      title,
      _id: { $ne: id }, //loại trừ chính nó
    });

    if (existedField) {
      throw new Error('Title already exists');
    }

    return await this.settingCategoryModel
      .findByIdAndUpdate(new Types.ObjectId(id), { title }, { new: true })
      .exec();
  }

  async deleteCategory(id: string): Promise<SettingCategory | null> {
    return await this.settingCategoryModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();
  }

  //-------------------------------------------
  // sửa thông số hê thống
  async createSystemSetting(data: SystemSetting): Promise<SystemSetting> {
    const existedSetting = await this.systemSettingModel.findOne({
      key: data.key,
    });
    if (existedSetting) {
      throw new Error('Key already exists');
    }
    return await new this.systemSettingModel(data).save();
  }

  async updateSystemSetting(
    dataUpdate: Partial<SystemSetting> & { key: string },
  ): Promise<SystemSetting | null> {
    const { key, ...updateData } = dataUpdate;
    return await this.systemSettingModel
      .findOneAndUpdate({ key }, updateData, { new: true })
      .exec();
  }

  async getAllSystemSettings(): Promise<SystemSetting[]> {
    return await this.systemSettingModel.find().populate('category').exec();
  }

  async deleteSystemSetting(key: string): Promise<SystemSetting | null> {
    return await this.systemSettingModel.findOneAndDelete({ key });
  }

  //-------------------------------------------
  // CRUD user
  //cấp quuyền cho user
  async changeUserRole(userId: string, newRole: string): Promise<User | null> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new Error('User not found');
    } else if ((user.role as string) !== 'ADMIN') {
      throw new Error('You are not an Admin');
    }
    user.role = newRole as any;
    return await user.save();
  }

  async changeUserStatus(
    userId: string,
    newStatus: string,
  ): Promise<User | null> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new Error('User not found');
    } else if ((user.role as string) === 'ADMIN') {
      throw new Error('Cannot change status of Admin user');
    }
    user.status = newStatus as any;
    return await user.save();
  }

  //-------------------------------------------

  // CRUD post

  //-------------------------------------------

  // CRUD revenue
}
