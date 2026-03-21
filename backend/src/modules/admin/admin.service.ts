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
import { User, UserDocument, UserRole } from 'src/entities/user.entity';

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
  // Seller verification workflow
  async getSellerRequests(
    status: 'pending' | 'approved' | 'rejected' = 'pending',
  ) {
    const filter: Record<string, any> = {};

    if (status === 'pending') {
      filter.sellerRequestPending = true;
    } else if (status === 'approved') {
      filter.verifiedRoleSeller = true;
      filter.role = UserRole.SELLER;
    } else if (status === 'rejected') {
      filter.sellerRequestRejected = true;
    }

    return this.userModel.find(filter).exec();
  }

  async approveSeller(userId: string) {
    return this.userModel.findByIdAndUpdate(
      new Types.ObjectId(userId),
      {
        $set: {
          role: UserRole.SELLER,
          verifiedRoleSeller: true,
          sellerRequestPending: false,
          sellerRequestRejected: false,
          sellerRejectReason: undefined,
          sellerApprovedAt: new Date(),
        },
      },
      { new: true },
    );
  }

  async rejectSeller(userId: string, reason?: string) {
    return this.userModel.findByIdAndUpdate(
      new Types.ObjectId(userId),
      {
        $set: {
          sellerRequestPending: false,
          sellerRequestRejected: true,
          verifiedRoleSeller: false,
          role: UserRole.BUYER,
          sellerRejectReason: reason,
        },
      },
      { new: true },
    );
  }

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
      await this.systemSettingModel.collection.updateOne(
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
    dataUpdate: Partial<SystemSetting> & {
      key?: string;
      _id?: string;
      groupId?: string;
      originalKey?: string;
    },
  ): Promise<SystemSetting | null> {
    const { key, _id, groupId, originalKey, ...updateData } = dataUpdate as any;

    const keyCandidates = [key, originalKey]
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);

    const normalizedUpdateData = {
      ...updateData,
      value:
        (updateData as any).value !== undefined
          ? this.parseSettingValue((updateData as any).value)
          : (updateData as any).value,
      category:
        (updateData as any).category === ''
          ? null
          : (updateData as any).category,
    };

    const targetDocId = (_id || groupId || '').toString().trim();

    if (targetDocId) {
      const updatedById = await this.systemSettingModel
        .findByIdAndUpdate(targetDocId, normalizedUpdateData, { new: true })
        .exec();

      if (updatedById && updatedById.key) {
        return updatedById;
      }
    }

    for (const candidateKey of keyCandidates) {
      const updatedFlat = await this.systemSettingModel
        .findOneAndUpdate({ key: candidateKey }, normalizedUpdateData, {
          new: true,
        })
        .exec();

      if (updatedFlat) return updatedFlat;
    }

    const collection = this.systemSettingModel.collection;

    let legacyContainer: any = null;

    if (keyCandidates.length > 0) {
      legacyContainer = await collection.findOne({
        'name_value.key': { $in: keyCandidates },
      } as any);
    }

    if (
      !legacyContainer &&
      targetDocId &&
      Types.ObjectId.isValid(targetDocId)
    ) {
      legacyContainer = await collection.findOne({
        _id: new Types.ObjectId(targetDocId),
      } as any);
    }

    if (!legacyContainer) {
      return null;
    }

    const matchedLegacy = ((legacyContainer as any)?.name_value || []).find(
      (item: any) =>
        keyCandidates.includes((item?.key || '').toString().trim()),
    );

    const legacyKeyToUpdate = matchedLegacy?.key;

    if (!legacyKeyToUpdate) {
      return null;
    }

    await collection.updateOne(
      {
        _id: (legacyContainer as any)._id,
        'name_value.key': legacyKeyToUpdate,
      } as any,
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

    const refreshedLegacy = await collection.findOne({
      _id: (legacyContainer as any)._id,
    } as any);

    const matchedSetting = (refreshedLegacy as any)?.name_value?.find(
      (item: any) => item?.key === legacyKeyToUpdate,
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

    const legacyContainer = await this.systemSettingModel.collection.findOne({
      'name_value.key': key,
    } as any);

    if (!legacyContainer) {
      return null;
    }

    const target = (legacyContainer as any).name_value?.find(
      (item: any) => item?.key === key,
    );

    await this.systemSettingModel.collection.updateOne(
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

// toi laf admin service, toi se quan ly tat ca cac chuc nang lien quan den admin nhu: duyet seller, quan ly system setting, quan ly user, xem thong ke doanh thu,...
