import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DisputeReason } from '../../../entities/dispute.entity';

export class CreateDisputeDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Transaction ID' })
  @IsString()
  transactionId: string;

  @ApiProperty({ 
    enum: DisputeReason, 
    example: DisputeReason.ITEM_NOT_AS_DESCRIBED,
    description: 'Dispute reason' 
  })
  @IsEnum(DisputeReason)
  reason: DisputeReason;

  @ApiProperty({ 
    example: 'The bicycle frame has scratches that were not in the inspection report',
    description: 'Detailed description of the issue' 
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    example: { photos: ['url1', 'url2'], videos: ['url3'] },
    required: false,
    description: 'Evidence (photos, videos, documents)' 
  })
  @IsOptional()
  @IsObject()
  evidence?: {
    photos?: string[];
    videos?: string[];
    documents?: string[];
  };
}