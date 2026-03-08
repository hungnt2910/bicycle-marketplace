import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TopUpDto {
  @ApiProperty({ example: 10000000, description: 'Amount' })
  @IsNumber()
  amount: number;
}