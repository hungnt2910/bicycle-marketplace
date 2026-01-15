import { IsOptional, IsString, IsNumber, IsIn, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import {
  BicycleStatus,
  BicycleType,
  ConditionOverall,
} from 'src/entities/bicycle.entity';

export class FilterBicycleDto {
  // search
  @IsOptional()
  keyword?: string;

  // price
  @IsOptional()
  minPrice?: number;

  @IsOptional()
  maxPrice?: number;

  // basic
  @IsOptional()
  @IsEnum(BicycleType)
  type?: BicycleType;

  @IsOptional()
  brand?: string;

  @IsOptional()
  @IsEnum(ConditionOverall)
  condition?: ConditionOverall;

  @IsOptional()
  @IsEnum(BicycleStatus)
  status?: BicycleStatus;

  // location
  @IsOptional()
  city?: string;

  @IsOptional()
  district?: string;

  // year
  @IsOptional()
  yearFrom?: number;

  @IsOptional()
  yearTo?: number;

  // inspection
  @IsOptional()
  isInspected?: boolean;

  // pagination
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  // sort
  @IsOptional()
  sort?: 'price_asc' | 'price_desc' | 'newest';
}
