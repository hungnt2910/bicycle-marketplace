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
  private parseSettingValue(value: any) {
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();
    if (trimmed === '') return '';

    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    const asNumber = Number(trimmed);
    if (!Number.isNaN(asNumber) && /^-?\d+(\.\d+)?$/.test(trimmed)) {
      return asNumber;
    }

    return trimmed;
  }

  async createSystemSetting(data: SystemSetting): Promise<SystemSetting> {
    const normalizedValue = this.parseSettingValue((data as any).value);

    const existedLegacy = await this.systemSettingModel.findOne({
      'name_value.key': (data as any).key,
    } as any);
    if (existedLegacy) {
      throw new Error('Key already exists');
    }

    const existedSetting = await this.systemSettingModel.findOne({
      key: data.key,
    });
    if (existedSetting) {
      throw new Error('Key already exists');
    }

    const legacyContainer = await this.systemSettingModel.findOne({
      name_value: { $exists: true, $type: 'array' },
    } as any);

    if (legacyContainer) {
      await this.systemSettingModel.updateOne(
        { _id: (legacyContainer as any)._id } as any,
        {
          $push: {
            name_value: {
              key: (data as any).key,
              value: normalizedValue,
              description: (data as any).description || '',
              category: (data as any).category || null,
            },
          },
        } as any,
      );

      return {
        key: (data as any).key,
        value: normalizedValue,
        description: (data as any).description,
        category: (data as any).category,
      } as SystemSetting;
    }

    return await new this.systemSettingModel({
      ...data,
      value: normalizedValue,
    }).save();
  }

  async updateSystemSetting(
    dataUpdate: Partial<SystemSetting> & { key: string },
  ): Promise<SystemSetting | null> {
    const { key, ...updateData } = dataUpdate;
    const normalizedUpdateData = {
      ...updateData,
      value:
        (updateData as any).value !== undefined
          ? this.parseSettingValue((updateData as any).value)
          : (updateData as any).value,
    };

    const updatedFlat = await this.systemSettingModel
      .findOneAndUpdate({ key }, normalizedUpdateData, { new: true })
      .exec();

    if (updatedFlat) return updatedFlat;

    const legacyContainer = await this.systemSettingModel.findOne({
      'name_value.key': key,
    } as any);

    if (!legacyContainer) {
      return null;
    }

    await this.systemSettingModel.updateOne(
      { _id: (legacyContainer as any)._id, 'name_value.key': key } as any,
      {
        $set: {
          ...(normalizedUpdateData.value !== undefined
            ? { 'name_value.$.value': normalizedUpdateData.value }
            : {}),
          ...(normalizedUpdateData.description !== undefined
            ? { 'name_value.$.description': normalizedUpdateData.description }
            : {}),
          ...(normalizedUpdateData.category !== undefined
            ? { 'name_value.$.category': normalizedUpdateData.category }
            : {}),
        },
      } as any,
    );

    const refreshedLegacy = await this.systemSettingModel.findOne({
      _id: (legacyContainer as any)._id,
    } as any);

    const matchedSetting = (refreshedLegacy as any)?.name_value?.find(
      (item: any) => item?.key === key,
    );

    if (!matchedSetting) {
      return null;
    }

    return {
      key: matchedSetting.key,
      value: matchedSetting.value,
      description: matchedSetting.description,
      category: matchedSetting.category || null,
    } as SystemSetting;
  }

  async getAllSystemSettings(): Promise<SystemSetting[]> {
    return await this.systemSettingModel.find().populate('category').exec();
  }

  async deleteSystemSetting(key: string): Promise<SystemSetting | null> {
    const deletedFlat = await this.systemSettingModel.findOneAndDelete({ key });
    if (deletedFlat) return deletedFlat;

    const legacyContainer = await this.systemSettingModel.findOne({
      'name_value.key': key,
    } as any);

    if (!legacyContainer) {
      return null;
    }

    const target = (legacyContainer as any).name_value?.find(
      (item: any) => item?.key === key,
    );

    await this.systemSettingModel.updateOne(
      { _id: (legacyContainer as any)._id } as any,
      {
        $pull: {
          name_value: { key },
        },
      } as any,
    );

    if (!target) return null;

    return {
      key: target.key,
      value: target.value,
      description: target.description,
      category: target.category || null,
    } as SystemSetting;
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
