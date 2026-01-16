import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { DisputeReason } from '../../../entities/dispute.entity';

export class CreateDisputeDto {
  @IsString()
  transactionId: string;

  @IsEnum(DisputeReason)
  reason: DisputeReason;

  @IsString()
  description: string;

  @IsOptional()
  @IsObject()
  evidence?: {
    photos?: string[];
    videos?: string[];
    documents?: string[];
  };
}
