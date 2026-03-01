import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../../entities/transaction.entity';

export class CreateDepositDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Bicycle ID' })
  @IsString()
  bicycleId: string;

  @ApiPropertyOptional({
    example: 0.2,
    description: 'Deposit rate as a decimal (e.g. 0.2 = 20%). Defaults to 0.2.',
    minimum: 0.1,
    maximum: 0.9,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(0.9)
  depositRate?: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.E_WALLET,
    description: 'Payment method',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}