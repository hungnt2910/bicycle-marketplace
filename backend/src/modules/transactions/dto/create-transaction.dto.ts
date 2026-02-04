import { IsString, IsNumber, IsEnum, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, PaymentMethod } from '../../../entities/transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Bicycle ID' })
  @IsString()
  bicycleId: string;

  @ApiProperty({ example: 5000000, description: 'Transaction amount in VND' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ 
    enum: TransactionType, 
    example: TransactionType.DEPOSIT,
    description: 'Transaction type' 
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ 
    enum: PaymentMethod, 
    example: PaymentMethod.E_WALLET,
    description: 'Payment method' 
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}