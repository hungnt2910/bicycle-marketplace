import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InspectionType } from '../../../entities/inspection-report.entity';

export class RequestInspectionDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Bicycle ID' })
  @IsString()
  bicycleId: string;

  @ApiProperty({ 
    enum: InspectionType, 
    example: InspectionType.ONSITE,
    description: 'Inspection type' 
  })
  @IsEnum(InspectionType)
  inspectionType: InspectionType;
}