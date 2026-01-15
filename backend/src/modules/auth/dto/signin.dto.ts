import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ 
    example: 'john.doe@example.com',
    description: 'User email address' 
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ 
    example: 'StrongP@ssw0rd',
    description: 'User password' 
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string | any;
}