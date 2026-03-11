import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
  TransactionStatus,
  TransactionType,
} from 'src/entities';
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

    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
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

  async getMoneyFlowSummary(period: SummaryPeriod): Promise<MoneyFlowSummary> {
    const { value, unit } = PERIOD_MAP[period];

    // ── Compute date range ──────────────────────────────────────────────────
    const to = new Date();
    const from = new Date();
    if (unit === 'day') {
      from.setDate(from.getDate() - value);
    } else {
      from.setMonth(from.getMonth() - value);
    }

    // ── Aggregate completed transactions by type ────────────────────────────
    const breakdown = await this.transactionModel.aggregate([
      {
        $match: {
          status: TransactionStatus.COMPLETED,
          createdAt: { $gte: from, $lte: to },
          type: { $in: [...MONEY_IN_TYPES, ...MONEY_OUT_TYPES] },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    // ── Tag direction + compute totals ──────────────────────────────────────
    const taggedBreakdown = breakdown.map((item) => ({
      type: item.type as TransactionType,
      direction: MONEY_IN_TYPES.includes(item.type)
        ? ('in' as const)
        : ('out' as const),
      total: item.total,
      count: item.count,
    }));

    const totalIn = taggedBreakdown
      .filter((i) => i.direction === 'in')
      .reduce((sum, i) => sum + i.total, 0);

    const totalOut = taggedBreakdown
      .filter((i) => i.direction === 'out')
      .reduce((sum, i) => sum + i.total, 0);

    return {
      period,
      from,
      to,
      totalIn,
      totalOut,
      net: totalIn - totalOut,
      breakdown: taggedBreakdown,
    };
  }

  //-------------------------------------------

  // CRUD post

  //-------------------------------------------

  // CRUD revenue
  //
}

// ─── admin.service.ts ─────────────────────────────────────────────────────────

export type SummaryPeriod = '7d' | '30d' | '12m';

const PERIOD_MAP: Record<
  SummaryPeriod,
  { value: number; unit: 'day' | 'month' }
> = {
  '7d': { value: 7, unit: 'day' },
  '30d': { value: 30, unit: 'day' },
  '12m': { value: 12, unit: 'month' },
};

// TransactionTypes that represent money coming IN to the platform
const MONEY_IN_TYPES = [
  TransactionType.FULL_PAYMENT,
  TransactionType.DEPOSIT,
  TransactionType.FEE,
  TransactionType.INSPECTION_FEE,
  TransactionType.PENALTY,
  TransactionType.COMMISSION,
];

// TransactionTypes that represent money going OUT of the platform
const MONEY_OUT_TYPES = [
  TransactionType.REFUND,
  TransactionType.DISPUTE_REFUND,
];

export interface MoneyFlowSummary {
  period: SummaryPeriod;
  from: Date;
  to: Date;
  totalIn: number;
  totalOut: number;
  net: number;
  breakdown: {
    type: TransactionType;
    direction: 'in' | 'out';
    total: number;
    count: number;
  }[];
}
