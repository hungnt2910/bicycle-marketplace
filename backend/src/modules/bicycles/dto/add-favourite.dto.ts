import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class AddToFavouritesDto {
  @ApiProperty({
    example: '64a7f0c2e1b2c3d4e5f67890',
    description: 'User ID',
  })
  @IsOptional()
  userId: string;

  @ApiProperty({
    example: '64a7f0c2e1b2c3d4e5f67891',
    description: 'Bicycle ID',
  })
  @IsOptional()
  bicycleId: string;
}
