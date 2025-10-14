import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsStrongPassword,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @IsOptional()
  @IsPhoneNumber('IN', { message: 'Please provide a valid phone number' })
  phone?: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @IsStrongPassword(
    {
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 symbol',
    },
  )
  password: string;

  @IsEnum(UserRole, {
    message: 'Role must be one of: CANDIDATE, ADMIN, SUPER_ADMIN, COMPANY',
  })
  role: UserRole;

  @IsOptional()
  @IsBoolean({ message: 'Email verified must be a boolean value' })
  emailVerified?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Phone verified must be a boolean value' })
  phoneVerified?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Two factor enabled must be a boolean value' })
  twoFactorEnabled?: boolean;
}
