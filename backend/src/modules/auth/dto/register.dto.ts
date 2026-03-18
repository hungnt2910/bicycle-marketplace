import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../entities/user.entity';

export class RegisterDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: '+84901234567',
    description: 'Phone number (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    {
      message: 'Please provide a valid phone number',
    },
  )
  phone?: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd',
    description:
      'Password (minimum 8 characters, must include uppercase, lowercase, number, and special character)',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  password: string | any;

  @ApiProperty({
    example: 'buyer',
    enum: UserRole,
    description: 'User role',
    default: UserRole.BUYER,
  })
  @IsEnum(UserRole, {
    message: 'Role must be buyer, seller, inspector, or admin',
  })
  role: UserRole;

  @ApiProperty({
    example: 'John',
    description: 'First name (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    example: ' Doe',
    description: 'Last name (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    example:
      '"https://example.com/avatar.jpg","https://example.com/avatar.jpg"',
    description: 'Avatar URL (optional)',
    required: false,
  })
  @IsOptional()
  CCCD?: Array<{
    frontImage: string;
    backImage: string;
  }>;
}
