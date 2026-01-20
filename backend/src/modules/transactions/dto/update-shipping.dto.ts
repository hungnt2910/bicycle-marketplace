import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateShippingDto {
  @ApiProperty({ example: 'Giao Hang Nhanh', description: 'Shipping provider' })
  @IsString()
  provider: string;

  @ApiProperty({ example: 'GHN123456789', description: 'Tracking number' })
  @IsString()
  trackingNumber: string;
}