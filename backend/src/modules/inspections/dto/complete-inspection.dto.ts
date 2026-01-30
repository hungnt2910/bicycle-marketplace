import { IsObject, IsNumber, IsEnum, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { 
  ComponentCondition, 
  InspectionVerdict 
} from '../../../entities/inspection-report.entity';

class ComponentCheckDto {
  @ApiProperty({ enum: ComponentCondition, example: ComponentCondition.GOOD })
  @IsEnum(ComponentCondition)
  condition: ComponentCondition;

  @ApiProperty({ example: ['Minor scratches'], required: false })
  @IsOptional()
  issues?: string[];

  @ApiProperty({ example: 'Overall frame is in good condition', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

class TechnicalChecksDto {
  @ApiProperty({ type: ComponentCheckDto })
  @IsObject()
  frame: ComponentCheckDto;

  @ApiProperty({ type: ComponentCheckDto })
  @IsObject()
  brakes: ComponentCheckDto;

  @ApiProperty({ type: ComponentCheckDto })
  @IsObject()
  drivetrain: ComponentCheckDto;

  @ApiProperty({ type: ComponentCheckDto })
  @IsObject()
  wheels: ComponentCheckDto;

  @ApiProperty({ type: ComponentCheckDto })
  @IsObject()
  suspension: ComponentCheckDto;
}

export class CompleteInspectionDto {
  @ApiProperty({ type: TechnicalChecksDto })
  @IsObject()
  technicalChecks: TechnicalChecksDto;

  @ApiProperty({ example: 8, minimum: 1, maximum: 10, description: 'Overall rating (1-10)' })
  @IsNumber()
  @Min(1)
  @Max(10)
  overallRating: number;

  @ApiProperty({ 
    enum: InspectionVerdict, 
    example: InspectionVerdict.APPROVED,
    description: 'Inspection verdict' 
  })
  @IsEnum(InspectionVerdict)
  verdict: InspectionVerdict;

  @ApiProperty({ 
    example: 'Bicycle is in good condition. Minor maintenance recommended.',
    required: false 
  })
  @IsOptional()
  @IsString()
  recommendations?: string;

  @ApiProperty({ 
    example: { photos: ['url1', 'url2'], videos: ['url3'] },
    required: false,
    description: 'Inspection media (photos and videos)' 
  })
  @IsOptional()
  @IsObject()
  media?: {
    photos?: string[];
    videos?: string[];
  };
}