import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

class MediaDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
export class CreateReviewDto {
  @IsOptional()
  @ApiProperty({
    example: '60d0fe4f5311236168a109ca',
    description: 'User ID',
  })
  reviewerId: string;

  @ApiProperty({
    example: '60d0fe4f5311236168a109cb',
    description: 'Transaction ID',
  })
  @IsOptional()
  transactionId: string;

  @ApiProperty({
    example: '60d0fe4f5311236168a109cc',
    description: 'Seller ID',
  })
  @IsOptional()
  sellerId: string;

  @IsOptional()
  @ApiProperty({
    example: '60d0fe4f5311236168a109cd',
    description: 'Listing ID',
  })
  listingId: string;

  @IsOptional()
  @ApiProperty({ example: 4, description: 'Rating from 1 to 5' })
  rating: number;

  @IsOptional()
  @ApiProperty({
    example: 'Great seller, fast shipping!',
    description: 'Review comment',
  })
  comment: string;

  @IsOptional()
  @ApiProperty({
    example: ['image1.jpg', 'image2.jpg'],
    description: 'Optional media attachments',
  })
  media: MediaDto;
}
