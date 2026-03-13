import { PaymentMethod } from './../../../entities/transaction.entity';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  IsMongoId,
  Min,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import {
  BicycleType,
  FrameMaterial,
  BrakeType,
  Suspension,
  ConditionOverall,
  BicycleStatus,
} from '../../../entities/bicycle.entity';

class SpecificationsDto {
  @IsOptional()
  @IsEnum(BicycleType)
  type?: BicycleType;

  @IsOptional()
  @IsString({ message: 'Please Enter Valid Name' })
  brand?: string;

  @IsOptional()
  @IsString({ message: 'Please Enter Valid Name' })
  model?: string;

  @IsOptional()
  @IsString({ message: 'Please Enter Valid Name' })
  frameSize?: string;

  @IsOptional()
  @IsEnum(FrameMaterial)
  frameMaterial?: FrameMaterial;

  @IsOptional()
  @IsNumber({}, { message: 'Please Enter Valid Year' })
  year?: number;

  @IsOptional()
  @IsString({ message: 'Please Enter Valid Color' })
  color?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Please Enter Valid Weight' })
  weight?: number;

  @IsOptional()
  @IsString({ message: 'Please Enter Valid Wheel Size' })
  wheelSize?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Please Enter Valid Gears' })
  gears?: number;

  @IsOptional()
  @IsEnum(BrakeType)
  brakeType?: BrakeType;

  @IsOptional()
  @IsEnum(Suspension)
  suspension?: Suspension;
}

class ConditionDto {
  @IsOptional()
  @IsEnum(ConditionOverall)
  overall?: ConditionOverall;

  @IsOptional()
  @IsString({ message: 'Please Enter Valid Usage History' })
  usageHistory?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Please Enter Valid Mileage' })
  mileage?: number;

  @IsOptional()
  lastServiceDate?: Date;
}

class MediaDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];

  @IsOptional()
  @IsString({ message: 'Please Enter Valid Main Image' })
  mainImage?: string;
}

class InspectionDto {
  @IsOptional()
  @IsBoolean()
  isInspected?: boolean;

  @IsOptional()
  inspectorId?: Types.ObjectId;

  @IsOptional()
  inspectionDate?: Date;

  @IsOptional()
  reportId?: Types.ObjectId;

  @IsOptional()
  expiryDate?: Date;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];
}

class LocationDto {
  @IsOptional()
  @IsString({ message: 'Please Enter Valid City' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'Please Enter Valid District' })
  district?: string;

  @IsOptional()
  @IsString({ message: 'Please Enter Valid Address' })
  address?: string;
}

class PricingDto {
  @IsOptional()
  @IsNumber()
  listingFee?: number;

  @IsOptional()
  @IsNumber()
  commissionRate?: number;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}

// CREATE DTO
export class CreateBicyclesDto {
  @IsMongoId()
  sellerId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => SpecificationsDto)
  specifications?: SpecificationsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConditionDto)
  condition?: ConditionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaDto)
  media?: MediaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => InspectionDto)
  inspection?: InspectionDto;

  @IsOptional()
  @IsEnum(BicycleStatus)
  status?: BicycleStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PricingDto)
  pricing?: PricingDto;
}
