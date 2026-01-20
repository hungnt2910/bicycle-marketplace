import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmDeliveryDto {
  @ApiProperty({ 
    example: true, 
    description: 'Does the bicycle match the inspection report?' 
  })
  @IsBoolean()
  matchesReport: boolean;

  @ApiProperty({ 
    example: 'Bicycle received in excellent condition', 
    required: false 
  })
  @IsOptional()
  @IsString()
  notes?: string;
}