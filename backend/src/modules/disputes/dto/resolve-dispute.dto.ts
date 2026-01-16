import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class ResolveDisputeDto {
  @IsString()
  decision: 'buyer_favor' | 'seller_favor' | 'partial_refund';

  @IsOptional()
  @IsNumber()
  @Min(0)
  refundAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  penaltyToSeller?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  penaltyToBuyer?: number;

  @IsString()
  notes: string;
}