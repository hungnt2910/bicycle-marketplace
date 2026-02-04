import { IsOptional, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddEvidenceDto {
  @ApiProperty({ 
    example: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    required: false,
    description: 'Photo URLs' 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiProperty({ 
    example: ['https://example.com/video1.mp4'],
    required: false,
    description: 'Video URLs' 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];

  @ApiProperty({ 
    example: ['https://example.com/document1.pdf'],
    required: false,
    description: 'Document URLs' 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];
}