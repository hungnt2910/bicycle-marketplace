import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Min, Max, IsBoolean, IsEnum } from 'class-validator';
import { UserRole, UserStatus } from 'src/entities/user.entity';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+84912345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: 'User residential address',
    example: '123 Main Street',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'City of residence',
    example: 'Ho Chi Minh City',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'District of residence',
    example: 'District 1',
    required: false,
  })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({
    description: 'User account status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({
    description: 'Phone verification status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  verifiedPhone?: boolean;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  verifiedEmail?: boolean;

  @ApiProperty({
    description: 'Verified seller status',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  verifiedRoleSeller?: boolean;
}
