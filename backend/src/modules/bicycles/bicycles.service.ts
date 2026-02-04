import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bicycle, BicycleDocument } from 'src/entities';
import { CreateBicyclesDto } from './dto/create-bicycles.dto';
import { FilterBicycleDto } from './dto/filler-bicycle.dto';
import { UpdateBicycleDto } from './dto/update-bicyce.dto';

@Injectable()
export class BicyclesService {
  constructor(
    @InjectModel(Bicycle.name) private bicycleModel: Model<BicycleDocument>,
  ) {}

  async createBicycle(bicycle: CreateBicyclesDto): Promise<Bicycle> {
    const result = await this.isDuplicateBicycle(bicycle);
    if (result) {
      throw new Error('Duplicate bicycle listing');
    }
    return await new this.bicycleModel(bicycle).save();
  }

  async findAllBicycles(): Promise<Bicycle[]> {
    return await this.bicycleModel.find().exec();
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
}
