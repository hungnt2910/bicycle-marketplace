import { IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { TransactionType, PaymentMethod } from '../../../entities/transaction.entity';

export class CreateTransactionDto {
  @IsString()
  bicycleId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}