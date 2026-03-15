import { IsString, IsNumber, IsOptional, Min, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveDisputeDto {
  @ApiProperty({ 
    example: 'buyer_favor',
    enum: ['buyer_favor', 'seller_favor', 'partial_refund'],
    description: 'Resolution decision' 
  })
  @IsString()
  @IsIn(['buyer_favor', 'seller_favor', 'partial_refund'])
  decision: string;

  @ApiProperty({ 
    example: 2500000,
    required: false,
    description: 'Refund amount (for partial refunds)' 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  refundAmount?: number;

  @ApiProperty({ 
    example: 100000,
    required: false,
    description: 'Penalty to seller' 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  penaltyToSeller?: number;

  @ApiProperty({ 
    example: 0,
    required: false,
    description: 'Penalty to buyer' 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  penaltyToBuyer?: number;

  @ApiProperty({ 
    example: 'After reviewing the evidence, the bicycle does not match the inspection report. Full refund issued to buyer.',
    description: 'Admin notes on the resolution' 
  })
  @IsString()
  notes: string;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Whether buyer must return the bicycle before refund'
  })
  @IsOptional()
  readonly requireReturn?: boolean;
}