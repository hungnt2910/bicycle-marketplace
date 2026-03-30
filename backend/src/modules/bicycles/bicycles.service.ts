import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bicycle, BicycleDocument, User, BicycleStatus } from 'src/entities';
import { CreateBicyclesDto } from './dto/create-bicycles.dto';
import { FilterBicycleDto } from './dto/filler-bicycle.dto';
import { UpdateBicycleDto } from './dto/update-bicyce.dto';

@Injectable()
export class BicyclesService {
  constructor(
    @InjectModel(Bicycle.name) private bicycleModel: Model<BicycleDocument>,
    @InjectModel('User') private userModel: Model<any>,
  ) {}

  async createBicycle(bicycle: CreateBicyclesDto): Promise<Bicycle> {
    const result = await this.isDuplicateBicycle(bicycle);
    if (result) {
      throw new Error('Duplicate bicycle listing');
    }
    return await new this.bicycleModel(bicycle).save();
  }

  async findAllBicycles(): Promise<Bicycle[]> {
    return await this.bicycleModel.find().sort({ createdAt: -1 }).exec();
  }

  async findBicycleById(id: string): Promise<Bicycle | null> {
    return await this.bicycleModel.findById(id).exec();
  }

  async updateBicycle(id: string, updateData: UpdateBicycleDto) {
    return await this.bicycleModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async deleteBicycle(id: string): Promise<Bicycle | null> {
    return await this.bicycleModel.findByIdAndDelete(id).exec();
  }

  //làm tạm thời để đó mốt có fillter cái gì thì sửa lại
  async fillerBicycles(filter: FilterBicycleDto): Promise<Bicycle[]> {
    const query: any = {};
    if (filter.keyword) {
      query.$or = [
        { title: { $regex: filter.keyword, $options: 'i' } },
        { description: { $regex: filter.keyword, $options: 'i' } },
      ];
    }

    if (filter.minPrice || filter.maxPrice) {
      query.price = {};
      if (filter.minPrice) query.price.$gte = filter.minPrice;
      if (filter.maxPrice) query.price.$lte = filter.maxPrice;
    }

    if (filter.type) query['specifications.type'] = filter.type;
    if (filter.brand) query['specifications.brand'] = filter.brand;
    if (filter.condition) query['condition.overall'] = filter.condition;
    if (filter.city) query['location.city'] = filter.city;
    if (filter.district) query['location.district'] = filter.district;
    if (filter.isInspected !== undefined)
      query['inspection.isInspected'] = filter.isInspected;

    return await this.bicycleModel.find(query).exec();
  }

  async isDuplicateBicycle(bicycle: CreateBicyclesDto): Promise<boolean> {
    if (
      !bicycle.sellerId ||
      !bicycle.specifications?.brand ||
      !bicycle.specifications?.model ||
      !bicycle.specifications?.year
    ) {
      return false; // không đủ thông tin thì không check
    }

    const existed = await this.bicycleModel.findOne({
      sellerId: bicycle.sellerId,
      'specifications.brand': bicycle.specifications?.brand,
      'specifications.model': bicycle.specifications?.model,
      'specifications.year': bicycle.specifications?.year,
      'specifications.frameSize': bicycle.specifications?.frameSize,
    });

    return !!existed;
  }

  async searchBicyclesBykeyword(keyword: string): Promise<Bicycle[]> {
    return await this.bicycleModel
      .find({
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
        ],
      })
      .exec();
  }

  //thêm vào danh sách yêu thích của người dùng
  // chưa check xem đã có trong danh sách yêu thích chưa, nếu có rồi thì không thêm nữa
  async addToFavourites(userId: string, bicycleId: string): Promise<void> {
    const bicycle = await this.bicycleModel.findById(bicycleId).exec();
    if (!bicycle) {
      throw new Error('Bicycle not found');
    }

    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { favourites: { itemId: bicycle._id } },
    });
    // cộng favouriteCount của bicycle lên 1
    console.log('toi day roi');
    await this.bicycleModel.findByIdAndUpdate(bicycle._id, {
      $inc: { favoriteCount: 1 },
      new: true,
    });
  }

  //xoá 1 khỏi danh sách yêu thích
  async removeOneFromFavourites(
    userId: string,
    bicycleId: string,
  ): Promise<void> {
    const bicycle = await this.bicycleModel.findById(bicycleId).exec();
    if (!bicycle) {
      throw new Error('Bicycle not found');
    }
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { favourites: { itemId: bicycle._id } },
    });
    // trừ favouriteCount của bicycle đi 1
    await this.bicycleModel.findByIdAndUpdate(bicycle._id, {
      $inc: { favoriteCount: -1 },
    });
  }

  //lấy danh sách yêu thích của người dùng
  async getFavouritesByUserId(userId: string): Promise<Bicycle[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new Error('User not found');
    }
    const favouriteBicycleIds = user.favourites.map((fav) => fav.itemId);
    return await this.bicycleModel
      .find({ _id: { $in: favouriteBicycleIds } })
      .exec();
  }

  //xoá hết danh sách yêu thích của người dùng
  async clearFavouritesByUserId(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { favourites: [] },
    });
  }

  /**
   * Validates bicycle status transitions to prevent data integrity issues.
   * Prevents invalid state transitions like SOLD -> ACTIVE (which enables fraud).
   *
   * @param fromStatus - Current bicycle status
   * @param toStatus - Target bicycle status
   * @throws BadRequestException if transition is invalid
   */
  validateStatusTransition(fromStatus: string, toStatus: string): void {
    // Define invalid transitions that should never occur
    const invalidTransitions = new Set([
      `${BicycleStatus.SOLD}|${BicycleStatus.ACTIVE}`, // SOLD -> ACTIVE (fraud risk)
      `${BicycleStatus.SOLD}|${BicycleStatus.RESERVED}`, // SOLD -> RESERVED (create new transaction instead)
      `${BicycleStatus.HIDDEN}|${BicycleStatus.ACTIVE}`, // HIDDEN -> ACTIVE (must go through review)
      `${BicycleStatus.REJECTED}|${BicycleStatus.ACTIVE}`, // REJECTED -> ACTIVE (must resubmit)
    ]);

    const transitionKey = `${fromStatus}|${toStatus}`;

    if (invalidTransitions.has(transitionKey)) {
      throw new BadRequestException(
        `Invalid status transition: ${fromStatus} → ${toStatus}. ` +
        `Bicycle status changes must follow proper workflow rules.`,
      );
    }
  }

  /**
   * Safe status update that validates the transition before applying.
   * Use this when updating bicycle status to ensure data integrity.
   *
   * @param bicycleId - ID of bicycle to update
   * @param newStatus - Target status
   */
  async updateStatusSafely(
    bicycleId: string,
    newStatus: string,
  ): Promise<Bicycle | null> {
    const bicycle = await this.bicycleModel.findById(bicycleId);
    if (!bicycle) {
      throw new BadRequestException('Bicycle not found');
    }

    // Validate the transition
    this.validateStatusTransition(bicycle.status as string, newStatus);

    // Apply the update
    bicycle.status = newStatus as any;
    bicycle.updatedAt = new Date();
    return await bicycle.save();
  }
}
