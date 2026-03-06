import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AttachmentDto {
  @IsString()
  @IsNotEmpty()
  type: string; // 'image' | 'document' | 'link'

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  name?: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
