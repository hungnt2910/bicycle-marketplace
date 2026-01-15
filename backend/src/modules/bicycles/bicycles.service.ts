import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bicycle, BicycleDocument } from 'src/entities';
import { CreateBicyclesDto } from './dto/create-bicycles.dto';

@Injectable()
export class BicyclesService {
  constructor(
    @InjectModel(Bicycle.name) private bicycleModel: Model<BicycleDocument>,
  ) {}

  async createBicycle(bicycle: CreateBicyclesDto): Promise<Bicycle> {
    return await new this.bicycleModel(bicycle).save();
  }

  async findAllBicycles(): Promise<Bicycle[]> {
    return await this.bicycleModel.find().exec();
  }

  async findBicycleById(id: string): Promise<Bicycle | null> {
    return await this.bicycleModel.findById(id).exec();
  }

  // async updateBicycle(
  //   id: string,
  //   updateData: ,
  // ): Promise<Bicycle | null> {
  //   return await this.bicycleModel
  //     .findByIdAndUpdate(id, updateData, { new: true })
  //     .exec();
  // }

  async deleteBicycle(id: string): Promise<Bicycle | null> {
    return await this.bicycleModel.findByIdAndDelete(id).exec();
  }
}
