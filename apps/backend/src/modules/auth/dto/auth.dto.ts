import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  MinLength, 
  IsEnum,
  IsOptional,
  Matches,
  MaxLength
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { UserRole } from '@prisma/client'

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address'
  })
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string

  @ApiProperty({
    example: 'Password123!',
    description: 'User password',
    minLength: 8
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string
}

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address'
  })
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string

  @ApiProperty({
    example: 'Password123!',
    description: 'User password',
    minLength: 8
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  )
  password: string

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name'
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string

  @ApiPropertyOptional({
    enum: UserRole,
    default: UserRole.REQUESTER,
    description: 'User role in the system'
  })
  @IsEnum(UserRole, { message: 'Invalid user role' })
  @IsOptional()
  role?: UserRole = UserRole.REQUESTER
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password'
  })
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string

  @ApiProperty({
    description: 'New password',
    minLength: 8
  })
  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(50, { message: 'New password must not exceed 50 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    {
      message: 'New password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  )
  newPassword: string
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token'
  })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string
}