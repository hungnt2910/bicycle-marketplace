import { PartialType } from '@nestjs/mapped-types';
import { CreateBicyclesDto } from './create-bicycles.dto';

// lấy dto của create rồi làm partial cho update
export class UpdateBicycleDto extends PartialType(CreateBicyclesDto) {}
